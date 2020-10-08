const fs = require('fs-extra')

const versionreg = /[#]+ \[(?<version>([0-9]+\.[0-9]+\.[0-9]+))\]\((?<url>[^)]+)\) \((?<date>[0-9]{4}-[0-9]{2}-[0-9]{2})\)/
const sectionreg = /^[#]+ (?<sectionName>.*)$/

fs.readFile('./CHANGELOG.md', 'utf-8')
  .then((changelog) => {
    const items = changelog.split('\n')
    const releases = []
    let currentRelease = {}
    let currentSection = {}
    for (const i in items) {
      const item = items[i]
      const versionLine = item.match(versionreg)
      const sectionLine = item.match(sectionreg)

      if (versionLine) {
        if (versionLine.groups && currentRelease.version) {
          currentRelease.sections.push(currentSection)
          currentSection = {}
          releases.push(currentRelease)
          currentRelease = {}
        }
        if (versionLine.groups.version) {
          currentRelease.version = versionLine.groups.version
          currentRelease.date = versionLine.groups.date
          currentRelease.url = versionLine.groups.url
          currentRelease.sections = []
        }
      } else if (!versionLine && sectionLine) {
        if (sectionLine && sectionLine.groups) {
          currentSection.name = sectionLine.groups.sectionName
          currentSection.notes = ''
        }
      } else if (!versionLine && item !== '' && !sectionLine) {
        currentSection.notes += item + '\n'
      }
    }
    console.debug(`Found ${releases.length} releases`)
    return Promise.resolve(releases)
  })
  .then((releases) => {
    return fs.writeJSON('./commands/versions.json', releases)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
