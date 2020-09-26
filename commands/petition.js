const { Permissions } = require('discord.js')
const { adjectives, passExclaimations, failExclaimations } = require('./phrases.json')
// Time to wait for a peition
const { waitTime } = require('../config.js')

module.exports = {
  name: 'new-role',
  description: 'Creates a petition for a new role. This will create a role without any permissions.',
  aliases: ['nr', 'grovel-4-role', 'beg-4-role'],
  usage: '<role-name> <user-mentions>',
  args: true,
  cooldown: 90000,
  execute: newRoleForUsers
}

function newRoleForUsers(message, args) {
  const roleName = args.find(arg => !getUserFromArg(message.client.users.cache, arg))
  const aGuild = message.guild
  const mentionedMembers = message.mentions.members

  const usageHelp = 'Use `!help nr` to see how to usage.'
  if (mentionedMembers.size < 1) {
    return message.channel.send(`<@${message.author.id}>, you didn't mention anyone to add a role to!\n${usageHelp}.`)
  } else if (!roleName) {
    return message.channel.send(`<@${message.author.id}>, you didn't provided a role-name!\n${usageHelp}.`)
  }

  sendPetitionMessage(message.channel, roleName, message.author, mentionedMembers)
    .then((petitionMsg) => {
      const roleAdminAppovedFilter = (reaction, user) => {
        return aGuild.members.resolve(user).hasPermission(Permissions.FLAGS.MANAGE_ROLES)
      }

      const collector = petitionMsg.createReactionCollector(roleAdminAppovedFilter,
        { time: waitTime })

      collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name === '👍') {
          collector.stop('role admin approved')
        } else if (reaction.emoji.name === '👎') {
          collector.stop('role admin disapproved')
        }
      })
      collector.on('end', (collected, reason) => {
        if (reason === 'role admin approved') {
          approvedRoleCreation(aGuild, petitionMsg.channel, roleName, mentionedMembers)
        } else {
          sendUnapprovedMessage(petitionMsg.channel, roleName)
        }
      })
    })
}

function sendPetitionMessage(channel, roleName, requestor, users) {
  const usersLine = users.map(member => {
    return `<@${member.id}>`
  }).join(' ')

  const anAdjective = randomFrom(adjectives)
  return channel.send(
    '**New Role Petition**:\n' +
    `<@${requestor.id}> would like to create a new *${anAdjective}* role ${roleName} for ${usersLine}\n` +
    'Members may show support however they like.\n' +
    'A role admin please react with a 👍 or 👎 to **approve** or **disapprove** this petition.\n',
    { allowedMentions: { parse: ['users'] } }
  )
}

function approvedRoleCreation(aGuild, channel, roleName, users) {
  let roleId = ''
  createNewRole(aGuild, roleName)
    .then((role) => {
      console.log(`Created new role named ${role.name}`)
      roleId = role.id
      return applyRole(role, users)
    })
    .then((mArray) => {
      console.log(`Applied new role to users ${mArray}`)
      sendSuccessMessage(channel, roleId, mArray)
    })
    .catch((error) => {
      console.error(error)
      sendErrorMessage(error)
    })
    .finally(() => {
      console.log('Finished adding roles and appling to user.')
    })
}

function getUserFromArg(users, arg) {
  if (!arg) return

  if (arg.startsWith('<@') && arg.endsWith('>')) {
    arg = arg.slice(2, -1)

    if (arg.startsWith('!')) {
      arg = arg.slice(1)
    }

    return users.get(arg)
  }
}

function createNewRole(aGuild, name) {
  return aGuild.roles
    .create({
      data: {
        name: name,
        permissions: 0
      },
      reason: 'Petition for new role was approved.'
    })
}

function applyRole(role, members) {
  return Promise.all(
    members.each(member => member.roles.add(role.id))
  )
}

function sendSuccessMessage(channel, roleId, membersWithRole) {
  const usersLine = membersWithRole.map(member => {
    return `<@${member[1].id}>`
  }).join(' ')
  const anExclaimation = randomFrom(passExclaimations)
  return channel.send(
    '**Petition APPROVED**\n' +
    `*${anExclaimation}*\n` +
    `New role <@&${roleId}> has been create for ${usersLine}`,
    { allowedMentions: { parse: ['roles', 'users'] } }
  )
}

function sendErrorMessage(channel, error) {
  return channel.send(`There was a problem creating a new role: ${error}`)
}

function sendUnapprovedMessage(channel, roleName) {
  const anExclaimation = randomFrom(failExclaimations)
  return channel.send(
    '**Petition FAILED!**\n' +
    `*${anExclaimation}*\n` +
    `${roleName} was not created because the petition did not pass.`,
    { allowedMentions: { parse: ['roles', 'users'] } })
}

function randomFrom(anArray) {
  return anArray[Math.floor(Math.random() * anArray.length)]
}
