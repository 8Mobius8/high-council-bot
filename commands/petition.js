const { Permissions } = require('discord.js');

module.exports = {
	name: 'new-role',
	description: 'Creates a petition for a new role',
	aliases: ['nr', 'grovel-role', 'beg-for-role'],
	usage: '<role-name> <mentions-to-attach-role-to>',
	args: true,
	execute(message, args) {

		const filter = (reaction, user) => {
			return !user.bot && reaction.emoji.name === '👍' &&
        message.guild.members.resolve(user).hasPermission(Permissions.FLAGS.MANAGE_ROLES);
		};

		const roleName = args.shift();
		const mentionedMembers = message.mentions.members;

		const collector = message.createReactionCollector(filter, { time: 15000 });

		collector.on('collect', (reaction, user) => {
			console.log(`Role Admin ${user.tag} responded with ${reaction.emoji.name}. Role Approved`);
			collector.stop('role admin responded');
			const roleData = {
				data: {
					name: roleName,
					permissions: 0,
				},
				reason: 'Petition for new role was approved.',
			};
			let roleId = '';

			message.guild.roles
				.create(roleData)
				.then((role) => {
					console.log(`Create new role named ${role.name}`);
					roleId = role.id;
					return Promise.all(mentionedMembers.each(member => member.roles.add(role)));
				})
				.then((mArray) => {
					const usersLine = mArray.map(m => `<@${m[1].id}>`).join(' ');
					console.log(`Applied role to users ${usersLine}`);
					message.channel.send(
						`New role <@&${roleId}> has been create for ${usersLine}`,
						{ allowedMentions: { parse: ['roles', 'users'] } });
				})
				.catch((error) => {
					console.error(error);
					message.channel.send(`There was a problem creating a new role: ${error}`);
				});
		});

		collector.on('end', () => {
			console.log(collector.endReason());
		});

	},
};