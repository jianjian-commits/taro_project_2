import { observable, action, computed, autorun } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { System } from 'common/service'
import Big from 'big.js'
import { isValid } from 'common/util'
import { Tip } from '@gmfe/react'

class Store {
  @observable list = []

  initItem = {
    id: '',
    solution: null,
    money_delta: null,
    department_blame_name: '',
    department_to_name: '',
    text: '',
    ticket_id: 0,
    exception_reason_text: '',
    station_to_id: '',
    station_to_name: '',
    station_blame_id: '',
    station_blame_name: '',
  }

  @observable
  nonProductExceptionReasonList = [] // 非商品异常原因数组

  @observable
  nonProductExceptionSolutionList = [] // 非商品异常处理方式数组

  @observable
  stationObj = {
    _id: '',
    name: '',
  } // 本站站点信息

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  orderDetail = {}

  requiredDisposer = _.noop

  @action
  init() {
    this.list = [{ ...this.initItem }]
    this.nonProductExceptionReasonList = []
    this.nonProductExceptionSolutionList = []
    this.stationObj = {}
    this.orderDetail = {}
    this.requiredDisposer()
  }

  // 总金额变动
  @computed
  get allAbnormalMoney() {
    const newList = this.list.slice()
    let allSum = 0
    _.forEach(newList, (o) => {
      allSum = Big(allSum)
        .plus(+o.money_delta)
        .toFixed(2)
    })
    return allSum
  }

  @action
  getAbnormalReasonList() {
    return Request('/station/order/exception_base_info')
      .data()
      .get()
      .then((json) => {
        // 异常原因
        this.nonProductExceptionReasonList = _.map(
          json.data.no_sku_recent_exceptions,
          (value) => {
            return {
              text: value,
            }
          },
        )

        // 异常处理方式
        this.nonProductExceptionSolutionList = _.map(
          json.data.nosku_exception_solution,
          (value, key) => ({
            value: key,
            text: value,
          }),
        )

        // 站点信息
        this.stationObj = json.data.station_info[0]
      })
  }

  @action
  getDataList(id) {
    return Request('/station/order/edit')
      .data({ id })
      .get()
      .then((json) => {
        const list = []
        _.each(json.data.no_sku_exceptions, (item) => {
          // 非商品异常
          item.money_delta = item.money_delta
            ? +Big(item.money_delta).div(100).toFixed(2)
            : null
          list.push(item)
        })
        this.list = list.length > 0 ? list : [{ ...this.initItem }]
        this.orderDetail = json.data
      })
  }

  /**
   * 销售额 = 出库金额+运费+实退金额+异常金额-优惠金额
   */
  @computed get saleAmount() {
    const {
      real_price = 0,
      coupon_amount = 0,
      freight = 0,
      refund_money = 0,
    } = this.orderDetail

    const newList = this.list.slice()

    let exceptionAmount = 0
    _.each(newList, (o) => {
      exceptionAmount = Big(exceptionAmount).plus(o.money_delta || 0)
    })
    exceptionAmount = Big(exceptionAmount).times(100)

    const saleMoney = Big(real_price)
      .plus(freight)
      .plus(refund_money)
      .plus(exceptionAmount)
      .minus(coupon_amount)
      .div(100)
      .toFixed(2)

    return saleMoney
  }

  @action
  add(index) {
    this.list.splice(index + 1, 0, {
      ...this.initItem,
    })
  }

  @action.bound
  setValue(value, key, index) {
    // 异常原因联动基础数据
    if (key === 'exception_reason_text') {
      this.doChangeReason(index, value)
    } else {
      this.list[index][key] = value
    }
  }

  @action
  doChangeReason(index, value) {
    const changeData = {
      exception_reason_text: value,
    }

    let basicData = {}

    if (isValid(value)) {
      basicData = {
        station_to_id: this.stationObj._id,
        station_to_name: this.stationObj.name,
        station_blame_id: this.stationObj._id,
        station_blame_name: this.stationObj.name,
      }
    } else {
      basicData = {
        station_to_id: '',
        station_to_name: '',
        station_blame_id: '',
        station_blame_name: '',
      }
    }
    Object.assign(changeData, basicData)

    Object.assign(this.list[index], changeData)
  }

  @action
  delete(index) {
    this.list.splice(index, 1)

    if (this.list.length === 0) {
      this.add(0)
    }
  }

  getValidList() {
    // 只要有用户填的值，则为有效数据
    return _.filter(this.list, (item) => {
      let valid = false
      for (const [key, value] of Object.entries(item)) {
        if (
          isValid(value) &&
          key !== 'ticket_id' &&
          key !== 'exception_reason_text'
        ) {
          // ticket_id是优惠券字段，不是用户填的，不处理.异常原因需要清掉空格，单独处理
          valid = true
        }
        if (key === 'exception_reason_text' && _.trim(value) !== '') {
          valid = true
        }
      }

      return valid
    })
  }

  initAutoRun() {
    this.requiredDisposer = autorun(() => {
      const validData = this.getValidList()
      // 判断必填项---异常原因、处理方式
      _.forEach(validData, (item) => {
        if (_.trim(item.exception_reason_text) === '') {
          item.reasonError = true
        }

        if (!isValid(item.solution)) {
          item.solutionError = true
        }
      })
    })
  }

  checkSubmit() {
    const validData = this.getValidList() // 有效数据

    let canSubmit = true
    // 判断必填项---异常原因、处理方式
    _.forEach(validData, (item) => {
      if (
        _.trim(item.exception_reason_text) === '' ||
        !isValid(item.solution)
      ) {
        canSubmit = false
      }
    })

    if (!canSubmit) {
      Tip.warning('请填写完整！')
    }

    return canSubmit
  }

  getSubmitParams() {
    const exceptionList = []
    // 过滤空白行
    const newList = this.getValidList()

    _.forEach(newList, (detail) => {
      const exceptionDetail = {
        solution: +detail.solution, // 处理方式ID
        money_delta: +Big(detail.money_delta || 0).times(100), // 金额传分给后端
        department_blame_name: detail.department_blame_name,
        department_to_name: detail.department_to_name,
        station_blame_id: detail.station_blame_id, // 责任站点默认为本站站点
        station_to_id: detail.station_to_id, // 跟进站点默认为本站站点
        description: detail.text,
        ticket_id: +detail.ticket_id || 0,
        exception_reason_text: detail.exception_reason_text,
      }
      if (detail.id) {
        exceptionDetail.id = detail.id
      }
      exceptionList.push(exceptionDetail)
    })

    return {
      id: this.orderDetail._id,
      no_sku_exceptions: JSON.stringify(exceptionList), // 传[] 表示没做非商品异常
      is_retail_interface: System.isC() ? 1 : null,
      exception_type: 1, // 1-非商品异常 0-商品异常
      is_duplicate_sku: 1,
      version: this.orderDetail.version,
    }
  }

  @action
  save() {
    const params = this.getSubmitParams()
    return Request('/station/order/exception').data(params).post()
  }
}

export default new Store()
