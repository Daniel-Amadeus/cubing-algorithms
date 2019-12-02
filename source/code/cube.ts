import { reverse } from "dns";

type Swap = {faces: number[], stickers: number[][]};

export class Cube {
    private _faces = Array(6).fill(0).map((e, i) => {return Array(9).fill(i)});
    private _pieces = Array(27).fill(0).map((e, i) =>  {return i});

    private _colors = [
        'yellow',
        'blue',
        'red',
        'green',
        'orange',
        'white'
    ];

    private _swaps = new Map<string, Swap>();
    
    constructor() {
        // console.log(this._faces);
        // console.log(this._pieces);
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
    
        let outputFaces = this._faces;
        let colors = this._colors;
        
        let leftFace = outputFaces[1];
        this.placeFace(anchor, 1, 2, colors[leftFace[0]], pll);
        this.placeFace(anchor, 1, 3, colors[leftFace[1]], pll);
        this.placeFace(anchor, 1, 4, colors[leftFace[2]], pll);
        
        let frontFace = outputFaces[2];
        this.placeFace(anchor, 2, 5, colors[frontFace[0]], pll);
        this.placeFace(anchor, 3, 5, colors[frontFace[1]], pll);
        this.placeFace(anchor, 4, 5, colors[frontFace[2]], pll);
        
        let rightFace = outputFaces[3];
        this.placeFace(anchor, 5, 2, colors[rightFace[2]], pll);
        this.placeFace(anchor, 5, 3, colors[rightFace[1]], pll);
        this.placeFace(anchor, 5, 4, colors[rightFace[0]], pll);
        
        let backFace = outputFaces[4];
        this.placeFace(anchor, 2, 1, colors[backFace[2]], pll);
        this.placeFace(anchor, 3, 1, colors[backFace[1]], pll);
        this.placeFace(anchor, 4, 1, colors[backFace[0]], pll);
        
        let topFace = outputFaces[0];
        topFace.forEach((color: number, index: number) => {
            const x = index % 3 + 2
            const y = Math.floor(index / 3) + 2;
            this.placeFace(anchor, x, y, colors[color], pll);
        });
    }
}