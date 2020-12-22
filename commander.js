const Discord = require('discord.js')
const fs = require('fs')

const c = {}
c.commands = new Discord.Collection()
c.cooldowns = new Discord.Collection()

const { prefix } = require('./config.js')

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)

  // set a new item in the collection
  // with the key as the command name and the value as the exported module
  c.commands.set(command.name, command)
}

c.getArgs = (message) => {
  console.log('in getArgs')
  const args = message.content.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()
  return {
    args: args,
    commandName: commandName
  }
}

c.getCommand = (name) => {
  console.log('in getCommand')
  return c.commands.get(name) || c.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name))
}

c.execute = (message, command, args) => {
  console.log('in execute')
  if (!command) return

  if (command.args && !args.length) {
    let reply = `You didnt' provide any arguments, ${message.author}!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  if (!c.cooldowns.has(command.name)) {
    c.cooldowns.set(command.name, new Discord.Collection())
  }

  const now = Date.now()
  const timestamps = c.cooldowns.get(command.name)
  const cooldownAmount = (command.cooldown || 3) * 1000 // defaults to 3 seconds
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${command.name}\` command.`)
    }
  }

  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply('I can\'t execute that command inside DMs!')
  }

  command.execute(message, args)
}

module.exports = c
