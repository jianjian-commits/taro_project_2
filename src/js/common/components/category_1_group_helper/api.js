import { Request } from '@gm-common/request'
import _ from 'lodash'
import printerOptionsStore from '../common_printer_options/printer_options_store'

// 检测是否是sid => 纯数字,或纯数字字符串
const isSid = (string) => /^\d+$/.test(string)

const getCategory2 = () => Request('/merchandise/category2/get').get()
const getCategory1 = () => Request('/merchandise/category1/get').get()

export const getCategoryGroupConfig = ({ sid }) => {
  sid = isSid(sid) ? sid : null // 是sid才传给后台
  return Request('/delivery/category_config/get').data({ sid }).get()
}

export const fetchCategoryData = async ({ addressId }) => {
  const diyCategoryToggle = printerOptionsStore.diyCategoryToggle
  const getCategoryApi = diyCategoryToggle === 1 ? getCategory1 : getCategory2
  const [data1, data2] = await Promise.all([
    getCategoryApi(),
    getCategoryGroupConfig({ sid: addressId }),
  ])
  const { data: categoryList } = data1
  const { category_config, category_config_2, id } = data2.data
  // 区分二级和一级分类
  const categoryConfig =
    diyCategoryToggle === 1 ? category_config : category_config_2

  const categoryMap = categoryList.reduce((res, cur) => {
    res[cur.id] = cur.name
    return res
  }, {})

  const categoryGroupData = categoryConfig.map((items) => {
    const groupItems = []

    _.each(items, (id) => {
      if (categoryMap[id]) {
        groupItems.push({
          text: categoryMap[id],
          value: id,
        })
        delete categoryMap[id]
      }
    })
    return groupItems
  })
  if (!categoryGroupData[0]) {
    categoryGroupData[0] = []
  }
  categoryGroupData[0].push(
    ..._.map(categoryMap, (text, value) => ({ text, value })),
  )
  // 去掉空白的组
  return {
    categoryGroupData: categoryGroupData.filter((group) => group.length),
    id,
  }
}

export const saveCategoryConfig = ({ data, id, diyCategoryToggle }) => {
  const list = data.map((group) => {
    return group.map((item) => item.value)
  })

  const req =
    diyCategoryToggle === 1
      ? { category_config: JSON.stringify(list), id: id || null }
      : { category_config_2: JSON.stringify(list), id: id || null }
  Request('/delivery/category_config/update').data(req).post()
}
