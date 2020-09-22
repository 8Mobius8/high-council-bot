module.exports = {
    name: 'server',
    description: 'Prints server information.',
    execute(message, args) {
        message.channel.send(`This server's name is: ${message.guild.name}\nTotal Members: ${message.guild.memberCount}`);
    }
}