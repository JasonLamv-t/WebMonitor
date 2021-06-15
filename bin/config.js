#! /usr/bin/env node

const inquirer = require('inquirer')
const fs = require('fs')
const os = require('os')
const { Command } = require('commander')
const program = new Command()
const { error, warning, info } = require('../plugins/theme')

program
// .option('-p --path <absolue path>', 'config file path')

program.parse(process.argv)
const options = program.opts()

const promptList = [{
  type: 'input',
  message: '请输入Server酱的SCKEY:',
  name: 'server_sckey'
}]

inquirer.prompt(promptList).then(answers => {
  const configDirPath = os.homedir() + '/.webmonitor/'
  let config = {}
  if (fs.existsSync(configDirPath + 'config.json')) {
    const rawdata = fs.readFileSync(configDirPath + 'config.json')
    config = JSON.parse(rawdata)
  } else if (!fs.existsSync(configDirPath)) fs.mkdirSync(configDirPath)

  config.server_sckey = answers.server_sckey

  fs.writeFileSync(configDirPath + 'config.json', JSON.stringify(config), { flag: 'w+' })
  console.log(info(`Config file save as ${configDirPath}config.json`))
})