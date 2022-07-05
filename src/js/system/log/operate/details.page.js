import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Loading, BoxTable } from '@gmfe/react'
import { Table, expandTableHOC, subTableHOC } from '@gmfe/table'
import { observer } from 'mobx-react'
import { withRouter } from '../../../common/service'
import _ from 'lodash'
import PropTypes from 'prop-types'
import purchaseStore from './stores/purchase_detail_store'
import lockStore from './stores/lock_detail_store'
import detailStore from './stores/detail_store'
import storageDetailStore from './stores/storage_detail_store'
import sortStore from './stores/sort_detail_store'

import TableTotalText from 'common/components/table_total_text'

const ExpandTable = expandTableHOC(Table)
const SubTable = subTableHOC(Table)

@withRouter
@observer
class LogDetail extends React.Component {
  constructor(props) {
    super(props)
    const { log } = props.location.query
    const _log_type = _.toNumber(log)
    if (_log_type === 7) {
      this.store = purchaseStore
    } else if (_log_type === 8) {
      this.store = sortStore
    } else if (_log_type === 5) {
      this.store = lockStore
    } else if (_log_type === 9) {
      this.store = storageDetailStore
    } else {
      this.store = detailStore
    }
  }

  componentDidMount() {
    const { id } = this.props.location.query
    this.store.getLogDetail(id)
  }

  renderTableTitle = (firstTextLabel, firstText) => {
    const { title } = this.store
    const { create_time, op_user, op_source } = title

    const data = [
      {
        label: firstTextLabel,
        content: firstText,
      },
      {
        label: i18next.t('操作时间'),
        content: create_time,
      },
      {
        label: i18next.t('操作人'),
        content: op_user,
      },
    ]
    if (firstTextLabel === '分类名') {
      data.push({
        label: i18next.t('操作来源'),
        content: op_source,
      })
    }
    return data
  }

  renderPurchaseDetailTableTitle = () => {
    const { title } = this.store
    const { firstText } = title

    const firstTextLabel = i18next.t('采购商品')

    return this.renderTableTitle(firstTextLabel, firstText)
  }

  renderLockDetailTableTitle = () => {
    const { title } = this.store
    const { op_id } = title
    const firstTextLabel = i18next.t('锁价规则编号')
    const firstText = op_id

    return this.renderTableTitle(firstTextLabel, firstText)
  }

  renderSortDetailTableTitle = () => {
    const { title } = this.store
    const firstTextLabel = i18next.t('分类名')
    const firstText = title.firstText
    return this.renderTableTitle(firstTextLabel, firstText)
  }

  renderStorageDetailTableTitle = () => {
    const { title } = storageDetailStore
    const { sheet_no, supplier_name, create_time, op_source } = title
    const data = [
      {
        label: i18next.t('入库单ID'),
        content: sheet_no,
      },
      {
        label: i18next.t('供应商名称'),
        content: supplier_name,
      },
      {
        label: i18next.t('操作时间'),
        content: create_time,
      },
      {
        label: i18next.t('操作来源'),
        content: op_source === 1 ? '单条操作' : '批量操作',
      },
    ]
    return data
  }

  renderDetailTableTitle = () => {
    const { title } = detailStore
    const {
      op_id,
      create_time,
      op_user,
      op_source,
      name,
      customer_name,
      sort_id,
      log_type,
    } = title

    const _customer_name = {
      label: i18next.t('商户名'),
      content: customer_name,
    }

    const _sort_id = {
      label: i18next.t('分拣序号'),
      content: sort_id,
    }

    const data = [
      {
        label: name,
        content: op_id,
      },
      {
        label: i18next.t('操作人'),
        content: op_user,
      },
      {
        label: i18next.t('操作时间'),
        content: create_time,
      },
      {
        label: i18next.t('操作来源'),
        content: op_source,
      },
    ]

    if (log_type === 4 || log_type === 1) {
      data.splice(1, 0, _sort_id)
      data.splice(1, 0, _customer_name)
    }

    return data
  }

  renderTitle = () => {
    const { log } = this.props.location.query
    const _log_type = _.toNumber(log)
    if (_log_type === 7) {
      // 采购
      return this.renderPurchaseDetailTableTitle()
    } else if (_log_type === 5) {
      // 锁价
      return this.renderLockDetailTableTitle()
    } else if (_log_type === 8) {
      // 分类日志详情
      return this.renderSortDetailTableTitle()
    } else if (_log_type === 9) {
      return this.renderStorageDetailTableTitle()
    } else {
      // 订单 / 商品 / 分拣
      return this.renderDetailTableTitle()
    }
  }

  renderExpandedRowRender(index) {
    const { specidList } = this.store
    const { detail } = specidList[index]

    return (
      <SubTable
        data={detail.slice()}
        columns={[
          { Header: t('变更字段'), accessor: 'fieldName' },
          { Header: t('编辑前'), accessor: 'before' },
          { Header: t('编辑后'), accessor: 'after' },
        ]}
      />
    )
  }

  render() {
    const { isLoading, list, title, specidList } = this.store

    const { op_type } = title

    if (isLoading) {
      return <Loading />
    }
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText data={this.renderTitle()} />
          </BoxTable.Info>
        }
      >
        {op_type === 1 || op_type === 2 ? (
          <ExpandTable
            data={specidList.slice()}
            /** 给‘商品名称(ID)’添加折叠展开的功能 */
            showRowExpan={(original) =>
              original.fieldName === '商品名称(ID)' ||
              original.fieldName === '分摊' ||
              original.fieldName === '折让'
            }
            SubComponent={({ index }) => this.renderExpandedRowRender(index)}
            /** 是否展示头部的折叠展开 */
            expandHeader={false}
            columns={[
              {
                Header: t('变更字段'),
                id: 'fieldName',
                accessor: (d) => (
                  <div
                    style={{
                      fontWeight: d ? 'bold' : 'normal',
                    }}
                  >
                    {d.fieldName}
                  </div>
                ),
              },
              { Header: t('变更字段'), accessor: 'fieldName' },
              { Header: t('编辑前'), accessor: 'before' },
              { Header: t('编辑后'), accessor: 'after' },
            ]}
          />
        ) : (
          <Table
            data={list.slice()}
            columns={[
              {
                Header: i18next.t('变更字段'),
                id: 'fieldName',
                accessor: (d) => (
                  <div
                    style={{
                      fontWeight: d.bold ? 'bold' : 'normal',
                    }}
                  >
                    {d.fieldName}
                  </div>
                ),
              },
              {
                Header: i18next.t('编辑前'),
                id: 'before',
                accessor: (d) => {
                  if (d.before === '') {
                    return ' '
                  }
                  return d.before
                },
              },
              {
                Header: i18next.t('编辑后'),
                id: 'after',
                accessor: (d) => {
                  if (d.after === '') {
                    return ' '
                  }
                  return d.after
                },
              },
            ]}
          />
        )}
      </BoxTable>
    )
  }
}

LogDetail.propTypes = {
  getDetail: PropTypes.func,
  store: PropTypes.object,
}

export default LogDetail
