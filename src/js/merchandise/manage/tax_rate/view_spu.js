import { i18next, t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Box,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  PaginationV2,
  BoxTable,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import taxRateStore, { STATUS } from './store'
import { history } from 'common/service'
import { convertNumber2Sid } from 'common/filter'
import _ from 'lodash'
import moment from 'moment'
import globalStore from 'stores/global'
import { Table } from '@gmfe/table'

@observer
class SpuListView extends React.Component {
  constructor(props) {
    super(props)

    this.handleSubmit = ::this.handleSubmit
    this.handlePageChange = ::this.handlePageChange
    this.handleCreate = ::this.handleCreate
  }

  componentDidMount() {
    taxRateStore.searchSpuList({})
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
  }

  handleSubmit() {
    taxRateStore.searchSpuList({})
  }

  handlePageChange(params) {
    taxRateStore.searchSpuList(params)
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
    const { data, spu_list, spu_pagination } = taxRateStore
    const { spu_status, spu_search_text } = data.filter

    return (
      <div>
        <Box hasGap>
          <Form onSubmit={this.handleSubmit.bind(this, 'mer')} inline>
            <FormItem label={i18next.t('状态')}>
              <Select
                className='gm-margin-right-10 gm-border-0'
                value={spu_status}
                onChange={this.handleChangeStatus.bind(this, 'spu_status')}
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
                placeholder={i18next.t(
                  '输入商户名、商户ID，或商品名、商品ID搜索',
                )}
                value={spu_search_text}
                onChange={this.handleChangeSearchText.bind(
                  this,
                  'spu_search_text',
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
        <BoxTable
          action={
            globalStore.hasPermission('edit_tax') ? (
              <Button onClick={this.handleCreate} type='primary'>
                {i18next.t('新建税率规则')}
              </Button>
            ) : null
          }
        >
          <Table
            data={spu_list.slice()}
            columns={[
              {
                Header: t('序号'),
                width: 100,
                Cell: ({ index }) => index + 1,
              },
              {
                Header: t('商户ID/商户名'),
                accessor: 'address_id',
                Cell: ({ original }) =>
                  `${convertNumber2Sid(original.address_id)}/${
                    original.address_name
                  }`,
              },
              {
                Header: t('商品ID/商品名'),
                accessor: 'spu_id',
                Cell: ({ original }) =>
                  `${original.spu_id}/${original.spu_name}`,
              },
              {
                Header: t('税率'),
                accessor: 'tax_rate',
                width: 100,
                Cell: ({ original }) => `${original.tax_rate}%`,
              },
              {
                Header: t('税率规则名称'),
                accessor: 'tax_rule_name',
                width: 200,
                Cell: ({ original }) => (
                  <a
                    onClick={this.handleOpenDetail.bind(
                      this,
                      original.tax_rule_id,
                    )}
                    style={{ textDecoration: 'underline' }}
                    target='_block'
                  >
                    {original.tax_rule_name}
                  </a>
                ),
              },
              { Header: t('创建人'), accessor: 'create_user' },
              {
                Header: t('创建时间'),
                accessor: 'create_time',
                Cell: ({ original }) =>
                  moment(original.create_time).format('YYYY-MM-DD HH:mm'),
              },
              {
                Header: t('状态'),
                accessor: 'status',
                width: 100,
                Cell: ({ original }) =>
                  original.status === 1 ? t('有效') : t('无效'),
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <PaginationV2
              data={spu_pagination}
              onChange={this.handlePageChange}
            />
          </Flex>
        </BoxTable>
      </div>
    )
  }
}

export default SpuListView
