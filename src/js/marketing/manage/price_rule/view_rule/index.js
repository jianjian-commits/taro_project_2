import { i18next, t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Pagination,
  DateRangePicker,
  Select,
  Form,
  FormItem,
  FormButton,
  Box,
  BoxTable,
  Button,
} from '@gmfe/react'
import { Link } from 'react-router-dom'
import { Table, TableUtil } from '@gmfe/table'
import { observer, Observer } from 'mobx-react'
import moment from 'moment'
import _ from 'lodash'
import actions from '../../../../actions'
import globalStore from 'stores/global'
import './../actions'
import './../reducer'
import ruleStore from './rule_store'
import { PRICE_RULE_STATUS } from 'common/enum'

@observer
class ViewRule extends React.Component {
  handleStatusChange(index, value) {
    ruleStore.handleEditDataChage(index, null, null, value)
  }

  handleDateChange(index, begin, end) {
    ruleStore.handleEditDataChage(
      index,
      moment(begin).format('YYYY-MM-DD'),
      moment(end).format('YYYY-MM-DD')
    )
  }

  handleCreatePriceRule = () => {
    actions.price_rule_creater_show()
  }

  handleSearchByRule = (e) => {
    e.preventDefault()
    const { filter } = ruleStore
    ruleStore.fetchData(
      0,
      filter.status,
      filter.searchText,
      globalStore.isCenterSaller() && filter.stationId
    )
  }

  handleRuleViewEdit = (i) => {
    ruleStore.handleEditChange(i)
  }

  handleRuleViewSave = (i) => {
    const rule = ruleStore.list[i]
    const postData = {
      price_rule_id: rule._id,
      begin: moment(rule.edit_begin).format('YYYY-MM-DD'),
      end: moment(rule.edit_end).format('YYYY-MM-DD'),
      status: rule.edit_status,
      rule_object_type: rule.rule_object_type,
    }
    ruleStore.handleEditDataSave(postData, i)
  }

  handleTab1PageChange = (pagination) => {
    const { filter } = ruleStore

    ruleStore.fetchData(
      pagination,
      filter.status,
      filter.searchText,
      globalStore.isCenterSaller() && filter.stationId
    )
  }

  render() {
    const { stations, statusMap } = this.props.price_rule
    // const { filter } = dataTab1
    const priviledge = globalStore.hasPermission('edit_sjgz')

    // store
    const { filter, list, pagination, loading } = ruleStore

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearchByRule}>
            <FormItem label={i18next.t('????????????')}>
              <Select
                value={filter.status}
                onChange={(value) =>
                  ruleStore.handleFilterChange('status', value)
                }
              >
                {_.map(PRICE_RULE_STATUS, (status) => {
                  return (
                    <option value={status.id} key={status.id}>
                      {status.name}
                    </option>
                  )
                })}
              </Select>
            </FormItem>
            {globalStore.isCenterSaller() ? (
              <FormItem label={i18next.t('????????????')}>
                <Select
                  value={filter.stationId}
                  onChange={(value) =>
                    ruleStore.handleFilterChange('stationId', value)
                  }
                >
                  {_.map(stations, (station) => {
                    return (
                      <option value={station.id} key={station.id}>
                        {station.name}
                      </option>
                    )
                  })}
                </Select>
              </FormItem>
            ) : null}
            <FormItem label={i18next.t('??????')}>
              <input
                type='text'
                value={filter.searchText}
                onChange={(e) =>
                  ruleStore.handleFilterChange('searchText', e.target.value)
                }
                className='form-control'
                placeholder={i18next.t(
                  '????????????????????????/????????????????????????/??????'
                )}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('??????')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <BoxTable
          action={
            !globalStore.isCenterSaller() && priviledge ? (
              <div>
                <Button type='primary' onClick={this.handleCreatePriceRule}>
                  {i18next.t('??????????????????')}
                </Button>
              </div>
            ) : null
          }
        >
          <Table
            data={list.slice()}
            loading={loading}
            columns={[
              {
                Header: t('??????'),
                accessor: '??????',
                width: 60,
                Cell: ({ index }) => index + 1,
              },
              {
                Header: t('??????????????????'),
                accessor: '_id',
                Cell: ({ original }) => (
                  <Link
                    to={`/marketing/manage/price_rule/detail?viewType=view&id=${original._id}`}
                    target='_blank'
                  >
                    {original._id}
                  </Link>
                ),
              },
              { Header: t('??????????????????'), accessor: 'name' },
              {
                Header: t('???????????????/??????'),
                width: 120,
                accessor: 'salemenu_id_name',
                Cell: ({ original }) => (
                  <span>
                    {original.salemenu_id}
                    <br />
                    {original.salemenu_name}
                  </span>
                ),
              },
              { Header: t('???????????????'), accessor: 'address_num' },
              {
                Header: t('?????????/?????????'),
                accessor: 'num',
                Cell: ({ original }) => (
                  <>
                    {original.rule_object_type === 1
                      ? original.sku_num
                      : original.category_2_list.length}
                  </>
                ),
              },
              {
                Header: t('????????????'),
                accessor: 'name',
                width: 240,
                Cell: ({ original, index }) => (
                  <Observer>
                    {() => (
                      <>
                        {original.edit ? (
                          <DateRangePicker
                            begin={moment(original.edit_begin)}
                            end={moment(original.edit_end)}
                            onChange={this.handleDateChange.bind(this, index)}
                            placeholder={[
                              i18next.t('?????????????????????'),
                              i18next.t('????????????????????????'),
                            ]}
                          />
                        ) : (
                          <span>
                            {moment(original.begin).format('YYYY-MM-DD')}
                            <br />
                            {
                              i18next.t('KEY144', {
                                VAR1: moment(original.end).format('YYYY-MM-DD'),
                              }) /* src:'???' + moment(original.end).format('YYYY-MM-DD') => tpl:???${VAR1} */
                            }
                          </span>
                        )}
                      </>
                    )}
                  </Observer>
                ),
              },
              {
                Header: t('KEY145', {
                  VAR1: globalStore.isCenterSaller() ? i18next.t('/??????') : '',
                }) /* src:'?????????' + (isCenterSaller ? '/??????' : '') => tpl:?????????${VAR1} */,
                accessor: 'creator',
                Cell: ({ original }) =>
                  original.creator +
                  (globalStore.isCenterSaller()
                    ? '/' + original.station_name
                    : ''),
              },
              {
                Header: t('????????????'),
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
                },
              },
              {
                Header: t('??????(?)'),
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
                        // ???????????????,??????????????????
                        if (!globalStore.isCenterSaller()) {
                          restArr.pop()
                        }

                        return (
                          <Select
                            value={original.edit_status}
                            onChange={(value) =>
                              this.handleStatusChange(index, value)
                            }
                          >
                            {_.map(restArr, (status) => {
                              return (
                                <option value={status.id} key={status.id}>
                                  {status.name}
                                </option>
                              )
                            })}
                          </Select>
                        )
                      } else {
                        return statusMap[original.status]
                      }
                    }}
                  </Observer>
                ),
              },
              {
                Header: TableUtil.OperationHeader,
                Cell: ({ original, index }) => {
                  if (original.status === 0 || !priviledge) {
                    return '-'
                  } else {
                    console.log('edit')
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
                            onCancel={this.handleRuleViewEdit.bind(this, index)}
                          />
                        )}
                      </Observer>
                    )
                  }
                },
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination data={pagination} toPage={this.handleTab1PageChange} />
          </Flex>
        </BoxTable>
      </div>
    )
  }
}

export default ViewRule
