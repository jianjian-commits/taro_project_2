import { i18next } from 'gm-i18n'
import React from 'react'
import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import globalStore from '../../../../stores/global'
import moment from 'moment'
import Big from 'big.js'
import _ from 'lodash'
import { Tip } from '@gmfe/react'
import { getCategory1 } from '../../../../merchandise/api.js'
import { System } from 'common/service'
import { isCStationAndC } from '../../../../common/service'
import { formatDate, formatDateTime } from '../../../../common/util'

class DetailStore {
  @observable basicInfo = {
    id: '',
    name: '',
    type: 1,
    category_id_1_list: [],
    price_value: '',
    min_total_price: '',
    validity_day: '',
    description: '',
    is_active: 1,
    max_discount_percent: '',
    time_type: 1, // 1-有效期天数，2-自定义
    valid_time_start: null,
    valid_time_end: null,
  }

  @observable rule = {
    audience_type: 1, // 可见范围
    address_label_ids: [],
    collect_limit: null,
    release_time: moment().startOf('day'),
    kid: [],
    receive_type: 1, // 领取方式
    max_received_num: '',
  }

  @observable view = {
    addressLabel: [],
    merchant: [],
  }

  @observable cms_key = ''

  @observable categoryOneList = []

  @observable merchantLabelList = [] // 商户标签

  @observable merchantList = [] // 商户

  @observable couponDetailList = [] // 优惠券领取明细表

  merchantListMap = {}
  labelMap = {}

  @action
  clear() {
    this.basicInfo = {
      id: '',
      name: '',
      type: 1,
      category_id_1_list: [],
      price_value: '',
      min_total_price: '',
      validity_day: '',
      description: '',
      is_active: 1,
      max_discount_percent: '',
      time_type: 1,
      valid_time_start: null,
      valid_time_end: null,
    }
    this.rule = {
      audience_type: 1,
      receive_type: 1,
      collect_limit: null,
      address_label_ids: '',
      release_time: moment().startOf('day'),
      kids: [],
      max_received_num: '',
    }
    this.view = {
      addressLabel: [],
      merchant: [],
    }
  }

  @action.bound
  getCouponDetail({ id, isCopy }) {
    Request('/coupon/get')
      .data({ id, is_retail_interface: System.isC() ? 1 : null })
      .get()
      .then(
        action('getCouponDetail', (json) => {
          const {
            id,
            name,
            category_id_1_list,
            price_value,
            audience_type,
            collect_limit,
            validity_day,
            description,
            min_total_price,
            is_active,
            max_discount_percent,
            kids,
            release_time,
            cms_key,
            address_label_dict,
            max_received_num,
            time_type,
            valid_time_end,
            valid_time_start,
          } = json.data
          // 复制订单需要清空有效期，id,发放时间
          this.basicInfo = {
            id: isCopy ? '' : id,
            name,
            type: category_id_1_list?.length > 0 ? 2 : 1, // 后端没有区分优惠券类型，前端用type区分
            category_id_1_list,
            price_value,
            min_total_price,
            validity_day: isCopy ? '' : validity_day,
            description,
            is_active,
            max_discount_percent,
            time_type,
            valid_time_end: isCopy ? null : valid_time_end,
            valid_time_start: isCopy ? null : valid_time_start,
          }
          const address_label_ids = _.map(address_label_dict, (v) => v.id)
          this.rule = {
            audience_type,
            release_time: isCopy ? null : release_time,
            address_label_ids,
            collect_limit,
            kids,
            receive_type: _.includes([2, 22, 26, 27], audience_type) ? 2 : 1,
            max_received_num,
          }
          this.cms_key = cms_key

          // 设置视图
          Promise.all([this.getAddressLabel(), this.getMerchant()]).then(() => {
            this.view = {
              addressLabel: address_label_dict || [],
              merchant: kids || [],
            }
          })
        }),
      )
  }

  @action
  changeDetail(name, val) {
    this.basicInfo[name] = val

    const { min_total_price, price_value } = this.basicInfo
    // 优惠券比例： （使用条件 - 单张面值）/ 使用条件
    if (
      (name === 'min_total_price' || name === 'price_value') &&
      min_total_price !== '' &&
      min_total_price !== '0'
    ) {
      this.basicInfo.max_discount_percent = Big(
        Big(min_total_price).minus(price_value || 0),
      )
        .div(min_total_price)
        .times(100)
        .toFixed(2)
    }
  }

  @action
  changeRule(name, val) {
    this.rule[name] = val

    if (name === 'receive_type') {
      const type = val === 1 ? (System.isC() ? 21 : 1) : System.isC() ? 22 : 2
      this.rule.audience_type = type
    }
  }

  @action
  changeView(name, val) {
    this.view[name] = val
  }

  @action
  save() {
    const {
      name,
      type,
      category_id_1_list,
      min_total_price,
      max_discount_percent,
      price_value,
      description,
      is_active,
      validity_day,
      time_type,
      valid_time_start,
      valid_time_end,
    } = this.basicInfo
    const {
      audience_type,
      release_time,
      address_label_ids,
      collect_limit,
      kids,
      max_received_num,
    } = this.rule

    const redEnvelopeShareInValid = audience_type === 27 && !max_received_num
    const validDateInvalid =
      (time_type === 1 && validity_day === '') || // 1时需校验有效期
      (time_type === 2 && !valid_time_end && !valid_time_start) // 2时需校验自定义的时间

    if (
      _.trim(name) === '' ||
      min_total_price === '' ||
      max_discount_percent === '' ||
      price_value === '' ||
      (audience_type !== 26 && audience_type !== 27 && collect_limit === '') ||
      (type === 2 && category_id_1_list.length === 0) ||
      ((audience_type === 3 || audience_type === 23) &&
        !address_label_ids.length) ||
      ((audience_type === 4 || audience_type === 24) && !kids.length) ||
      redEnvelopeShareInValid ||
      validDateInvalid
    ) {
      Tip.warning(i18next.t('请填写完整'))
      return Promise.reject(new Error('createCouponErr'))
    }

    if (
      min_total_price === '0' ||
      Big(price_value).gte(min_total_price) ||
      Big(max_discount_percent).gt(
        Big(Big(min_total_price).minus(price_value || 0))
          .div(min_total_price)
          .times(100)
          .toFixed(2),
      )
    ) {
      Tip.warning(i18next.t('请填写正确的数值'))
      return Promise.reject(new Error('createCouponErr'))
    }

    let req = {
      name,
      type,
      min_total_price,
      max_discount_percent,
      price_value,
      audience_type,
      is_active,
      time_type,
    }
    if (collect_limit) req.collect_limit = collect_limit
    if (type === 2) {
      req.category_id_1_list = JSON.stringify(category_id_1_list)
    }

    // 处理发放时间,除红包，邀请有礼外必选发放时间
    if (audience_type !== 26 && audience_type !== 27) {
      // 复制优惠券会清空，因此需要做判空
      if (!release_time) {
        Tip.warning(i18next.t('请选择发放时间'))
        return Promise.reject(new Error('createCouponErr'))
      }

      // 有效期间才判断
      if (
        time_type === 2 &&
        (moment(release_time).isAfter(valid_time_end, 'day') ||
          moment(release_time).isBefore(moment()))
      ) {
        Tip.warning(i18next.t('发放时间不能小于当天或者大于有效期'))
        return Promise.reject(new Error('createCouponErr'))
      } else {
        req = Object.assign({}, req, {
          release_time: formatDateTime(release_time),
        })
      }
    }

    if (audience_type === 3 || audience_type === 23) {
      req.address_label_ids = JSON.stringify(address_label_ids)
    } else if (audience_type === 4 || audience_type === 24) {
      req.kids = JSON.stringify(kids)
    } else if (audience_type === 27) {
      // 红包分享时领取数默认为1
      req.collect_limit = 1
      req.max_received_num = max_received_num
    }

    // 处理有效期
    if (time_type === 1) {
      req.validity_day = validity_day
    } else if (time_type === 2) {
      req.valid_time_start = formatDate(valid_time_start)
      req.valid_time_end = formatDate(valid_time_end)
    }

    if (description !== '') req = Object.assign({}, req, { description })
    // 后台不区分优惠券类型，前端用type来区分，传参修改为1
    req.type = 1
    // 判断零售还是b端的
    if (System.isC()) req.is_retail_interface = 1
    return Request('/coupon/create').data(req).post()
  }

  @action
  edit() {
    const { id, is_active } = this.basicInfo
    return Request('/coupon/edit')
      .data({ id, is_active, is_retail_interface: System.isC() ? 1 : null })
      .post()
  }

  @action
  getCategoryIdOne() {
    if (!_.isEmpty(this.categoryOneList)) return
    getCategory1().then(
      action((res) => {
        this.categoryOneList = _.map(res.data, (i) => ({
          value: i.id,
          text: i.name,
        }))
      }),
    )
  }

  @action
  getAddressLabel() {
    const url = System.isC()
      ? '/station/toc/user/label/list'
      : '/station/address_label/list'
    return Request(url)
      .get()
      .then(
        action((json) => {
          this.merchantLabelList = json.data
          // 做个map，免得后面需要遍历
          this.labelMap = _.reduce(
            json.data,
            (pre, cur) => ({
              ...pre,
              [cur.id]: cur,
            }),
            {},
          )
        }),
      )
  }

  @action
  getMerchant() {
    return Request('/coupon/address/list')
      .data({ search_type: System.isC() ? 2 : 1 })
      .get()
      .then(
        action((json) => {
          const data = json.data
          let options = []
          const cache = {}
          // 同一个kid要聚合成一条
          _.each(data.list, (customer, index) => {
            // 缓存找不到记录,该kid第一次出现
            if (!cache[customer.id]) {
              const opt = {
                value: customer.id,
                name: customer.resname,
              }
              if (System.isC())
                opt.phone = customer.username.split(globalStore.groupId)[1]
              options.push(opt)
              cache[customer.id] = options.length - 1
            } else {
              // 有记录，该kid重复出现，要聚合成一条
              const index = cache[customer.id]
              const opt = options[index]
              opt.name = System.isC()
                ? opt.phone
                : opt.name + '、' + customer.resname
            }
          })
          // 加样式
          options = _.map(options, (o) => {
            this.merchantListMap[o.value] = o.name
            return {
              value: o.value,
              name: (
                <span>
                  {System.isC() ? o.phone : `k${o.value}`}
                  <span className='gm-text-desc'>{`（${o.name}）`}</span>
                </span>
              ),
            }
          })
          this.merchantList = options
        }),
      )
  }

  @action
  fetchCouponDetailList(pagination, id) {
    const req = {
      ...pagination,
      user_type: isCStationAndC() ? 2 : 1, // 1-b端，2-c端
      id, // 只有detail才有领取明细，因此id一定会有
    }
    return Request('/coupon/collect_details/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.couponDetailList = json.data
        })
        return json
      })
  }
}

export default new DetailStore()
