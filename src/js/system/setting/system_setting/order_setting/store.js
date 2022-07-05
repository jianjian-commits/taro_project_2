import { t } from 'gm-i18n'
import { observable, action } from 'mobx'
import globalStore from '../../../../stores/global'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { isCStationAndC } from 'common/service'

import { reqUrl, boolObjectToNumberObject, orderStreamType } from '../util'
import printerStore from './printer'
/**
 * 订单流类型配置, order_process_config为默认配置value值, 并且商城, 运营数据，商户结算，商户对账单不可修改
 * 对应value: 商城-0, 采购任务-1, 分拣任务-2, 配送任务-3, 销售出库-4, 运营数据-5, 商户结算-6, 商户对账单-7
 * A类订单初始默认值：0, 1, 2, 3, 4, 5, 6, 7; B类订单初始默认值：0, 5, 6, 7
 */
const initOrderData = {
  order_create_purchase_task: 0,
  order_process: [
    {
      value: 1,
      text: t('A类订单'),
      order_process_config: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    { value: 2, text: t('B类订单'), order_process_config: [0, 5, 6, 7] },
  ],
  order_can_have_duplicate_sku: 0,
  order_supplement_price: 0,
  pf_merge_order: 0,
  // 自动下单
  order_auto_print: 0,
  recalculate_freight: 0,
  contract_rate_format: 1,
  order_auto_sign: 0,
  auto_sign_days: 7,
  default_spu_remark: 0,
}

class Store {
  @observable orderData = { ...initOrderData }

  // 将获取的配置对象转换成value数组
  @action
  getInitOrderProcessConfig(configs) {
    if (!configs.length) {
      return initOrderData.order_process
    }

    // configs 后台返回配置信息，orderStreamType 前端定义配置数组
    // 处理成checkbox数组形式
    const order_process = []
    _.each(configs, (config, index) => {
      const order_process_config = []
      _.each(orderStreamType, (type) => {
        const selected = config.process[type.name]
        if (selected === '1') order_process_config.push(type.value)
      })
      order_process.push({
        id: config.id,
        value: index + 1,
        name: config.name,
        text: `${t('order_type_name', { name: config.name })}${t('订单')}`,
        order_process_config,
      })
    })
    // 按名字排序一下
    const data = _.sortBy(order_process, ({ name }) => name.toLowerCase())
    return data
  }

  @action
  initData() {
    let order_data = { ...this.orderData }
    const { orderSupplementPrice, orderInfo } = globalStore
    // 获取订单流配置信息
    const {
      orderProcess,
      orderCreatePurchaseTask,
      orderCanHaveDuplicateSku,
      recalculateFreight,
      pf_merge_order,
      contract_rate_format,
      order_auto_sign,
      auto_sign_days,
      default_spu_remark,
      order_auto_print,
    } = orderInfo
    order_data = {
      ...order_data,
      order_create_purchase_task: orderCreatePurchaseTask,
      order_process: this.getInitOrderProcessConfig(orderProcess),
      order_can_have_duplicate_sku: orderCanHaveDuplicateSku,
      order_supplement_price: orderSupplementPrice,
      default_spu_remark: default_spu_remark,
      recalculate_freight: recalculateFreight,
      pf_merge_order,
      contract_rate_format,
      order_auto_sign,
      auto_sign_days,
      order_auto_print,
    }
    Object.assign(this.orderData, { ...order_data })
  }

  @action
  changeDataItem(name, value) {
    this.orderData[name] = value
  }

  // 处理每一类订单类型value对应属性值，传给后台
  @action
  getOrderProcessConfigObj(config) {
    let data = {}
    _.each(orderStreamType, (orderType) => {
      let flag = 1
      if (_.findIndex(config, (item) => item === orderType.value) === -1) {
        flag = 0
      }
      data = {
        ...data,
        [orderType.name]: flag,
      }
    })
    return data
  }

  /** 将value数组转成obj形式传给后台, 对应订单流中的每个配置
   * obj: {bshop: 1, purchase_task: 1, sorting_task, distribute_task, out_stock, operational_data}
   */
  @action
  getAllOrderProcessConfigObj() {
    const { order_process } = this.orderData
    return _.map(order_process, (type) => {
      return {
        id: type.id,
        name: type.name,
        process: this.getOrderProcessConfigObj(type.order_process_config),
      }
    })
  }

  @action
  getPostData(type) {
    let postData = {}
    const {
      order_create_purchase_task,
      order_can_have_duplicate_sku,
      order_supplement_price,
      pf_merge_order,
      recalculate_freight,
      contract_rate_format,
      order_auto_sign,
      default_spu_remark,
      auto_sign_days,
      order_auto_print,
    } = this.orderData
    const hasEditOrderPurchaseProfitPermission = globalStore.hasPermission(
      'edit_order_purchase_profit',
    )
    const canEditOrderProcessConfig = globalStore.hasPermission(
      'edit_order_process',
    )

    const canViewDuplicateSkuSetting = globalStore.hasPermission(
      'view_edit_duplicate_sku_setting',
    )

    // 权限问题
    if (hasEditOrderPurchaseProfitPermission) {
      postData = {
        ...postData,
        order_create_purchase_task,
      }
    }

    if (canEditOrderProcessConfig) {
      postData = {
        ...postData,
        order_process: JSON.stringify(this.getAllOrderProcessConfigObj()),
      }
    }

    if (canViewDuplicateSkuSetting) {
      postData = {
        ...postData,
        order_can_have_duplicate_sku,
      }
    }

    if (!isCStationAndC()) {
      postData = {
        ...postData,
        order_supplement_price,
        pf_merge_order,
        recalculate_freight,
      }
    }
    postData = {
      ...postData,
      contract_rate_format,
      order_auto_sign,
      auto_sign_days,
      default_spu_remark,
      order_auto_print,
    }

    return boolObjectToNumberObject(postData, ['order_process'])
  }

  @action
  postSetting(type) {
    const req = { ...this.getPostData(type) }
    const url = reqUrl[type]

    return Request(url).data(req).post()
  }

  @action
  setOrderProcess(value, index) {
    const { order_process } = this.orderData
    order_process[index].order_process_config = value
  }
}

export default new Store()
