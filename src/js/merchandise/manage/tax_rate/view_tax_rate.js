import { i18next, t } from 'gm-i18n'
import React from 'react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  BoxTable,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import taxRateStore, { STATUS } from './store'
import { history } from 'common/service'
import _ from 'lodash'
import moment from 'moment'
import globalStore from 'stores/global'
import { Table } from '@gmfe/table'

@observer
class TaxRateListView extends React.Component {
  constructor(props) {
    super(props)

    this.handleSubmit = ::this.handleSubmit
    this.handlePageChange = ::this.handlePageChange
    this.handleCreate = ::this.handleCreate
  }

  componentDidMount() {
    this.pagination.apiDoFirstRequest()
    // taxRateStore.searchTaxRateList()
  }

  handleChangeStatus(type, value) {
    taxRateStore.setData(type, value)
  }

  handleChangeSearchText(type, event) {
    taxRateStore.setData(type, event.target.value)
  }

  handleCreate() {
    history.push({
      pathname: '/merchandise/manage/tax_rate/details',
      query: {
        viewType: 'edit',
      },
    })
    taxRateStore.create()
  }

  handleSubmit() {
    taxRateStore.searchTaxRateList()
  }

  handlePageChange(params) {
    taxRateStore.searchTaxRateList(params)
  }

  handleOpenDetail = (id) => {
    history.push({
      pathname: '/merchandise/manage/tax_rate/details',
      query: {
        viewType: 'view',
        tax_id: id,
      },
    })
  }

  render() {
    const { data, tax_list } = taxRateStore
    const { tax_status, tax_search_text } = data.filter

    return (
      <div>
        <Box hasGap>
          <Form onSubmit={this.handleSubmit} inline>
            <FormItem label={i18next.t('状态')}>
              <Select
                className='gm-margin-right-10'
                value={tax_status}
                onChange={this.handleChangeStatus.bind(this, 'tax_status')}
              >
                {_.map(STATUS, (v) => (
                  <Option key={v.id} value={v.id}>
                    {v.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('输入税率规则名称')}
                value={tax_search_text}
                onChange={this.handleChangeSearchText.bind(
                  this,
                  'tax_search_text'
                )}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <ManagePaginationV2
          id='pagination_in_merchandise_tax_rate_list'
          onRequest={(pagination) => taxRateStore.searchTaxRateList(pagination)}
          ref={(ref) => (this.pagination = ref)}
        >
          <BoxTable
            action={
              globalStore.hasPermission('edit_tax') ? (
                <Button type='primary' onClick={this.handleCreate}>
                  {i18next.t('新建税率规则')}
                </Button>
              ) : null
            }
          >
            <Table
              data={tax_list.slice()}
              columns={[
                {
                  Header: t('序号'),
                  width: 100,
                  Cell: ({ index }) => index + 1,
                },
                {
                  Header: t('税率规则名称'),
                  Cell: ({ original }) => (
                    <span
                      className='text-primary gm-cursor'
                      onClick={() =>
                        this.handleOpenDetail(original.tax_rule_id)
                      }
                    >
                      {original.tax_rule_name}
                    </span>
                  ),
                },
                { Header: t('商户数'), accessor: 'address_count' },
                { Header: t('商品数'), accessor: 'spu_count' },
                { Header: t('创建人'), accessor: 'create_user' },
                {
                  Header: t('创建时间'),
                  id: 'create_time',
                  accessor: (original) =>
                    moment(original.create_time).format('YYYY-MM-DD HH:mm'),
                },
                {
                  Header: t('状态'),
                  width: 100,
                  id: 'status',
                  accessor: (original) =>
                    original.status === 1 ? t('有效') : t('无效'),
                },
              ]}
            />
          </BoxTable>
        </ManagePaginationV2>
      </div>
    )
  }
}

export default TaxRateListView
