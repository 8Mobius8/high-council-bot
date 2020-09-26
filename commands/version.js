const { versionName, version } = require('../package.json')

module.exports = {
  name: 'version',
  description: 'Prints version info for the bot.',
  cooldown: 5,
  execute (message, args) {
    message.channel.send(`${versionName} - ${version}`)
  }
}
