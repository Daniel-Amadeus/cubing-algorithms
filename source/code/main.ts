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

function invertMoves (moves) {
    moves = moves.toLowerCase();
    moves = moves.replace(/[()]/g, '');
    moves = moves.split(' ');
    let invertedMoves = '';
    for (let i = moves.length-1; i >= 0; i--) {
        const move = moves[i];
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

function invertDirection(direction, invert = true) {
    return ((direction == FACEROTATIONS.CW) != invert)
        ? FACEROTATIONS.CW
        : FACEROTATIONS.CCW;
}

function applyMoves(model, moves) {
    moves = moves.toLowerCase();
    moves = moves.replace(/[()]/g, '');
    moves = moves.split(' ');
    moves.forEach(move => {
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
                    model.rotateFace(FACES.LEFT, direction);
                    break;
                }
                case 'u': {
                    model.rotateFace(FACES.TOP, direction);
                    break;
                }
                case 'd': {
                    model.rotateFace(FACES.BOTTOM, direction);
                    break;
                }
                case 'f': {
                    model.rotateFace(FACES.FRONT, direction);
                    break;
                }
                case 'b': {
                    model.rotateFace(FACES.BACK, direction);
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
            }
        }
    });
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

    data.steps.forEach((step, stepIndex) => {
        step.algorithmGroups.forEach((group, groupIndex) => {
            group.algorithms.forEach((algorithm, algorithmIndex) => {
                const id = stepIndex + '-' + groupIndex + '-' + algorithmIndex;
                const vis = document.getElementById(id);
                let cubeModel = CubeModel.create(faces);

                const moves = algorithm.algorithm;
                applyMoves(cubeModel, invertMoves(moves));

                let topFace = cubeModel.getFacesArray()[0];
                topFace.forEach(element => {
                    const sticker = document.createElement('div');
                    sticker.className = 'cubeFace';
                    sticker.classList.add(colors[element]);
                    vis.appendChild(sticker);
                });
            })
        })
    })

    
}