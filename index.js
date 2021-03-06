const http = require('http')
const fs = require('fs')
const Discord = require('discord.js')
const { prefix, token, listenServer } = require('./config.js')
const { salutations } = require('./commands/phrases.json')

const client = new Discord.Client()
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)

  // set a new item in the collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command)
}

const cooldowns = new Discord.Collection()
client.once('ready', () => {
  console.log('Ready!')
})

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  const args = message.content.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => {
      return cmd.aliases && cmd.aliases.includes(commandName)
    })

  if (!command) return

  if (command.args && !args.length) {
    let reply = `You didnt' provide any arguments, ${message.author}!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.name)
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

  try {
    command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('there was an error trying to execute that command!')
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

function randomFrom (anArray) {
  return anArray[Math.floor(Math.random() * anArray.length)]
}

if (listenServer) {
  http.createServer(
    function (request, response) {
      const content = randomFrom(salutations)
      response.writeHead(200)
      response.end(content, 'utf-8')
    }
  ).listen(process.env.PORT || 443)
}
