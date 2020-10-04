console.log('run change-db.js')

const args = process.argv.slice(2).join('')

try {
  const versiondb = JSON.parse(args)

  const data = JSON.stringify(versiondb);

  fs.writeFile('./commands/versions.json', data, (err) => {
      if (err) {
          throw err;
      }
      console.log("JSON data is saved.");
  })

} catch(err) {
  console.error(err)
}