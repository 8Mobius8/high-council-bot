const { version } = require('../package.json')
const { releases } = require('./versions.json')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'version',
  description: 'Prints version info for the bot.',
  cooldown: 5,
  execute (message, args) {
    const theRelease = releases.find(release => release.version === version)
    const theSections = theRelease.sections.map((i, s) => {
      return { name: s.name, value: s.notes }
    })

    const avatarEmbed = new MessageEmbed()
      .setTitle(`${version}`)
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 128 }))
      .setURL(theRelease.url)
      .addFields(theSections)
    message.channel.send(avatarEmbed)
  }
}
