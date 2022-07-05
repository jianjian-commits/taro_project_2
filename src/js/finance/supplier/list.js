import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import { Form, FormItem, FormButton, Box, BoxTable, Button } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { Table } from '@gmfe/table'

import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import _ from 'lodash'
import globalStore from '../../stores/global'
import './actions'
import './reducer'
import actions from '../../actions'
import InitSupplier from '../../guides/init/guide/init_supplier'
import { PAY_METHOD_TYPE } from 'common/enum'

import BatchImportDialog from './batch_import_dialog'
import PropTypes from 'prop-types'

class SupplierList extends React.Component {
  constructor(props) {
    super(props)

    this.refPagination = React.createRef()
    this.state = {
      search_text: '',
      exportTemplate: {
        [i18next.t('供应商编号')]: 'customer_id',
        [i18next.t('供应商名称')]: 'name',
        [i18next.t('联系电话')]: 'phone',
        [i18next.t('公司名称')]: 'company_name',
        [i18next.t('公司地址')]: 'company_address',
        [i18next.t('财务联系人')]: 'financer',
        [i18next.t('联系人电话')]: 'financer_phone',
        [i18next.t('开户银行')]: 'bank',
        [i18next.t('银行账号')]: 'card_no',
        [i18next.t('营业执照号')]: 'license',
        [i18next.t('供应商结款周期')]: 'pay_method',
        [i18next.t('供应商站点id')]: 'supplier_id',
      },
      exportNull: [
        {
          [i18next.t('供应商编号')]: '',
          [i18next.t('供应商名称')]: '',
          [i18next.t('联系电话')]: '',
          [i18next.t('公司名称')]: '',
          [i18next.t('公司地址')]: '',
          [i18next.t('财务联系人')]: '',
          [i18next.t('联系人电话')]: '',
          [i18next.t('开户银行')]: '',
          [i18next.t('银行账号')]: '',
          [i18next.t('营业执照号')]: '',
          [i18next.t('供应商结款周期')]: '',
          [i18next.t('供应商站点id')]: '',
        },
      ],
      exportFlag: false,
      dialogShow: false,
    }

    this.handleChangeValue = ::this.handleChangeValue
    this.handleSearch = ::this.handleSearch
    this.handleExport = ::this.handleExport
    this.handleCreateSupplier = ::this.handleCreateSupplier
    this.handlePurchaseManage = ::this.handlePurchaseManage
  }

  componentDidMount() {
    this.refPagination.current.apiDoFirstRequest()
  }

  handleChangeValue(e) {
    this.setState({ search_text: e.target.value })
  }

  handleSearch(e) {
    e.preventDefault()
    const { search_text } = this.state
    const req = {}

    if (search_text) {
      req.search_text = search_text
    }

    this.refPagination.current.apiDoFirstRequest(req)
  }

  handleRequest = (params) => {
    const { search_text } = this.state
    const req = {
      search_text,
      ...params,
    }
    return actions.supplier_get_list(req)
  }

  handleExport(e) {
    e.preventDefault()
    const { search_text, exportTemplate, exportNull } = this.state
    this.setState({ exportFlag: true })
    actions.supplier_export({ search_text }).then((json) => {
      const exportData =
        json.data.length > 0
          ? _.map(json.data, (supplier) => {
              const data = {}
              _.forEach(exportTemplate, (value, key) => {
                data[key] = supplier[value]
                if (value === 'pay_method') {
                  const payMethodItem = PAY_METHOD_TYPE.find(
                    (item) => item.value === supplier[value],
                  )
                  data[key] = payMethodItem.name
                }
              })
              return data
            })
          : exportNull
      requireGmXlsx((res) => {
        const { jsonToSheet } = res
        jsonToSheet([exportData], { fileName: i18next.t('供应商.xlsx') })
      })
      this.setState({ exportFlag: false })
    })
  }

  handleCreateSupplier() {
    actions.supplier_clear_supplier_info()
    window.open('#/sales_invoicing/base/supplier/supplier_info')
  }

  handleGoToDetail(supplier_id) {
    window.open(
      `#/sales_invoicing/base/supplier/supplier_info?supplier_id=${supplier_id}`,
    )
  }

  handlePurchaseManage() {
    window.open('#/supply_chain/purchase/information?tab=get_pur_spec')
  }

  handleDialogToggle = () => {
    this.setState({
      dialogShow: !this.state.dialogShow,
    })
  }

  render() {
    const { list } = this.props.supplier
    const { search_text, exportFlag } = this.state

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={i18next.t('搜索')}>
              <input
                value={search_text}
                onChange={this.handleChangeValue}
                name='search_text'
                type='text'
                placeholder={i18next.t('输入供应商编号、名称或电话')}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={this.handleExport} disabled={exportFlag}>
                {i18next.t('导出')}
              </Button>
            </FormButton>
          </Form>
        </Box>

        <BoxTable
          action={
            <div data-id='initSupplier'>
              {globalStore.hasPermission('add_settle_supplier') && (
                <Button
                  type='primary'
                  onClick={this.handleCreateSupplier}
                  className='gm-margin-right-10'
                >
                  {i18next.t('新建供应商')}
                </Button>
              )}
              {globalStore.hasPermission('add_batch_supplier') && (
                <Button type='primary' plain onClick={this.handleDialogToggle}>
                  {i18next.t('批量导入供应商')}
                </Button>
              )}
            </div>
          }
        >
          <ManagePagination
            ref={this.refPagination}
            onRequest={this.handleRequest}
          >
            <Table
              data={list}
              columns={[
                {
                  Header: i18next.t('供应商编号'),
                  accessor: 'customer_id',
                  Cell: ({ value, index }) => {
                    return (
                      <a
                        href='javascript:;'
                        onClick={this.handleGoToDetail.bind(
                          this,
                          list[index].supplier_id,
                        )}
                      >
                        {value || '-'}
                      </a>
                    )
                  },
                },
                {
                  Header: i18next.t('供应商名称'),
                  accessor: 'name',
                },
                {
                  width: 160,
                  Header: i18next.t('联系电话'),
                  accessor: 'phone',
                },
              ]}
            />
          </ManagePagination>
        </BoxTable>

        <BatchImportDialog
          show={this.state.dialogShow}
          title={i18next.t('批量导入供应商')}
          onHide={this.handleDialogToggle}
        />
        <InitSupplier ready />
      </div>
    )
  }
}

SupplierList.propTypes = {
  supplier: PropTypes.object,
}

export default connect((state) => ({
  supplier: state.supplier,
}))(SupplierList)
