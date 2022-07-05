import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen, Storage } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer'
import PropTypes from 'prop-types'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { errorAlert } from '../../order_printer/util'
import {
  splitOrderBaseOnCategoryConfigStorage,
  splitOrderBaseOnCategoryConfig,
  splitOrderBaseOnCategory,
} from '../util'
import _ from 'lodash'
import { order as formatOrder } from '../config/data_to_key'
import { getKidPrintData } from '../util'
import globalStore from 'stores/global'
import { getCategoryGroupConfig } from 'common/components/category_1_group_helper/api'
import printLog from 'common/print_log'

setTitle(i18next.t('打印'))

class Print extends React.Component {
  query = this.props.history.location.query
  ids = ''
  category_config = [] // 自定义分单打印配置
  order_ids = [] // 订单id列表

  commonHandle = ([dataList, configList]) => {
    errorAlert(dataList, configList)
    this.order_ids = _.flatten(
      _.reduce(dataList, (prev, item) => [...prev, item.order_ids], []),
    )
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
    // 添加打印人
    data.printer_operator = globalStore.user.name
    const dataConfigList = this.splitOrderHelper(data, config)

    return dataConfigList.map((page) => ({
      data: formatOrder(page.data),
      config: page.config,
    }))
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
        .data({ id: this.query.kidPrintId })
        .get()
        .then((json) => json.data),
    ]

    return Promise.all(reqList).then((res) => {
      const [dataList, config] = res
      this.commonHandle(res)
      return _.map(dataList, (data) => {
        return this.commonFormatData(data, config.content)
      })
    })
  }

  // 按账户打印
  getKidPrint = async (getDataPromise) => {
    let list = []
    list = await this.getDistributeListByOneTemplate(getDataPromise)
    // 数组扁平化
    list = _.flatten(list)
    return list
  }

  getData = () => {
    const { order_ids, filter, group_by_sid } = this.query
    // 全选所有页: 传搜索条件，非全选(包含当前页全选): 传id
    const query = order_ids ? { ids: this.ids } : { ...JSON.parse(filter) }
    return getKidPrintData({
      ...query,
      group_by_sid: group_by_sid === 'true' ? 1 : 0,
    })
  }

  start = async () => {
    const { address_id, split_order_type, diy_category_toggle } = this.query
    let list = []
    let getDataPromise = null
    if (split_order_type === '2') {
      await getCategoryGroupConfig({
        sid: address_id,
      }).then(
        (res) =>
          (this.category_config =
            diy_category_toggle === '1'
              ? res.data.category_config
              : res.data.category_config_2),
      )
    }
    getDataPromise = this.getData()

    // 获取打印数据
    list = await this.getKidPrint(getDataPromise)
    // 去除loading
    LoadingFullScreen.hide()
    // 执行打印
    doBatchPrint(list).then(
      printLog({
        sheet_type: 1,
        ids: JSON.stringify(this.order_ids),
      }),
    )
  }

  componentDidMount() {
    const { order_ids } = this.query

    this.ids = JSON.stringify(_.isArray(order_ids) ? order_ids : [order_ids])

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
