import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const data = require('../algorithms.json');
const {Cube} = require('./cube');

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

window.onload = function() {
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

                const moves = algorithm.algorithm;

                let cube = new Cube();
                cube.applyMoves(invertMoves(moves));
                cube.drawCube(vis, step.short == 'pll');
            })
        })
    })

    
}