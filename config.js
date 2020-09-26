let prefix, token, waitTime

try {
  const config = require(process.env.BOT_CONFIG_PATH || './config.json')
  prefix = config.prefix
  token = config.token
  waitTime = config['wait-time']
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    console.log('config.json does not exist. Will fallback to `DISCORD_TOKEN` variable.')
  }
}

module.exports = {
  prefix: prefix || process.env.BOT_PREFIX || '!',
  token: token || process.env.DISCORD_TOKEN,
  waitTime: waitTime || process.env.WAIT_TIME || 90000 // 1.5 mins
}
