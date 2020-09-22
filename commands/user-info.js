module.exports = {
    name: 'user-info',
    description: 'Shows Avatar URLs.',
    execute(message, args) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    }
}