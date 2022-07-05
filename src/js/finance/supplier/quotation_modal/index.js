import React from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  RightSideModal,
  InputNumber,
  Tip,
  Price,
  Popover,
  Button,
} from '@gmfe/react'
import classNames from 'classnames'
import { Table, TableUtil } from '@gmfe/table'
import { renderPurchaseSpec } from '../../../common/filter'
import store from './store'
import { i18next } from 'gm-i18n'
import Big from 'big.js'
// import { connect } from 'react-redux'
import globalStore from '../../../stores/global'
import { SvgSupplier } from 'gm-svg'

@observer
class EditContent extends React.Component {
  handleTextChange = (event) => {
    const val = event.target.value
    // eslint-disable-next-line react/prop-types
    const { field } = this.props
    store.reqDataChange(field, val)
  }

  handleNumberChange = (val) => {
    // eslint-disable-next-line react/prop-types
    const { field } = this.props
    store.reqDataChange(field, val)
  }

  handleStopPropagation = (e) => {
    e.stopPropagation()
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { row, field } = this.props
    const { reqData, invalidData, activeRow, purchase_spec } = store
    const { purchase_unit, std_unit } = purchase_spec
    // eslint-disable-next-line
    const val = row.original[field]
    const reqVal = reqData[field] // 数据副本

    const stdUnit = `${Price.getUnit()}/${std_unit}`
    const purchaseUnit = `${Price.getUnit()}/${purchase_unit}`
    const unit = field === 'std_unit_price' ? stdUnit : purchaseUnit
    // eslint-disable-next-line
    if (row.index === activeRow) {
      return ['purchase_unit_price', 'std_unit_price'].includes(field) ? ( // 价格使用数字输入框
        <div>
          <InputNumber
            onClick={this.handleStopPropagation}
            onChange={this.handleNumberChange}
            value={reqVal}
            style={{ width: '70px' }}
            className={classNames({ 'b-bg-warning': invalidData[field] })}
            title={
              invalidData[field]
                ? i18next.t('询价价格须为正数，最多两位小数')
                : undefined
            }
          />
          {unit}
        </div>
      ) : (
        <input
          type='text'
          value={reqVal}
          onClick={this.handleStopPropagation}
          onChange={this.handleTextChange}
          style={{ width: '80px' }}
        />
      )
    } else {
      if (['purchase_unit_price', 'std_unit_price'].includes(field)) {
        return val ? val + unit : '-'
      } else {
        return val || '-'
      }
    }
  }
}

@observer
class Quotation extends React.Component {
  componentDidMount() {
    store.getSupplier()
  }

  handleCancelEdit = () => {
    store.setActiveRow(-1)
  }

  handleToEdit(index, e) {
    e.stopPropagation()
    store.setActiveRow(index)
  }

  // 用reqData发送数据给后台
  async handleToSave() {
    const { invalidData } = store
    if (invalidData.all) return
    await store.sendReqData()
    // eslint-disable-next-line react/prop-types
    this.props.handleSearch()
    Tip.success(i18next.t('保存成功'))
  }

  render() {
    const { purchase_spec, sheetArray, activeRow, invalidData } = store
    const { name, price, std_unit } = purchase_spec
    const list = sheetArray.slice()

    const stdUnit = `${Price.getUnit()}/${std_unit}`
    const quotation = price ? Big(price).div(100).toFixed(2) : '-'
    return (
      <div
        className='gm-padding-lr-20'
        style={{ height: '100%' }}
        onClick={this.handleCancelEdit}
      >
        <Flex
          justifyBetween
          alignCenter
          className='gm-padding-tb-10 gm-border-bottom'
        >
          <div className='b-modal-title'>
            {name}({renderPurchaseSpec(purchase_spec)})
            <span className='gm-margin-left-20 gm-text-12'>
              {i18next.t('最近询价(基本单位)')}:{quotation}
              {stdUnit}
            </span>
          </div>
          {globalStore.hasPermission('get_quote_price_record') && (
            <Button
              type='primary'
              plain
              onClick={() => {
                window.open('#/supply_chain/purchase/analysis?tab=3')
              }}
              className='gm-margin-right-20'
            >
              {i18next.t('查看询价记录')}
            </Button>
          )}
        </Flex>

        <div className='gm-text-red gm-padding-tb-10'>
          {i18next.t('注: 仅显示供应商最近的询价信息')}
        </div>

        <Table
          data={list}
          style={{ maxHeight: 'calc(100% - 85px)' }}
          getTrProps={(state, rowInfo) => {
            return {
              onClick: (e) => {
                rowInfo.index === activeRow && e.stopPropagation()
              },
            }
          }}
          active
          columns={[
            {
              Header: i18next.t('供应商编号'),
              accessor: 'customer_id',
              maxWidth: 80,
            },
            {
              Header: i18next.t('供应商名称'),
              accessor: 'name',
              maxWidth: 90,
            },
            {
              Header: i18next.t('询价(采购单位)'),
              id: 'purchase_unit_price',
              width: 130,
              Cell: (row) => (
                <Flex alignCenter>
                  <EditContent row={row} field='purchase_unit_price' />
                  {row.original.quoted_from_supplier && (
                    <Popover
                      top
                      showArrow
                      type='hover'
                      popup={<div>{i18next.t('供应商报价')}</div>}
                    >
                      <SvgSupplier
                        className='gm-text-14'
                        style={{
                          color: 'green',
                          marginLeft: '2px',
                        }}
                      />
                    </Popover>
                  )}
                </Flex>
              ),
            },
            {
              Header: i18next.t('询价(基本单位)'),
              id: 'std_unit_price',
              width: 120,
              Cell: (row) => (
                <Flex alignCenter>
                  <EditContent row={row} field='std_unit_price' />{' '}
                  {row.original.quoted_from_supplier && (
                    <Popover
                      top
                      showArrow
                      type='hover'
                      popup={<div>{i18next.t('供应商报价')}</div>}
                    >
                      <SvgSupplier
                        className='gm-text-14'
                        style={{
                          color: 'green',
                          marginLeft: '2px',
                        }}
                      />
                    </Popover>
                  )}
                </Flex>
              ),
            },
            {
              Header: i18next.t('产地'),
              id: 'origin_place',
              Cell: (row) => <EditContent row={row} field='origin_place' />,
            },
            {
              Header: i18next.t('描述'),
              id: 'remark',
              Cell: (row) => <EditContent row={row} field='remark' />,
            },
            {
              Header: i18next.t('最近询价时间'),
              accessor: 'last_time',
            },
            {
              show: globalStore.hasPermission('edit_quote_price'),
              Header: TableUtil.OperationHeader,
              Cell: (row) => (
                <TableUtil.OperationCell>
                  {row.index === activeRow ? (
                    <i
                      className={classNames('xfont xfont-ok text-primary', {
                        'gm-cursor': !invalidData.all,
                        'b-cursor-disable': invalidData.all,
                      })}
                      onClick={this.handleToSave.bind(this, row.index)}
                    />
                  ) : (
                    <i
                      className='xfont xfont-edit text-primary gm-cursor'
                      onClick={this.handleToEdit.bind(this, row.index)}
                    />
                  )}
                </TableUtil.OperationCell>
              ),
            },
          ]}
        />
      </div>
    )
  }
}

function QuotationModal(purchase_spec, handleSearch) {
  store.init(purchase_spec)
  RightSideModal.render({
    children: <Quotation handleSearch={handleSearch} />,
    onHide: RightSideModal.hide,
    style: {
      width: '920px',
    },
  })
}

export default QuotationModal
