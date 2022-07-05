import { i18next } from 'gm-i18n'
import React from 'react'
import { observable, action } from 'mobx'
import { RightSideModal } from '@gmfe/react'
import { Request } from '@gm-common/request'
import moment from 'moment/moment'
import _ from 'lodash'
import { generateUIList } from '../common/utils'
import TaskList from '../../../../task/task_list'

function generateEditPurchaseText(modifyList) {
  let text = ''
  _.each(modifyList, (item) => {
    const order_id = _.filter(
      item,
      (_item) => _item.fieldName === i18next.t('订单号'),
    )
    text += `${i18next.t('采购条目：')}${order_id[0].after}，`

    const list = _.filter(item, (_item) => {
      return _item && _item.before !== _item.after
    })

    _.each(list, (_item) => {
      if (_item.fieldName !== i18next.t('订单号')) {
        text += `${i18next.t('KEY50', {
          VAR1: _item.fieldName,
          VAR2: _item.before || '',
          VAR3: _item.fieldName,
          VAR4: _item.after || '',
        })}`
      }
    })
  })

  if (text.length > 60) {
    return text.slice(0, 60) + '...'
  } else {
    return text.slice(0, -1)
  }
}
function sortListAddModifyAttrs(obj) {
  const { cat_type, cat_name, op_type, modify } = obj
  const { category1_name, category2_name, pinlei_name } = obj.modify
  switch (op_type) {
    case 1:
      modify.cat_name = { before: null, after: cat_name }
      modify.list_cat_type = { before: null, after: cat_type }
      break
    case 2: {
      const _cat_name_before =
        category1_name?.before || category2_name?.before || pinlei_name?.before
      const _cat_name_after =
        category1_name?.after || category2_name?.after || pinlei_name?.after
      modify.cat_name = { before: _cat_name_before, after: _cat_name_after }
      modify.list_cat_type = { before: cat_type, after: cat_type }
      break
    }
    case 3:
      modify.cat_name = { before: cat_name, after: null }
      modify.list_cat_type = { before: cat_type, after: null }
      break
  }
}
function generateEditSortText(modifyList) {
  const type = {
    '1': '一级分类',
    '2': '二级分类',
    '3': '品类',
  }
  let text = ''
  const level = _.filter(modifyList, { fieldName: '列表分类级别' })[0].before
  _.each(modifyList, (item) => {
    if (item.fieldName === '列表分类名称') {
      text = `原${type[level]}名称：${item.before},编辑后${type[level]}名称：${item.after}`
    }
  })
  if (text.length > 60) {
    return text.slice(0, 60) + '...'
  } else {
    return text
  }
}

function generateText(modifyList, text = '', log_type = null, op_type = null) {
  // 改动描述
  let modifyText = text
  let _modifyList = modifyList

  // 采购
  if (log_type === 7) {
    if (op_type === 2) {
      _modifyList = _.filter(modifyList, (obj) => {
        return obj && obj.length
      })
      return generateEditPurchaseText(_modifyList)
    } else {
      return ''
    }
  }
  if (log_type === 8) {
    if (op_type === 2) {
      return generateEditSortText(_modifyList)
    } else {
      return ''
    }
  }

  _.each(_modifyList, (item, index) => {
    if (modifyText.length > 100) {
      return false
    } else {
      // 图片只要特殊处理，为什么结尾要加分号，处理的时候却slice(0,-1)去掉结尾的分号
      let itemText =
        item.fieldName === i18next.t('商品图片')
          ? i18next.t('更改商品图片；')
          : i18next.t('KEY50', {
              VAR1: item.fieldName,
              VAR2: item.before || '',
              VAR3: item.fieldName,
              VAR4: item.after || '',
            }) /* src:`原${item.fieldName}:${item.before || ''}，编辑后${item.fieldName}:${item.after || ''}；` => tpl:原${VAR1}:${VAR2}，编辑后${VAR3}:${VAR4}； */
      if (item.fieldName === i18next.t('商品详情')) {
        itemText = i18next.t('更改商品详情；')
      }

      // 分拣
      if (log_type === 4) {
        itemText = i18next.t(
          /* tpl:原状态: ${VAR1}, 变更后的状态: ${VAR2}; */ 'WEIGHT_TMP',
          { VAR1: item.before || '', VAR2: item.after || '' },
        )
      }

      modifyText = modifyText + itemText
    }
  })

  // 如果在限制字符内，后面的“句号”去掉不显示；如果在限制字符外，直接加“...”
  if (modifyText.length > 60) {
    return modifyText.slice(0, 60) + '...'
  } else {
    return modifyText.slice(0, -1)
  }
}

export default class ListStore {
  constructor(log_type) {
    this.filter.log_type = log_type
    this.doFirstRequest = _.noop()
  }

  @observable filter = {
    begin_time: moment().startOf('day'),
    end_time: moment().startOf('day'),
    search_text: '',
    op_type: 0,
    log_type: 1,
    // log_type -- 1: 订单log 2和3: 商品log（2表示sku的改动，3表示spu的改动） 4: 分拣log  5: 锁价log  7: 采购log 8:分类log 9.入库log
    order_op_source: 0, // 订单日志 操作来源
    limit: 50,
    reverse: 0,
    page_obj: {},
  }

  @observable in_query = false

  @observable list = []

  @action.bound
  getLogList(paramsFromManagePaginationV2 = {}, customizedList = []) {
    const {
      op_type,
      search_text,
      log_type,
      begin_time,
      end_time,
      order_op_source,
      limit,
      reverse,
      page_obj,
    } = this.filter

    const params = {
      search_text: search_text.trim() || null,
      op_start_date: moment(begin_time).format('YYYY-MM-DD'),
      op_end_date: moment(end_time).format('YYYY-MM-DD'),
      log_type,
      op_type: op_type || null,
      order_op_source: order_op_source || null,
      ...paramsFromManagePaginationV2,
    }

    const params2 = {
      search_text: search_text.trim() || null,
      start_date: moment(begin_time).format('YYYY-MM-DD'),
      end_date: moment(end_time).format('YYYY-MM-DD'),
      op_type: op_type || null,
      log_type,
      limit,
      reverse,
      page_obj,
      ...paramsFromManagePaginationV2,
    }

    // 入库日志
    if (log_type === 9) {
      return Request('/station/op_log/in_stock_sheet/list')
        .data(params2)
        .get()
        .then(
          action('getList', (json) => {
            this.in_query = json.data.in_query
            const list = json.data
            this.list.replace(list)
            return json
          }),
        )
    } else {
      return Request('/station/op_log/list')
        .data(params)
        .get()
        .then(
          action('getList', (json) => {
            const list = json.data.op_data
            const in_query = json.data.in_query

            _.each(list, (obj, index) => {
              const { log_type, modify, op_type, fee_type } = obj
              if (log_type === 8) {
                sortListAddModifyAttrs(obj)
              }
              // details 是订单内修改,删除,新增的商品
              modify.purchase_spec = { before: '', after: '' }
              const {
                skus = [],
                categories = [],
                addresses = [],
                details = [], // details 是订单内修改,删除,新增的商品
                orders = [],
                ...rest
              } = modify
              const type = rest.type
              // {modifyObj, log_type, type, fee_type}
              const modifyList1 = _.flatten(
                generateUIList({
                  modifyObj: rest,
                  log_type,
                  fee_type,
                  op_type,
                  customizedList,
                }),
              )
              const modifyList2 = _.flatten(
                _.map(details, (sku) =>
                  generateUIList({
                    modifyObj: sku,
                    log_type,
                    fee_type,
                    op_type,
                    customizedList,
                  }),
                ),
              )
              const modifyList3 = _.flatten(
                _.map(addresses, (address) =>
                  generateUIList({
                    modifyObj: address,
                    log_type,
                    type,
                    fee_type,
                    op_type,
                  }),
                ),
              )
              const modifyList4 = _.flatten(
                _.map(categories, (category) =>
                  generateUIList({
                    modifyObj: category,
                    log_type,
                    fee_type,
                    op_type,
                  }),
                ),
              )

              const modifyList5 = _.flatten(
                _.map(skus, (sku) =>
                  generateUIList({
                    modifyObj: sku,
                    log_type,
                    fee_type,
                    op_type,
                  }),
                ),
              )

              // 采购任务处理不同
              // 采购不用区分币种
              let modifyList6 = []
              if (log_type === 7 && op_type === 2) {
                modifyList6 = _.map(orders, (order) => {
                  let _order = generateUIList({
                    modifyObj: order,
                    log_type,
                    op_type,
                  })
                  _order = [...modifyList1, ..._order]
                  return _order
                })
              } else {
                modifyList6 = _.flatten(
                  _.map(orders, (order) =>
                    generateUIList({ modifyObj: order, log_type, op_type }),
                  ),
                )
              }

              const text = generateText(
                [
                  ...modifyList1,
                  ...modifyList2,
                  ...modifyList3,
                  ...modifyList4,
                  ...modifyList5,
                  ...modifyList6,
                ],
                '',
                log_type,
                op_type,
              )
              // 分拣日志区分
              if (log_type === 4) {
                // 分拣日志标签
                list[index].label = modifyList1[0] ? modifyList1[0].label : ''
              }

              if (log_type === 7) {
                // 增加 采购规格 字段
                const _modify = _.filter(
                  modifyList1,
                  (obj) => obj.fieldName === i18next.t('采购规格'),
                )
                modify.purchase_spec = _modify[0]
              }
              list[index].modifyText = text
            })

            this.in_query = in_query
            this.list.replace(list)
            return json
          }),
        )
    }
  }

  // 入库日志

  @action
  setFilterOpTime(begin_time, end_time) {
    this.filter.begin_time = begin_time
    this.filter.end_time = end_time
  }

  @action
  setFilterSearchText(text) {
    this.filter.search_text = text
  }

  @action
  setFilterType(type) {
    this.filter.op_type = type
  }

  @action
  setFilterSource(type) {
    this.filter.order_op_source = type
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @action
  exportLog() {
    const {
      begin_time,
      end_time,
      log_type,
      search_text,
      op_type,
      order_op_source,
    } = this.filter
    const params = {
      op_start_date: moment(begin_time).format('YYYY-MM-DD'),
      op_end_date: moment(end_time).format('YYYY-MM-DD'),
      log_type,
      search_text,
      op_type: op_type || null,
      order_op_source,
    }

    const params2 = {
      start_date: moment(begin_time).format('YYYY-MM-DD'),
      end_date: moment(end_time).format('YYYY-MM-DD'),
      search_text,
      op_type: op_type || null,
    }

    if (log_type === 9) {
      Request('station/op_log/in_stock_sheet/export')
        .data(params2)
        .get()
        .then((json) => {
          RightSideModal.render({
            children: <TaskList tabKey={0} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        })
    } else {
      Request('station/op_log/export')
        .data(params)
        .get()
        .then((json) => {
          RightSideModal.render({
            children: <TaskList tabKey={0} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        })
    }
  }
}
