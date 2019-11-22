import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const CubeModel = require('node-cube-model');
const constants = CubeModel.constants;
const FACES = constants.FACES;
const FACEROTATIONS = constants.FACEROTATIONS;
const CUBEROTATIONS = constants.CUBEROTATIONS;
const data = require('../algorithms.json');

const colors = [
    'yellow',
    'blue',
    'red',
    'green',
    'orange',
    'white'
];

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

function placeFace(vis: HTMLDivElement, x: number, y: number, color: string) {
    const sticker = document.createElement('div');
    sticker.className = 'cubeFace';
    sticker.classList.add(color);
    sticker.style.gridColumnStart = x.toString();
    sticker.style.gridRowStart = y.toString();
    vis.appendChild(sticker);
}

window.onload = function() {
    let faces = [
        [0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1],
        [2,2,2,2,2,2,2,2,2],
        [3,3,3,3,3,3,3,3,3],
        [4,4,4,4,4,4,4,4,4],
        [5,5,5,5,5,5,5,5,5]
    ];

    data.steps.forEach((step: any, stepIndex: number) => {
        step.algorithmGroups.forEach((group: any, groupIndex: number) => {
            group.algorithms.forEach(
                    (algorithm: any, algorithmIndex: number) => {
                const id = stepIndex + '-' + groupIndex + '-' + algorithmIndex;
                const row = document.getElementById(id) as HTMLDivElement;
                if(algorithm.beginner)
                    row.classList.add('mark');

                const vis = document
                    .getElementById('cubeVis-' + id) as HTMLDivElement;
                let cubeModel = CubeModel.create(faces);

                const moves = algorithm.algorithm;
                applyMoves(cubeModel, invertMoves(moves));

                let outputFaces = cubeModel.getFacesArray();
                
                let leftFace = outputFaces[1];
                placeFace(vis, 1, 2, colors[leftFace[0]]);
                placeFace(vis, 1, 3, colors[leftFace[1]]);
                placeFace(vis, 1, 4, colors[leftFace[2]]);
                
                let frontFace = outputFaces[2];
                placeFace(vis, 2, 5, colors[frontFace[0]]);
                placeFace(vis, 3, 5, colors[frontFace[1]]);
                placeFace(vis, 4, 5, colors[frontFace[2]]);
                
                let rightFace = outputFaces[3];
                placeFace(vis, 5, 2, colors[rightFace[2]]);
                placeFace(vis, 5, 3, colors[rightFace[1]]);
                placeFace(vis, 5, 4, colors[rightFace[0]]);
                
                let backFace = outputFaces[4];
                placeFace(vis, 2, 1, colors[backFace[2]]);
                placeFace(vis, 3, 1, colors[backFace[1]]);
                placeFace(vis, 4, 1, colors[backFace[0]]);
                
                let topFace = outputFaces[0];
                topFace.forEach((color: number, index: number) => {
                    const x = index % 3 + 2
                    const y = Math.floor(index / 3) + 2;
                    placeFace(vis, x, y, colors[color]);
                });
            })
        })
    })

    
}