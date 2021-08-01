import { View } from './view';
import { Commit, Tag, CommitsObject, CommitQueue, Coords } from './mytypes';

export class Model {
    view: View;
    commit_queue: CommitQueue;
    json_check: boolean;


    constructor(view: View) {
        this.view = view;
        this.json_check = false;
    }


    parseJSON(text: string) {
        let json: CommitsObject;
        let error_msg: string;
        try {
            json = JSON.parse(text);
            if (!this.checkJSONContent(json)) throw {name: 'ContentError'};
            this.json_check = true;
        } catch (event) {
            error_msg = 'JSON: ' + event.name;
            this.json_check = false;
        }

        if (this.json_check){
            this.generateCommitQueue(json);
            this.view.render(this.commit_queue);
        } else {
            this.view.renderFail(error_msg);
        }
    }


    // добавить проверку времени
    checkJSONContent(json: CommitsObject): boolean {
        let hashs: string[] = [];
        let error: boolean = false;
        
        // проверяем наличие обязательных массивов
        if (!json.hasOwnProperty('commits'))
            return false;
        if (!json.hasOwnProperty('tags'))
            return false;

        // проверяем коммиты на наличие обязательных полей и совпадения хэшей
        for (let i = 0; i < json.commits.length; i++) {
            if (!json.commits[i].hasOwnProperty('hash') || !json.commits[i].hasOwnProperty('text') || !json.commits[i].hasOwnProperty('time') || !json.commits[i].hasOwnProperty('previous')) {
                error = true;
                break;
            }
            if (hashs.indexOf(json.commits[i].hash) !== -1) {
                error = true;
                break;
            }
            hashs.push(json.commits[i].hash);

        }
        if (error)
            return false;

        // проверяем наличие всех родителей коммитов как самостоятельных коммитов
        for (let i = 0; i < json.commits.length; i++) {
            for (let j = 0; j < json.commits[i].previous.length; j++) {
                if (hashs.indexOf(json.commits[i].previous[j]) == -1) {
                    error = true;
                    break;
                }
            }
            if (error) break;
        }
        if (error)
            return false;

        // проверяем тэги на наличие обязательных полей и корректность хэша
        for (let i = 0; i < json.tags.length; i++) {
            if (!json.tags[i].hasOwnProperty('commit') || !json.tags[i].hasOwnProperty('tag')) {
                error = true;
                break;
            }
            if (hashs.indexOf(json.tags[i].commit) == -1) {
                error = true;
                break;
            }
        }
        if (error)
            return false;

        return true;
    }


    // генерирует объект отсортированных по времени коммитов с добавлением в них ветки и тэга
    generateCommitQueue(json: CommitsObject) {
        let branchs: string[] = [];
        let tags: Tag[] = json.tags;
        this.commit_queue = json.commits;

        // сортируем по времени
        this.commit_queue.sort(function(a, b) {
            return Date.parse(a.time) - Date.parse(b.time);
        });

        // добавляем ветки и теги
        for (let i = 0; i < this.commit_queue.length; i++) {                     // проходим по коммитам
            let branchExist: boolean = false;
            for (let j = 0; j < this.commit_queue[i].previous.length; j++) {     // проходим по предкам
                for (let k = 0; k < branchs.length; k++) {                       // проходим по веткам
                    if (this.commit_queue[i].previous[j] == branchs[k]) {        // нашли ветку к которой относится
                        branchs[k] = this.commit_queue[i].hash;
                        this.commit_queue[i].branch = k;
                        branchExist = true;
                        break;
                    }
                }
                if (branchExist) break;
            }

            // создаем новую ветку, если коммит не является продолжением текущей
            if (!branchExist) {
                branchs.push(this.commit_queue[i].hash);
                this.commit_queue[i].branch = branchs.length - 1;
            }

            // добавляем тэг к коммиту, если есть
            for (let j = 0; j < tags.length; j++) {
                if (this.commit_queue[i].hash == tags[j].commit)
                    this.commit_queue[i].tag = tags[j].tag;
            }
        }
    }


    graphMove(shift: Coords) {
        if (this.json_check) {
            this.view.move(shift);
            this.view.render(this.commit_queue);
        }
    }


    checkClick(coords: Coords, mouse: Coords) {
        if (this.json_check) {
            this.view.onClick(this.commit_queue, coords, mouse);
        }
    }
}