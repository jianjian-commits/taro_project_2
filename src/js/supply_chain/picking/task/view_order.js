import React from 'react'
import _ from 'lodash'
import QueryFilter from './components/query_filter_order'
import PickTable from './components/pick_table'
import store from './store/store_order'
import orderTableConfig from './config/order_table_config'
import qs from 'query-string'
import { Dialog, RightSideModal } from '@gmfe/react'
import PopupPrint from './components/popup_print'
import { i18next } from 'gm-i18n'
import globalStore from 'stores/global'
import Share from './components/share'
import { getFiledData } from '../../../common/components/customize'
import { observer } from 'mobx-react'
@observer
class ViewOrder extends React.Component {
  formatQuery = () => {
    const {
      // 订单号、商户
      search_text,
      order_status,
      area_id,
      area_level,
      routeSelected,
      carrier_id_and_driver_id,
      sort_remark,
      detail_customized_field,
      customized_field,
    } = store.searchQuery
    const { limit, offset } = store.pagination
    return {
      search_text,
      limit,
      offset,
      carrier_id: carrier_id_and_driver_id[0] || null,
      driver_id: carrier_id_and_driver_id[1] || null,
      route_ids: routeSelected.length
        ? JSON.stringify(
            routeSelected.reduce((res, r) => {
              if (r.id !== 0) {
                res.push(r.id)
              }
              return res
            }, []),
          )
        : null,
      order_status: order_status || null,
      area_id,
      area_level,
      sort_remark: sort_remark || null,
      customized_field: _.keys(customized_field).length
        ? JSON.stringify(customized_field)
        : null,
      detail_customized_field: _.keys(detail_customized_field).length
        ? JSON.stringify(detail_customized_field)
        : null,
    }
  }

  getPickTasks = () => {
    store.getPickTasks(this.formatQuery())
  }

  getPickRemark = () => {
    store.getRemarkList()
  }

  handlePageChange = (config) => {
    store.changePagination(config)
    this.getPickTasks()
  }

  templates = [
    {
      type: 1,
      name: i18next.t('按订单打印（一个订单打印一张拣货单）'),
    },
    {
      type: 2,
      name: i18next.t('按订单打印（所有订单打印一张拣货单）'),
    },
  ]

  getPrintQuery = (isPrinterAllPage, ids) => {
    if (isPrinterAllPage) {
      const data = this.formatQuery()
      const date = store.formatDate()
      return Object.assign(data, date)
    } else {
      return {
        order_ids: JSON.stringify(ids),
      }
    }
  }

  printer = (isPrinterAllPage, ids) => {
    let params = '#/printer/picking/task?'
    const query = this.getPrintQuery(isPrinterAllPage, ids)
    params += qs.stringify(query)
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupPrint view='order' templates={this.templates} params={params} />
      ),
    })
  }

  share = (isPrinterAllPage, ids) => {
    const query = this.getPrintQuery(isPrinterAllPage, ids)
    const url = `${window.location.origin}/more/?__trace_group_id=${
      globalStore.groupId
    }/#/share_picking_task?${qs.stringify(query)}`
    Dialog.dialog({
      title: i18next.t('拣货任务分享'),
      children: <Share url={url} view='order' />,
      OKBtn: false,
      size: 'md',
    })
  }

  componentDidMount() {
    this.getPickTasks()
    this.getPickRemark()
    store.getRouteList()
    store.fetchStationServiceTime()
  }

  render() {
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) => v.permission.read_station_picking,
    )

    return (
      <div>
        <QueryFilter getData={this.getPickTasks} />
        <PickTable
          store={store}
          onPageChange={this.handlePageChange}
          printer={this.printer}
          share={this.share}
          orderTableConfig={[
            ...orderTableConfig,
            ..._.map(infoConfigs, (v) => ({
              Header: v.field_name,
              diyGroupName: i18next.t('基础字段'),
              accessor: `customized_field.${v.id}`,
              Cell: (cellProps) => {
                const order = cellProps.original
                return <div>{getFiledData(v, order.customized_field)}</div>
              },
            })),
          ]}
          tableKey='order_id'
        />
      </div>
    )
  }
}

export default ViewOrder
