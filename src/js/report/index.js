import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Request } from '@gm-common/request'
import Big from 'big.js'
import { getSearchData, radioSelect } from './util'
import ValueReportHeader from './value_report_header'
import actions from '../actions'
import './actions'
import './reducer'
import { Table, diyTableHOC } from '@gmfe/table'
import _ from 'lodash'
import DimSelector from 'common/components/dim_selector'
import TableListTips from 'common/components/table_list_tips'
import TableTotalText from 'common/components/table_total_text'

const DiyTable = diyTableHOC(Table)

class Report extends React.Component {
  columns = [
    {
      Header: i18next.t('一级分类ID'),
      accessor: 'category_id_1',
      diyGroupName: i18next.t('基础字段'),
      no: true,
      index: 2,
      diyEnable: true,
    },
    {
      Header: i18next.t('一级分类'),
      accessor: 'category_id_1_name',
      diyGroupName: i18next.t('基础字段'),
      no: true,
      index: 2,
      diyEnable: true,
    },
    {
      Header: i18next.t('二级分类ID'),
      accessor: 'category_id_2',
      diyGroupName: i18next.t('基础字段'),
      no: true,
      index: 1,
      diyEnable: true,
    },
    {
      Header: i18next.t('二级分类'),
      accessor: 'category_id_2_name',
      diyGroupName: i18next.t('基础字段'),
      no: true,
      index: 1,
      diyEnable: true,
    },
    {
      Header: i18next.t('商品id'),
      accessor: 'spu_id',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('商品名称'),
      accessor: 'spu_name',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('基本单位'),
      accessor: 'std_unit_name',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('期初库存'),
      accessor: 'start_stock',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('期初货值'),
      accessor: 'start_stock_value',
      diyGroupName: i18next.t('基础字段'),
      diyEnable: false,
    },
    {
      Header: i18next.t('期初均价'),
      accessor: 'start_avg_price',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('期末库存'),
      accessor: 'end_stock',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('期末货值'),
      accessor: 'end_stock_value',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('期末均价'),
      accessor: 'end_avg_price',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期采购入库数'),
      accessor: 'in_stock_num',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期采购入库金额'),
      accessor: 'in_stock_value',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('本期采购入库均价'),
      accessor: 'in_stock_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期采购退货数量'),
      accessor: 'return_stock_num',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期采购退货金额'),
      accessor: 'return_stock_value',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      index: 0,
    },
    {
      Header: i18next.t('本期采购退货均价'),
      accessor: 'return_stock_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期销售出库数'),
      accessor: 'out_stock_num',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期销售出库金额'),
      accessor: 'out_stock_value',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('本期销售出库均价'),
      accessor: 'out_stock_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期报溢数量'),
      accessor: 'increase_stock_num',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期报溢金额'),
      accessor: 'increase_stock_value',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('本期报溢均价'),
      accessor: 'increase_stock_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期报损数量'),
      accessor: 'loss_stock_num',
      diyEnable: true,
      index: 0,
      diyGroupName: i18next.t('基础字段'),
      show: false,
    },
    {
      Header: i18next.t('本期报损金额'),
      accessor: 'loss_stock_value',
      diyGroupName: i18next.t('基础字段'),
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期报损均价'),
      accessor: 'loss_stock_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期销售退货入库数'),
      accessor: 'in_return_stock_num',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期销售退货入库金额'),
      accessor: 'in_return_stock_value',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('本期销售退货入库均价'),
      accessor: 'in_return_stock_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期分割入库数量'),
      accessor: 'split_stock_num',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期分割入库金额'),
      accessor: 'split_stock_value',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期分割入库均价'),
      accessor: 'split_stock_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期分割出库数量'),
      accessor: 'split_stock_out_num',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期分割出库金额'),
      accessor: 'split_stock_out_value',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
    {
      Header: i18next.t('本期分割出库均价'),
      accessor: 'split_stock_out_price',
      diyGroupName: i18next.t('基础字段'),
      show: false,
      index: 0,
      diyEnable: true,
    },
  ]

  constructor(props) {
    super(props)
    this.handleGetReportList = ::this.handleGetReportList
    this.handlePopDimensionChange = ::this.handlePopDimensionChange
    this.handleUpdateValueData = ::this.handleUpdateValueData
    this.handleSearch = ::this.handleSearch
  }

  componentDidMount() {
    this.pagination.apiDoFirstRequest()
  }

  handlePopDimensionChange(selectedValue) {
    actions.report_filter_pop_dimension(selectedValue)
    const {
      report: { filter_pop_dimension },
    } = this.props
    const selectedIndex = radioSelect(filter_pop_dimension)
    if (selectedIndex === 1) {
      // 选中一级分类：清空二级分类、搜索框
      actions.report_select_filter({
        ...this.props.report.select_filter,
        category2_ids: [],
      })
      actions.report_search_text('')
    } else if (selectedIndex === 2) {
      // 选中二级分类：清空搜索框
      actions.report_search_text('')
    }

    this.pagination.apiDoFirstRequest()
  }

  handleSearch() {
    this.pagination.apiDoFirstRequest()
  }

  handleUpdateValueData(data) {
    actions.update_report_value_data(data)
  }

  handleResetValueData() {
    actions.reset_report_value_data()
  }

  handleGetReportList(paramsFromManagePaginationV2 = {}) {
    const param = {
      ...getSearchData(this.props),
      ...paramsFromManagePaginationV2,
    }
    this.handleResetValueData()
    actions.report_sum_data(getSearchData(this.props)).then((json) => {
      // 如果引发错误，置为零
      actions.update_report_sum_data(json.data)
    })
    return Request('/stock/report/value')
      .data(param)
      .get()
      .then((json) => {
        this.handleUpdateValueData(json.data)
        return json
      })
  }

  render() {
    const { report } = this.props
    const {
      start_stock_value_sum,
      end_stock_value_sum,
      in_stock_value_sum,
      out_stock_value_sum,
    } = report.sum_data
    const selectIndex = radioSelect(report.filter_pop_dimension)
    const list = _.map(report.value_data.dataList, (d) => {
      return {
        ...d,
        category_id_1: d.category_id_1 || '-',
        category_id_1_name: d.category_id_1_name || '-',
        category_id_2: d.category_id_2 || '-',
        category_id_2_name: d.category_id_2_name || '-',
        spu_id: d.spu_id || '-',
        spu_name: d.spu_name || '-',
        std_unit_name: d.std_unit_name || '-',
      }
    })
    const columns = _.filter(this.columns, (item) => {
      if (!item.diyEnable) {
        return true
      }
      return item.no ? item.index !== selectIndex : item.index === selectIndex
    })

    return (
      <div>
        <ValueReportHeader report={report} onSearch={this.handleSearch} />
        <TableListTips
          tips={[
            i18next.t(
              '在某商品库存为负的情况下，库存均价会在此商品下一次入库时更新为的此次入库的入库单价，以保证后续出库时库存成本的准确。货值成本表中的所有数据来源自明细数据的统计，请在库存为负的情况下及时盘点库存，否则会出现货值成本不准确的情况。',
            ),
          ]}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('期初总货值'),
                    content: Big(start_stock_value_sum).toFixed(4),
                  },
                  {
                    label: i18next.t('期末总货值'),
                    content: Big(end_stock_value_sum).toFixed(4),
                  },
                  {
                    label: i18next.t('本期入库总金额'),
                    content: Big(in_stock_value_sum).toFixed(4),
                  },
                  {
                    label: i18next.t('本期出库总金额'),
                    content: Big(out_stock_value_sum).toFixed(4),
                  },
                ]}
              />
            </BoxTable.Info>
          }
          // action={
          //   <DimSelector
          //     onChange={this.handlePopDimensionChange}
          //     data={report.filter_pop_dimension.list}
          //     name={i18next.t('查看方式')}
          //     selected={report.filter_pop_dimension.selectedValue}
          //   />
          // }
        >
          <ManagePaginationV2
            id='pagination_in_cost_of_goods_list'
            onRequest={this.handleGetReportList}
            ref={(ref) => {
              this.pagination = ref
            }}
            disablePage
          >
            {({ loading }) =>
              selectIndex === 0 ? (
                <DiyTable
                  id='diy-table'
                  data={list}
                  columns={columns}
                  loading={loading}
                  diyGroupSorting={[i18next.t('基础字段')]}
                />
              ) : (
                <Table data={list} columns={columns} loading={loading} />
              )
            }
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default Report
