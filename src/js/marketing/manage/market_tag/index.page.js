import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import {
  Form,
  FormItem,
  FormButton,
  Flex,
  Select,
  Option,
  Box,
  Pagination,
  BoxTable,
  Button,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { tagIndexStore } from './stores'
import { history, System } from 'common/service'
import moment from 'moment'
import globalStore from 'stores/global'
const stores = tagIndexStore

@observer
class MarketTag extends React.Component {
  componentWillMount() {
    stores.getSearchList()
  }

  handleSelectChange(name, value) {
    stores.handleSelectChange(name, value)
  }

  handleInputChange = (e) => {
    const value = e.target.value
    stores.handleInputChange(value)
  }

  handleSearch = (e) => {
    e.preventDefault()
    stores.getSearchList(true)
  }

  handleCreateActivity = () => {
    history.push(System.getUrl('/marketing/manage/market_tag/detail'))
  }

  goToDetail(id) {
    window.open(System.getUrl(`#/marketing/manage/market_tag/detail?id=${id}`))
  }

  handleToPage = (page) => {
    stores.setPageOffset(page.offset)
    stores.setPageLimit(page.limit)
    stores.getSearchList()
  }

  render() {
    const { show_method, active, search_text, offset, limit, type } = stores
    const list = toJS(stores.list)
    const nextDisabled = list.length < 10

    const hasEditPermission = globalStore.hasPermission('edit_promotion')
    const hasAddPermission = globalStore.hasPermission('add_promotion')

    return (
      <div>
        <Box hasGap>
          <Form disabledCol inline onSubmit={this.handleSearch}>
            <FormItem label={i18next.t('状态筛选')}>
              <Select
                className='gm-inline-block'
                value={show_method}
                onChange={this.handleSelectChange.bind(this, 'show_method')}
              >
                <Option value=''>{i18next.t('全部展示类型')}</Option>
                <Option value={1}>{i18next.t('首页分类')}</Option>
                <Option value={0}>{i18next.t('无')}</Option>
              </Select>
              <div className='gm-gap-5' />
              <Select
                className='gm-inline-block'
                value={active}
                onChange={this.handleSelectChange.bind(this, 'active')}
              >
                <Option value=''>{i18next.t('全部活动状态')}</Option>
                <Option value={1}>{i18next.t('有效')}</Option>
                <Option value={0}>{i18next.t('无效')}</Option>
              </Select>
              <div className='gm-gap-5' />
              {System.isB() && (
                <Select
                  className='gm-inline-block'
                  value={type}
                  onChange={this.handleSelectChange.bind(this, 'type')}
                >
                  <Option value=''>{i18next.t('全部活动类型')}</Option>
                  <Option value={2}>{i18next.t('限购')}</Option>
                  <Option value={1}>{i18next.t('默认')}</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                style={{ width: '250px' }}
                className='form-control'
                placeholder={i18next.t('输入活动名称')}
                value={search_text}
                onChange={this.handleInputChange}
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
            hasAddPermission && (
              <Button type='primary' onClick={this.handleCreateActivity}>
                {i18next.t('新建活动')}
              </Button>
            )
          }
        >
          <Table
            data={list}
            columns={[
              {
                Header: i18next.t('序号'),
                accessor: 'id',
                Cell: ({ index }) => index + 1,
              },
              {
                Header: i18next.t('活动名称'),
                accessor: 'name',
              },
              {
                Header: i18next.t('活动类型'),
                show: System.isB(),
                id: 'type',
                accessor: (d) => {
                  if (d.type === 1) return <span>{i18next.t('默认')}</span>
                  else if (d.type === 2) return <span>{i18next.t('限购')}</span>
                },
              },
              {
                Header: i18next.t('展示类型'),
                id: 'show_method',
                accessor: (d) =>
                  d.show_method ? (
                    <span>{i18next.t('首页分类')}</span>
                  ) : (
                    <span>{i18next.t('无')}</span>
                  ),
              },
              {
                Header: i18next.t('活动状态'),
                id: 'active',
                accessor: (d) =>
                  d.active ? (
                    <span>{i18next.t('有效')}</span>
                  ) : (
                    <span>{i18next.t('无效')}</span>
                  ),
              },
              {
                Header: i18next.t('商品数'),
                accessor: 'sku_nums',
              },
              {
                Header: i18next.t('创建人'),
                accessor: 'operator',
              },
              {
                Header: i18next.t('创建时间'),
                id: 'create_time',
                accessor: (d) => (
                  <span>{moment(d.create_time).format('YYYY-MM-DD')}</span>
                ),
              },
              {
                Header: TableUtil.OperationHeader,
                show: hasEditPermission,
                Cell: ({ original }) => {
                  return (
                    <TableUtil.OperationCell>
                      <TableUtil.OperationDetail
                        onClick={this.goToDetail.bind(this, original.id)}
                      />
                    </TableUtil.OperationCell>
                  )
                },
              },
            ]}
          />
          <Flex alignCenter justifyEnd className='gm-padding-20'>
            <Pagination
              data={{
                offset,
                limit,
              }}
              toPage={this.handleToPage.bind(this)}
              nextDisabled={nextDisabled}
            />
          </Flex>
        </BoxTable>
      </div>
    )
  }
}

export default MarketTag
