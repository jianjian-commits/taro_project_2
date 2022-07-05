import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Flex, Input, InputNumberV2 } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import { t } from 'gm-i18n'
import { commonModalHandleOk, getProductDetailsData } from '../../../utils'
import moment from 'moment'
import { store } from '../../../store'
import _ from 'lodash'
import SupplierDel from 'common/components/supplier_del_sign'

export default class StockDetailsModal extends Component {
  pagination

  state = {
    data: [],
    loading: false,
  }

  columns = [
    { Header: '批次号', accessor: 'batch_number' },
    {
      Header: '供应商',
      accessor: 'supplier_name',
      Cell: (cellProps) => {
        const { supplier_name, supplier_status } = cellProps.original

        return (
          <Flex>
            {supplier_status === 0 && <SupplierDel />}
            {supplier_name}
          </Flex>
        )
      },
    },
    { Header: '批次库存均价', accessor: 'batch_avg_price' },
    {
      Header: '生产日期',
      accessor: 'production_time',
      Cell: ({ original }) => (
        <>
          {original.production_time
            ? moment(original.production_time).format('YYYY-MM-DD')
            : '-'}
        </>
      ),
    },
    {
      Header: '保质期',
      accessor: 'life_time',
      Cell: ({ original }) => (
        <>
          {original.life_time
            ? moment(original.life_time).format('YYYY-MM-DD')
            : '-'}
        </>
      ),
    },
    {
      Header: '抄盘数',
      accessor: 'remain',
      Cell: ({ original: { remain, std_unit_name } }) => (
        <>
          {remain}
          {std_unit_name}
        </>
      ),
    },
    {
      Header: '实盘数',
      width: 200,
      accessor: 'new_remain',
      Cell: ({ original }) =>
        original.edit ? (
          <Flex row justifyBetween>
            <InputNumberV2
              precision={2}
              min={0}
              style={{ width: '60px' }}
              className='form-control'
              value={
                _.isNumber(original.new_remain) ? original.new_remain : null
              }
              placeholder={t('实盘数')}
              onChange={(event) =>
                this.changeInput(event, original, 'new_remain')
              }
            />
            <Input
              style={{ width: '60px' }}
              className='form-control'
              value={original.remark}
              placeholder={t('备注')}
              onChange={(event) =>
                this.changeInput(event.target.value, original, 'remark')
              }
            />
            <span
              style={{
                fontSize: '14px',
                lineHeight: '30px',
                cursor: 'pointer',
              }}
              onClick={() => this.handleOk(original)}
            >
              <i key='1' className='xfont xfont-ok text-primary' />
            </span>
            <span
              style={{
                fontSize: '14px',
                lineHeight: '30px',
                cursor: 'pointer',
              }}
              onClick={() => this.handleCancel(original)}
            >
              <i key='2' className='xfont xfont-remove' />
            </span>
          </Flex>
        ) : (
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => this.toggleEdit(original, true)}
          >
            <i className='glyphicon glyphicon-pencil text-primary' />
          </span>
        ),
    },
  ]

  constructor(props) {
    super(props)
    this.handleGetTableData = ::this.handleGetTableData
  }

  componentDidMount() {
    this.pagination.doFirstRequest()
  }

  handleOk(value) {
    commonModalHandleOk(value, this)
  }

  handleCancel(value) {
    value.new_remain = value.remark = ''
    this.toggleEdit(value, false)
  }

  /**
   * 编辑
   * @param value
   * @param flag
   */
  toggleEdit(value, flag) {
    value.edit = flag
    this.setState(({ data }) => data)
  }

  /**
   * 输入货位
   * @param event
   * @param value
   * @param key
   */
  changeInput(event, value, key) {
    value[key] = event
    this.setState(({ data }) => data)
  }

  /**
   * 获取表格数据
   * @param pagination
   * @returns {Q.Promise<any> | Promise<void>}
   */
  handleGetTableData(pagination) {
    this.setState({ loading: true })
    const {
      shelf: { shelf_id },
    } = this.props
    const {
      productSearchOption: { spu_id },
    } = store
    return getProductDetailsData({
      ...pagination,
      shelf_id,
      spu_id,
    })
      .then((result) => {
        const { data } = result
        this.setState({ data })
        return result
      })
      .finally(() => this.setState({ loading: false }))
  }

  render() {
    const { data } = this.state
    const {
      shelf: { shelf_name, is_distribution },
    } = this.props
    return (
      <Flex column className='gm-padding-lr-20 gm-padding-tb-10'>
        <h2 className='modal-foot gm-margin-0' style={{ lineHeight: '40px' }}>
          {`${shelf_name}${is_distribution ? t('（未分配子级货位）') : ''}`}
        </h2>
        <div className='gm-gap-20' />
        <Flex flex={1} style={{ overflowY: 'auto' }}>
          <div className='width-100-percent'>
            <ManagePaginationV2
              id='pagination_in_product_cargo_location_management_stock_details_modal_list'
              onRequest={this.handleGetTableData}
              ref={(ref) => (this.pagination = ref)}
            >
              <Table
                data={data}
                columns={this.columns}
                className='gm-margin-bottom-10'
              />
            </ManagePaginationV2>
          </div>
        </Flex>
      </Flex>
    )
  }
}

StockDetailsModal.propTypes = {
  shelf: PropTypes.shape({
    shelf_name: PropTypes.string,
    shelf_id: PropTypes.number,
    is_distribution: PropTypes.bool,
  }).isRequired,
}
