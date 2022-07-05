import _ from 'lodash'
import kidTemplate from './kid_template'

const kidTemplateDetail = () => {
  const template = _.cloneDeep(kidTemplate)
  template.contents.map((item) => {
    // 展示商户明细的模版比普通模版只是table多了一列明细
    if (item.type === 'table') {
      item.columns.push({
        head: '明细',
        headStyle: {
          textAlign: 'center',
        },
        style: {
          textAlign: 'center',
        },
        isSpecialColumn: true,
        specialDetailsKey: '__details',
        text: '{{收货商户}}*{{商户_出库数_基本单位}}{{商户_基本单位}}',
      })
    }
  })
  return template
}
export default kidTemplateDetail()
