# WebMonitor
A CLI tool that monitor web page change and notifies in real-time in local

## Install

```shell
npm install webmonitor-cli -g
```

or

```shell
yarn global add webmonitor-cli
```

## Usage

```shell
webmonitor -u https://baidu.com
```

or

```shell
wmcli -u https://baidu.com
```

## Examples

Continuous monitoring of https://baidu.com with an interval of 5 seconds:

```shell
wmcli -u https://baidu.com -d -i 5
```

Log mode

```shell
wmcli -u https://baidu.com -l
```

## Options

 ```
Usage: webmonitor -u, <Target URL> [options]

Options:
  -V, --version                   output the version number
  -D, --debug                     Debug mode (default: false)
  -l, --log                       Log mode (default: false)
  -u, --url <Target URL>          Target URL
  -i, --interval <Interval time>  The interval between initiating a web request(in seconds) (default: "60")
  -d, --daemon                    Whether the web page will continue to run after the change (default: false)
  -m, --method <Request method>   get | post (current get only) (default: "get")
  -r, --retry <Retry limit>       Limit the number of retries (default: "5")
  -h, --help                      display help for command
 ```

