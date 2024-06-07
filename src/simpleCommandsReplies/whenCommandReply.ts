
function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getWhenReply():string {
    const date = randomDate(new Date(Date.now()), new Date(Date.parse('01.01.2032')));
    return `Я считаю, это произойдет ${date.toLocaleDateString('ru-RU')}`;

}

export { getWhenReply };