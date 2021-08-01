import { Model } from './model';
import { Coords, Mouse } from './mytypes';

export class Controller {
    model: Model;
    mouse: Mouse;


    constructor(model: Model) {
        this.model = model;
        this.mouse = {x: 0, y: 0, isPressed: false, isMoved: false};
    }


    textInput(text: string) {
        this.model.parseJSON(text);
    }


    mouseDown(event: MouseEvent, canvas: HTMLCanvasElement) {
        // записываем координаты мыши в системе холста
        this.mouse.x = event.x - canvas.offsetLeft;
        this.mouse.y = event.y - canvas.offsetTop;
        this.mouse.isPressed = true;
    }


    mouseMove(event: MouseEvent, canvas: HTMLCanvasElement) {
        if (this.mouse.isPressed) {
            // получаем новые координаты мыши в системе холста
            let x: number = event.x - canvas.offsetLeft;
            let y: number = event.y - canvas.offsetTop;
            
            // вычисляем смещение мыши
            let shift: Coords = {x: 0, y: 0};
            shift.x = x - this.mouse.x;
            shift.y = y - this.mouse.y;

            // обновляем координаты объекта мыши на текущие
            this.mouse.x = x;
            this.mouse.y = y;

            this.mouse.isMoved = true;
            this.model.graphMove(shift);
        }
    }


    mouseUp(event: MouseEvent) {
        if (this.mouse.isPressed) {
            this.mouse.isPressed = false;
            if (!this.mouse.isMoved) {
                let mouse: Coords = {x: 0, y: 0};
                mouse.x = event.x;
                mouse.y = event.y;
                let coords: Coords = {x: 0, y: 0};
                coords.x = this.mouse.x;
                coords.y = this.mouse.y;
                this.model.checkClick(coords, mouse);
            }
            this.mouse.isMoved = false;
        }
    }
}