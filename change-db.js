console.log('running change-db.js')

const args = process.argv.slice(2)[0]

try {
  console.log(args)

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
  process.exit(1)
}