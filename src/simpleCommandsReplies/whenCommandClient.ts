import { BaseSimpleCommandClient } from "./baseSimpleCommandClient.js";


const preludes = ['Я считаю, это произойдет', 'Даже ежику понятно, что это произойдет', 'Ну я выбираю - это произойдет', 'Единственный верный вариант - это произойдет', 'Без базара - это произойдет'];
class WhenCommandClient extends BaseSimpleCommandClient {

    preludes = preludes;

    private randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    getWhenReply(): string {
        const date = this.randomDate(new Date(Date.now()), new Date(Date.parse('01.01.2032')));
        return `${this.getRandomPrelude()} ${date.toLocaleDateString('ru-RU')}`;
    }
}





export { WhenCommandClient };