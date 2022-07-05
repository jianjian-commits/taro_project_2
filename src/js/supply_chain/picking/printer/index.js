import React from 'react'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gmfe/react'

import TemplateOrder from './order/template_order'
import TemplateOrderWhole from './order/template_whole'

import TemplateSpu from './spu/template_detail'
import TemplateSpuPool from './spu/template_pool'
import globalStore from 'stores/global'

setTitle(i18next.t('打印'))

class PickPrinter extends React.Component {
  query = this.props.location.query
  state = {
    data: [],
  }

  componentDidMount() {
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    this.getPickTasks()
  }

  getPickTasks = async () => {
    let data
    if (this.query.template.includes('order')) {
      data = await this.getOrderPick()
    } else {
      data = await this.getSpuPick()
    }
    this.setState({ data })
    LoadingFullScreen.hide()
  }

  formatDate = () => {
    const {
      query_type,
      order_time_begin,
      order_time_end,
      time_config_id,
      cycle_start_time,
      cycle_end_time,
      receive_begin_time,
      receive_end_time,
    } = this.query
    const data = { query_type }
    switch (query_type) {
      case '1':
        data.order_time_begin = order_time_begin
        data.order_time_end = order_time_end
        break
      case '2':
        data.time_config_id = time_config_id
        data.cycle_start_time = cycle_start_time
        data.cycle_end_time = cycle_end_time
        break
      case '3':
        data.receive_begin_time = receive_begin_time
        data.receive_end_time = receive_end_time
        break
      default:
        break
    }
    return data
  }

  getOrderPick = () => {
    const {
      // 订单号、商户
      search_text,
      order_status,
      area_id,
      area_level,
      route_ids,
      carrier_id,
      driver_id,
      sort_remark,
      order_ids,
      customized_field,
    } = this.query
    let data = {}
    if (order_ids) {
      data = { order_ids }
    } else {
      const date = this.formatDate()
      data = {
        search_text,
        carrier_id: Number(carrier_id) || null,
        driver_id: Number(driver_id) || null,
        route_ids: route_ids,
        order_status: Number(order_status) || null,
        area_id,
        area_level: Number(area_level) || null,
        sort_remark,
        customized_field,
        ...date,
      }
    }
    data.station_id = globalStore.stationId
    return Request('/picking/task/orders/print')
      .data(data)
      .get()
      .then((json) => {
        return json.data.picking_tasks
      })
      .catch(() => [])
  }

  getSpuPick = () => {
    const {
      search_text,
      category1_ids,
      category2_ids,
      pinlei_ids,
      shelf_id,
      order_ids,
      sku_ids,
      detail_customized_field,
    } = this.query
    let data = {}
    if (order_ids) {
      data = { order_ids, sku_ids }
    } else {
      const date = this.formatDate()
      data = {
        search_text,
        category1_ids,
        category2_ids,
        pinlei_ids,
        shelf_id: Number(shelf_id) || null,
        ...date,
      }
    }
    data.station_id = globalStore.stationId
    data.detail_customized_field = detail_customized_field || null
    return Request('/picking/task/skus/print')
      .data(data)
      .get()
      .then((json) => {
        return json.data.picking_tasks
      })
      .catch(() => [])
  }

  getTemplate = () => {
    switch (this.query.template) {
      case 'order_1':
        return TemplateOrder
      case 'order_2':
        return TemplateOrderWhole
      case 'spu_1':
        return TemplateSpuPool
      case 'spu_2':
        return TemplateSpu
    }
  }

  render() {
    const Template = this.getTemplate()
    return <Template data={this.state.data} />
  }
}

export default PickPrinter
