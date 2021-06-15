const fs = require('fs')
const os = require('os')
const axios = require('axios')
const inquirer = require('inquirer')

const wechat = async () => {
  const configDirPath = os.homedir() + '/.webmonitor/'
  let config = {}
  if (fs.existsSync(configDirPath + 'config.json')) {
    const rawdata = fs.readFileSync(configDirPath + 'config.json')
    config = JSON.parse(rawdata)
  }

  if (!config.server_sckey) {
    console.log(error('Error: server酱 SCKEY no configured.'))
    console.log(info('please run \'wmcli config\' to config SCKEY'))
    console.log('process exit.')
    return false
  }

  const promptList = [{
    type: 'input',
    message: '请输入通知消息标题:',
    name: 'title'
  }, {
    type: 'input',
    message: '请输入通知消息内容:',
    name: 'content'
  },]

  return await inquirer.prompt(promptList).then(answers => {
    // console.log(`https://sc.ftqq.com/${config.server_sckey}.send?text=${answers.title}&desp=${answers.content}`)
    return function () {
      axios.get(`https://sc.ftqq.com/${config.server_sckey}.send`, {
        params: {
          text: answers.title,
          desp: answers.content
        }
      })
    }
  })
}

module.exports = {
  wechat
}