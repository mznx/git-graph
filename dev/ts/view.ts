import { Commit, CommitQueue, Coords, ViewParams } from './mytypes';

export class View {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    params: ViewParams;
        commit_coords: Map<string, Coords>;
    colors: string[] = ['#FF3300', '#6666FF', '#99FF66', '#CC66FF', '#FF9966', '#FF99CC',
                        '#66CCCC', '#9999CC', '#CCCC99', '#CCCCCC', '#CC9999', '#339966'];


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.commit_coords = new Map();
        this.params = {shift: {x: 0, y: 0}, margin: {x: 25, y: 30}, radius: 5, x_max: 0};
    }


    render(commit_queue: CommitQueue) {
        this.removeCommitInfoIfExist();
        this.ctx.clearRect(this.params.shift.x, this.params.shift.y, this.canvas.width, this.canvas.height);
        this.generateCoords(commit_queue);
        this.drawLines(commit_queue);
        this.drawPoints(commit_queue);
        this.drawText(commit_queue);
    }


    renderFail(msg: string) {
        this.removeCommitInfoIfExist();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = "48px serif";
        let text_width: number = this.ctx.measureText(msg).width;
        this.ctx.fillText(msg, (this.canvas.width-text_width)/2, this.canvas.height/2);
    }


    // добавляет коммиту координаты на холсте
    generateCoords(commit_queue: CommitQueue) {
        commit_queue.forEach((commit, index) => {
            commit.x = (commit.branch + 1) * this.params.margin.x;
            commit.y = (index + 1) * this.params.margin.y;

            if (commit.x > this.params.x_max)
                this.params.x_max = commit.x;
        });
    }


    drawLines(commit_queue: CommitQueue) {
        commit_queue.forEach((commit) => {
            commit.previous.forEach((prev_hash) => {
                let prev_id: number = this.getIdByHash(commit_queue, prev_hash);
                
                // координаты начальной точки
                let x0: number = commit.x;
                let y0: number = commit.y;

                // координаты конечной точки
                let x1: number = commit_queue[prev_id].x;
                let y1: number = commit_queue[prev_id].y;

                // координаты перегиба
                let xx: number, yy: number;
                if (x0 > x1) {
                    xx = x0;
                    yy = y1;
                } else {
                    xx = x1;
                    yy = y0;
                }

                // цвет линии
                let color: string;
                if (commit.branch > commit_queue[prev_id].branch)
                    color = this.colors[commit.branch % this.colors.length];
                else
                    color = this.colors[commit_queue[prev_id].branch % this.colors.length];

                // рисуем
                this.ctx.beginPath();
                this.ctx.moveTo(x0, y0);
                this.ctx.bezierCurveTo(xx, yy, xx, yy, x1, y1);
                this.ctx.strokeStyle = color;
                this.ctx.stroke();
            });
        });
    }


    drawPoints(commit_queue: CommitQueue) {
        commit_queue.forEach((commit) => {
            // цвет точки
            let color: string = this.colors[commit.branch % this.colors.length];

            // рисуем
            this.ctx.beginPath();
            this.ctx.arc(commit.x, commit.y, this.params.radius, 0, 2*Math.PI);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        });
    }


    drawText(commit_queue: CommitQueue) {
        commit_queue.forEach((commit) => {
            this.ctx.font = '14px sans-serif';
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(commit.hash, this.params.x_max + 40, commit.y);
            if (commit.hasOwnProperty('tag')) {
                this.ctx.fillStyle = 'green';
                this.ctx.fillText(commit.tag, this.params.x_max + 150, commit.y);
            }
        });
    }


    getIdByHash(commit_queue: CommitQueue, hash: string): number {
        let i: number;
        for (i = 0; i < commit_queue.length; i++) {
            if (commit_queue[i].hash == hash)
                break;
        }

        return i;
    }


    move(shift: Coords) {
        // обновляем глобальное смещение
        this.params.shift.x -= shift.x;
        this.params.shift.y -= shift.y;

        this.ctx.translate(shift.x, shift.y);
    }


    onClick(commit_queue: CommitQueue, coords: Coords, mouse: Coords) {
        this.removeCommitInfoIfExist();

        // получаем координаты в системе холста с учетом смещений
        let click_coords: Coords = {x: 0, y: 0};
        click_coords.x = coords.x + this.params.shift.x;
        click_coords.y = coords.y + this.params.shift.y;

        // проверяем произошел ли клик в области коммита
        let id: number = this.checkClickCoords(commit_queue, click_coords);
        if (id != -1)
            this.drawCommitInfo(commit_queue[id], mouse);
    }


    checkClickCoords(commit_queue: CommitQueue, coords: Coords): number {
        let commit_id: number = -1;
        for (let i = 0; i < commit_queue.length; i ++) {
            // если клик произошел по коммиту
            if ((Math.abs(commit_queue[i].x - coords.x) <= this.params.radius) && (Math.abs(commit_queue[i].y - coords.y) <= this.params.radius)) {
                commit_id = i;
                break;
            }
        }

        return commit_id;
    }


    drawCommitInfo(commit: Commit, coords: Coords) {
        let previous: string = '';
        commit.previous.forEach((prev_hash, index) => {
            previous += prev_hash;
            if (index != commit.previous.length - 1)
                previous += ', ';
        });

        let elem: HTMLDivElement = document.createElement('div');
        elem.id = 'commit_info';
        elem.style.top  = coords.y + 'px';
        elem.style.left = coords.x+10 + 'px';

        elem.innerHTML  = `<h4>Хэш: </h4><p>${commit.hash}</p>`;
        elem.innerHTML += `<h4>Текст: </h4><p>${commit.text}</p>`;
        if (commit.hasOwnProperty('tag'))
            elem.innerHTML += `<h4>Тег: </h4><p>${commit.tag}</p>`;
        elem.innerHTML += `<h4>Время: </h4><p>${(new Date(commit.time)).toLocaleString()}</p>`;
        elem.innerHTML += `<h4>Предки: </h4><p>${previous}</p>`;
        document.body.append(elem);
    }


    removeCommitInfoIfExist() {
        let elem: HTMLDivElement = document.querySelector('#commit_info');
        if (elem) 
            elem.remove();
    }
}