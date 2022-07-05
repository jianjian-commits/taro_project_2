import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable, Flex } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { Table, expandTableHOC, subTableHOC } from '@gmfe/table'

import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'

import './actions'
import './reducer'
import actions from '../../actions'
import { matchKey } from '../util'
import Big from 'big.js'
import ShelfBatchFilter from './shelf_batch_filter'
import PropTypes from 'prop-types'
import TableTotalText from 'common/components/table_total_text'
import ToolTip from '@gmfe/react/src/component/tool_tip'

const ExpandTable = expandTableHOC(Table)
const SubTable = subTableHOC(Table)

class ShelfManagementRecording extends React.Component {
  constructor(props) {
    super(props)
    this.shelfManagementRecordingRef = React.createRef()

    this.state = {
      pagination: {
        offset: 0,
        limit: 10,
        count: 0,
      },
      filter: {},
    }
  }

  componentDidMount() {
    this.shelfManagementRecordingRef.current.apiDoFirstRequest()
  }

  handleSearch = (filter) => {
    this.setState(
      {
        filter,
      },
      () => {
        this.shelfManagementRecordingRef.current.apiDoFirstRequest()
      },
    )
  }

  handleData = (data) => {
    const exportData = []
    _.forEach(data, (value) => {
      _.forEach(value.shelf_details, (val) => {
        exportData.push({
          shelf_name: value.shelf_name,
          sku_id: val.sku_id || val.spu_id,
          sku_name: val.sku_name || val.spu_name,
          remain_unit: val.remain + val.std_unit,
          ratio: val.ratio + val.std_unit + '/' + val.purchase_unit,
          remain_purchase:
            _.isNumber(val.remain) && _.isNumber(val.ratio)
              ? parseFloat(Big(val.remain).div(val.ratio).toFixed(2)) +
                val.purchase_unit
              : '',
        })
      })
    })
    return exportData
  }

  handleExport = (filter) => {
    const { inventoryShelfExportList } = this.props.inventory
    const { text } = filter
    const req = Object.assign({}, { export: 1, text })

    actions.product_inventory_shelf_management_list(req).then((json) => {
      let exportData = []
      if (!json.data.length) {
        const data = [
          {
            shelf_name: null,
            sku_id: null,
            sku_name: null,
            remain_unit: null,
            ratio: null,
            remain_purchase: null,
          },
        ]
        exportData = matchKey(data, inventoryShelfExportList)
      } else
        exportData = matchKey(
          this.handleData(json.data),
          inventoryShelfExportList,
        )
      requireGmXlsx((res) => {
        const { jsonToSheet } = res
        jsonToSheet([exportData], { fileName: i18next.t('货位盘点.xlsx') })
      })
    })
  }

  handlePageChange = (page) => {
    const { text } = this.state.filter
    const req = Object.assign({}, { text }, page)

    return actions.product_inventory_shelf_management_list(req).then((json) => {
      this.setState({ pagination: json.pagination })
      return json
    })
  }

  renderExpandedRowRender = (list) => {
    return (
      <SubTable
        data={list}
        columns={[
          {
            Header: (
              <Flex alignCenter>
                {i18next.t('入库规格ID')}
                <ToolTip
                  className='gm-margin-left-5'
                  showArrow
                  popup={
                    <div className='gm-padding-5'>
                      {i18next.t(
                        '入库规格ID：展示规格ID，如无规格则展示商品ID',
                      )}
                    </div>
                  }
                />
              </Flex>
            ),
            accessor: 'sku_id',
            Cell: (cellProps) => {
              const { sku_id, spu_id } = cellProps.original
              return sku_id || spu_id || '-'
            },
          },
          {
            Header: (
              <Flex alignCenter>
                {i18next.t('入库规格名')}
                <ToolTip
                  className='gm-margin-left-5'
                  showArrow
                  popup={
                    <div className='gm-padding-5'>
                      {i18next.t(
                        '入库规格名：展示规格名，如无规格名则展示商品名',
                      )}
                    </div>
                  }
                />
              </Flex>
            ),
            accessor: 'sku_name',
            Cell: (cellProps) => {
              const { sku_name, spu_name } = cellProps.original
              return sku_name || spu_name || '-'
            },
          },
          {
            Header: i18next.t('库存数（基本单位）'),
            accessor: 'std_unit',
            Cell: ({ value, original: { remain } }) => `${remain}${value}`,
          },
          {
            Header: i18next.t('入库规格'),
            accessor: 'ratio',
            Cell: ({ value, original: { std_unit, purchase_unit } }) =>
              `${value}${std_unit}/${purchase_unit}`,
          },
          {
            Header: i18next.t('库存数（采购单位）'),
            accessor: 'purchase_unit',
            Cell: ({ value, original: { remain, ratio } }) =>
              _.isNumber(ratio)
                ? `${parseFloat(Big(remain).div(ratio).toFixed(2))}${value}`
                : '',
          },
        ]}
      />
    )
  }

  handleExpand = (index) => {
    actions.product_inventory_shelf_management_expand(index)
  }

  render() {
    const { inventoryShelfManagementList } = this.props.inventory
    const { list, loading } = inventoryShelfManagementList
    const { pagination } = this.state

    return (
      <>
        <ShelfBatchFilter
          onSearch={this.handleSearch}
          onExport={this.handleExport}
          placeholder={i18next.t('输入货位号、规格名、规格ID')}
        />
        <ManagePagination
          id='shelf_management_recording_managepagination'
          ref={this.shelfManagementRecordingRef}
          onRequest={this.handlePageChange}
        >
          <BoxTable
            info={
              <BoxTable.Info>
                <TableTotalText
                  data={[
                    {
                      label: i18next.t('货位总数'),
                      content: pagination.count || 0,
                    },
                  ]}
                />
              </BoxTable.Info>
            }
          >
            <ExpandTable
              data={list}
              loading={loading}
              columns={[
                { Header: i18next.t('货位号'), accessor: 'shelf_name' },
                { Header: i18next.t('存放商品数'), accessor: 'sku_count' },
              ]}
              SubComponent={({ original: { shelf_details } }) =>
                this.renderExpandedRowRender(shelf_details)
              }
            />
          </BoxTable>
        </ManagePagination>
      </>
    )
  }
}

ShelfManagementRecording.propTypes = {
  inventory: PropTypes.object,
}

export default ShelfManagementRecording
