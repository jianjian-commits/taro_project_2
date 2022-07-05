module.exports = function (config) {
  config.externals = Object.assign({}, config.externals, {
    'gm-pdfmake': 'pdfMake',
    'gm-pdfmake-font-bold-0': 'bold_0',
    'gm-pdfmake-font-bold-1': 'bold_1',
    'gm-pdfmake-font-regular-0': 'regular_0',
    'gm-pdfmake-font-regular-1': 'regular_1',
    xlsx: 'XLSX',
    echarts: 'echarts',
    'react-beautiful-dnd': 'ReactBeautifulDnd',
    'gm-i18n': 'gmI18n',
  })
  config.devServer = Object.assign({}, config.devServer, {
    open: true,
    host: 'localhost',
  })

  return config
}
