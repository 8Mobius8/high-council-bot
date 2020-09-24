let prefix, token;

try {
  const config = require('./config.json');
  prefix = config.prefix;
  token = config.token;
}
catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    console.log('config.json does not exist. Will fallback to `DISCORD_TOKEN` variable.');
  }
}

module.exports = {
  prefix: prefix || process.env.BOT_PREFIX || '!',
  token: token || process.env.DISCORD_TOKEN,
};