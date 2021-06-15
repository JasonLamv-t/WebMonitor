#! /usr/bin/env node

const { Command, Option } = require('commander')
const program = new Command()

const axios = require('axios')
const cheerio = require('cheerio')
const { error, warning, info } = require('../plugins/theme')
const validator = require('../plugins/validator')
const notify = require('../plugins/notify')

program
  .usage('-u <target url> [options]')
  .requiredOption('-u --url <url>', 'monitoring target', validator.isUrl)
  .option('-l, --log', 'log mode', false)
  .option('-i, --interval <delay>', 'the interval between initiating a web request in seconds', validator.isInt, 60)
  .option('-D, --debug', 'debug mode', false)
  .option('-d, --daemon', 'monitor whether to continue after the change of the web page is detected', false)
  .addOption(new Option('-M, --mode <operation mode>', 'currently local only').choices(['local']).default('local'))
  .addOption(new Option('-m, --method <request method>', 'current get only').choices(['get']).default('get'))
  .option('-r, --retry <retry time>', 'retry times limit', validator.isInt, 5)
  .option('-w, --wechat', 'enable Wechat push notification')

program.parse(process.argv)

const options = program.opts()
if (options.debug) console.log('options: ', options)

const getRes = async () => {
  return new Promise((resolve, reject) => {
    axios[options.method](options.url)
      .then(r => {
        const $ = cheerio.load(r.data)
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

const main = async () => {
  if (options.wechat) options.wechat = await notify.wechat()
  if (!options.wechat) return -1

  let requestCount = 0, retryCount = 0
  let origin = await getRes()
    .then(r => { return r })
    .catch(e => {
      console.log(e)
      return false
    })

  console.log(origin)

  if (!origin) return { code: -1, message: 'Failed to request a web page for the first time.' }
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

    // The web page has not changed and is in log mode
    if (newWeb && newWeb == origin && options.log) console.log(`Request ${requestCount} times. The web page remains unchanged.`)
    else if (newWeb && newWeb != origin) {
      console.log(info('The web page has changed!'))
      if (options.wechat) options.wechat()
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