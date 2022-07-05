import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Button, FormButton, FormItem, Form, Box } from '@gmfe/react'
import { history } from 'common/service'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, expandTableHOC, TableUtil, subTableHOC } from '@gmfe/table'
import SVGReturn from 'svg/return.svg'
import store from './store'
import commonStore from '../../store'

import Permission from '../../../common/components/permission'
import { formatPrice } from '../../util'

const ExpandTable = expandTableHOC(Table)
const SubTable = subTableHOC(Table)

@observer
class CustomerList extends React.Component {
  componentDidMount() {
    commonStore.fetchList()
    store.setPagination(this.pagination)
    store.pagination.apiDoFirstRequest()
  }

  handleChange = (e) => {
    store.handleFilterChange('q', e.target.value)
  }

  handleReturn = (value) => {
    history.push(
      `/material_manage/customer/create?data=${JSON.stringify(value)}`,
    )
  }

  renderExpandedRowRender(index) {
    const { tlist, sid, sname } = store.customerMaterialList[index]
    return (
      <SubTable
        data={tlist.slice()}
        columns={[
          { Header: t('周转物名称'), accessor: 'tname' },
          {
            Header: t('未归还数'),
            Cell: ({ original: { amount, unit_name } }) => {
              return (
                <span>
                  {amount}
                  {unit_name}
                </span>
              )
            },
          },
          {
            Header: t('未归还货值'),
            Cell: ({ original }) => formatPrice(original.price),
          },
          {
            Header: TableUtil.OperationHeader,
            Cell: ({ original }) => (
              <TableUtil.OperationCell>
                <SVGReturn
                  style={{ cursor: 'pointer', fontSize: '14px' }}
                  onClick={() =>
                    this.handleReturn(Object.assign(original, { sid, sname }))
                  }
                  open
                />
                <TableUtil.OperationDetail
                  href={`#/supply_chain/material_manage/customer/list/detail?tid=${original.tid}&sid=${sid}`}
                  open
                />
              </TableUtil.OperationCell>
            ),
          },
        ]}
      />
    )
  }

  render() {
    const { customerMaterialList, handleSearch, handleExport, filter } = store
    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={handleSearch} colWidth='260px'>
            <FormItem label={t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('输入商户名或商户ID搜索')}
                value={filter.q}
                onChange={this.handleChange}
              />
            </FormItem>
            <FormButton>
              <div className='gm-inline-block'>
                <Button type='primary' htmlType='submit'>
                  {i18next.t('搜索')}
                </Button>
                <div className='gm-gap-10' />
                <Permission field='export_turnover_history'>
                  <Button onClick={handleExport}>{i18next.t('导出')}</Button>
                </Permission>
              </div>
            </FormButton>
          </Form>
        </Box>
        <ManagePaginationV2
          id='pagination_in_material_manage_customer_list'
          disablePage
          onRequest={store.fetchCustomerMaterialList}
          ref={(pagination) => {
            this.pagination = pagination
          }}
        >
          <ExpandTable
            data={customerMaterialList.slice()}
            SubComponent={({ index }) => this.renderExpandedRowRender(index)}
            columns={[
              { Header: t('商户ID'), accessor: 'sid' },
              { Header: t('商户名'), accessor: 'sname' },
              { Header: t('未归还数'), accessor: 'amount' },
              {
                Header: t('未归还货值'),
                Cell: ({ original }) => formatPrice(original.price),
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

export default CustomerList
