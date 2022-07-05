import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'

const initSalemenuDetails = {
  id: '',
  name: '',
  time_config: {},
  time_config_id: '-',
  is_active: true,
  targets: [],
  supplier_name: '',
  about: '',
  copy_salemenu_id: '-',
  is_copy_salemenu: false,
  fee_type: 'CNY',
  auto_set_price: false,
  price_end_time: null,
  price_start_time: null,
  selectedSku: [],
}

class MerchandiseSaleFormStore {
  @observable feeList = [{ symbol: '￥', type: 'CNY', name: '人民币' }]
  @observable serviceTime = []

  @observable salemenuTargets = []

  @observable allSalemenuList = []

  @observable salemenuDetails = { ...initSalemenuDetails }

  @observable salemenuInfo = {
    salemenu_id: '',
    sku_data: [],
    logo: '',
    phone: '',
    sms_signature: '',
    address_url: '',
  }

  @observable skuTree = []

  @action
  getServiceTime() {
    Request('/service_time/list')
      .data({ details: 0 })
      .get()
      .then((json) => {
        runInAction(() => {
          this.serviceTime = json.data
        })
      })
  }

  @action
  getSalemenuTargets() {
    return Request('/salemenu/sale/targets')
      .get()
      .then((json) => {
        runInAction(() => {
          this.salemenuTargets = this.formatSaletarget(json.data)
        })
        return this.formatSaletarget(json.data)
      })
  }

  // MoreSelect需要的数据解构是({text, value})，接口/salemenu/sale/targets和/salemenu/sale/detail 需要格式化
  formatSaletarget(data) {
    return _.map(data, (v) => ({ text: v.name, value: v.id }))
  }

  @action
  getSalemenuDetails(id) {
    Request('/salemenu/sale/detail')
      .data({ id })
      .get()
      .then((json) => {
        runInAction(() => {
          const { time_config, targets, ...rest } = json.data
          this.salemenuDetails = {
            ...this.salemenuDetails,
            ...rest,
            targets: this.formatSaletarget(targets),
            time_config,
            time_config_id: time_config.id,
          }
        })
      })
  }

  @action
  getAllSalemenuList() {
    Request('/salemenu/sale/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.allSalemenuList = json.data
        })
      })
  }

  @action
  clearSalemenuDetails() {
    this.salemenuDetails = { ...initSalemenuDetails }
  }

  @action
  changeDetails(name, val) {
    this.salemenuDetails[name] = val
  }

  @action
  createSalemenu() {
    const {
      name,
      time_config_id,
      is_active,
      targets,
      supplier_name,
      about,
      copy_salemenu_id,
      is_copy_salemenu,
      fee_type,
      auto_set_price,
      price_end_time,
      price_start_time,
      selectedSku,
    } = this.salemenuDetails
    const params = {
      name,
      supplier_name,
      about,
      is_copy_salemenu,
      time_config_id,
      fee_type,
      is_active: is_active ? 1 : 0,
      targets: JSON.stringify(_.map(targets, (tg) => tg.value)),
      auto_set_price: auto_set_price ? 1 : 0,
      price_end_time: price_end_time
        ? moment(price_end_time).format('YYYY-MM-DD')
        : '',
      price_start_time: price_start_time
        ? moment(price_start_time).format('YYYY-MM-DD')
        : '',
      copy_salemenu_id: is_copy_salemenu ? copy_salemenu_id : null,
      sku_ids:
        is_copy_salemenu && copy_salemenu_id
          ? JSON.stringify(selectedSku)
          : null,
    }

    return Request('/salemenu/sale/create').data(params).post()
  }

  @action
  updateSalemenu() {
    const {
      id,
      name,
      time_config_id,
      is_active,
      targets,
      supplier_name,
      about,
      auto_set_price,
      price_end_time,
      price_start_time,
    } = this.salemenuDetails
    const params = {
      id,
      name,
      supplier_name,
      about,
      time_config_id,
      targets: JSON.stringify(_.map(targets, (tg) => tg.value)),
      is_active: is_active ? 1 : 0,
      auto_set_price: auto_set_price ? 1 : 0,
      price_end_time: price_end_time
        ? moment(price_end_time).format('YYYY-MM-DD')
        : '',
      price_start_time: price_start_time
        ? moment(price_start_time).format('YYYY-MM-DD')
        : '',
    }

    return Request('/salemenu/sale/update').data(params).post()
  }

  @action
  getSalemenuShareInfo(salemenu_id) {
    return Request('/station/salemenu/print')
      .data({ salemenu_id })
      .get()
      .then((json) => {
        this.salemenuInfo = json.data
        return json.data
      })
  }

  @action
  getFeeList() {
    Request('/fee/type/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.feeList = json.data
        })
      })
  }

  @action
  getSkuList(salemenu_id) {
    Request('/product/sku_salemenu/list')
      .data({ salemenu_id, limit: 99999 })
      .get()
      .then((json) => {
        runInAction(() => {
          const category1Group = _.groupBy(json.data, 'category_id_1')
          this.skuTree = _.map(category1Group, (category1) => {
            const category2Group = _.groupBy(category1, 'category_id_2')
            return {
              value: category1[0].category_id_1,
              text: category1[0].category_name_1,
              children: _.map(category2Group, (category2) => {
                const spuGroup = _.groupBy(category2, 'spu_id')
                return {
                  value: category2[0].category_id_2,
                  text: category2[0].category_name_2,
                  children: _.map(spuGroup, (spu) => {
                    return {
                      value: spu[0].spu_id,
                      text: spu[0].spu_name,
                      children: _.map(spu, (sku) => {
                        return {
                          value: sku.sku_id,
                          text: sku.sku_name,
                        }
                      }),
                    }
                  }),
                }
              }),
            }
          })
        })
      })
  }
}

export default new MerchandiseSaleFormStore()
