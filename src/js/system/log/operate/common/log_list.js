import { i18next } from 'gm-i18n'
import React from 'react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import moment from 'moment'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

// 采购任务增加 发布 / 生成 类型
const opType = {
  '1': i18next.t('新建'),
  '2': i18next.t('编辑'),
  '3': i18next.t('删除'),
  '4': i18next.t('生成'),
  '15': i18next.t('恢复'),
  '16': i18next.t('彻底删除'),
}
const logType = {
  '1': i18next.t('订单'),
  '2': i18next.t('销售规格(sku)'),
  '3': i18next.t('商品(spu)'),
}

// 采购日志类型
const purchaseType = {
  '1': i18next.t('采购条目'),
  '2': i18next.t('采购任务'),
  '3': i18next.t('采购单'),
}
@observer
class LogList extends React.Component {
  componentDidMount() {
    this.props.listData.setDoFirstRequest(this.pagination.doFirstRequest)
    this.pagination.doFirstRequest()
  }

  showLogDetail = (label, modifyText) => {
    return modifyText ? (
      <div>
        <span
          className='label label-primary gm-text-12 gm-margin-right-5'
          style={{ padding: '1.5px 8px 1.5px 8px' }}
        >
          {label || i18next.t('摘要')}
        </span>
        <span>{modifyText}</span>
      </div>
    ) : null
  }

  // 分拣
  showWeightTitle = (item) => {
    const { merchandise_name, customer_name, sort_id, op_id } = item
    const idMsg = op_id.split('_')

    return (
      <div>
        <span>{`${i18next.t('订单ID')}：${idMsg[0] || '-'}`}</span> &nbsp;&nbsp;
        <span>{`${i18next.t('商品信息')}:${merchandise_name || ''}(${
          idMsg[1] || '-'
        })`}</span>{' '}
        &nbsp;&nbsp;
        <span>{`${i18next.t('商户名')}：${customer_name}`}</span> &nbsp;&nbsp;
        <span>{`${i18next.t('分拣序号')}：${sort_id || '-'}`}</span>
      </div>
    )
  }

  // 商品
  showSkuTitle = (item) => {
    const { op_type, log_type, op_id, merchandise_name } = item

    return (
      <div>{`${opType[op_type]}${logType[log_type]}${
        merchandise_name || ''
      }(${op_id})`}</div>
    )
  }

  // 订单
  showOrderTitle = (item) => {
    const { op_type, log_type, customer_name, op_id, sort_id } = item

    return (
      <div>{`${opType[op_type]}${
        logType[log_type]
      }${op_id}（商户：${customer_name}，分拣序号：${sort_id || '-'}）`}</div>
    )
  }

  // 锁价
  showLockTitle = (item) => {
    const { op_type, merchandise_name, op_id } = item

    return (
      <div>{`${opType[op_type]}锁价规则${merchandise_name || ''}${op_id}`}</div>
    )
  }

  createPurchaseTaskTitle = (item) => {
    const { op_type, modify } = item
    const {
      std_unit_name_forsale,
      sku_name,
      settle_supplier_name,
      plan_amount,
      purchase_spec,
      order_id,
      purchaser,
    } = modify

    let id = '-'
    if (order_id && order_id.after) {
      id = order_id.after
    }
    let _purchaser = '-'
    if (purchaser && purchaser.after) {
      _purchaser = purchaser.after
    }

    return (
      <div>
        <span>{`${opType[op_type]}${purchaseType[op_type]}`}</span>
        <span>{`（${i18next.t('订单号：')}${id}，${sku_name.after}/${
          purchase_spec.after
        }，${settle_supplier_name.after}，`}</span>
        <span>{`${i18next.t('采购')}${plan_amount.after}${
          std_unit_name_forsale.after
        }，${_purchaser}）`}</span>
      </div>
    )
  }

  mulPurchaseTaskTitle = (item) => {
    const { op_type, modify } = item
    const {
      std_unit_name_forsale,
      sku_name,
      settle_supplier_name,
      plan_amount,
      purchaser,
      purchase_spec,
      order_id,
    } = modify
    let opt = null
    let purt = null
    let _purchaser = '-'
    let id = ''

    if (op_type === 3) {
      // 删除采购条目
      opt = opType[3]
      purt = purchaseType[1]
      const _order_id = order_id.before || '-'
      id = `${i18next.t('订单号：')}${_order_id}，`
    } else if (op_type === 9) {
      // 生成采购单
      opt = opType[4]
      purt = purchaseType[3]
    } else if (op_type === 10) {
      // 发布采购任务
      opt = ''
      purt = `${i18next.t('任务状态变更')}`
    }

    if (purchaser.before !== null) {
      _purchaser = `${purchaser.before}`
    }

    return (
      <div>
        <span>{`${opt}${purt} (${id}${sku_name.before}/${purchase_spec.before}，
            ${settle_supplier_name.before}，`}</span>
        <span>{`${i18next.t('采购')}${plan_amount.before}${
          std_unit_name_forsale.before
        }，`}</span>
        <span>{`${_purchaser}）`}</span>
      </div>
    )
  }

  // 采购
  showPurchaseTitle = (item) => {
    const { op_type, modify } = item
    const { sku_name, purchase_spec } = modify
    // 1：新建 2：更新 3：删除  9.生成采购单  10.发布采购任务
    if (op_type === 1) {
      return this.createPurchaseTaskTitle(item)
    } else if (op_type === 3 || op_type === 9 || op_type === 10) {
      return this.mulPurchaseTaskTitle(item)
    } else if (op_type === 2) {
      // 编辑采购任务
      return (
        <div>{`${opType[op_type]}${purchaseType[op_type]}
          ${sku_name.after} (${purchase_spec.after})`}</div>
      )
    }
  }

  // 入库日志
  showStorageTitle = (item) => {
    const { op_type, op_id, supplier_name } = item
    return (
      <div>{`${opType[op_type]}采购入库单${op_id}（供应商：${supplier_name})`}</div>
    )
  }

  // 分类
  showSortTitle = (item) => {
    // 这里是用来定义操作日志的，不含编辑情况的摘要内容
    // 摘要看modifyList字段，在list_store中处理
    const { op_type, cat_type, cat_name } = item
    return (
      <div>{`${opType[op_type]}${
        cat_type === 3 ? '品类' : cat_type === 2 ? '二级分类' : '一级分类'
      }${cat_name}`}</div>
    )
  }

  render() {
    const { list, in_query, filter } = this.props.listData
    const { getLogList } = this.props.listData
    const dataList = list.slice()
    const inQueryText =
      filter.log_type === 4
        ? i18next.t('已在全部分拣日志中为您找到')
        : i18next.t('已在全部订单中为您找到')

    return (
      <>
        {in_query && (
          <div
            className='gm-padding-10'
            style={{
              color: '#cf4848',
              backgroundColor: '#f5f5f5',
            }}
          >
            {i18next.t('不在筛选条件中，')}
            {dataList[0].op_id}
            {inQueryText}
          </div>
        )}
        <ManagePaginationV2
          id={this.props.paginationId}
          onRequest={this.props.onRequest || getLogList}
          ref={(ref) => {
            this.pagination = ref
          }}
          disablePage
        >
          <Table
            data={dataList}
            columns={[
              {
                Header: i18next.t('操作时间'),
                id: 'create_time',
                Cell: (cellProps) =>
                  moment(cellProps.original.create_time).format(
                    'YYYY-MM-DD HH:mm:ss',
                  ),
              },
              {
                Header: i18next.t('操作人'),
                id: 'op_user',
                Cell: (cellProps) => {
                  const { op_user, op_user_remark } = dataList[cellProps.index]
                  return (
                    <div>
                      <div>{op_user}</div>
                      {op_user_remark && <div>{`(${op_user_remark})`}</div>}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('操作日志'),
                id: 'detail',
                Cell: (cellProps) => {
                  const { label, modifyText } = dataList[cellProps.index]
                  const showTitle = () => {
                    if (filter.log_type === 1) {
                      // 订单日志
                      return this.showOrderTitle(dataList[cellProps.index])
                    } else if (filter.log_type === 2 || filter.log_type === 3) {
                      // 商品日志
                      return this.showSkuTitle(dataList[cellProps.index])
                    } else if (filter.log_type === 4) {
                      // 分拣日志
                      return this.showWeightTitle(dataList[cellProps.index])
                    } else if (filter.log_type === 5) {
                      // 锁价日志
                      return this.showLockTitle(dataList[cellProps.index])
                    } else if (filter.log_type === 7) {
                      // 采购日志
                      return this.showPurchaseTitle(dataList[cellProps.index])
                    } else if (filter.log_type === 8) {
                      // 分类日志
                      return this.showSortTitle(dataList[cellProps.index])
                    } else if (filter.log_type === 9) {
                      // 入库日志
                      return this.showStorageTitle(dataList[cellProps.index])
                    }
                  }
                  const showDetail = this.showLogDetail(label, modifyText)

                  return (
                    <div>
                      {showTitle()}
                      {showDetail}
                    </div>
                  )
                },
              },
              {
                Header: TableUtil.OperationHeader,
                show: filter.log_type !== 4,
                width: 200,
                Cell: (cellProps) => {
                  const url = `#/system/log/operate/details?id=${cellProps.original.id}&log=${filter.log_type}`

                  return (
                    <TableUtil.OperationCell>
                      <TableUtil.OperationDetail href={url} open />
                    </TableUtil.OperationCell>
                  )
                },
              },
            ]}
          />
        </ManagePaginationV2>
      </>
    )
  }
}

LogList.propTypes = {
  listData: PropTypes.object.isRequired,
  onRequest: PropTypes.func,
  paginationId: PropTypes.string, // 页码唯一id，用于记忆 limit
}

export default LogList
