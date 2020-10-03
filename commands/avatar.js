const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'avatar',
  description: 'Shows your avatar url',
  aliases: ['av'],
  args: false,
  guildOnly: true,
  execute: function (message, args) {
    const user = message.author
    const name = !user.displayName ? user.username : user.displayName

    const avatarEmbed = new MessageEmbed()
      .setURL(user.displayAvatarURL())
      .setTitle(name)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))

    if (message.guild.available) {
      avatarEmbed
        .addField('Roles',
          message.guild.member(user).roles.cache
            .mapValues(role => role.name)
            .reduce((acc, role) => acc + '\n' + role)
        )
    }

    message.reply(avatarEmbed)
  }
}
