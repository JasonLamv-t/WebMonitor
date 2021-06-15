# WebMonitor-CLI
A CLI tool that monitor web page change and notifies in real-time in local

## Install

```shell
npm install webmonitor-cli -g
```

or

```shell
yarn global add webmonitor-cli
```

## Before use

```shell
webmonitor config 
```

or

```shell
wmcli config
```

## Usage

```shell
webmonitor run -u https://baidu.com
```

or

```shell
wmcli run -u https://baidu.com
```

## Examples

Continuous monitoring of https://baidu.com with an interval of 5 seconds:

```shell
wmcli run -u https://baidu.com -d -i 5
```

Log mode

```shell
wmcli run -u https://baidu.com -l
```

Notified by Wechat

```shell
wmcli run -u https://baidu.com -w
```

## Options

 ```she
Usage: run -u <target url> [options]

Options:
  -u --url <url>                 monitoring target
  -l, --log                      log mode (default: false)
  -i, --interval <delay>         the interval between initiating a web request in seconds (default: 60)
  -D, --debug                    debug mode (default: false)
  -d, --daemon                   monitor whether to continue after the change of the web page is detected (default: false)
  -M, --mode <operation mode>    currently local only (choices: "local", default: "local")
  -m, --method <request method>  current get only (choices: "get", default: "get")
  -r, --retry <retry time>       retry times limit (default: 5)
  -w --wechat                    enable Wechat push notification
  -h, --help                     display help for command
 ```

