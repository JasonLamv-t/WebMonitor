#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()

const chalk = require('chalk')
const error = chalk.bgRedBright.white
const warning = chalk.keyword('orange')
const info = chalk.yellowBright

const axios = require('axios')
const inquirer = require('inquirer')
const validator = require('../plugins/validator')
const cheerio = require('cheerio')

program
  .name('webmonitor')
  .version('1.0.0')
  .usage('-u, <Target URL> [options]')
  .option('-D, --debug', 'Debug mode', false)
  .option('-l, --log', 'Log mode', false)
  .requiredOption('-u, --url <Target URL>', 'Target URL')
  .requiredOption('-i, --interval <Interval time>', 'The interval between initiating a web request(in seconds)', '60')
  .requiredOption('-d, --daemon', 'Whether the web page will continue to run after the change', false)
  // .option('-M, --mode <Operation mode>', 'Operation mode (currently local only)', 'local')
  .option('-m, --method <Request method>', 'get | post (current get only)', 'get')
  .option('-r, --retry <Retry limit>', 'Limit the number of retries', '5')

program.parse(process.argv)

const options = program.opts()
if (options.debug) console.log('options: ', options)

// validate params
if (!validator.isUrl(options.url)) {
  console.log(error('Error! Invalid parameter Target URL'))
  return -1
}

try {
  options.interval = parseInt(options.interval)
  if (!options.interval) {
    console.log(error('Error! Invalid parameter Interval time: Not Int'))
    return -1
  }
} catch (e) {
  console.log(error('Error! Invalid parameter Interval time: Not Int'))
  return -1
}

try {
  options.retry = parseInt(options.retry)
  if (!options.retry) {
    console.log(error('Error! Invalid parameter Retry limit: Not Int'))
    return -1
  }
} catch (e) {
  console.log(error('Error! Invalid parameter Retry limit: Not Int'))
  return -1
}

// process params
options.method = 'get'  // the current method can only be 'get'

getRes = async () => {
  return new Promise((resolve, reject) => {
    axios[options.method](options.url)
      .then(r => {
        let $ = cheerio.load(r.data)
        if (options.debug) console.log($.text())
        resolve($.text())
      }).catch(e => {
        if (e.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error('Error! Request error. StatusCode:', e.response.status))
          if (options.debug || options.log) {
            console.log('Response Data:', e.response.data)
            console.log('Response Header:', e.response.headers)
          }
        } else if (e.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error('The request was made but no response was received'))
          if (options.debug || options.log) console.log('Request:', e.request)
          else console.log(warning('add \'-l\' flag for more info'))
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', e.message)
        }
        if (options.debug) console.log(e.config)
        reject(e)
      })
  })
}

main = async () => {
  let requestCount = 0, retryCount = 0
  let origin = await getRes().then(r => {
    return r
  }).catch(e => {
    return false
  })

  if (!origin) {
    console.log('process exit')
    return -1
  }
  console.log('The request for the web page is successful. Start monitoring.')

  let pro = setInterval(async () => {
    let newWeb = await getRes().then(r => {
      requestCount++
      retryCount = 0
      return r
    }).catch(e => {
      retryCount++
      return false
    })

    if (newWeb && newWeb == origin && options.log) console.log(`Request ${requestCount} times. The web page remains unchanged.`)
    else if (newWeb && newWeb != origin) {
      console.log(info('The web page has changed!'))
      if (!options.daemon) {
        console.log('process exit')
        clearInterval(pro)
      } else origin = newWeb
    }
    else if (!newWeb && retryCount <= options.retry) console.log(warning(`Request fail, retry for ${retryCount} times`))
    else if (!newWeb && retryCount > options.retry) {
      console.log(error('The number of retries exceeds the limit! Process exit.'))
      clearInterval(pro)
    }
  }, 1000 * options.interval)
}

main()