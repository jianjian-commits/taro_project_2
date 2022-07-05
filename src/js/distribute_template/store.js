import { i18next } from 'gm-i18n'
import { defaultTemplateConfig, getTemplateList } from './util'
import { observable, action, computed, runInAction } from 'mobx'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import Big from 'big.js'
import moment from 'moment/moment'
import { isLK, isPL } from '../order/util'
import { Tip } from '@gmfe/react'

// 打印
class TemplateStore {
  @observable templateConfig = [defaultTemplateConfig]
  @observable template_id = '-1'

  @computed
  get curTemplateConfig() {
    const tem = _.find(this.templateConfig, (t) => +t.id === +this.template_id)
    if (tem) {
      return tem
    } else {
      return null
    }
  }

  @action
  getTemplateConfig() {
    return getTemplateList().then(
      action('getTemplateConfig', (data) => {
        if (data.length) {
          this.templateConfig = data
        }
      }),
    )
  }

  @action
  setTemplateID(id) {
    this.template_id = id
  }
}

// 继承模板store
class PrintStore {
  @observable templateConfig = [defaultTemplateConfig]
  @observable template_id = '-1'
  @observable curTemplateConfig = null
  @observable sid = ''
  @observable isLoading = true

  @action
  getTemplateConfig() {
    return getTemplateList().then((data) => {
      if (data.length) {
        runInAction(() => {
          this.templateConfig = data
          this.isLoading = false
        })
      }
      return data
    })
  }

  @action
  setTemplateID(id) {
    this.template_id = id
    let tem
    if (+this.template_id === -1) {
      tem = _.find(this.templateConfig, (template) =>
        _.includes(template.address_ids, +this.sid),
      )
    } else {
      tem = _.find(this.templateConfig, (t) => +t.id === +this.template_id)
    }
    this.curTemplateConfig = tem
  }

  @observable printData = {
    refunds: [],
    details: [],
    abnormals: [],
    allAbnormalList: [],
  }

  @action
  getPrintData(order_id) {
    return Request('/station/distribute/get_order_by_id')
      .data({ ids: JSON.stringify([order_id]) })
      .get()
      .then(
        action('getPrintData', (json) => {
          const order = json.data[0]
          this.sid = order.sid

          let customerInfo = {}
          if (
            order.origin_customer.origin_area &&
            order.origin_customer.origin_area.name
          ) {
            customerInfo = {
              resname: `${order.origin_customer.origin_resname}(${
                order.origin_customer.address_id || '-'
              })`,
              receiver_name: order.origin_customer.origin_receiver_name,
              receiver_phone: order.origin_customer.origin_receiver_phone,
              address: `${order.origin_customer.origin_area.first_name}-${order.origin_customer.origin_area.name}-${order.origin_customer.address}`,
            }
          } else {
            customerInfo = {
              resname: `${order.resname}(${order.sid || '-'})`,
              receiver_name: order.receiver_name,
              receiver_phone: order.receiver_phone,
              address: `${
                order.address_sign === i18next.t('未指定')
                  ? order.address
                  : order.address_sign + '|' + order.address
              }`,
            }
          }
          _.each(order.details, (sku) => {
            // 出库数(销售单位)
            sku.real_weight_sale =
              parseFloat(Big(sku.real_weight).div(sku.sale_ratio).toFixed(2)) +
              sku.sale_unit_name // 出库数(销售单位)
            // 每个商品应付金额
            sku.real_item_price = Big(sku.real_weight)
              .times(sku.std_sale_price)
              .toFixed(2)
            // 单价(销售单位)
            sku.sale_price = Big(sku.std_sale_price)
              .times(sku.sale_ratio)
              .toFixed(2)
            // 税率
            sku.tax_rate = Big(sku.tax_rate || 0)
              .div(100)
              .toFixed(2)
          })

          const allAbnormalList = []
          _.each(order.abnormals, (abnormal) => {
            const sku = _.find(
              order.details,
              (s) => s.id === abnormal.detail_id,
            )
            if (sku) {
              allAbnormalList.push({
                ...abnormal,
                amount_delta: Big(abnormal.amount_delta).toFixed(2),
                std_unit_name: sku.std_unit_name,
                name: sku.name,
              })
            } else {
              allAbnormalList.push({
                ...abnormal,
                std_unit_name: '',
                name: '-',
              })
            }
          })

          _.each(order.refunds, (refund) => {
            const sku = _.find(order.details, (s) => s.id === refund.detail_id)
            if (sku) {
              allAbnormalList.push({
                ...refund,
                amount_delta: Big(refund.amount_delta).toFixed(2),
                std_unit_name: sku.std_unit_name,
                name: sku.name,
              })
            } else {
              allAbnormalList.push({
                ...refund,
                std_unit_name: '',
                name: '-',
              })
            }
          })

          if (_.isNil(order.remark) || order.remark === '') {
            order.remark = '-'
          }

          this.printData = {
            allAbnormalList,
            ...order,
            ...customerInfo,
            sale_employee: order.sale_manager.name || '-',
            sale_employee_phone: order.sale_manager.phone || '-',
            id_PL: isPL(order.id) ? order.id : '',
            id_LK: isLK(order.id) ? order.id : '',
            print_time: moment().format('YYYY-MM-DD HH:mm:ss'),
            receive_time: `${moment(order.receive_begin_time).format(
              'MM-DD HH:mm',
            )}~${moment(order.receive_end_time).format('MM-DD HH:mm')} `,
            origin_order_id: order.origin_customer.origin_order_id,
            sort_id: `${order.sort_id} ${order.child_sort_id} `,
            date_time: moment(order.date_time).format('YYYY-MM-DD'),
            area_sign: `${order.city}${order.area_l1}${order.area_l2}`, // 地理标签
          }
        }),
      )
  }

  @action
  submitDistributeOrder() {
    // 取出需要的数据
    const { id, freight } = this.printData
    // 传给后台的字段
    const skuKey = [
      'id',
      'name',
      'category_title_1',
      'category_title_2',
      'pinlei_title',
      'std_sale_price',
      'sale_unit_name',
      'std_unit_name',
      'sale_ratio',
      'real_weight',
      'outer_id',
      'desc',
      'remark',
      'quantity',
    ]
    const skus = _.map(this.printData.details.slice(), (sku) => {
      return _.pickBy(sku, (val, key) => {
        return (
          val !== undefined &&
          val !== null &&
          val !== '' &&
          skuKey.includes(key)
        )
      })
    })
    const exceptionSkuKey = [
      'name',
      'type_text',
      'text',
      'amount_delta',
      'std_unit_name',
      'money_delta',
    ]
    const exception_skus = _.map(
      this.printData.allAbnormalList.slice(),
      (sku) => {
        return _.pickBy(sku, (val, key) => {
          return (
            val !== undefined &&
            val !== null &&
            val !== '' &&
            exceptionSkuKey.includes(key)
          )
        })
      },
    )

    const reqParams = {
      order_id: id,
      freight: freight,
      skus: JSON.stringify(skus),
      exception_skus: JSON.stringify(exception_skus),
    }

    const printData = this.printData
    return Request('/station/transport/distribution_order/submit')
      .data(reqParams)
      .post()
      .then(() => {
        return printData
      })
  }

  @action
  setFieldValue(field, value) {
    const _printData = { ...this.printData }
    _printData[field] = value

    _printData.total_pay = Big(_printData.freight || 0)
      .add(_printData.abnormal_money)
      .add(_printData.real_price)
      .toFixed(2)

    this.printData = _printData
  }

  @action
  setSkuDetailValue(field, skuIndex, value) {
    const newData = Object.assign({}, this.printData)
    const skuDetails = this.printData.details.slice()
    skuDetails[skuIndex][field] = value

    // 联动的数据
    const {
      real_weight,
      std_sale_price,
      sale_ratio,
      sale_unit_name,
      quantity,
    } = skuDetails[skuIndex]

    if (
      real_weight !== '' &&
      std_sale_price !== '' &&
      sale_ratio !== '' &&
      quantity !== ''
    ) {
      // 每个商品应付金额
      skuDetails[skuIndex].real_item_price = Big(real_weight)
        .times(std_sale_price)
        .toFixed(2)
      // 出库数(销售单位)
      skuDetails[skuIndex].real_weight_sale =
        parseFloat(Big(real_weight).div(sale_ratio).toFixed(2)) + sale_unit_name
      // 单价(销售单位)
      skuDetails[skuIndex].sale_price = Big(std_sale_price)
        .times(sale_ratio)
        .toFixed(2)

      // 出库金额
      newData.real_price = _.reduce(
        skuDetails,
        (sum, sku) => Big(sum).add(sku.real_item_price).toFixed(2),
        0,
      )
      // 下单金额
      newData.total_price = _.reduce(
        skuDetails,
        (sum, sku) => {
          // sku的下单金额
          const skuTotal = Big(sku.std_sale_price)
            .times(sku.sale_ratio)
            .times(sku.quantity)
            .toFixed(2)
          return Big(sum).add(skuTotal).toFixed(2)
        },
        0,
      )
      // 总应付金额
      newData.total_pay = Big(newData.freight || 0)
        .add(newData.abnormal_money)
        .add(newData.real_price)
        .toFixed(2)
    }

    newData.details = skuDetails
    this.printData = newData
  }

  @action
  deleteDetailSku(skuIndex) {
    const newData = Object.assign({}, this.printData)

    const skuDetails = this.printData.details.slice()
    // 只有一条数据不允许再删除
    if (skuDetails.length === 1) {
      Tip.info(i18next.t('至少保留一个商品'))
      return
    }
    skuDetails.splice(skuIndex, 1)
    // 重新计算一些数据
    // 出库金额
    newData.real_price = _.reduce(
      skuDetails,
      (sum, sku) => Big(sum).add(sku.real_item_price).toFixed(2),
      0,
    )
    // 下单金额
    newData.total_price = _.reduce(
      skuDetails,
      (sum, sku) => {
        // sku的下单金额
        const skuTotal = Big(sku.std_sale_price)
          .times(sku.sale_ratio)
          .times(sku.quantity)
          .toFixed(2)
        return Big(sum).add(skuTotal).toFixed(2)
      },
      0,
    )
    // 总应付金额
    newData.total_pay = Big(newData.freight || 0)
      .add(newData.abnormal_money)
      .add(newData.real_price)
      .toFixed(2)
    newData.details = skuDetails

    this.printData = newData
  }

  @action
  addDetailSku() {
    const newData = Object.assign({}, this.printData)

    const skuDetails = this.printData.details.slice()
    skuDetails.push({
      outer_id: '',
      total_item_price: 0,
      specs: '',
      real_item_price: 0,
      category_title_1: '',
      real_weight: 0,
      sale_price: 0,
      purchase_station_id: '',
      id: '',
      sale_unit_name: '',
      std_sale_price: 0,
      name: '',
      salemenu_id: '',
      sale_ratio: 1,
      remark: '',
      std_unit_name: '',
      quantity: 1,
    })

    newData.details = skuDetails

    this.printData = newData
  }

  // 异常
  @action
  setAbnormalListValue(field, index, value) {
    const newData = Object.assign({}, this.printData)
    const _allnormalList = this.printData.allAbnormalList.slice()
    _allnormalList[index][field] = value

    if (field === 'money_delta') {
      // 异常总金额
      newData.abnormal_money = _.reduce(
        _allnormalList,
        (sum, sku) =>
          Big(sum)
            .add(sku.money_delta || 0)
            .toFixed(2),
        0,
      )
      // 应付金额
      newData.total_pay = Big(newData.freight || 0)
        .add(newData.abnormal_money)
        .add(newData.real_price)
        .toFixed(2)
    }

    newData.allAbnormalList = _allnormalList

    this.printData = newData
  }

  @action
  addAbnormal() {
    const _allnormalList = this.printData.allAbnormalList.slice()
    _allnormalList.push({
      amount_delta: '',
      detail_id: '',
      money_delta: 0,
      text: '',
      type_text: '',
    })

    this.printData.allAbnormalList = _allnormalList
  }

  @action
  deleteAbnormal(index) {
    const newData = Object.assign({}, this.printData)
    const _allnormalList = this.printData.allAbnormalList.slice()
    // 只有一条数据不允许删除
    if (_allnormalList.length === 1) {
      Tip.info(i18next.t('至少保留一个商品'))
      return
    }
    _allnormalList.splice(index, 1)
    // 异常总金额
    newData.abnormal_money = _.reduce(
      _allnormalList,
      (sum, sku) =>
        Big(sum)
          .add(sku.money_delta || 0)
          .toFixed(2),
      0,
    )
    // 应付金额
    newData.total_pay = Big(newData.freight || 0)
      .add(newData.abnormal_money)
      .add(newData.real_price)
      .toFixed(2)
    newData.allAbnormalList = _allnormalList

    this.printData = newData
  }
}

const printStore = new PrintStore()
const printEditStore = new TemplateStore()

export { printStore, printEditStore }
