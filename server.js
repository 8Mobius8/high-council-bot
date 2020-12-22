const http = require('http')
const { listenServer } = require('./config.js')
const { salutations } = require('./commands/phrases.json')

function randomFrom (anArray) {
  return anArray[Math.floor(Math.random() * anArray.length)]
}

module.exports = () => {
  if (listenServer) {
    console.log('Starting server')
    http.createServer(
      function (request, response) {
        const content = randomFrom(salutations)
        response.writeHead(200)
        response.end(content, 'utf-8')
      }
    ).listen(process.env.PORT || 443)
  }
}
