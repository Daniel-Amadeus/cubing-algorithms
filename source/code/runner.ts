import {
    Canvas,
    Initializable,
    Renderer,
} from 'webgl-operate';

export class ExerciseRunner extends Initializable {

    private _canvas: Canvas;
    private _renderer: Renderer;

    initialize(element: string, renderer: Renderer): boolean {
        this._canvas = new Canvas(element);

        this._renderer = renderer;
        this._canvas.renderer = this._renderer;

        return true;
    }

    uninitialize(): void {
        this._canvas.dispose();
        this._renderer.uninitialize();
    }

    get canvas(): Canvas {
        return this._canvas;
    }

    get renderer(): Renderer {
        return this._renderer;
    }
}
