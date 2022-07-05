import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { getStaticStorage } from 'gm_static_storage'
import { convertNumber2Sid } from '../common/filter'
class CommonStore {
  @observable
  materialUnitNameList = []

  @observable
  materialList = [] // 下拉框的物料

  @observable
  allDriverList = [] // 司机

  @observable
  driverList = [] // 给 cascader 的 driverlist 格式

  @observable
  customerList = []

  getDriver = (driverId) => {
    const driver = _.find(this.allDriverList, ({ value }) => {
      if (value === driverId) {
        return true
      }
    })
    return driver
  }

  @action
  fetchMaterilUnitName() {
    if (this.materialUnitNameList.length > 0) {
      return
    }
    // 周转物单位
    getStaticStorage(`/common/turnover_unit_name.json`).then((json) => {
      // this.materialUnitNameList = ['个', '框', '板', '箱', '桶', '瓶', '只']
      runInAction(() => {
        this.materialUnitNameList = json.unitName
      })
    })
  }

  @action
  async fetchDriverList() {
    const json = await Request('/station/task/distribute/get_drivers').get()

    const driverList = json.data[0]
    const carriers = json.data[1]
    const carrierDriverList = []

    const _driverList = []
    _.forEach(driverList, (obj) => {
      // 过滤 停用司机 state === 0
      if (obj.state === 0) {
        return
      }
      const driver = {
        value: obj.id,
        name: obj.name,
        carrier_id: obj.carrier_id,
      }
      _driverList.push(driver)
    })
    this.allDriverList = _driverList
    // 司机按承运商分组
    const driverGroup = _.groupBy(_driverList, 'carrier_id')

    _.each(carriers, (obj) => {
      const carrier = {
        name: obj.company_name,
        value: obj.id,
      }
      // 如果存在这个运营商
      if (driverGroup[obj.id]) {
        carrier.children = driverGroup[obj.id]
      }
      carrierDriverList.push(carrier)
    })
    runInAction(() => {
      this.driverList = carrierDriverList
    })
  }

  @action
  async fetchCustomerList() {
    const json1 = await Request('/station/order/customer/search').get()
    const json2 = await Request('/station/child_stations').get()

    // 目前 选择子站点 和 商户放在一起
    const stationList = _.map(json2.data, ({ id, name }) => {
      return {
        id, // 提交用
        name, // input 显示
        resname: `${name}(${id})`, // 搜索用
      }
    })
    const customerList = _.map(json1.data.list, (customer) => ({
      id: customer.address_id, // 提交用
      // address_id: customer.address_id,
      // uid: customer.id,
      name: customer.resname, // input 显示
      // username: customer.username,
      resname: `${customer.resname}(${convertNumber2Sid(customer.address_id)}/${
        customer.username
      })`, // 搜索用
      // receiver_name: customer.receiver_name,
      // receiver_phone: customer.receiver_phone,
      // address: customer.address,
    }))

    runInAction(() => {
      this.customerList = stationList.concat(customerList)
    })
  }

  @action
  async fetchMaterialList() {
    // 单独的下拉接口
    const json = await Request('/station/turnover/simple_list').get()
    runInAction(() => {
      this.materialList = json.data
    })
  }

  fetchList() {
    this.fetchDriverList()
    this.fetchCustomerList()
    this.fetchMaterialList()
  }
}
export default new CommonStore()
