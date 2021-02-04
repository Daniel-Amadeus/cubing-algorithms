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
        preparePracticeArea();
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

const preparePracticeArea = () => {
    const id = 'cube';
    const vis = document.getElementById(id) as HTMLDivElement;
    const algorithmLabel = document.getElementById('algorithmLabel');

    if (!vis) {
        return;
    }

    const steps = data.steps.map((step: any) => {
        const algorithms = step.algorithmGroups.map((algorithmGroup: any) => {
            return algorithmGroup.algorithms;
        })
            .flat()
            .map((algorithm: any) => {
                return algorithm.algorithm;
            });
        return { name: step.name, short: step.short, algorithms };
    });

    const algorithms = steps
        .map((step: any) => {
            return step.algorithms;
        })
        .flat();


    let cube = new Cube();
    cube.drawCube(vis, true);

    const controls =
        document.getElementById('practiceControls') as HTMLDivElement;

    const randomAlgorithmButton = document.createElement('button');
    controls.appendChild(randomAlgorithmButton);
    randomAlgorithmButton.classList.add('btn', 'btn-primary', 'btn-block');
    randomAlgorithmButton.textContent = 'random algorithm';
    randomAlgorithmButton.addEventListener('click', () => {
        const index = Math.floor(Math.random() * algorithms.length);
        const algorithm = algorithms[index];

        cube.reset(vis);
        cube.applyMoves(algorithm, true);
        cube.drawCube(vis, index >= steps[0].algorithms.length);

        algorithmLabel.innerText = algorithm;
    });

    const randomOllAlgorithmButton = document.createElement('button');
    controls.appendChild(randomOllAlgorithmButton);
    randomOllAlgorithmButton.classList.add('btn', 'btn-primary', 'btn-block');
    randomOllAlgorithmButton.textContent = 'random oll algorithm';
    randomOllAlgorithmButton.addEventListener('click', () => {
        const algs = steps[0].algorithms;
        const index = Math.floor(Math.random() * algs.length);
        const algorithm = algs[index];

        cube.reset(vis);
        cube.applyMoves(algorithm, true);
        cube.drawCube(vis);

        algorithmLabel.innerText = algorithm;
    });

    const randomPllAlgorithmButton = document.createElement('button');
    controls.appendChild(randomPllAlgorithmButton);
    randomPllAlgorithmButton.classList.add('btn', 'btn-primary', 'btn-block');
    randomPllAlgorithmButton.textContent = 'random pll algorithm';
    randomPllAlgorithmButton.addEventListener('click', () => {
        const algs = steps[1].algorithms;
        const index = Math.floor(Math.random() * algs.length);
        const algorithm = algs[index];

        cube.reset(vis);
        cube.applyMoves(algorithm, true);
        cube.drawCube(vis, true);

        algorithmLabel.innerText = algorithm;
    });
}
