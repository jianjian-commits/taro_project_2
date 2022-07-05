import { t } from 'gm-i18n'
import React from 'react'
import { observer, Observer } from 'mobx-react'
import {
  Box,
  BoxTable,
  Button,
  DateRangePicker,
  Form,
  FormButton,
  FormItem,
  Select
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import _ from 'lodash'
import { PRICE_RULE_STATUS } from '../../../common/enum'
import { GET_STATUS } from './util'
import store from './store'
import detailStore from './detail/store'
import globalStore from '../../../stores/global'
import { Table, TableUtil } from '@gmfe/table'
import moment from 'moment'
import { history } from '../../../common/service'
import { isEndOfDay } from '../../../common/util'

@observer
class FlashSale extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    this.pagination.current.apiDoFirstRequest()
  }

  componentWillUnmount() {
    store.init()
  }

  handlePageChange = page => {
    return store.getList(page)
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handleRuleViewEdit = index => {
    store.edit(index)
  }

  handleRuleViewSave = i => {
    const rule = store.list[i]
    const begin = isEndOfDay(rule.edit_begin)
    const end = isEndOfDay(rule.edit_end)
    this.handleDateChange(i, begin, end)
    const postData = {
      flash_sale_id: rule.flash_sale_id,
      begin: moment(begin).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
      status: rule.edit_status
    }
    store.editSave(postData, i)
  }

  handleStatusChange = (index, value) => {
    store.changeEditData(index, 'edit_status', value)
  }

  handleDateChange = (index, begin, end) => {
    store.changeEditData(index, 'edit_begin', begin)
    store.changeEditData(index, 'edit_end', end)
  }

  handleCreatePriceRule = () => {
    detailStore.changeViewType('create')
    history.push('/c_retail/marketing/flash_sale/detail/create')
  }

  handleDetail = id => {
    detailStore.changeViewType('view')
    history.push(`/c_retail/marketing/flash_sale/detail?id=${id}`)
  }

  render() {
    const {
      filter: { status, q },
      list
    } = store

    return (
      <>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={t('状态筛选')}>
              <Select
                value={status}
                onChange={value => store.changeFilter('status', value)}
              >
                {_.map(PRICE_RULE_STATUS, status => {
                  return (
                    <option value={status.id} key={status.id}>
                      {status.name}
                    </option>
                  )
                })}
              </Select>
            </FormItem>
            <FormItem label={t('搜索')}>
              <input
                type='text'
                value={q}
                onChange={e => store.changeFilter('q', e.target.value)}
                className='form-control'
                placeholder={t('输入抢购规则编号/名称')}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <BoxTable
          action={
            !globalStore.isCenterSaller() &&
            globalStore.hasPermission('edit_flash_sale') ? (
              <div>
                <Button type='primary' onClick={this.handleCreatePriceRule}>
                  {t('新建抢购规则')}
                </Button>
              </div>
            ) : null
          }
        >
          <ManagePaginationV2
            id='pagination_in_flash_sale_list'
            onRequest={this.handlePageChange}
            ref={this.pagination}
          >
            <Table
              data={list.slice()}
              columns={[
                {
                  Header: t('序号'),
                  accessor: '序号',
                  width: 60,
                  Cell: ({ index }) => index + 1
                },
                {
                  Header: t('抢购规则编号'),
                  accessor: 'flash_sale_id',
                  Cell: ({ original }) => (
                    <a
                      onClick={this.handleDetail.bind(
                        this,
                        original.flash_sale_id
                      )}
                    >
                      {original.flash_sale_id}
                    </a>
                  )
                },
                { Header: t('抢购规则名称'), accessor: 'name' },
                {
                  Header: t('商品数'),
                  accessor: 'num',
                  Cell: ({ original }) => <>{original.sku_num}</>
                },
                {
                  Header: t('起止时间'),
                  accessor: 'name',
                  width: 300,
                  Cell: ({ original, index }) => (
                    <Observer>
                      {() => (
                        <>
                          {original.edit ? (
                            <DateRangePicker
                              begin={original.edit_begin}
                              end={original.edit_end}
                              onChange={this.handleDateChange.bind(this, index)}
                              enabledTimeSelect
                            />
                          ) : (
                            <span>
                              {moment(original.begin).format(
                                'YYYY-MM-DD HH:mm:ss'
                              )}
                              <br />
                              {t('KEY144', {
                                VAR1: moment(original.end).format(
                                  'YYYY-MM-DD HH:mm:ss'
                                )
                              }) /* src:'至' + moment(original.end).format('YYYY-MM-DD') => tpl:至${VAR1} */}
                            </span>
                          )}
                        </>
                      )}
                    </Observer>
                  )
                },
                {
                  Header: t('KEY145', {
                    VAR1: globalStore.isCenterSaller() ? t('/站点') : ''
                  }) /* src:'创建人' + (isCenterSaller ? '/站点' : '') => tpl:创建人${VAR1} */,
                  accessor: 'creator',
                  Cell: ({ original }) =>
                    original.creator +
                    (globalStore.isCenterSaller()
                      ? '/' + original.station_name
                      : '')
                },
                {
                  Header: t('创建时间'),
                  accessor: 'create_time',
                  Cell: ({ original }) => {
                    const m = moment(original.create_time)
                    return (
                      <span>
                        {m.format('YYYY-MM-DD')}
                        <br />
                        {m.format('HH:mm:ss')}
                      </span>
                    )
                  }
                },
                {
                  Header: t('状态'),
                  accessor: 'status',
                  Cell: ({ original, index }) => (
                    <Observer>
                      {() => {
                        if (original.edit) {
                          const restArr = PRICE_RULE_STATUS.slice(1)
                          if (original.status === 2) {
                            restArr.splice(1, 1)
                          } else {
                            restArr.shift()
                          }
                          // 如果是总站,无法看到关闭
                          if (!globalStore.isCenterSaller()) {
                            restArr.pop()
                          }

                          return (
                            <Select
                              value={original.edit_status}
                              onChange={value =>
                                this.handleStatusChange(index, value)
                              }
                            >
                              {_.map(restArr, status => {
                                return (
                                  <option value={status.id} key={status.id}>
                                    {status.name}
                                  </option>
                                )
                              })}
                            </Select>
                          )
                        } else {
                          return GET_STATUS(original.status)
                        }
                      }}
                    </Observer>
                  )
                },
                {
                  Header: TableUtil.OperationHeader,
                  width: 160,
                  Cell: ({ original, index }) => {
                    if (original.status === 0) {
                      return '-'
                    } else {
                      return (
                        <Observer>
                          {() => (
                            <TableUtil.OperationRowEdit
                              isEditing={!!original.edit}
                              onClick={this.handleRuleViewEdit.bind(
                                this,
                                index,
                                original
                              )}
                              onSave={this.handleRuleViewSave.bind(this, index)}
                              onCancel={this.handleRuleViewEdit.bind(
                                this,
                                index
                              )}
                            />
                          )}
                        </Observer>
                      )
                    }
                  }
                }
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default FlashSale
