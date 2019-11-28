import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {ExerciseRunner as CubeRunner} from './runner';
import {CubeRenderer} from './renderer';
const CubeModel = require('node-cube-model');
const constants = CubeModel.constants;
const FACES = constants.FACES;
const FACEROTATIONS = constants.FACEROTATIONS;
const CUBEROTATIONS = constants.CUBEROTATIONS;
const data = require('../algorithms.json');

type Point = {x: number, y: number};
type Line = {start: Point, end: Point};

const colors = [
    'yellow',
    'blue',
    'red',
    'green',
    'orange',
    'white'
];

let faces = [
    [0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2],
    [3,3,3,3,3,3,3,3,3],
    [4,4,4,4,4,4,4,4,4],
    [5,5,5,5,5,5,5,5,5]
];

const orignCube = CubeModel.create(faces);

function invertMoves (moves: String): String{
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

function invertDirection(direction: any, invert = true): any {
    return ((direction == FACEROTATIONS.CW) != invert)
        ? FACEROTATIONS.CW
        : FACEROTATIONS.CCW;
}

function applyMoves(model: any, moves: String) {
    moves = moves.toLowerCase();
    moves = moves.replace(/[()]/g, '');
    const movesArray = moves.split(' ');
    movesArray.forEach(move => {
        const mainMove = move[0];
        let twoLayers = move.includes('w');
        let inverted = move.includes("'");
        let double = move.includes('2');

        let direction = invertDirection(FACEROTATIONS.CW, inverted);
        for(let i = 0; i < (double ? 2 : 1); i++){
            switch (mainMove) {
                case 'r': {
                    if(twoLayers) {
                        model.rotateCube(inverted ? CUBEROTATIONS.FORWARD : CUBEROTATIONS.BACK);
                        model.rotateFace(
                            FACES.LEFT, direction);
                    } else {
                        model.rotateFace(FACES.RIGHT, direction);
                    }
                    break;
                }
                case 'l': {
                    if(twoLayers) {
                        model.rotateCube(inverted
                            ? CUBEROTATIONS.BACK
                            : CUBEROTATIONS.FORWARD);
                        model.rotateFace(
                            FACES.RIGHT, direction);
                    } else {
                        model.rotateFace(FACES.LEFT, direction);
                    }
                    break;
                }
                case 'u': {
                    if(twoLayers) {
                        model.rotateCube(inverted
                            ? CUBEROTATIONS.CCW
                            : CUBEROTATIONS.CW);
                        model.rotateFace(
                            FACES.BOTTOM, direction);
                    } else {
                        model.rotateFace(FACES.TOP, direction);
                    }
                    break;
                }
                case 'd': {
                    if(twoLayers) {
                        model.rotateCube(inverted
                            ? CUBEROTATIONS.CW
                            : CUBEROTATIONS.CCW);
                        model.rotateFace(
                            FACES.TOP, direction);
                    } else {
                        model.rotateFace(FACES.BOTTOM, direction);
                    }
                    break;
                }
                case 'f': {
                    if(twoLayers) {
                        model.rotateCube(inverted
                            ? CUBEROTATIONS.LEFT
                            : CUBEROTATIONS.RIGHT);
                        model.rotateFace(
                            FACES.BACK, direction);
                    } else {
                        model.rotateFace(FACES.FRONT, direction);
                    }
                    break;
                }
                case 'b': {
                    if(twoLayers) {
                        model.rotateCube(inverted
                            ? CUBEROTATIONS.RIGHT
                            : CUBEROTATIONS.LRFT);
                        model.rotateFace(
                            FACES.FRONT, direction);
                    } else {
                        model.rotateFace(FACES.BACK, direction);
                    }
                    break;
                }
                case 'm': {
                    model.rotateCube(inverted ? CUBEROTATIONS.BACK : CUBEROTATIONS.FORWARD);
                    model.rotateFace(FACES.LEFT, invertDirection(direction));
                    model.rotateFace(FACES.RIGHT, direction);
                    break;
                }
                case 'x': {
                    model.rotateCube(inverted
                        ? CUBEROTATIONS.FORWARD
                        : CUBEROTATIONS.BACK);
                    break;
                }
                case 'y': {
                    model.rotateCube(inverted
                        ? CUBEROTATIONS.CCW
                        : CUBEROTATIONS.CW);
                    break;
                }
            }
        }
    });
}

function placeFace(
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

function getPoint(piece: any): Point {
    const position = piece.getStickerOnFace(FACES.TOP)._position;
    const index = {
        x: position % 3,
        y: Math.floor(position / 3)
    };
    return {
            x: (index.x + 1) / 4,
            y: (index.y + 1) / 4,
        }
}

function getMovement(model: any, pieceLocation: any): Line {
    const orignPiece = orignCube.getPieceByDestinationLocation(pieceLocation);
    const movedPiece = model.getPieceByDestinationLocation(pieceLocation);
    const start = getPoint(orignPiece);
    const end = getPoint(movedPiece);
    return {start, end};
}

function shortenLine(line: Line, amount = 15): Line {
    const diffX = (line.end.x - line.start.x) * (amount) / 100;
    const diffY = (line.end.y - line.start.y) * (amount) / 100;
    line.start.x += diffX;
    line.start.y += diffY;
    line.end.x -= diffX;
    line.end.y -= diffY;
    return line;
}

function drawArrow(svg: SVGElement, cube: any, pieceLocation: any): void {
    let movement = getMovement(cube, pieceLocation);
    if(movement.start.x == movement.end.x
        && movement.start.y == movement.end.y) {
        return;
    }
    movement = shortenLine(movement);
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGLineElement;
    arrow.style.stroke = 'black';
    arrow.setAttribute('x1', (movement.start.x * 100).toString());
    arrow.setAttribute('y1', (movement.start.y * 100).toString());
    arrow.setAttribute('x2', (movement.end.x * 100).toString());
    arrow.setAttribute('y2', (movement.end.y * 100).toString());
    arrow.setAttribute('marker-start', 'url(#arrow)');
    svg.appendChild(arrow);
}

function drawArrows(vis: HTMLDivElement, cube: any): void {
    const svg = vis.getElementsByClassName('cubeAnnotation')[0] as SVGElement;
    drawArrow(svg, cube, [FACES.TOP, FACES.BACK, FACES.RIGHT]);
    drawArrow(svg, cube, [FACES.TOP, FACES.BACK, FACES.LEFT]);
    drawArrow(svg, cube, [FACES.TOP, FACES.FRONT, FACES.RIGHT]);
    drawArrow(svg, cube, [FACES.TOP, FACES.FRONT, FACES.LEFT]);
    drawArrow(svg, cube, [FACES.TOP, FACES.RIGHT]);
    drawArrow(svg, cube, [FACES.TOP, FACES.LEFT]);
    drawArrow(svg, cube, [FACES.TOP, FACES.BACK]);
    drawArrow(svg, cube, [FACES.TOP, FACES.FRONT]);
}

function drawCube(anchor: HTMLDivElement, cube: any, pll: boolean): void {
    if(pll){
        drawArrows(anchor, cube);
    }

    let outputFaces = cube.getFacesArray();
    
    let leftFace = outputFaces[1];
    placeFace(anchor, 1, 2, colors[leftFace[0]], pll);
    placeFace(anchor, 1, 3, colors[leftFace[1]], pll);
    placeFace(anchor, 1, 4, colors[leftFace[2]], pll);
    
    let frontFace = outputFaces[2];
    placeFace(anchor, 2, 5, colors[frontFace[0]], pll);
    placeFace(anchor, 3, 5, colors[frontFace[1]], pll);
    placeFace(anchor, 4, 5, colors[frontFace[2]], pll);
    
    let rightFace = outputFaces[3];
    placeFace(anchor, 5, 2, colors[rightFace[2]], pll);
    placeFace(anchor, 5, 3, colors[rightFace[1]], pll);
    placeFace(anchor, 5, 4, colors[rightFace[0]], pll);
    
    let backFace = outputFaces[4];
    placeFace(anchor, 2, 1, colors[backFace[2]], pll);
    placeFace(anchor, 3, 1, colors[backFace[1]], pll);
    placeFace(anchor, 4, 1, colors[backFace[0]], pll);
    
    let topFace = outputFaces[0];
    topFace.forEach((color: number, index: number) => {
        const x = index % 3 + 2
        const y = Math.floor(index / 3) + 2;
        placeFace(anchor, x, y, colors[color], pll);
    });
}

window.onload = function() {
    const runner = new CubeRunner();
    const renderer = new CubeRenderer();
    const canvasId = 'webgl-canvas';
    if (document.getElementById(canvasId)) {
        runner.initialize(canvasId, renderer);
    }

    data.steps.forEach((step: any, stepIndex: number) => {
        step.algorithmGroups.forEach((group: any, groupIndex: number) => {
            group.algorithms.forEach(
                    (algorithm: any, algorithmIndex: number) => {
                const id =
                    `cubeVis-${stepIndex}-${groupIndex}-${algorithmIndex}`;
                const vis = document.getElementById(id) as HTMLDivElement;
                if(!vis){
                    return;
                }

                let cubeModel = CubeModel.create(faces);
                const moves = algorithm.algorithm;
                applyMoves(cubeModel, invertMoves(moves));

                drawCube(vis, cubeModel, step.short == 'pll');
            })
        })
    })

    
}