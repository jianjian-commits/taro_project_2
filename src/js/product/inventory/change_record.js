import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  DateRangePicker,
  BoxTable,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { Table } from '@gmfe/table'

import './actions'
import './reducer'
import actions from '../../actions'

import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { matchKey } from '../util'

import { i18next } from 'gm-i18n'
import TableTotalText from '../../common/components/table_total_text'

class ChangeRecord extends React.Component {
  constructor() {
    super()
    this.state = {
      begin: moment().subtract('d', 7).toDate(),
      end: new Date(),
    }
  }

  componentDidMount() {
    const start_time = moment(new Date()).subtract('d', 7).format('YYYY-MM-DD')
    const end_time = moment(new Date()).format('YYYY-MM-DD')
    actions.product_inventory_get_change_record({
      start_time: start_time,
      end_time: end_time,
      batch_number: this.props.location.query.id,
    })
  }

  handleDateChange = (begin, end) => {
    this.setState({ begin, end })
  }

  handleSearch = (e) => {
    e.preventDefault()
    const { begin, end } = this.state
    const start_time = moment(begin).format('YYYY-MM-DD')
    const end_time = moment(end).format('YYYY-MM-DD')

    actions.product_inventory_get_change_record({
      start_time: start_time,
      end_time: end_time,
      batch_number: this.props.location.query.id,
    })
  }

  handleExportData = (data) => {
    const { stockDetailMatchList } = this.props.inventory
    const {
      batch_number,
      purchase_unit_name,
      sale_ratio,
      sku_id,
      sku_name,
      spu_id,
      std_unit_name,
      data_list,
    } = data

    const exportData = _.map(data_list, (value) => {
      const diff = Big(value.now_stock_number)
        .sub(value.old_stock_number)
        .toFixed(2)
      const operation = _.find(
        stockDetailMatchList,
        (list) => list.id === value.stock_operate,
      ).name
      const sign = Big(diff).gt(0.0) ? '+' + parseFloat(diff) : parseFloat(diff)

      return {
        batch_number: batch_number,
        sku_id: sku_id || spu_id,
        sku_name: sku_name,
        specification:
          _.isNil(sale_ratio) || _.isNil(purchase_unit_name)
            ? '-'
            : sale_ratio + std_unit_name + '/' + purchase_unit_name,
        operate_time: value.operate_time,
        old_stock_number: value.old_stock_number + std_unit_name,
        now_stock_number: value.now_stock_number + std_unit_name,
        stock_detail:
          value.operator + operation + '(' + sign + std_unit_name + ')',
      }
    })
    return exportData
  }

  handleExport = (e) => {
    e.preventDefault()
    const { inventoryBatchExportChangeList } = this.props.inventory
    const { begin, end } = this.state
    const start_time = moment(begin).format('YYYY-MM-DD')
    const end_time = moment(end).format('YYYY-MM-DD')

    actions
      .product_inventory_get_change_record({
        start_time: start_time,
        end_time: end_time,
        batch_number: this.props.location.query.id,
      })
      .then((json) => {
        let exportData = []

        if (!json.data.data_list.length) {
          const data = [
            {
              batch_number: null,
              sku_id: null,
              sku_name: null,
              specification: null,
              operate_time: null,
              old_stock_number: null,
              now_stock_number: null,
              stock_detail: null,
            },
          ]
          exportData = matchKey(data, inventoryBatchExportChangeList)
        } else
          exportData = matchKey(
            this.handleExportData(json.data),
            inventoryBatchExportChangeList,
          )
        requireGmXlsx((res) => {
          const { jsonToSheet } = res
          jsonToSheet([exportData], { fileName: t('批次盘点.xlsx') })
        })
      })
  }

  render() {
    const { stockDetailMatchList } = this.props.inventory
    const { begin, end } = this.state
    const {
      batch_number,
      data_list,
      sku_name,
      sku_id,
      sale_ratio,
      std_unit_name,
      purchase_unit_name,
    } = this.props.inventory.changeRecord

    const title = (
      <BoxTable.Info>
        <TableTotalText
          data={[
            {
              label: i18next.t('批次号'),
              content: batch_number,
            },
            {
              label: i18next.t('商品信息'),
              content: (() => {
                let result = `${sku_name}`
                if (
                  !(
                    _.isNil(sku_id) ||
                    _.isNil(sale_ratio) ||
                    _.isNil(purchase_unit_name)
                  )
                ) {
                  result += `(${sku_id},${sale_ratio}${std_unit_name}/${purchase_unit_name})`
                }
                return result
              })(),
            },
          ]}
        />
      </BoxTable.Info>
    )

    return (
      <div>
        <Box hasGap>
          <Form onSubmit={this.handleSearch} className='form-inline'>
            <FormItem label={t('按日期')}>
              <DateRangePicker
                begin={begin}
                end={end}
                onChange={this.handleDateChange}
              />
            </FormItem>
            <FormButton>
              <Button
                type='primary'
                htmlType='submit'
                className='gm-margin-right-5'
              >
                {t('搜索')}
              </Button>
              <Button onClick={this.handleExport}>{t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>
        <BoxTable title={title} info={title}>
          <Table
            data={data_list.slice()}
            columns={[
              {
                Header: t('操作时间'),
                accessor: 'operate_time',
              },
              {
                Header: t('变动前库存'),
                id: 'old_stock_number',
                accessor: (v) => {
                  return v.old_stock_number + std_unit_name
                },
              },
              {
                Header: t('变动后库存'),
                id: 'now_stock_number',
                accessor: (v) => v.now_stock_number + std_unit_name,
              },
              {
                Header: t('库存明细'),
                accessor: 'stock_operate',
                Cell: (row) => {
                  const {
                    now_stock_number,
                    old_stock_number,
                    stock_operate,
                    operator,
                  } = row.original
                  const diff = Big(now_stock_number)
                    .sub(old_stock_number)
                    .toFixed(2)
                  const operation = _.find(
                    stockDetailMatchList,
                    (list) => list.id === stock_operate,
                  ).name
                  const sign = Big(diff).gt(0.0)
                    ? '+' + parseFloat(diff)
                    : parseFloat(diff)

                  return operator + operation + '(' + sign + std_unit_name + ')'
                },
              },
            ]}
          />
        </BoxTable>
      </div>
    )
  }
}

ChangeRecord.propTypes = {
  inventory: PropTypes.object,
}
export default connect((state) => ({
  inventory: state.inventory,
}))(ChangeRecord)
