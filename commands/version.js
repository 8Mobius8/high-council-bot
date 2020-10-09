const { version: CURRENT_VERSION } = require('../package.json')
const botReleases = require('./versions.json')
const { MessageEmbed } = require('discord.js')

const options = ['all', 'features', 'feature', 'bugs', 'bug', 'new']

module.exports = {
  name: 'version',
  description: 'Prints version info for the bot.',
  cooldown: 5,
  execute (message, args) {
    const unsupportedArgs = args.filter(unsupportedOption)
    if (unsupportedArgs.length > 0) {
      message.channel.send(`Invalid version options were given:\n${unsupportedArgs}\n\nTry using these: \`${options}\``)
      return
    }
    const inputOptions = args.filter(supportedOption)

    const versionMessage = new MessageEmbed()
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 128 }))
    buildVersions(versionMessage, filterReleases(inputOptions, botReleases))

    message.channel.send(versionMessage)
  }
}

function supportedOption (arg) { return options.indexOf(arg) !== -1 }
function unsupportedOption (arg) { return options.indexOf(arg) === -1 }
function oneContainedIn (array, optsToMatch) {
  return array.length > 0 &&
    optsToMatch.some(opt => array.includes(opt))
}

function filterReleases (argOptions, releases) {
  let filter = (releases) => releases.filter(r => r.version === CURRENT_VERSION)

  if (oneContainedIn(argOptions, ['all'])) return releases
  if (oneContainedIn(argOptions, ['feature', 'features'])) filter = filterFeatures
  if (oneContainedIn(argOptions, ['bug', 'bugs'])) filter = filterBugs

  if (oneContainedIn(argOptions, ['new'])) filter = filterLatest(filter, releases)
  return filter(releases)
}

function filterFeatures (releases) { return filterSectionName('Feature', releases) }
function filterBugs (releases) { return filterSectionName('Bug', releases) }

function filterSectionName (fName, inputReleases) {
  return inputReleases.reduce((releases, release) => {
    if (release.sections.some(section => section.name.includes(fName))) {
      release.sections = release.sections.filter(section => section.name.includes(fName))
      releases.push(release)
    }
    return releases
  }, [])
}

function filterLatest (filter, releases) {
  return releases => filter(releases).slice(0, 1)
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
