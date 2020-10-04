const { versionName, version } = require('../package.json')
const { releases } = require('./versions.json')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'version',
  description: 'Prints version info for the bot.',
  cooldown: 5,
  execute (message, args) {
    const theRelease = releases.find(release => release.version === version)

    const avatarEmbed = new MessageEmbed()
      .setTitle(`${versionName} - ${version}`)
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 128 }))
      .setURL(theRelease.url)
      .addField(
        'Release Notes',
        theRelease.notes
      )
    message.channel.send(avatarEmbed)
  }
}
