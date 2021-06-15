const chalk = require('chalk')
const error = chalk.bgRedBright.white
const warning = chalk.keyword('orange')
const info = chalk.yellowBright

module.exports = {
  error, warning, info
}