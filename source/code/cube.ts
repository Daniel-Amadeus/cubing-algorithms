import { mat4, vec3, vec4, quat } from 'gl-matrix';


type Swap = {faces: number[], stickers: number[][]};



let epsilon = 0.01;
function eq(x: number, y: number): boolean {
    return Math.abs(x - y) < epsilon;
}

export class Cube {

    private _size = 3;
    private _faces = Array(6).fill(0).map((e, i) => {return Array(9).fill(i)});
    private _pieces: mat4[][][] = [];

    private _colors = [
        'yellow',
        'blue',
        'red',
        'green',
        'orange',
        'white'
    ];

    private _colorMap = [
        {direction: [ 0, 1, 0], color: 'yellow'},
        {direction: [ 0,-1, 0], color: 'white'},
        {direction: [ 1, 0, 0], color: 'orange'},
        {direction: [-1, 0, 0], color: 'red'},
        {direction: [ 0, 0, 1], color: 'green'},
        {direction: [ 0, 0,-1], color: 'blue'},
    ]

    private _swaps = new Map<string, Swap>();
    private _circleSwap = [[0, 2, 6, 8], [1, 3, 5, 7]];
    
    constructor(size = 3) {
        this._size = size;
        let offset = (size - 1) / 2;
        for(let z = 0; z < size; z++) {
            let slice: mat4[][] = [];
            for(let y = 0; y < size; y++) {
                let row: mat4[] = [];
                for(let x = 0; x < size; x++) {
                    row.push(mat4.fromTranslation(
                            mat4.create(),
                            [
                                x - offset,
                                y - offset,
                                z - offset]
                        ));
                }
            slice.push(row);
            }
            this._pieces.push(slice);
        }

        this._swaps.set('r', {
            faces: [0, 4, 5, 2],
            stickers: [[2, 6, 2, 2], [5, 3, 5, 5], [8, 0, 8, 8]]
        });
        this._swaps.set('l', {
            faces: [0, 2, 5, 4],
            stickers: [[0, 0, 0, 8], [3, 3, 3, 5], [6, 6, 6, 2]]
        });
        this._swaps.set('f', {
            faces: [0, 3, 5, 1],
            stickers: [[6, 0, 2, 8], [7, 5, 1, 5], [8, 6, 0, 2]]
        });
        this._swaps.set('b', {
            faces: [0, 1, 5, 3],
            stickers: [[0, 6, 8, 2], [1, 3, 7, 5], [2, 0, 6, 8]]
        });
        this._swaps.set('u', {
            faces: [4, 3, 2, 1],
            stickers: [[0, 0, 0, 0], [1, 1, 1, 1], [2, 2, 2, 2]]
        });
        this._swaps.set('d', {
            faces: [1, 2, 3, 4],
            stickers: [[6, 6, 6, 6], [7, 7, 7, 7], [8, 8, 8, 8]]
        });
    }

    getColor(piece: mat4, face: vec3 = vec3.fromValues(0, 1, 0)): string {
        let origin = vec3.fromValues(0, 0, 0);
        let pos = vec3.transformMat4(vec3.create(), origin, piece);
        let translation = mat4.fromTranslation(mat4.create(), [-pos[0], -pos[1], -pos[2]]);
        let rotation = mat4.multiply(mat4.create(), piece, translation);
        let up = vec4.fromValues(face[0], face[1], face[2], 0);
        let direction = vec4.transformMat4(vec4.create(), up, rotation);
        let color = this._colorMap.find((element: any) => {
            let dir = element.direction;
            return eq(dir[0], direction[0]) && eq(dir[1], direction[1]) && eq(dir[2], direction[2]);
        });
        return color.color;
    }

    getFace(direction: vec3 = vec3.fromValues(0, 1, 0)): mat4[][] {
        let rotateUp = quat.rotationTo(quat.create(), [0, 1, 0], direction);
        let offset = (this._size - 1) / 2;
        let face: mat4[][] = [];
        for(let z = 0; z < this._size; z++) {
            let y = this._size - 1;
            let row: mat4[] = [];
            for(let x = 0; x < this._size; x++) {
                let origin = vec3.fromValues(0, 0, 0);
                let piece = this._pieces[z][y][x];
                // let rot = mat4.fromRotation(mat4.create(), Math.PI/2, [1,0,0]);
                let rot = mat4.fromQuat(mat4.create(), rotateUp);
                piece = mat4.multiply(mat4.create(), rot, piece);
                let pos = vec3.transformMat4(vec3.create(), origin, piece);
                row.push(piece);
            }
            face.push(row);
        }
        return face;
    }

    applyMoves(moves: string): void {
        console.log(moves);
        moves = moves.toLowerCase();
        moves = moves.replace(/[()]/g, '');
        const movesArray = moves.split(' ');
        movesArray.forEach(move => {
            const mainMove = move[0];
            let twoLayers = move.includes('w');
            let inverted = move.includes("'");
            let double = move.includes('2');

            // let direction = invertDirection(FACEROTATIONS.CW, inverted);
            for(let i = 0; i < (double ? 2 : 1); i++){
                const swap = this._swaps.get(mainMove);
                if(!swap) {
                    return;
                }
                let faces = swap.faces;
                let stickers = swap.stickers;

                if (inverted) {
                    console.log('inverted');
                    faces = faces.reverse();
                    stickers.map(e => {return e.reverse()});
                }

                stickers.forEach((swap) => {
                    const buffer = this._faces[faces[3]][swap[3]];
                    for (let index = faces.length - 2; index >= 0; index--) {
                        const face0 = faces[index];
                        const face1 = faces[index + 1];
                        const sticker0 = swap[index];
                        const sticker1 = swap[index + 1];
                        this._faces[face1][sticker1] = this._faces[face0][sticker0];
                    }
                    this._faces[faces[0]][swap[0]] = buffer;
                })
                // switch (mainMove) {
                //     case 'r': {
                //         if(twoLayers) {
                //         } else {
                //             const swapFaces = [0, 2, 5, 4];
                //             const sticker = [
                //                 [2, 2, 2, 6],
                //                 [5, 5, 5, 3],
                //                 [8, 8, 8, 0]
                //             ];

                //             sticker.forEach((swap) => {
                //                 const buffer = this._faces[swapFaces[0]][swap[0]];
                //                 for (let index = 0; index < swapFaces.length - 1; index++) {
                //                     const face0 = swapFaces[index];
                //                     const face1 = swapFaces[(index + 1) % 4];
                //                     const sticker0 = swap[index];
                //                     const sticker1 = swap[(index + 1) % 4];
                //                     this._faces[face0][sticker0] = this._faces[face1][sticker1];
                //                 }
                //                 this._faces[swapFaces[3]][swap[3]] = buffer;
                //             })
                //         }
                //         break;
                //     }
                //     case 'l': {
                //         if(twoLayers) {
                //         } else {
                //         }
                //         break;
                //     }
                //     case 'u': {
                //         if(twoLayers) {
                //         } else {
                //         }
                //         break;
                //     }
                //     case 'd': {
                //         if(twoLayers) {
                //         } else {
                //         }
                //         break;
                //     }
                //     case 'f': {
                //         if(twoLayers) {
                //         } else {
                //         }
                //         break;
                //     }
                //     case 'b': {
                //         if(twoLayers) {
                //         } else {
                //         }
                //         break;
                //     }
                //     case 'm': {
                //         break;
                //     }
                //     case 'x': {
                //         break;
                //     }
                //     case 'y': {
                //         break;
                //     }
                // }
            }
        });
        console.log(this._faces);
    }

    placeFace(
            vis: HTMLDivElement,
            x: number,
            y: number,
            color: string,
            pll: boolean) {
        const sticker = document.createElement('div');
        sticker.className = 'cubeFace';
        sticker.classList.add(color);
        if (!pll) {
            sticker.classList.add('oll');
        }
        sticker.style.gridColumnStart = x.toString();
        sticker.style.gridRowStart = y.toString();
        vis.appendChild(sticker);
    }

    drawCube(anchor: HTMLDivElement, pll: boolean): void {
        // if(pll){
        //     drawArrows(anchor);
        // }

        let size = this._size;
        let topFace_ = this.getFace(vec3.fromValues(0,1,0));
        topFace_.forEach((row: mat4[], y) => {
            row.forEach((piece: mat4, x) => {
                let color = this.getColor(piece);
                this.placeFace(anchor, x + 2, y + 2, color, pll);
            });

            let firstPiece = row[0];
            let firstColor = this.getColor(firstPiece, vec3.fromValues(-1, 0, 0));
            this.placeFace(anchor, 1, y + 2, firstColor, pll);

            let lastPiece = row[size-1];
            let lastColor = this.getColor(lastPiece, vec3.fromValues(1, 0, 0));
            this.placeFace(anchor, size + 2, y + 2, lastColor, pll);
        });

        topFace_[0].forEach((piece: mat4, x) => {
            let firstPiece = topFace_[0][x];
            let firstColor = this.getColor(firstPiece, vec3.fromValues(0, 0, -1));
            this.placeFace(anchor, x + 2, 1, firstColor, pll);
        });

        topFace_[size-1].forEach((piece: mat4, x) => {
            let firstPiece = topFace_[size-1][x];
            let firstColor = this.getColor(firstPiece, vec3.fromValues(0, 0, 1));
            this.placeFace(anchor, x + 2, size + 2, firstColor, pll);
        });
    }
}