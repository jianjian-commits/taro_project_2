import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen, Storage, Tip } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer'
import qs from 'query-string'
import {
  driverSkuConfig,
  driverTaskConfig,
  checklistConfig,
} from '../config/template_config'
import PropTypes from 'prop-types'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import printLog from 'common/print_log'
import {
  splitOrderBaseOnCategoryConfigStorage,
  splitOrderBaseOnCategoryConfig,
  prepareSorting,
  splitOrderBaseOnCategory,
} from '../util'
import _ from 'lodash'
import moment from 'moment'
import {
  order as formatOrder,
  formatKid,
  sku as formatSku,
  task as formatTask,
  checklist as formatCheckList,
} from '../config/data_to_key'
import { ORDER_PRINT_API } from '../api'
import globalStore from 'stores/global'
import { isThermalPrinter } from 'common/components/select_print_template/store'
import { KidTemplate, KidTemplateDetail } from '../config/template_config'
import Big from 'big.js'
import { getCategoryGroupConfig } from 'common/components/category_1_group_helper/api'

setTitle(i18next.t('打印'))

const sortFirst = (type) => {
  if (type === 'line') {
    return (o) => o.data._origin.address_route_name
  } else if (type === 'driver') {
    return (o) => o.data._origin.driver_name
  } else {
    return _.noop
  }
}

class Print extends React.Component {
  query = this.props.history.location.query
  order_ids = [] // 订单id列表
  ids = ''
  category_config = [] // 自定义分单打印配置

  /**
   * 核查单
   * @param ids 已JSON.stringify的数组
   * @param page 打印配置,页面信息
   * @returns {*}
   */
  getChecklist(ids, page) {
    return ORDER_PRINT_API[1]({ ids }).then((data) => {
      const newChecklistConfig = {
        ...checklistConfig,
        page: {
          ...checklistConfig.page,
          ...page,
        },
      }

      return data.map((item) => {
        return {
          data: formatCheckList(item),
          config: newChecklistConfig,
        }
      })
    })
  }

  /**
   * 司机装车,司机任务
   * @param print_drivers  已JSON.stringify的司机ids数组
   * @param page 打印配置页面信息
   * @returns {*}
   */
  getSkuAndTask(print_drivers, page) {
    return Request('/station/transport/driver_tasks/print')
      .data({ print_drivers })
      .get()
      .then((json) => {
        const sku = []
        const tasks = []
        // 👓如有配送单,使用配送单的纸张尺寸
        const newDriverSkuConfig = {
          ...driverSkuConfig,
          page: {
            ...driverSkuConfig.page,
            ...page,
          },
        }
        const newDriverTaskConfig = {
          ...driverTaskConfig,
          page: {
            ...driverTaskConfig.page,
            ...page,
          },
        }
        _.each(json.data, (o) => {
          const { order_detail, sku_detail, ...rest } = o
          // 司机装车单
          const skuObj = {
            data: formatSku({ sku_detail, ...rest }),
            config: newDriverSkuConfig,
          }
          sku.push(skuObj)
          // 司机任务单
          const tasksObj = {
            data: formatTask({ order_detail, ...rest }, (data) => data.slice()),
            config: newDriverTaskConfig,
          }
          tasks.push(tasksObj)
        })
        return { sku, tasks }
      })
  }

  // 其他单排序
  sortList = (list) => {
    const { type, sortType } = this.query

    // 根据搜索列表排序字段排序
    if (sortType) {
      const { field, sortWay } = prepareSorting(sortType)

      const result = _.sortBy(list, [(o) => o.data._origin[field]])
      return sortWay === 'desc' ? result.reverse() : result
    } else {
      return _.sortBy(list, [
        sortFirst(type),
        type === 'line'
          ? (o) => o.data._origin.sort_id
          : (o) => moment.now() - moment(o.data._origin.date_time),
      ])
    }
  }

  // 分拣核查单排序
  sortChecklist = (list) => {
    return _.sortBy(list, [
      sortFirst(this.query.type),
      (o) => o.data._origin.sort_id,
    ])
  }

  batchPlus = (accumulator, current, keys) => {
    keys.forEach((key) => {
      if (key === 'merchandise') {
        accumulator[key].push(current[key][0])
      } else {
        accumulator[key] = Big(accumulator[key]).plus(current[key])
      }
    })
  }

  // 按账户打印
  getKidPrint = (getDataPromise) => {
    /*
     *  kidToIndex
     * {
     *   [kid]: {
     *     index: 0,
     *     nowSkuIndex: 0,
     *     skuToIndex: {
     *         [sku]: 0
     *      }
     *   }
     * }
     * */
    const kidToIndex = {}
    let kidIndex = 0
    const initData = (d) => {
      return {
        username: d.username,
        total_price: d.total_price,
        real_price: d.real_price,
        freight: d.freight,
        abnormal_money: d.abnormal_money,
        before_change_total_pay: d.before_change_total_pay, // 原销售额
        refund_money: d.refund_money,
        total_pay: d.total_pay,
        details: [],
      }
    }
    const {
      kidMergeType = null, // 账户合并配送单据 0汇总商品数量 1展示商户明细一模板
    } = this.query

    return getDataPromise.then((data) => {
      return data
        .reduce((accumulator, currentValue) => {
          const kid = currentValue.uid
          const existIndex = kidToIndex[kid]?.index
          // 账户
          if (existIndex !== undefined) {
            this.batchPlus(accumulator[existIndex], currentValue, [
              'total_price',
              'real_price',
              'freight',
              'abnormal_money',
              'refund_money',
              'total_pay',
              'before_change_total_pay',
            ])
          } else {
            kidToIndex[kid] = {
              index: kidIndex,
              nowSkuIndex: 0,
              skuToIndex: {},
            }
            kidIndex += 1
            accumulator.push(initData(currentValue))
          }

          const currentKid = kidToIndex[kid]
          // sku
          currentValue.details.forEach((detail) => {
            const sku = detail.id
            // 把商户信息塞进每条detail
            detail.merchandise = [
              {
                resname: currentValue.resname,
                sid_real_weight: detail.real_weight,
                sid_std_unit_name_forsale: detail.std_unit_name_forsale,
              },
            ]
            const existIndex = currentKid.skuToIndex[sku]
            if (existIndex !== undefined) {
              this.batchPlus(
                accumulator[currentKid.index].details[existIndex],
                detail,
                ['quantity', 'real_weight', 'real_item_price', 'merchandise'],
              )
            } else {
              currentKid.skuToIndex[sku] = currentKid.nowSkuIndex
              currentKid.nowSkuIndex += 1
              accumulator[currentKid.index].details.push(detail)
            }
          })
          return accumulator
        }, [])
        .map((v) => {
          // 账户合并配送单据 0汇总商品数量 1展示商户明细一模板
          const templateConfig =
            kidMergeType === '1' ? KidTemplateDetail : KidTemplate
          return {
            data: formatKid(v),
            config: templateConfig,
          }
        })
    })
  }

  commonHandle = ([dataList, configList]) => {
    // errorAlert(dataList, configList)
    // 全选所有页打印时: 前端不会传order_ids, 为保证打印次数正确, 需从后台接口中获取数据
    // 合并sid进行打印时，后台不返回id值，返回的时order_ids数组中包含的所有的id值
    // 记录打印次数，需要向后端传递this.order_ids
    if (this.query.mergeDeliveryType === '1') {
      this.order_ids = _.flatten(
        _.reduce(dataList, (prev, item) => [...prev, item.order_ids], []),
      )
    } else {
      this.order_ids = _.map(dataList, (item) => item.id)
    }
  }

  /**
   * 分单逻辑
   * @param data
   * @param config
   * @returns {*[]|{data: *, config: *}[]}
   */
  splitOrderHelper = (data, config) => {
    const { diy_category_toggle, isCategorySuffix } = this.query
    // 分单打印: 把一张订单 按 商品分类 拆成多个单
    const printRange = Storage.get('PRINT_CATEGORY_RANGE') || 0
    if (this.query.split_order_type === '1') {
      // 按一级分类
      if (this.query.split_order_type_way === '1') {
        const category1Config = Storage.get('PRINT_CATEGORY1_LIST')
        // 根据打印范围用不同的函数处理
        return printRange === 0
          ? splitOrderBaseOnCategory({ data, config }, 1, isCategorySuffix)
          : splitOrderBaseOnCategoryConfigStorage(
              { data, config },
              category1Config,
              1,
              isCategorySuffix,
            )
      } else if (this.query.split_order_type_way === '2') {
        // 按二级分类
        const category2Config = Storage.get('PRINT_CATEGORY2_LIST')
        return printRange === 0
          ? splitOrderBaseOnCategory({ data, config }, 2, isCategorySuffix)
          : splitOrderBaseOnCategoryConfigStorage(
              { data, config },
              category2Config,
              2,
              isCategorySuffix,
            )
      }
    }
    // 自定义分单打印: 把一张订单 按 一级分类聚合配置 拆成对个单
    else if (this.query.split_order_type === '2') {
      return splitOrderBaseOnCategoryConfig(
        { data, config, diy_category_toggle },
        this.category_config,
      )
    }
    // 普通打印
    else {
      return [{ data, config }]
    }
  }

  commonFormatData = (data, config) => {
    const { mergeDeliveryType } = this.query
    // 添加打印人
    data.printer_operator = globalStore.user.name
    const dataConfigList = this.splitOrderHelper(data, config)
    return dataConfigList.map((page) => {
      const {
        data,
        config,
        config: { specialConfig },
      } = page
      // 特殊控制--是否按税率排序
      if (specialConfig === 'rateSort') {
        data.details = _.sortBy(data.details, (item) => item.tax_rate)
      }
      return {
        data: formatOrder(data, false, mergeDeliveryType, config),
        config: config,
      }
    })
  }

  /**
   * 按商户配置的模板打印,使用多个模板
   * @param getDataPromise
   * @returns {Promise<(*)[]>}
   */
  getDistributeList(getDataPromise) {
    const reqList = [
      getDataPromise,
      Request('/station/distribute_config/list')
        .get()
        .then((json) => json.data),
      globalStore.fetchCustomizedConfigs(),
    ]

    return Promise.all(reqList).then((res) => {
      const [dataList, configList] = res
      this.commonHandle(res)

      const templateMap = configList.reduce((acc, cur) => {
        acc[cur.id] = cur
        return acc
      }, {})

      return _.map(dataList, (data) => {
        const config = templateMap[data.template_id]
        !config &&
          window.alert(
            `(${data.resname})${i18next.t('商户未配置打印模板，打印异常!')}`,
          )

        return this.commonFormatData(data, config.content)
      })
    })
  }

  /**
   * 使用单一模板打印
   * @param getDataPromise
   * @returns {Promise<(*)[]>}
   */
  getDistributeListByOneTemplate(getDataPromise) {
    const reqList = [
      getDataPromise,
      Request('/station/distribute_config/get_new')
        .data({ id: this.query.template_id })
        .get()
        .then((json) => json.data),
      globalStore.fetchCustomizedConfigs(),
    ]

    return Promise.all(reqList).then((res) => {
      const [dataList, config] = res
      this.commonHandle(res)

      return _.map(dataList, (data) => {
        return this.commonFormatData(data, config.content)
      })
    })
  }

  // 按商户打印
  getSidPrint = async (getDataPromise) => {
    const { template_id } = this.query
    let list = []

    // 按商户配置的模板打印,每个订单可能使用不同的模板
    if (template_id === '-1') {
      list = await this.getDistributeList(getDataPromise)
      // 数组扁平化
      list = _.flatten(list)
      // 使用同一个模板
    } else {
      list = await this.getDistributeListByOneTemplate(getDataPromise)
      // 数组扁平化
      list = _.flatten(list)
    }

    return list
  }

  getData = () => {
    const {
      order_ids,
      delivery_type = '1',
      filter,
      mergeDeliveryType, // 合并配送单打印 1 合并sid打印 2 合并订单相同的商品
      categorySort, // 按商品分类管理顺序打印
    } = this.query
    // 全选所有页: 传搜索条件，非全选(包含当前页全选): 传id
    const query = order_ids
      ? { ids: this.ids, category_sort: categorySort === 'true' ? 1 : 0 }
      : {
          ...JSON.parse(filter),
          category_sort: categorySort === 'true' ? 1 : 0,
        }

    // params 新老接口需要传递的参数 delivery_type为了区分新老接口
    const params = delivery_type === '2' ? { ...query, type: 2 } : query

    // 这里打印请求的接口有四个：新老接口、合并sid接口、合并订单相同商品的接口
    if (mergeDeliveryType === '1' || mergeDeliveryType === '2') {
      return mergeDeliveryType === '1'
        ? ORDER_PRINT_API['3'](params)
        : ORDER_PRINT_API['4'](params)
    } else {
      return ORDER_PRINT_API[delivery_type](params)
    }
  }

  start = async () => {
    const {
      isPrintSid,
      to_print_sku,
      to_print_task,
      print_drivers,
      to_print_checklist,
      split_order_type, // null/0: 普通打印, 1: 按一级分类分单, 2: 自定义分单(按一级分类聚合配置)
      address_id, // 商户id
      diy_category_toggle, // 自定义分类 一级或者二级
      mergeDeliveryType,
    } = this.query
    let list = []
    let sidList = []
    const kidList = []
    let getDataPromise = null

    if (split_order_type === '2') {
      await getCategoryGroupConfig({
        sid: address_id,
      }).then((res) => {
        if (Storage.get('Category1_groupData') && diy_category_toggle === '1') {
          this.category_config = Object.values(
            Storage.get('Category1_groupData'),
          )[0]
        } else if (
          Storage.get('Category2_groupData') &&
          diy_category_toggle === '2'
        ) {
          this.category_config = Object.values(
            Storage.get('Category2_groupData'),
          )[0]
        } else {
          this.category_config =
            diy_category_toggle === '1'
              ? res.data.category_config
              : res.data.category_config_2
        }
      })
    }

    // 打印配送单
    getDataPromise = this.getData()
    if (isPrintSid === 'true') {
      sidList = await this.getSidPrint(getDataPromise)
      // 合并打印配送单时，分拣重点关注显示- -
      if (mergeDeliveryType === '1' || mergeDeliveryType === '2') {
        sidList.forEach((item) => {
          const arr = Object.keys(item.data.common)
          if (arr.includes('分拣重点关注')) {
            item.data.common['分拣重点关注'] = '- -'
          }
        })
      }
    }
    // if (isPrintKid === 'true') {
    //   kidList = await this.getKidPrint(getDataPromise)
    // }
    list = sidList.concat(kidList)

    if (list.length === 0) {
      Tip.warning('打印的配送单中没有勾选的分类的商品！')
    }

    // ‼️‼️ 如果存在配送打印,那么就统一用配送单的 纸张尺寸 去打印所有单据(包括: 司机任务单 + 司机装车单 + 核查单)
    const page = list[0] ? list[0].config.page : {}

    // 打印 司机任务单 和 司机装车单
    if (to_print_sku === 'true' || to_print_task === 'true') {
      const skuAndTasks = await this.getSkuAndTask(print_drivers, page)

      if (to_print_sku === 'true') {
        list = list.concat(skuAndTasks.sku)
      }
      if (to_print_task === 'true') {
        list = list.concat(skuAndTasks.tasks)
      }
    }

    // 按打印类型排序
    list = this.sortList(list)

    // 核查单排序插入: 打印核查单,需要聚合核查单，需要按分拣序号排序
    if (to_print_checklist === 'true') {
      const checklist = await this.getChecklist(this.ids, page)
      list = list.concat(this.sortChecklist(checklist))
    }

    LoadingFullScreen.hide()
    // 执行打印
    doBatchPrint(list).then(() => {
      // 记录打印次数
      isPrintSid === 'true' &&
        printLog({
          sheet_type: 1,
          ids: JSON.stringify(this.order_ids),
        })
    })
  }

  componentDidMount() {
    const { template_id, order_ids, delivery_type = '1', filter } = this.query

    this.ids = JSON.stringify(_.isArray(order_ids) ? order_ids : [order_ids])
    // 长条单打印，跳转到新地址↓
    if (isThermalPrinter(template_id)) {
      const req = qs.stringify({
        order_ids: order_ids ? this.ids : null,
        delivery_type,
        filter,
      })
      this.props.history.replace(
        `/system/setting/distribute_templete/thermal_printer?${req}`,
      )
      return
    }

    // 常规自定义打印↓
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    this.start()
  }

  render() {
    return null
  }
}

Print.propTypes = {
  history: PropTypes.object.isRequired,
}

export default Print
