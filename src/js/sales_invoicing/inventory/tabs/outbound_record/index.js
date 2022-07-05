import React, { Component, createRef } from 'react'
import Filter from '../../components/filter'
import { t } from 'gm-i18n'
import OutboundRecordDate from '../../components/outbound_record_date'
import { ManagePagination } from '@gmfe/business'
import {
  BoxTable,
  Button,
  Price,
  RightSideModal,
  Tip,
  Uploader,
} from '@gmfe/react'
import { observer, Observer } from 'mobx-react'
import { store } from './store'
import TableTotalText from 'common/components/table_total_text'
import { TableX, fixedColumnsTableXHOC, diyTableXHOC } from '@gmfe/table-x'
import Big from 'big.js'
import moment from 'moment'
import globalStore from 'stores/global'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import _ from 'lodash'
import TaskList from '../../../../task/task_list'
import { convertNumber2Sid } from 'common/filter'

const DiyFixedColumnsTableX = fixedColumnsTableXHOC(diyTableXHOC(TableX))

@observer
class OutboundRecord extends Component {
  paginationRef = createRef()

  dateSelectBox = {
    1: t('按出库日期'),
    2: t('按建单日期'),
    3: t('按运营周期'),
    4: t('按收货日期'),
  }

  columns = [
    {
      Header: t('商品ID'),
      diyEnable: false,
      accessor: 'spu_id',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      fixed: 'left',
    },
    {
      Header: t('出库规格ID'),
      diyEnable: false,
      accessor: 'sku_id',
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('出库规格名'),
      diyEnable: false,
      accessor: 'name',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('商品分类'),
      accessor: 'category_name_2',
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('出库单号'),
      diyEnable: false,
      accessor: 'order_id',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: () => (
        <div>
          {t('商户名')}
          <br />
          {t('(商户ID)')}
        </div>
      ),
      accessor: 'default',
      diyItemText: t('商户名（商户ID）'),
      diyGroupName: t('基础字段'),
      minWidth: 200,
      Cell: ({
        row: {
          original: { address_name, address_id },
        },
      }) =>
        address_id && address_name
          ? `${address_name}（${convertNumber2Sid(address_id, 'S')}）`
          : '-',
    },
    {
      Header: () => (
        <div>
          {t('出库数')}
          <br />
          {t('(基本单位)')}
        </div>
      ),
      diyGroupName: t('基础字段'),
      diyEnable: false,
      diyItemText: t('出库数（基本单位）'),
      minWidth: 100,
      accessor: 'default',
      Cell: ({
        row: {
          original: { out_stock_base, std_unit_name },
        },
      }) => `${parseFloat(Big(out_stock_base).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: () => (
        <div>
          {t('出库数')}
          <br />
          {t('(销售单位)')}
        </div>
      ),
      accessor: 'default',
      diyGroupName: t('基础字段'),
      diyItemText: t('出库数（销售单位）'),
      minWidth: 100,
      Cell: ({
        row: {
          original: { out_stock_sale, sale_unit_name },
        },
      }) => `${parseFloat(Big(out_stock_sale).toFixed(2))}${sale_unit_name}`,
    },
    {
      Header: t('出库成本价'),
      diyEnable: false,
      accessor: 'price',
      diyGroupName: t('基础字段'),
      minWidth: 100,
      Cell: ({
        row: {
          original: { price, std_unit_name },
        },
      }) =>
        `${parseFloat(
          Big(price).div(100).toFixed(2),
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: t('成本金额'),
      accessor: 'money',
      diyEnable: false,
      diyGroupName: t('基础字段'),
      minWidth: 100,
      Cell: ({
        row: {
          original: { price, out_stock_base },
        },
      }) =>
        `${parseFloat(
          Big(price || 0)
            .times(out_stock_base || 0)
            .div(100)
            .toFixed(2),
        )}${Price.getUnit()}`,
    },
    {
      Header: t('出库金额（不含税）'),
      id: 'detail_out_money_no_tax',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.detail_out_money_no_tax || 0).toFixed(
          2,
        )}${Price.getUnit()}`,
    },
    {
      Header: t('销项税率'),
      id: 'tax_rate',
      diyGroupName: t('进项税率'),
      minWidth: 100,
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.tax_rate || 0)
          .div(100)
          .toFixed(2)}%`,
    },
    {
      Header: t('销项税额'),
      id: 'tax_money',
      diyGroupName: t('进项税额'),
      minWidth: 100,
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.tax_money || 0).toFixed(
          2,
        )}${Price.getUnit()}`,
    },
    {
      Header: () => (
        <Observer>
          {() => {
            const headerMap = {
              1: t('出库日期'),
              4: t('收货日期'),
            }
            const {
              filter: { time_type },
            } = store
            return headerMap[time_type] || t('建单日期')
          }}
        </Observer>
      ),
      accessor: 'create_time',
      diyItemText: (
        <Observer>
          {() => {
            const headerMap = {
              1: t('出库日期'),
              4: t('收货日期'),
            }
            const {
              filter: { time_type },
            } = store
            return headerMap[time_type] || t('建单日期')
          }}
        </Observer>
      ),
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({
        row: {
          original: { create_time, receive_begin_time, date_time },
        },
      }) => {
        const {
          filter: { time_type },
        } = store
        const timeMap = {
          1: create_time,
          4: receive_begin_time,
        }
        return moment(timeMap[time_type] || date_time).format('YYYY-MM-DD')
      },
    },
    {
      Header: t('操作人'),
      accessor: 'operator',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
  ]

  componentDidMount() {
    store.initFilter()
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleChange = (value) => {
    store.temporaryFilter = value
  }

  handleSearch = (filter) => {
    const { mergeFilter, temporaryFilter } = store
    mergeFilter({ ...filter, ...temporaryFilter })
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleExport = (filter) => {
    const { mergeFilter, temporaryFilter } = store
    mergeFilter({ ...filter, ...temporaryFilter })
    store.export(Object.assign({ export: 1 }, this._checkFilter(store.filter)))
    // store.export(
    //   Object.assign({ export: 1, async: 1 }, this._checkFilter(store.filter)),
    // )
  }

  handlePageChange = (pagination) => {
    const { filter, fetchData } = store
    return fetchData(Object.assign(this._checkFilter(filter), pagination))
  }

  _checkFilter = (filter) => {
    const {
      begin,
      end,
      time_config_id,
      text,
      category_id_1,
      category_id_2,
      time_type,
      find_type,
    } = filter
    const result = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      time_type,
    }
    if (find_type) {
      result.find_type = find_type
    }
    if (text) {
      result.text = text
    }
    if (category_id_1) {
      result.category_id_1 = category_id_1
    }
    if (category_id_2) {
      result.category_id_2 = category_id_2
    }
    if (time_type === 3) {
      result.time_config_id = time_config_id
      result.status = 3
    }
    return result
  }

  handleBatchData = (files) => {
    requireGmXlsx((res) => {
      const { sheetToJson } = res
      sheetToJson(files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(t('没有可导入数据，请确认表格数据有效'))
          return
        }
        const arr = _.map(sheetData, (v) => {
          return {
            sheet_id: v[0],
            sku_id: v[1],
            price: v[3],
          }
        })
        const { updateOutboundPrice } = store
        updateOutboundPrice(arr).then(() => {
          RightSideModal.render({
            children: <TaskList />,
            noCloseBtn: true,
            onHide: RightSideModal.hide,
            opacityMask: true,
            style: {
              width: '300px',
            },
          })
        })
      })
    })
  }

  render() {
    const { pagination, list, loading } = store
    const canPriceRepair = globalStore.hasPermission(
      'import_out_stock_log_price_repair',
    )

    return (
      <>
        <Filter
          renderDate={
            <OutboundRecordDate
              timeTypeMap={this.dateSelectBox}
              onChange={this.handleChange}
            />
          }
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          id='outbound_record'
          onRequest={this.handlePageChange}
          ref={this.paginationRef}
        >
          <BoxTable
            info={
              <TableTotalText
                data={
                  pagination?.count === -1
                    ? []
                    : [
                        {
                          label: t('明细总数'),
                          content: pagination?.count || 0,
                        },
                      ]
                }
              />
            }
            action={
              canPriceRepair && (
                <Uploader
                  onUpload={this.handleBatchData}
                  accept='.xlsx'
                  className='gm-dropper-wrap'
                >
                  <Button type='primary'>{t('修复出库数据')}</Button>
                </Uploader>
              )
            }
          >
            <DiyFixedColumnsTableX
              id='outbound_record'
              diyGroupSorting={[t('基础字段')]}
              data={list.slice()}
              columns={this.columns}
              loading={loading}
            />
          </BoxTable>
        </ManagePagination>
      </>
    )
  }
}

export default OutboundRecord
