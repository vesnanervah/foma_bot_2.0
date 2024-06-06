const preludes = [
    'Я думаю что это',
    'По моему мнению это',
    'Однозначно, это',
    'Я считаю, это',
    'Конечно же это',
    'Все знают, что это',
    'Единственный верный вариант - это',
    'Без базара, это',
    'Ну я выбираю', 
    'Тут стопудово: это',
];

function whoCommand( members: Array<string>): string {
    if (members.length < 3) {
        return 'Я знаю еще слишком мало юзеров...Давайте знакомиться!';
    }
    const member = members[Math.floor(Math.random() * members.length)];
    const prelude = preludes[Math.floor(Math.random() * preludes.length)]
    return `${member} ${prelude}`;
}

export { whoCommand };