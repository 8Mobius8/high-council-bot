let prefix, token;

try {
	const config = require('./config.json');
	prefix = config.prefix;
	token = config.token;
}
catch(error) {
	console.log('Problem parsing config.json');
	console.error(error);
}

module.exports = {
	prefix: prefix || '!',
	token: token || process.env.DISCORD_TOKEN,
};