import { i18next, t } from 'gm-i18n'
import React, { Component } from 'react'
import qs from 'query-string'
import { observer } from 'mobx-react'
import { BoxTable, Dialog, Price, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import { Link } from 'react-router-dom'
import RequireGoodsHeader from './components/require_goods_header'
import RequireGoodsShare from './components/share_qrcode'
import requireStore from './store'
import moment from 'moment'
import globalStore from '../../stores/global'

@observer
class RequireGoodsBill extends Component {
  componentDidMount() {
    requireStore.init()
    this.pagination.apiDoFirstRequest()
    // requireStore.getRequireGoodsSheetList()
  }

  // 导出
  handleExport = () => {
    const { start_time, end_time, status, sheet_no } = requireStore
    const params = {
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
    }
    status && (params.status = status)
    sheet_no && (params.sheet_no = sheet_no)

    window.open('/stock/require_goods_sheet/export?' + qs.stringify(params))
  }

  // 单据分享
  handleShareQrcode = (id) => {
    requireStore.getRequireGoodsShareToken(id).then((json) => {
      const params = {
        id: id,
        token: json.data.token,
        group_id: globalStore.groupId,
      }

      Dialog.dialog({
        title: i18next.t('要货单据分享'),
        children: <RequireGoodsShare shareUrlParam={params} />,
        OKBtn: false,
        size: 'md',
      })
    })
  }

  handlePageChange = (pagination) => {
    return requireStore.getRequireGoodsSheetList(pagination)
  }

  render() {
    const list = requireStore.require_goods_list || []
    return (
      <div>
        <RequireGoodsHeader
          onSearch={() => this.pagination.apiDoFirstRequest()}
        />

        <BoxTable
          info={<BoxTable.Info>{i18next.t('要货单据')}</BoxTable.Info>}
          action={
            <div>
              <Button type='primary' onClick={this.handleExport}>
                {i18next.t('导出供货价')}
              </Button>
            </div>
          }
        >
          <ManagePaginationV2
            id='pagination_in_require_goods_bill_list'
            onRequest={this.handlePageChange}
            ref={(ref) => {
              this.pagination = ref
            }}
          >
            <Table
              data={list.slice()}
              columns={[
                {
                  Header: t('申请时间'),
                  accessor: 'apply_time',
                  Cell: ({ value: apply_time }) =>
                    apply_time
                      ? moment(apply_time).format('YYYY-MM-DD HH:mm:ss')
                      : '-',
                },
                {
                  Header: t('要货单据号'),
                  accessor: 'sheet_no',
                  Cell: ({ original, value }) => {
                    const { id } = original
                    return (
                      <Link
                        to={`/supply_chain/purchase/require_goods/${id}`}
                        target='_blank'
                      >
                        {value}
                      </Link>
                    )
                  },
                },
                {
                  Header: t('要货任务数'),
                  accessor: 'task_num',
                },
                {
                  Header: t('单据金额'),
                  accessor: 'sheet_price',
                  Cell: ({ value }) => value + Price.getUnit(),
                },
                {
                  Header: t('申请站点'),
                  accessor: 'apply_station_name',
                },
                {
                  Header: t('申请人'),
                  accessor: 'apply_username',
                },
                {
                  Header: t('单据状态'),
                  accessor: 'status',
                  Cell: ({ value }) => requireStore.findBillStatus(value),
                },
                {
                  Header: TableUtil.OperationHeader,
                  id: 'action',
                  Cell: ({ original: { id, status } }) => {
                    return (
                      <TableUtil.OperationCell>
                        {status === 4 ? (
                          '-'
                        ) : (
                          <span
                            className='gm-margin-left-5'
                            onClick={this.handleShareQrcode.bind(this, id)}
                          >
                            <i className='xfont xfont-share-bold gm-text-14 gm-text-hover-primary gm-cursor' />
                          </span>
                        )}
                      </TableUtil.OperationCell>
                    )
                  },
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default RequireGoodsBill
