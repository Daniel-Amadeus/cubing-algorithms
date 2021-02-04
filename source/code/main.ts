import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const data = require('../algorithms.json');
const specials = require('../algorithms_special.json');
const { Cube } = require('./cube');

window.onload = function () {
    if (document.getElementById('algorithms')) {
        drawAlgorithms();
    }

    if (document.getElementById('specials')) {
        drawSpecials();
    }

    if (document.getElementById('practice')) {
        console.log('practice');
        const id = 'cube';
        const vis = document.getElementById(id) as HTMLDivElement;
        console.log(vis);

        if (!vis) {
            return;
        }

        let cube = new Cube();
        // cube.applyMoves(algorithm.algorithm, true);
        cube.drawCube(vis);
    }
}

const drawAlgorithms = () => {
    data.steps.forEach((step: any, stepIndex: number) => {
        step.algorithmGroups.forEach((group: any, groupIndex: number) => {
            group.algorithms.forEach(
                (algorithm: any, algorithmIndex: number) => {
                    const id =
                        `cubeVis-${stepIndex}-${groupIndex}-${algorithmIndex}`;
                    const vis = document.getElementById(id) as HTMLDivElement;
                    if (!vis) {
                        return;
                    }

                    let cube = new Cube();
                    cube.applyMoves(algorithm.algorithm, true);
                    cube.drawCube(vis, step.short == 'pll');
                })
        })
    })
}

const drawSpecials = () => {
    specials.forEach((specials: any, algorithmIndex: number) => {
        const id = `cubeVis-${algorithmIndex}`;
        const vis = document.getElementById(id) as HTMLDivElement;
        if (!vis) {
            return;
        }

        let cube = new Cube(specials.cube_size);
        cube.applyMoves(specials.algorithm, true);
        cube.drawCube(vis, specials.pll);
    })
}
