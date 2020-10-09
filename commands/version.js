const { version } = require('../package.json')
const botReleases = require('./versions.json')
const { MessageEmbed } = require('discord.js')

const options = ['all']

module.exports = {
  name: 'version',
  description: 'Prints version info for the bot.',
  cooldown: 5,
  execute (message, args) {
    const versionMessage = new MessageEmbed()
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 128 }))

    const unsupportedArgs = args.filter(a => options.indexOf(a) === -1)
    if (unsupportedArgs.length > 0) {
      message.channel.send(`Invalid version options were given:\n${unsupportedArgs}\n\nTry using these: \`${options}\``)
      return
    }

    const inputOptions = args.filter(a => options.indexOf(a) > -1)
    buildVersions(versionMessage, filterReleases(inputOptions, botReleases))

    message.channel.send(versionMessage)
  }
}

function filterReleases (options, releases) {
  if (options.indexOf('all') > -1) return releases
  else return releases.slice(0, 1)
}

function buildVersions (embeded, releases) {
  if (releases.length === 1) {
    buildVersion(embeded, releases[0])
    return
  }

  embeded.title = 'Release Notes'
  embeded.description = ''
  for (const release of releases) {
    embeded.description += `[${release.version}](${release.url}) | `
    let notes = ''
    for (const section of release.sections) {
      notes += `**${section.name}**\n${section.notes}\n\n`
    }
    embeded.fields.push({ name: `${release.version}`, value: notes })
  }
  embeded.description = embeded.description.slice(0, -3)
}

function buildVersion (embeded, release) {
  embeded.title = `${version}`
  embeded.url = release.url
  for (const section of release.sections) {
    embeded.fields.push({ name: section.name, value: section.notes })
  }
}
