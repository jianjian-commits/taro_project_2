import _ from 'lodash'
import { i18next } from 'gm-i18n'

// 司机数据适配成级联
const driverListAdapter = (data) => {
  const driverList = data[0]
  const carriers = data[1]
  const carrierDriverList = [{ text: '未分配', value: -1 }]

  const _driverList = _.map(driverList, (obj) => {
    return {
      value: obj.id,
      text: `${obj.name}${obj.state ? '' : i18next.t('(停用)')}`,
      carrier_id: obj.carrier_id,
    }
  })

  // 司机按承运商分组
  const driverGroup = _.groupBy(_driverList, 'carrier_id')

  _.each(carriers, (obj) => {
    const carrier = {
      text: obj.company_name,
      value: obj.id,
    }
    // 如果存在这个运营商
    if (driverGroup[obj.id]) {
      carrier.children = driverGroup[obj.id]
      // 只有有司机才可以选
      carrierDriverList.push(carrier)
    }
  })

  return carrierDriverList
}

export { driverListAdapter }
