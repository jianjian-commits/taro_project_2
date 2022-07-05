const config = {
  resourceDir: 'resource',
  outputDir: 'out',
  // 下面是双语替换排除的路径
  exclude: ['demo/*.js', 'i18next.js'],
  callStatement: 'i18next.t',
  importStatementStr: "import {i18next} from 'gm-i18n';\n",
}

module.exports = config
