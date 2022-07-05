import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer'
import {
  commanderTaskConfig,
  commanderSkuConfig
} from '../config/template_config'
import PropTypes from 'prop-types'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'
import { sku as formatSku, task as formatTask } from '../config/data_to_key'

setTitle(i18next.t('打印'))

class Print extends React.Component {
  async componentDidMount() {
    const { to_print_sku, to_print_task } = this.props.history.location.query
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!')
    })

    let list = []

    if (to_print_sku || to_print_task) {
      const skuAndTasks = await this.getSkuAndTask()

      if (to_print_sku) {
        list = list.concat(skuAndTasks.sku)
      }
      if (to_print_task) {
        list = list.concat(skuAndTasks.tasks)
      }
    }
    console.log(list)

    LoadingFullScreen.hide()
    // 执行打印
    doBatchPrint(list)
  }

  /**
   * 团长装车,团长任务
   * @param print_commanders  已JSON.stringify的司机ids数组
   * @param page 打印配置页面信息
   * @returns {*}
   */
  getSkuAndTask() {
    const {
      start_time,
      end_time,
      q,
      query_type,
      print_commanders,
      print_all
    } = this.props.history.location.query
    const filter = { start_time, end_time, q, query_type }
    const params =
      print_all !== 'false'
        ? filter
        : { ...filter, distributor_ids: print_commanders }
    return Request('/community/distributor/task/print')
      .data(params)
      .get()
      .then(json => {
        const sku = []
        const tasks = []
        const newCommanderSkuConfig = {
          ...commanderSkuConfig,
          page: {
            ...commanderSkuConfig.page
          }
        }
        const newCommanderTaskConfig = {
          ...commanderTaskConfig,
          page: {
            ...commanderTaskConfig.page
          }
        }

        _.each(json.data, o => {
          const { order_detail, sku_detail, ...rest } = o
          // 团长装车单
          const skuObj = {
            data: formatSku({ sku_detail, ...rest }),
            config: newCommanderSkuConfig
          }
          sku.push(skuObj)
          // 团长任务单
          const tasksObj = {
            data: formatTask({ order_detail, ...rest }, data =>
              _.sortBy(data, data => moment(data.receive_begin_time))
            ),
            config: newCommanderTaskConfig
          }
          tasks.push(tasksObj)
        })

        return { sku, tasks }
      })
  }

  render() {
    return null
  }
}

Print.propTypes = {
  history: PropTypes.object.isRequired
}

export default Print
