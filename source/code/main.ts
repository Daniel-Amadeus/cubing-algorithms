import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const data = require('../algorithms.json');
const {Cube} = require('./cube');

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

                let cube = new Cube();
                cube.applyMoves(algorithm.algorithm, true);
                cube.drawCube(vis, step.short == 'pll');
            })
        })
    })

    
}