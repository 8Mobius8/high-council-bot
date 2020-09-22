const { MessageAttachment, ReactionCollector, Permissions } = require('discord.js');

module.exports = {
    name: 'new-role',
    description: 'Creates a petition for a new role',
    aliases: ['nr', 'grovel-role', 'beg-for-role', 'request'],
    usage: `<role-name> <mentions-to-attach-role-to>`,
    args: true,
    execute(message, args) {

        const filter = (reaction, user) => {
            return !user.bot && reaction.emoji.name === '👍' &&
                message.guild.members.resolve(user).hasPermission(Permissions.FLAGS.MANAGE_ROLES)
        };

        const roleName = args.shift();
        const usersNames = args;

        const collector = message.createReactionCollector(filter, { time: 15000 });

        collector.on('collect', (reaction, user) => {
            console.log(`Found ${reaction.emoji.name} from role manager ${user.tag}`);
            collector.stop('admin responded')
            try {
                message.guild.roles.create({
                    data: {
                        name: roleName
                    },
                    reason: 'Petition for new election as approved.',
                })
                message.channel.send(`New role ${roleName} has been created for ${usersNames}`);
            } catch (error) {
                message.channel.send(`new-role command had an error while forfilling\n${error}`)
            }
        });

        collector.on('end', collected => {
            console.log(collector.endReason());
        });

    }
}