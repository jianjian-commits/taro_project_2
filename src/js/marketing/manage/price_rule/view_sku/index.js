import { i18next, t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Pagination,
  Select,
  Price,
  Form,
  FormItem,
  FormButton,
  Box,
  BoxTable,
  Button,
} from '@gmfe/react'
import { Link } from 'react-router-dom'
import { Table, TableUtil } from '@gmfe/table'
import { Observer, observer } from 'mobx-react'
import FloatTip from 'common/components/float_tip'
import RuleEditPopup from './../components/rule_edit_popup'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { priceRuleTarget, ruleTypeName } from './../filter'
import { convertNumber2Sid } from 'common/filter'
import actions from '../../../../actions'
import globalStore from 'stores/global'
import './../actions'
import './../reducer'
import skuStore from './sku_store'
import { PRICE_RULE_STATUS, PRICE_RULE_TYPE } from 'common/enum'

@observer
class ViewSku extends React.Component {
  componentDidMount() {
    this.handleSearchBySku()
  }

  handleSearchBySku = () => {
    /** 迁移 */
    // const { filter } = this.props.price_rule.dataTab2

    // actions.price_rule_search_by_sku(
    //   0,
    //   filter.type,
    //   filter.status,
    //   filter.addressText,
    //   filter.skuText,
    //   globalStore.isCenterSaller() && filter.stationId
    // )

    const { filter } = skuStore
    skuStore.fetchData(
      0,
      filter.type,
      filter.status,
      filter.addressText,
      filter.skuText,
      globalStore.isCenterSaller() && filter.stationId
    )
  }

  handleCreatePriceRule = () => {
    actions.price_rule_creater_show()
  }

  handleRulePriceUpdate(_id, addresses, id, type, value) {
    const { filter, pagination } = skuStore
    value = +Big(value).times(100) // 元转分
    skuStore.updateRulePrice(_id, addresses, id, type, value).then(() => {
      skuStore.fetchData(
        pagination,
        filter.type,
        filter.status,
        filter.addressText,
        filter.skuText,
        globalStore.isCenterSaller() && filter.stationId
      )
    })
  }

  handleTab2PageChange = (pagination) => {
    const { filter } = skuStore
    skuStore.fetchData(
      pagination,
      filter.type,
      filter.status,
      filter.addressText,
      filter.skuText,
      globalStore.isCenterSaller() && filter.stationId
    )
  }

  render() {
    const { statusMap, stations } = this.props.price_rule
    // const { filter } = dataTab2 // old

    /** store */
    const { filter } = skuStore
    const { list, loading, pagination } = skuStore

    const ruleTarget = priceRuleTarget(PRICE_RULE_TYPE, filter.type) || {}
    const priviledge = globalStore.hasPermission('edit_sjgz')

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearchBySku}>
            <FormItem label={i18next.t('锁价类型')}>
              <Select
                value={filter.type}
                name='type'
                onChange={(value) => {
                  skuStore.handleFilterChange('type', value)
                }}
              >
                {_.map(PRICE_RULE_TYPE, (type) => {
                  return (
                    <option value={type.id} key={type.id}>
                      {i18next.t('面向')}
                      {type.name}
                      {i18next.t('的锁价')}
                    </option>
                  )
                })}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('状态筛选')}>
              <Select
                value={filter.status}
                name='status'
                onChange={(value) =>
                  skuStore.handleFilterChange('status', value)
                }
              >
                {_.map(PRICE_RULE_STATUS, (statu) => {
                  return (
                    <option value={statu.id} key={statu.id}>
                      {statu.name}
                    </option>
                  )
                })}
              </Select>
            </FormItem>
            {globalStore.isCenterSaller() ? (
              <FormItem label={i18next.t('站点筛选')}>
                <Select
                  value={filter.stationId}
                  name='stationId'
                  onChange={(value) =>
                    skuStore.handleFilterChange('stationId', value)
                  }
                  style={{ width: '120px' }}
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
            <FormItem label={i18next.t('搜索')}>
              <input
                value={filter.addressText}
                name='addressText'
                onChange={(e) =>
                  skuStore.handleFilterChange('addressText', e.target.value)
                }
                type='text'
                className='form-control'
                placeholder={
                  i18next.t('KEY146', {
                    VAR1: ruleTarget.name,
                  }) /* src:`输入${ruleTarget.name}编号或名称` => tpl:输入${VAR1}编号或名称 */
                }
              />
            </FormItem>
            <FormItem>
              <input
                value={filter.skuText}
                name='skuText'
                onChange={(e) =>
                  skuStore.handleFilterChange('skuText', e.target.value)
                }
                type='text'
                className='form-control'
                placeholder={i18next.t('输入商品ID或名称')}
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
            !globalStore.isCenterSaller() && priviledge ? (
              <Button type='primary' onClick={this.handleCreatePriceRule}>
                {i18next.t('新建锁价规则')}
              </Button>
            ) : null
          }
        >
          <Table
            data={list.slice()}
            loading={loading}
            columns={[
              { Header: t('id'), Cell: ({ index }) => index + 1, width: 50 },
              {
                Header: i18next.t('KEY147', {
                  VAR1: ruleTarget.name,
                }) /* src:`${ruleTarget.name}ID/名称` => tpl:${VAR1}ID/名称 */,
                accessor: '_id',
                Cell: ({ original, index }) => (
                  <span>
                    {convertNumber2Sid(original.addresses)}
                    <br />
                    {original.object_name}
                  </span>
                ),
              },
              {
                Header: t('商品ID/名称'),
                accessor: 'sku_id_name',
                Cell: ({ original }) => (
                  <span>
                    <FloatTip
                      skuId={original.skus.id}
                      tip={original.skus.outer_id}
                      showCustomer={globalStore.otherInfo.showSkuOuterId}
                    />
                    <br />
                    {original.skus.name}
                  </span>
                ),
              },
              {
                Header: t('规格'),
                accessor: 'spec',
                Cell: ({ original }) =>
                  original.skus.sale_ratio +
                  original.skus.std_unit_name_forsale +
                  '/' +
                  original.skus.sale_unit_name,
              },
              {
                Header: t('原价'),
                accessor: 'sku_num',
                Cell: ({ original }) =>
                  original.skus.sale_price +
                  Price.getUnit(original.skus.fee_type) +
                  '/' +
                  original.skus.sale_unit_name,
              },
              {
                Header: t('计算规则'),
                accessor: 'skus',
                Cell: ({ original, index }) => {
                  const {
                    id,
                    sale_unit_name,
                    rule_type,
                    yx_price_factor,
                    fee_type,
                  } = original.skus
                  const suffixText =
                    Price.getUnit(fee_type) + '/' + sale_unit_name

                  // rule_type: 0-固定 1-加 2-乘
                  return (
                    <Observer>
                      {() => (
                        <Flex column>
                          <Flex>
                            <span style={{ marginRight: '2px' }}>
                              {ruleTypeName(original.skus.rule_type)}
                            </span>
                            <TableUtil.EditButton
                              popupRender={(closePopup) => (
                                <RuleEditPopup
                                  id={index}
                                  selected={rule_type}
                                  inputValue={+Big(yx_price_factor).div(100)}
                                  suffixText={suffixText}
                                  closePopup={closePopup}
                                  onSave={(type, value) =>
                                    this.handleRulePriceUpdate(
                                      original._id,
                                      original.addresses,
                                      id,
                                      type,
                                      value
                                    )
                                  }
                                />
                              )}
                            />
                          </Flex>
                          <span>{original.spu_id}</span>
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: t('规则价'),
                accessor: 'sku_num',
                Cell: ({ original }) => {
                  const yxPriceArrowDom = Big(original.skus.yx_price).gt(
                    original.skus.sale_price
                  ) ? (
                    <i
                      className='glyphicon glyphicon-arrow-up'
                      style={{ color: '#ff5454' }}
                    />
                  ) : (
                    <i
                      className='glyphicon glyphicon-arrow-down'
                      style={{ color: '#bdea74' }}
                    />
                  )
                  return (
                    <span>
                      {original.skus.yx_price}
                      {Price.getUnit(original.skus.fee_type) + '/'}
                      {original.skus.sale_unit_name} {yxPriceArrowDom}
                    </span>
                  )
                },
              },
              {
                Header: t('锁价规则编号'),
                width: 150,
                Cell: ({ original }) => (
                  <Link
                    to={`/marketing/manage/price_rule/detail?viewType=view&id=${original._id}`}
                    target='_blank'
                  >
                    {original._id}
                  </Link>
                ),
              },
              {
                Header: t('报价单编号/名称'),
                accessor: 'salemenu_id_name',
                Cell: ({ original }) => (
                  <span>
                    {original.salemenu_id}
                    <br />
                    {original.salemenu_name}
                  </span>
                ),
              },
              {
                Header: t('起止时间'),
                accessor: 'name',
                Cell: ({ original }) => (
                  <span>
                    {moment(original.begin).format('YYYY-MM-DD')}
                    <br />
                    {
                      i18next.t('KEY144', {
                        VAR1: moment(original.end).format('YYYY-MM-DD'),
                      }) /* src:'至' + moment(rule.end).format('YYYY-MM-DD') => tpl:至${VAR1} */
                    }
                  </span>
                ),
              },
              {
                Header: i18next.t('KEY150', {
                  VAR1: globalStore.isCenterSaller() ? i18next.t('/站点') : '',
                }) /* src:'创建人' + (isCenterSaller ? '/站点' : '') => tpl:创建人${VAR1} */,
                accessor: 'creator',
                Cell: ({ original }) =>
                  original.creator +
                  (globalStore.isCenterSaller()
                    ? '/' + original.station_name
                    : ''),
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
                },
              },
              {
                Header: t('状态(?)'),
                width: 60,
                Cell: ({ original }) => statusMap[original.status],
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination data={pagination} toPage={this.handleTab2PageChange} />
          </Flex>
        </BoxTable>
      </div>
    )
  }
}

export default ViewSku
