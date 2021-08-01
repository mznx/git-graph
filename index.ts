import { Model }      from './dev/ts/model';
import { View }       from './dev/ts/view';
import { Controller } from './dev/ts/controller';
import './dev/scss/main.scss';

document.addEventListener('DOMContentLoaded', () => {
    let textarea   = document.querySelector('textarea');
    let canvas     = document.querySelector('canvas');
    let view       = new View(canvas);
    let model      = new Model(view);
    let controller = new Controller(model);


    textarea.addEventListener('input', () => {
        controller.textInput(textarea.value);
    });

    canvas.addEventListener('mousedown', (event: MouseEvent) => {
        controller.mouseDown(event, canvas);
    });
    canvas.addEventListener('mousemove', (event: MouseEvent) => {
        controller.mouseMove(event, canvas);
    });
    window.addEventListener('mouseup', (event: MouseEvent) => {
        controller.mouseUp(event);
    });
});