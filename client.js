const Discord = require('discord.js')
const commander = require('./commander.js')
const { prefix, token } = require('./config.js')

module.exports = () => {
  const client = new Discord.Client()
  client.commander = commander

  client.once('ready', () => {
    console.log('Ready!')
  })

  client.on('message', message => {
    const commander = client.commander
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const { args, commandName } = commander.getArgs(message)

    const command = commander.getCommand(commandName)

    try {
      commander.execute(message, command, args)
    } catch (error) {
      console.log('Error when executing command.\n' + error)
    }
  })

  client.login(token)
    .catch((error) => {
      if (error.code === 'TOKEN_INVALID') {
        console.error('Discord token is not acceptable. Please set config.json or DISCORD_TOKEN appropiately.')
      } else {
        throw error
      }
    })
}
