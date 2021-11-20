const fs = require('fs')
const traverse = require('@babel/traverse').default
const parser = require('@babel/parser')
const generate = require('@babel/generator').default

const chalk = require('chalk')

let scanList = []
function deal(filePath, keywords, astNode) {
  const { value, type } = astNode
  let key = ''
  const hasKey = keywords.some(keyword => {
    if (!!~value.indexOf(keyword)) {
      key = keyword
      return true
    }
  })
  // console.info('🍉', type, value, hasKey)
  if (hasKey) {
    scanList.push({
      filePath,
      key,
      astNode
    })
  }
}
module.exports = function run(filePath, keywords, callback) {
  const code = fs.readFileSync(filePath, 'utf-8')
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: [
      // enable jsx and flow syntax
      'jsx',
      'typescript',
      'decorators-legacy',
      'throwExpressions'
    ]
  })
  scanList = []
  const visitor = {
    VariableDeclarator(astPath) {
      const node = astPath.node
      const init = node.init
      if (init && init.type === 'StringLiteral') {
        deal(filePath, keywords, init)
      }
    },
    ObjectExpression(astPath) {
      const node = astPath.node
      // 遍历object
      node.properties.forEach(prop => {
        if (prop.type === 'ObjectProperty') {
          if (prop.value.type === 'StringLiteral') {
            // 属性是字符串
            deal(filePath, keywords, prop.value)
          } else if (prop.value.type === 'Identifier') {
            // 属性是变量
            //   processIdentifier(astPath, prop.value.name)
          }
        }
      })
    },
    CallExpression(astPath) {
      const node = astPath.node
      const args = node.arguments
      args.forEach(arg => {
        if (arg.type === 'StringLiteral') {
          // 函数参数是字符串
          deal(filePath, keywords, arg)
        } else if (arg.type === 'Identifier') {
          // 函数参数是变量
          //   processIdentifier(astPath, arg.name)
        }
      })
    }
  }
  traverse(ast, visitor)
  typeof callback === 'function' && callback(scanList)
}
// function processIdentifier(astPath, name) {
//   const binding = astPath.scope.getBinding(name)
//   const bindingNode = binding.path.node
//   //   console.log('bindingNode: ', bindingNode)
//   if (bindingNode.type === 'VariableDeclarator') {
//     if (bindingNode.init.type === 'StringLiteral') {
//       log(bindingNode.init.value, 'processIdentifier')
//     }
//   }
// }
// run(`/**
// * 容十三内水s是说
// */
// import aaa from './index'
// const bbb = require('./test.js'),ccc = 'ccc==mock.key.com======'
// var method = 'fangfa====='
// async function run (aaa){
//     await testing({
//         url: "url mock.key.com ===========",
//         method,
//         param: {
//             aaa,
//             bbb
//         }
//     }, "run ===========")
//     test2(ccc) // ingggggggg
// }`)
