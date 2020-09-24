const { Permissions } = require('discord.js');
const { adjectives, pass_exclaimations, fail_exclaimations } = require('./phrases.json');

module.exports = {
  name: 'new-role',
  description: 'Creates a petition for a new role. This will create a role without any permissions.',
  aliases: ['nr', 'grovel-4-role', 'beg-4-role'],
  usage: '<role-name> <user-mentions>',
  args: true,
  execute: newRoleForUsers,
};

function newRoleForUsers(message, args) {
  const roleName = args.find(arg => !getUserFromArg(message.client.users.cache, arg));
  const aGuild = message.guild;
  const mentionedMembers = message.mentions.members;

  const usageHelp = 'Use `!help nr` to see how to usage.';
  if (mentionedMembers.size < 1) {
    return message.channel.send(`<@${message.author.id}>, you didn't mention anyone to add a role to!\n${usageHelp}.`);
  }
  else if (!roleName) {
    return message.channel.send(`<@${message.author.id}>, you didn't provided a role-name!\n${usageHelp}.`);
  }

  sendPetitionMessage(message.channel, roleName, message.author, mentionedMembers)
    .then((petitionMsg) => {
      const roleAdminAppovedFilter = (reaction, user) => {
        return reaction.emoji.name === '👍'
          && aGuild.members.resolve(user).hasPermission(Permissions.FLAGS.MANAGE_ROLES);
      };
      const collector = petitionMsg.createReactionCollector(roleAdminAppovedFilter, { time: 15000 });

      collector.on('collect', () => collector.stop('role admin approved'));
      collector.on('end', (collected, reason) => {
        if (reason === 'role admin approved') {
          approvedRoleCreation(aGuild, petitionMsg.channel, roleName, mentionedMembers);
        }
        else {
          sendUnapprovedMessage(petitionMsg.channel, roleName);
        }
      });
    });
}

function sendPetitionMessage(channel, roleName, requestor, users) {
  const usersLine = users.map(member => {
    return `<@${member.id}>`;
  }).join(' ');

  const anAdjective = randomFrom(adjectives);
  return channel.send(
    '**New Role Petition**:\n' +
    `<@${requestor.id}> would like to create a new *${anAdjective}* role ${roleName} for ${usersLine}\n` +
    'Members may show support however they like.\n' +
    'A role admin please approve by reacting with a 👍 to approve this petition.\n',
    { allowedMentions: { parse: ['users'] } },
  );
}

function approvedRoleCreation(aGuild, channel, roleName, users) {
  let roleId = '';
  createNewRole(aGuild, roleName)
    .then((role) => {
      console.log(`Created new role named ${role.name}`);
      roleId = role.id;
      return applyRole(role, users);
    })
    .then((mArray) => {
      console.log(`Applied new role to users ${mArray}`);
      sendSuccessMessage(channel, roleId, mArray);
    })
    .catch((error) => {
      console.error(error);
      sendErrorMessage(error);
    })
    .finally(() => {
      console.log('Finished adding roles and appling to user.');
    });
}

function getUserFromArg(users, arg) {
  if (!arg) return;

  if (arg.startsWith('<@') && arg.endsWith('>')) {
    arg = arg.slice(2, -1);

    if (arg.startsWith('!')) {
      arg = arg.slice(1);
    }

    return users.get(arg);
  }
}

function createNewRole(aGuild, name) {
  return aGuild.roles
    .create({
      data: {
        name: name,
        permissions: 0,
      },
      reason: 'Petition for new role was approved.',
    });
}

function applyRole(role, members) {
  return Promise.all(
    members.each(member => member.roles.add(role.id)),
  );
}

function sendSuccessMessage(channel, roleId, membersWithRole) {
  const usersLine = membersWithRole.map(member => {
    return `<@${member[1].id}>`;
  }).join(' ');
  const anExclaimation = randomFrom(pass_exclaimations);
  return channel.send(
    '**Petition APPROVED**\n' +
    `*${anExclaimation}*\n` +
    `New role <@&${roleId}> has been create for ${usersLine}`,
    { allowedMentions: { parse: ['roles', 'users'] } },
  );
}

function sendErrorMessage(channel, error) {
  return channel.send(`There was a problem creating a new role: ${error}`);
}

function sendUnapprovedMessage(channel, roleName) {
  const anExclaimation = randomFrom(fail_exclaimations);
  return channel.send(
    '**Petition FAILED!**\n' +
    `*${anExclaimation}*\n` +
    `${roleName} was not created because the petition did not pass.`,
    { allowedMentions: { parse: ['roles', 'users'] } });
}

function randomFrom(anArray) {
  return anArray[Math.floor(Math.random() * anArray.length)];
}