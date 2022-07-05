import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table } from '@gmfe/table'
import { Flex, Input, InputNumberV2 } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { t } from 'gm-i18n'
import { commonModalHandleOk, getProductDetailsData } from '../../../utils'
import moment from 'moment'
import { store } from '../../../store'
import _ from 'lodash'
import globalStore from 'stores/global'
import SupplierDel from 'common/components/supplier_del_sign'

export default class ProductDetailsModal extends Component {
  state = {
    data: [],
    loading: false,
  }

  pagination

  column = [
    {
      Header: t('存放货位'),
      accessor: 'shelf_name',
      Cell: ({ original: { shelf_name } }) => <>{shelf_name || t('未分配')}</>,
    },
    { Header: t('批次号'), accessor: 'batch_number' },
    {
      Header: t('供应商'),
      accessor: 'supplier_name',
      width: '150',
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
    { Header: t('批次库存均价'), accessor: 'batch_avg_price' },
    {
      Header: t('生产日期'),
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
      Header: t('保质期'),
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
      Header: t('抄盘数'),
      accessor: 'remain',
      Cell: ({ original: { remain, std_unit_name } }) => (
        <>
          {remain}
          {std_unit_name}
        </>
      ),
    },
    ...(globalStore.hasPermission('edit_sku_stocks')
      ? [
          {
            Header: t('实盘数'),
            width: 200,
            accessor: 'new_remain',
            Cell: ({ original }) => {
              const permission = globalStore.hasPermission(
                'get_check_batch_number',
              )
              return original.edit ? (
                <Flex row justifyBetween>
                  <InputNumberV2
                    precision={2}
                    min={0}
                    style={{ width: '60px' }}
                    className='form-control'
                    value={
                      _.isNumber(original.new_remain)
                        ? original.new_remain
                        : null
                    }
                    placeholder={t('实盘数')}
                    onChange={(value) =>
                      this.changeInput(value, original, 'new_remain')
                    }
                  />
                  <Input
                    style={{ width: '60px' }}
                    className='form-control'
                    value={original.remark || ''}
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
                permission && (
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.toggleEdit(original, true)}
                  >
                    <i className='glyphicon glyphicon-pencil text-primary' />
                  </span>
                )
              )
            },
          },
        ]
      : []),
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
    value.new_remain = value.remark = undefined
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
   * 获取数据
   * @param pagination
   * @returns {Q.Promise<any> | Promise<void>}
   */
  handleGetTableData(pagination) {
    this.setState({ loading: true })
    const {
      searchItem: { shelf_id },
    } = store
    const {
      spu: { spu_id, negative },
    } = this.props
    return getProductDetailsData({
      ...pagination,
      spu_id,
      shelf_id,
      view_shelf: 1,
      [negative ? 'remain_negative' : 'remain_positive']: 1,
      batch_edit: 1,
    })
      .then((result) => {
        const { data } = result
        this.setState({ data })
        return result
      })
      .finally(() => this.setState({ loading: false }))
  }

  render() {
    const { data, loading } = this.state
    const {
      spu: { spu_id, spu_name },
    } = this.props
    return (
      <Flex column className='modal-container'>
        <header className='modal-foot gm-padding-bottom-10'>
          <h3>
            {spu_name}
            <span className='gm-gap-15' />
            {spu_id}
          </h3>
        </header>
        <Flex flex={1} style={{ overflowY: 'auto' }}>
          <div className='width-100-percent'>
            <ManagePaginationV2
              id='pagination_in_product_cargo_location_management_product_details_modal_list'
              onRequest={this.handleGetTableData}
              ref={(ref) => (this.pagination = ref)}
            >
              <Table
                data={data}
                columns={this.column}
                loading={loading}
                className='gm-margin-bottom-20'
              />
            </ManagePaginationV2>
          </div>
        </Flex>
      </Flex>
    )
  }
}

ProductDetailsModal.propTypes = {
  spu: PropTypes.shape({
    spu_id: PropTypes.string,
    spu_name: PropTypes.string,
    negative: PropTypes.bool,
  }).isRequired,
}
