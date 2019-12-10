import { mat4, vec3, vec4, quat } from 'gl-matrix';

let epsilon = 0.01;
function eq(x: number, y: number): boolean {
    return Math.abs(x - y) < epsilon;
}

type Point = {x: number, y: number};
type Line = {start: Point, end: Point};

export class Cube {

    private _size = 3;
    private _pieces: mat4[][][] = [];

    private _colorMap = [
        {direction: vec3.fromValues( 0, 1, 0), side: 'u', center: ' ', rotation: 'y', color: 'yellow'},
        {direction: vec3.fromValues( 0,-1, 0), side: 'd', center: 'e', rotation: ' ', color: 'white'},
        {direction: vec3.fromValues( 1, 0, 0), side: 'r', center: ' ', rotation: 'x', color: 'orange'},
        {direction: vec3.fromValues(-1, 0, 0), side: 'l', center: 'm', rotation: ' ', color: 'red'},
        {direction: vec3.fromValues( 0, 0,-1), side: 'b', center: ' ', rotation: ' ', color: 'blue'},
        {direction: vec3.fromValues( 0, 0, 1), side: 'f', center: 's', rotation: 'z', color: 'green'},
    ]
    
    constructor(size = 3) {
        this._size = size;
        let offset = this.offset();
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
    }

    offset(): number {
        return (this._size - 1) / 2;
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
        const size = this._size;
        const offset = this.offset();
        if (layer >= size ) {
            console.warn(`Can not rotate layer ${layer} of a cube-${size}.`);
            return;
        }
        const rotateUp = quat.rotationTo(quat.create(), direction, [0, 1, 0]);
        const rot = mat4.fromQuat(mat4.create(), rotateUp);
        const face: mat4[][] = Array(size).fill(0).map((e) => {return Array(size)});
        for(let z = 0; z < this._size; z++) {
            for(let y = 0; y < size; y++) {
                for(let x = 0; x < this._size; x++) {
                    let piece = this._pieces[z][y][x];
                    piece = mat4.multiply(mat4.create(), rot, piece);
                    let pos = this.getPos(piece);
                    if (eq(pos[1] + offset, size - layer - 1)) {
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
        return this.getLayer(direction);
    }

    rotateLayer(direction: vec3, amount = 1, layer = 0): void {
        let rotation = mat4.fromRotation(mat4.create(), -amount * Math.PI/2, direction);
        let slice = this.getLayer(direction, layer);
        slice.forEach((row: mat4[], y) => {
            row.forEach((piece: mat4, x) => {
                mat4.multiply(piece, rotation, piece);
            });
        });
    }

    invertMoves (moves: string): string{
        moves = moves.toLowerCase();
        moves = moves.replace(/[()]/g, '');
        const movesArray = moves.split(' ');
        let invertedMoves = '';
        for (let i = movesArray.length-1; i >= 0; i--) {
            const move = movesArray[i];
            const mainMove = move[0];
            let twoLayers = move.includes('w');
            let inverted = move.includes("'");
            let double = move.includes('2');
            
            invertedMoves += mainMove;
            invertedMoves += twoLayers ? 'w' : '';
            invertedMoves += inverted ? '' : "'";
            invertedMoves += double ? '2' : '';
            invertedMoves += ' ';
        }
        return invertedMoves;
    }

    applyMoves(moves: string, invertMoves = false): void {
        const size = this._size;
        if (invertMoves) {
            moves = this.invertMoves(moves);
        }
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

            // face rotations
            let faceData = this._colorMap.find((e) => {return e.side == mainMove});
            if (faceData) {
                this.rotateLayer(faceData.direction, amount);
                if (twoLayers) {
                    this.rotateLayer(faceData.direction, amount, 1);
                }
            }

            // center rotations
            let centerData = this._colorMap.find((e) => {return e.center == mainMove});
            if (centerData) {
                this.rotateLayer(centerData.direction, amount, Math.floor(size/2));
            }

            // cube rotations
            let rotationData = this._colorMap.find((e) => {return e.rotation == mainMove});
            if (rotationData) {
                for (let i = 0; i < size; i++) {
                    this.rotateLayer(rotationData.direction, amount, i);
                }
            }
        });
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

    getMovement(face: mat4[][], x: number, y: number): Line {
        const offset = this.offset();
        const start = {
            x: (x + 1) / (this._size + 1),
            y: (y + 1) / (this._size + 1)
        };
        let pos = this.getPos(this._pieces[y][this._size-1][x]);
        const end = {
            x: (pos[0] + offset + 1) / (this._size + 1),
            y: (pos[2] + offset + 1) / (this._size + 1)
        }
        return {start, end};
    }

    shortenLine(line: Line, amount = 15): Line {
        const diffX = (line.end.x - line.start.x) * (amount) / 100;
        const diffY = (line.end.y - line.start.y) * (amount) / 100;
        line.start.x += diffX;
        line.start.y += diffY;
        line.end.x -= diffX;
        line.end.y -= diffY;
        return line;
    }

    drawArrow(svg: SVGElement, face: mat4[][], x: number, y: number): void {
        let movement = this.getMovement(face, x, y);
        if(eq(movement.start.x, movement.end.x)
            && eq(movement.start.y, movement.end.y)) {
            return;
        }
        movement = this.shortenLine(movement);
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGLineElement;
        arrow.style.stroke = 'black';
        arrow.setAttribute('x1', (movement.start.x * 100).toString());
        arrow.setAttribute('y1', (movement.start.y * 100).toString());
        arrow.setAttribute('x2', (movement.end.x * 100).toString());
        arrow.setAttribute('y2', (movement.end.y * 100).toString());
        arrow.setAttribute('marker-start', 'url(#arrow)');
        svg.appendChild(arrow);
    }

    drawArrows(vis: HTMLDivElement, face: mat4[][]): void {
        const svg = vis.getElementsByClassName('cubeAnnotation')[0] as SVGElement;
        for (let y = 0; y < this._size; y++) {
            for (let x = 0; x < this._size; x++) {
                this.drawArrow(svg, face, x, y);
            }
        }
    }

    drawCube(anchor: HTMLDivElement, pll: boolean): void {
        let size = this._size;

        let topFace = this.getFace(vec3.fromValues(0,1,0));
        if(pll){
            this.drawArrows(anchor, topFace);
        }

        let gridTemplate = `0.5fr repeat(${size}, 1fr) 0.5fr`;
        anchor.style.gridTemplateColumns = gridTemplate;
        anchor.style.gridTemplateRows = gridTemplate;

        topFace.forEach((row: mat4[], y) => {
            row.forEach((piece: mat4, x) => {
                const color = this.getColor(piece);
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