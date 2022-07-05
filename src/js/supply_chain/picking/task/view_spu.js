import React from 'react'
import _ from 'lodash'
import store from './store/store_spu'
import QueryFilter from './components/query_filter_spu'
import PickTable from './components/pick_table'
import spuTableConfig from './config/spu_table_config'
import { i18next } from 'gm-i18n'
import qs from 'query-string'
import { Dialog, RightSideModal } from '@gmfe/react'
import PopupPrint from './components/popup_print'
import globalStore from 'stores/global'
import Share from './components/share'

class ViewSpu extends React.Component {
  formatQuery = () => {
    const {
      // 订单号、商户
      search_text,
      categoryFilter: { category1_ids, category2_ids, pinlei_ids },
      shelf_ids,
      detail_customized_field,
    } = store.searchQuery
    const { limit, offset } = store.pagination
    const data = {
      search_text,
      limit,
      offset,
      category1_ids: category1_ids.length
        ? JSON.stringify(category1_ids.map((c) => c.id))
        : null,
      category2_ids: category2_ids.length
        ? JSON.stringify(category2_ids.map((c) => c.id))
        : null,
      pinlei_ids: pinlei_ids.length
        ? JSON.stringify(pinlei_ids.map((c) => c.id))
        : null,
      shelf_id: shelf_ids.slice().pop() || null,
      detail_customized_field: _.keys(detail_customized_field).length
        ? JSON.stringify(detail_customized_field)
        : null,
    }
    return data
  }

  getPickTasks = () => {
    store.getPickTasks(this.formatQuery())
  }

  handlePageChange = (config) => {
    store.changePagination(config)
    this.getPickTasks()
  }

  templates = [
    {
      type: 1,
      name: i18next.t('商品汇总'),
    },
    {
      type: 2,
      name: i18next.t('商品汇总-明细（展示每个商品的订单信息）'),
    },
  ]

  getPrintQuery = (isPrinterAllPage, sku_ids) => {
    if (isPrinterAllPage) {
      const data = this.formatQuery()
      const date = store.formatDate()
      return Object.assign(data, date)
    } else {
      return {
        sku_ids: JSON.stringify(sku_ids),
        order_ids: JSON.stringify(
          store.pickTasks
            .map((d) => {
              if (sku_ids.includes(d.sku_id)) {
                return d.order_list.map((o) => o.order_id)
              }
              return []
            })
            .flat(),
        ),
      }
    }
  }

  printer = (isPrinterAllPage, sku_ids) => {
    let params = '#/printer/picking/task?'
    const query = this.getPrintQuery(isPrinterAllPage, sku_ids)
    params += qs.stringify(query)
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupPrint view='spu' templates={this.templates} params={params} />
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
      children: <Share url={url} view='spu' />,
      OKBtn: false,
      size: 'md',
    })
  }

  componentDidMount() {
    this.getPickTasks()
    store.getStock()
    store.fetchStationServiceTime()
  }

  render() {
    return (
      <div>
        <QueryFilter getData={this.getPickTasks} />
        <PickTable
          store={store}
          onPageChange={this.handlePageChange}
          printer={this.printer}
          share={this.share}
          orderTableConfig={spuTableConfig}
          tableKey='sku_id'
        />
      </div>
    )
  }
}

export default ViewSpu
