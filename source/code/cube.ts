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
        {direction: vec3.fromValues( 0, 1, 0), color: 'yellow', side: 'u'},
        {direction: vec3.fromValues( 0,-1, 0), color: 'white', side: 'd'},
        {direction: vec3.fromValues( 1, 0, 0), color: 'orange', side: 'r'},
        {direction: vec3.fromValues(-1, 0, 0), color: 'red', side: 'l'},
        {direction: vec3.fromValues( 0, 0,-1), color: 'blue', side: 'b'},
        {direction: vec3.fromValues( 0, 0, 1), color: 'green', side: 'f'},
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
                    let mat = mat4.fromTranslation(
                        mat4.create(),
                        [
                            x - offset,
                            y - offset,
                            z - offset]
                    );
                    (mat as any).index = {x: x - offset, y: y - offset, z: z - offset};
                    row.push(mat);
                }
            slice.push(row);
            }
            this._pieces.push(slice);
        }

        // this.rotateLayer(vec3.fromValues(1, 0, 0));
        // this.rotateLayer(vec3.fromValues(0, 1, 0));
        // this.rotateLayer(vec3.fromValues(0, 0, 1));
        // console.log(this._pieces);
        // this.getLayer();

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
        let pos = this.getPos(piece);
        let translation = mat4.fromTranslation(mat4.create(), [-pos[0], -pos[1], -pos[2]]);
        let rotation = mat4.multiply(mat4.create(), piece, translation);
        mat4.invert(rotation, rotation);
        let up = vec4.fromValues(face[0], face[1], face[2], 0);
        let direction = vec4.transformMat4(vec4.create(), up, rotation);
        let color = this._colorMap.find((element: any) => {
            let dir = element.direction;
            return eq(dir[0], direction[0]) && eq(dir[1], direction[1]) && eq(dir[2], direction[2]);
        });
        return color.color;
    }

    getLayer(direction: vec3 = vec3.fromValues(0, 1, 0), layer: number = 0): mat4[][] {
        // console.log('getLayer');
        const size = this._size;
        if (layer >= size ) {
            console.warn(`Can not rotate layer ${layer} of a cube-${size}.`);
            return;
        }
        const origin = vec3.fromValues(0, 0, 0);
        const rotateUp = quat.rotationTo(quat.create(), direction, [0, 1, 0]);
        const rot = mat4.fromQuat(mat4.create(), rotateUp);
        // console.log(rot);
        const offset = (size - 1) / 2;
        const face: mat4[][] = Array(size).fill(0).map((e) => {return Array(size)});
        for(let z = 0; z < this._size; z++) {
            for(let y = 0; y < size; y++) {
                for(let x = 0; x < this._size; x++) {
                    let piece = this._pieces[z][y][x];
                    piece = mat4.multiply(mat4.create(), rot, piece);
                    let pos = vec3.transformMat4(vec3.create(), origin, piece);
                    // console.log({oldPie: this._pieces[z][y][x], piece});
                    if (eq(pos[1] + offset, size - layer - 1)) {
                        // console.log({x: Math.round(pos[0] + offset), y: Math.round(pos[2] + offset)});
                        // console.log((this._pieces[z][y][x] as any).index);
                        // console.log(pos);
                        face[Math.round(pos[2] + offset)][Math.round(pos[0] + offset)] = this._pieces[z][y][x];
                    }
                }
            }
        }
        return face;
    }

    getPos(piece: mat4): vec3 {
        const origin = vec3.fromValues(0, 0, 0);
        return vec3.transformMat4(vec3.create(), origin, piece);
    }

    getFace(direction: vec3 = vec3.fromValues(0, 1, 0)): mat4[][] {
        // console.log('get face');
        return this.getLayer(direction);
    }

    rotateLayer(direction: vec3, amount = 1): void {
        let rotation = mat4.fromRotation(mat4.create(), -amount * Math.PI/2, direction);
        let layer = this.getLayer(direction, 0);
        layer.forEach((row: mat4[], y) => {
            row.forEach((piece: mat4, x) => {
                mat4.multiply(piece, rotation, piece);
            });
        });
    }

    applyMoves(moves: string): void {
        console.log(moves);
        moves = moves.toLowerCase();
        moves = moves.replace(/[()]/g, '');
        const movesArray = moves.split(' ');
        movesArray.forEach(move => {
            if (!move) return;
            const mainMove = move[0];
            let inverted = move.includes("'");
            let double = move.includes('2');
            let twoLayers = move.includes('w');

            let amount = 1;
            if (inverted) amount *= -1;
            if (double) amount *= 2;

            // console.log(move);

            let sideData = this._colorMap.find((e) => {return e.side == mainMove});
            if (sideData) {
                this.rotateLayer(sideData.direction, amount);
            }

            // let direction = invertDirection(FACEROTATIONS.CW, inverted);
            for(let i = 0; i < (double ? 2 : 1); i++){
                const swap = this._swaps.get(mainMove);
                if(!swap) {
                    return;
                }
                let faces = swap.faces;
                let stickers = swap.stickers;

                if (inverted) {
                    // console.log('inverted');
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
        // console.log(this._faces);
    }

    placeFace(
            vis: HTMLDivElement,
            x: number,
            y: number,
            color: string,
            pll: boolean,
            piece: any = undefined) {
        const sticker = document.createElement('div');
        sticker.className = 'cubeFace';
        sticker.classList.add(color);
        if (!pll) {
            sticker.classList.add('oll');
        }
        sticker.style.gridColumnStart = x.toString();
        sticker.style.gridRowStart = y.toString();
        if (piece)
            sticker.innerText = JSON.stringify(piece.index).replace(/[,]/g, '\n').replace(/[{}"]/g, '');
        vis.appendChild(sticker);
    }

    drawArrows(vis: HTMLDivElement): void {
        const svg = vis.getElementsByClassName('cubeAnnotation')[0] as SVGElement;
        // drawArrow(svg, cube, [FACES.TOP, FACES.BACK, FACES.RIGHT]);
        // drawArrow(svg, cube, [FACES.TOP, FACES.BACK, FACES.LEFT]);
        // drawArrow(svg, cube, [FACES.TOP, FACES.FRONT, FACES.RIGHT]);
        // drawArrow(svg, cube, [FACES.TOP, FACES.FRONT, FACES.LEFT]);
        // drawArrow(svg, cube, [FACES.TOP, FACES.RIGHT]);
        // drawArrow(svg, cube, [FACES.TOP, FACES.LEFT]);
        // drawArrow(svg, cube, [FACES.TOP, FACES.BACK]);
        // drawArrow(svg, cube, [FACES.TOP, FACES.FRONT]);
    }

    drawCube(anchor: HTMLDivElement, pll: boolean): void {
        let size = this._size;
        let offset = (size - 1) / 2;

        if(pll){
            this.drawArrows(anchor);
        }

        let gridTemplate = `0.5fr repeat(${size}, 1fr) 0.5fr`;
        anchor.style.gridTemplateColumns = gridTemplate;
        anchor.style.gridTemplateRows = gridTemplate;

        let topFace = this.getFace(vec3.fromValues(0,1,0));
        // console.log('faces');
        topFace.forEach((row: mat4[], y) => {
            row.forEach((piece: mat4, x) => {
                // console.log({x,y});
                // console.log((piece as any).index);
                const color = this.getColor(piece);
                const pos = this.getPos(piece);
                // console.log(pos);
                // const xIndex = pos[0] + offset;
                // const yIndex = pos[2] + offset;
                this.placeFace(anchor, x + 2, y + 2, color, pll);
            });

            let firstPiece = row[0];
            let firstColor = this.getColor(firstPiece, vec3.fromValues(-1, 0, 0));
            this.placeFace(anchor, 1, y + 2, firstColor, pll);

            let lastPiece = row[size-1];
            let lastColor = this.getColor(lastPiece, vec3.fromValues(1, 0, 0));
            this.placeFace(anchor, size + 2, y + 2, lastColor, pll);
        });

        topFace[0].forEach((piece: mat4, x) => {
            let firstPiece = topFace[0][x];
            let firstColor = this.getColor(firstPiece, vec3.fromValues(0, 0, -1));
            this.placeFace(anchor, x + 2, 1, firstColor, pll);
        });

        topFace[size-1].forEach((piece: mat4, x) => {
            let firstPiece = topFace[size-1][x];
            let firstColor = this.getColor(firstPiece, vec3.fromValues(0, 0, 1));
            this.placeFace(anchor, x + 2, size + 2, firstColor, pll);
        });
    }
}