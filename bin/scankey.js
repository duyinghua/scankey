#! /usr/bin/env node

const program = require('commander')
const path = require('path')
const klaw = require('klaw')
const ora = require('ora')

const run = require('../src/run.js')
const chalk = require('chalk')

function getRootPath() {
  return path.resolve(__dirname, '../')
}
function getPkgVersion() {
  return require(path.join(getRootPath(), 'package.json')).version
}
program
  .version(getPkgVersion())
  .usage('<command> [options]')
  .option('--root [root]', '指定检查的目录')
  .option('--keywords [keywords]', '需要检查的字符串，可用英文逗号分隔')
  .option('--ext [ext]', '指定文件类型，可用英文逗号分隔')
  .parse(process.argv)

const { root, keywords, ext = '.js,.jsx,.ts,.tsx' } = program
const keywordArr = keywords.split(',')
const extArr = ext ? ext.split(',') : []
const appPath = process.cwd()
const scanPath = path.join(appPath, root)
const filePaths = []
const spinner = ora({
  text: `代码扫描中，请稍后...`,
  color: 'blue'
}).start()
const scanResult = []
klaw(scanPath)
  .on('data', file => {
    if (!file.stats.isDirectory()) {
      spinner.text = `代码扫描中，请稍后...\n${chalk.blue(file.path)}`

      filePaths.push(file.path)
      const extname = path.extname(file.path)
      const bingo = extArr.some(ext => ext === extname)
      if (bingo) {
        try {
          run(file.path, keywordArr, scanList => {
            scanList.forEach(item => {
              const { filePath, astNode } = item
              scanResult.push(`${filePath}@${astNode.loc.start.line}:${astNode.loc.start.column}`)
            })
          })
        } catch (e) {
          console.log(chalk.red(`文件${file.path}解析异常`))
          console.log(e)
        }
      }
    }
  })
  .on('error', (err, item) => {
    console.log(err.message)
    console.log(item.path)
  })
  .on('end', () => {
    // console.log('filePaths=====', filePaths)
    if (scanResult.length) {
      spinner.fail(chalk.red(`代码扫描完成，异常文件: `))
      scanResult.forEach(res => {
        console.log(chalk.yellow('\t' + res))
      })
      process.exit(1) 
    } else {
      spinner.succeed(chalk.green('代码扫描完成！'))
    }
  })
