import _ from 'lodash'

/**
 * 将受控组件的数据合理化，undefined/null => ''
 * @param data 需要将undefined转化为''的数据
 */
const adapterNilData = (data) => {
  return _.isNil(data) ? '' : data
}

const excelHeaderData = {
  name: '工艺名称',
  custom_id: '工艺编号',
  desc: '工艺描述',
  col_name: '自定义字段名称',
  params: '自定义字段参数描述',
  col_type: '字段属性设置（0为单选，1为文本）',
}

const compareFindIndex = (fieldName, compareFieldName) => {
  return fieldName === compareFieldName
}

export { adapterNilData, excelHeaderData, compareFindIndex }
