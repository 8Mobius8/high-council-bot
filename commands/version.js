const { version } = require('../package.json')
const releases = require('./versions.json')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'version',
  description: 'Prints version info for the bot.',
  cooldown: 5,
  execute (message, args) {
    const avatarEmbed = new MessageEmbed()
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 128 }))

    const toshow = []

    if (args.indexOf('all') > -1) {
      avatarEmbed.setTitle('Release Notes')
      toshow.push(...releases)

      avatarEmbed.description = ''
      for (const release of toshow) {
        avatarEmbed.description += `[${release.version}](${release.url}) | `
        let notes = ''
        for (const section of release.sections) {
          notes += `**${section.name}**\n${section.notes}\n\n`
        }
        avatarEmbed.addField(`${release.version}`, notes)
      }
      avatarEmbed.description = avatarEmbed.description.substr(0, avatarEmbed.description.length - 3)
    } else {
      toshow.push(releases.find(release => release.version === version))
      avatarEmbed
        .setTitle(`${version}`)
        .setURL(toshow[0].url)

      for (const release of toshow) {
        for (const section of release.sections) {
          avatarEmbed.addField(section.name, section.notes)
        }
      }
    }

    message.channel.send(avatarEmbed)
  }
}
