import { observable, action, runInAction } from 'mobx'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import moment from 'moment'

class CommanderTaskStore {
  @observable
  filter = {
    dateType: '1',
    begin: new Date(),
    end: new Date(),
    q: ''
  }

  @observable
  to_print_what = {
    to_print_task: [],
    to_print_sku: []
  }

  @action
  filterChange(filter) {
    const filterObj = { ...this.filter, ...filter }
    this.filter = filterObj
  }

  @action
  mergePrintType = type => {
    Object.assign(this.to_print_what, type)
  }

  @observable commanderTaskList = []

  getRequestFilter = () => {
    const { begin, end, dateType, ...rest } = this.filter
    return {
      start_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
      query_type: +dateType,
      ...rest
    }
  }

  @action.bound
  getCommanderTaskList(pagination = null) {
    const data = {
      ...this.getRequestFilter(),
      ...pagination
    }
    this.loading = true
    return Request('/community/distributor/task/list')
      .data(data)
      .get()
      .then(json => {
        runInAction(() => {
          this.commanderTaskList = json.data
        })
        return json
      })
      .finally(() => {
        runInAction(() => {
          this.loading = false
        })
      })
  }

  @observable selectedList = []

  @observable isSelectAllPage = false

  @observable loading = false

  @action
  commanderSelect(selected) {
    if (selected.length !== this.commanderTaskList.length) {
      this.isSelectAllPage = false
    }
    this.selectedList = selected
  }

  @action
  clearSelect() {
    this.selectedList.clear()
  }

  @action
  selectAllPage(bool) {
    this.isSelectAllPage = bool
    if (bool) {
      this.selectedList = _.map(this.commanderTaskList, v => v.distributor_id)
    }
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @observable
  carrierDriverList = []

  formatDriverList(json) {
    const driverList = json.data[0]
    const carriers = json.data[1]
    const carrierDriverList = []

    // 承运商列表
    const carrierList = carriers.slice()
    _.each(carrierList, v => {
      v.name = v.company_name
    })
    carrierList.unshift({ id: '0', name: i18next.t('全部承运商') })

    const _driverList = _.map(driverList, obj => {
      return {
        value: obj.id,
        name: `${obj.name}${obj.state ? '' : i18next.t('(停用)')}`,
        carrier_id: obj.carrier_id,
        state: obj.state
      }
    })
    // 司机按承运商分组
    const driverGroup = _.groupBy(_driverList, 'carrier_id')

    _.each(carriers, obj => {
      const carrier = {
        name: obj.company_name,
        value: obj.id
      }
      // 如果存在这个运营商
      if (driverGroup[obj.id]) {
        carrier.children = driverGroup[obj.id]
        carrierDriverList.push(carrier)
      }
    })
    return carrierDriverList
  }

  @action
  getDriverList() {
    return Request('/station/task/distribute/get_drivers')
      .data()
      .get()
      .then(json => {
        runInAction(() => {
          this.carrierDriverList = _.map(this.formatDriverList(json), item => {
            const children = _.filter(item.children, child => {
              return child.state !== 0
            })
            return {
              name: item.name,
              value: item.value,
              children
            }
          })
        })
      })
  }

  @action
  commanderTaskAssign = (query, isSingle) => {
    const params = { ...this.getRequestFilter(), ...query }
    if (!this.isSelectAllPage && !isSingle) {
      params.distributor_ids = JSON.stringify(this.selectedList)
    }
    return Request('/community/distributor/task/edit_assign')
      .data(params)
      .post()
  }
}

export default new CommanderTaskStore()
