const { version } = require('../package.json')
const botReleases = require('./versions.json')
const { MessageEmbed } = require('discord.js')

const options = ['all', 'features', 'feature', 'bugs', 'bug', 'new']

module.exports = {
  name: 'version',
  description: 'Prints version info for the bot.',
  cooldown: 5,
  execute (message, args) {
    const versionMessage = new MessageEmbed()
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 128 }))

    const unsupportedArgs = args.filter(unsupportedOption)
    if (unsupportedArgs.length > 0) {
      message.channel.send(`Invalid version options were given:\n${unsupportedArgs}\n\nTry using these: \`${options}\``)
      return
    }

    const inputOptions = args.filter(supportedOption)
    buildVersions(versionMessage, filterReleases(inputOptions, botReleases))

    message.channel.send(versionMessage)
  }
}

function supportedOption (arg) { return options.indexOf(arg) !== -1 }
function unsupportedOption (arg) { return options.indexOf(arg) === -1 }
function oneContainedIn(opts, inputs) { return inputs.length > 0 && opts.some(opt => inputs.includes(opt)) }

function filterReleases (argOptions, releases) {
  let filter = (releases) => releases.slice(0, 1)
  if (oneContainedIn(['all'], argOptions)) return releases
  if (oneContainedIn(['feature', 'features'], argOptions)) filter = filterFeatures
  if (oneContainedIn(['bug', 'bugs'], argOptions)) filter = filterBugs

  if (oneContainedIn(['new'], argOptions)) filter = filterNew(filter, releases)
  return filter(releases)
}

function filterFeatures (release) {
  return release.reduce((featureReleases, release) => {
    if (release.sections.some(section => section.name.includes('Features'))) {
      release.sections = release.sections.filter(section => section.name.includes('Features'))
      featureReleases.push(release)
    }
    return featureReleases
  }, [])
}

function filterBugs (release) {
  return release.reduce((bugReleases, release) => {
    if (release.sections.some(section => section.name.includes('Bug'))) {
      release.sections = release.sections.filter(section => section.name.includes('Bug'))
      bugReleases.push(release)
    }
    return bugReleases
  }, [])
}

function filterNew(filter, releases) {
  return releases => filter(releases).slice(0,1)
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
  embeded.title = `${release.version}`
  embeded.url = release.url
  for (const section of release.sections) {
    embeded.fields.push({ name: section.name, value: section.notes })
  }
}
