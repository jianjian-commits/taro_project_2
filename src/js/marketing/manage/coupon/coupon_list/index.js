import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  Price,
  BoxTable,
  Button,
  Flex,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX, TableXUtil } from '@gmfe/table-x'
import globalStore from 'stores/global'
import store from './store'
import detailStore from '../detail/store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import { history, System } from 'common/service'
import TableTotalText from 'common/components/table_total_text'
import SVGCopy from 'svg/copy.svg'
import { STATUS, audienceType, isActive, AUDIENCETYPE } from '../util'
import { formatDateTime } from '../../../../common/util'

const { OperationIconTip } = TableXUtil
@observer
class CouponList extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    this.pagination.current.apiDoFirstRequest()
    detailStore.getAddressLabel()
  }

  componentWillUnmount() {
    store.init()
  }

  handleFilterSelectChange = (name, value) => {
    store.changeFilter(name, value)
  }

  handleFilterInputChange = (e) => {
    e.preventDefault()
    store.changeFilter('q', e.target.value)
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handleSort = (name) => {
    const { sort_direction, sort_type } = store.filter
    if (!sort_direction || (sort_type === name && sort_direction === 'desc')) {
      store.couponListSort(name, 'asc').then(() => {
        this.pagination.current.apiDoFirstRequest()
      })
    } else {
      store.couponListSort(name, 'desc').then(() => {
        this.pagination.current.apiDoFirstRequest()
      })
    }
  }

  handleCreateCoupon = () => {
    history.push(System.getUrl('/marketing/manage/coupon/detail'))
  }

  handleDetail = (id) => {
    window.open(System.getUrl(`#/marketing/manage/coupon/detail?id=${id}`))
  }

  handleCopy = (id) => {
    history.push(
      System.getUrl(`/marketing/manage/coupon/detail?id=${id}&isCopy=true`),
    )
  }

  render() {
    const {
      filter: { is_active, q, sort_type, sort_direction, audience_type },
      list,
      pagination,
    } = store
    const hasAddPermission = globalStore.hasPermission('edit_coupon')

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={i18next.t('状态筛选')}>
              <Select
                value={is_active}
                name='is_active'
                onChange={this.handleFilterSelectChange.bind(this, 'is_active')}
              >
                {_.map(STATUS, (is_active, key) => (
                  <Option value={_.toNumber(key)} key={key}>
                    {is_active}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('可见范围')}>
              <Select
                value={audience_type}
                name='audience_type'
                onChange={this.handleFilterSelectChange.bind(
                  this,
                  'audience_type',
                )}
              >
                <Option value={-1} key={-1}>
                  {i18next.t('全部范围')}
                </Option>
                {_.map(AUDIENCETYPE(), (audience_type, key) => (
                  <Option value={_.toNumber(key)} key={key}>
                    {audience_type}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                value={q}
                onChange={this.handleFilterInputChange}
                name='q'
                type='text'
                className='form-control'
                placeholder={i18next.t('输入优惠券名称')}
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
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('优惠券'),
                    content: pagination.count,
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={
            hasAddPermission && (
              <div>
                <Button type='primary' onClick={this.handleCreateCoupon}>
                  {i18next.t('新建优惠券')}
                </Button>
              </div>
            )
          }
        >
          <ManagePaginationV2
            id='pagination_in_coupon_list'
            onRequest={store.getCouponList} // eslint-disable-line
            ref={this.pagination}
          >
            <TableX
              ref={(ref) => (this.table = ref)}
              data={list.slice()}
              columns={[
                {
                  Header: i18next.t('序号'),
                  accessor: 'id',
                  minWidth: 60,
                  Cell: ({ row: { index } }) => ++index,
                },
                {
                  Header: i18next.t('优惠券名称'),
                  accessor: 'name',
                  minWidth: 60,
                  Cell: ({ row: { original } }) => original.name,
                },
                {
                  Header: i18next.t('面值') + `（${Price.getUnit()}）`,
                  accessor: 'price_value',
                  minWidth: 60,
                  Cell: ({ row: { original } }) =>
                    Big(original.price_value).toFixed(2),
                },
                {
                  Header: i18next.t('使用条件'),
                  accessor: 'min_total_price',
                  minWidth: 100,
                  Cell: ({ row: { original } }) =>
                    i18next.t(
                      /* src:`满${d.min_total_price}元可用` => tpl:满${num}可用 */ 'coupon_list_use_min_limit',
                      {
                        num:
                          Big(original.min_total_price).toFixed(2) +
                          Price.getUnit(),
                      },
                    ),
                },
                {
                  Header: i18next.t('限领（张）'),
                  accessor: 'collect_limit',
                  minWidth: 60,
                  Cell: ({ row: { original } }) =>
                    original.audience_type === 26
                      ? '-'
                      : original.collect_limit,
                },
                {
                  Header: i18next.t('有效时间（天）'),
                  accessor: 'validity_day',
                  minWidth: 80,
                  Cell: ({ row: { original } }) => {
                    return original.validity_day || '-' // 0只会出现在选择有效期时，因此显示‘-’
                  },
                },
                {
                  Header: i18next.t('有效期'),
                  accessor: 'valid_time',
                  minWidth: 120,
                  Cell: ({ row: { original } }) => {
                    const {
                      valid_time_start,
                      valid_time_end,
                      time_type,
                    } = original

                    return time_type === 1
                      ? '-'
                      : moment(valid_time_start).format('YYYY.MM.DD') +
                          '~' +
                          moment(valid_time_end).format('YYYY.MM.DD')
                  },
                },
                {
                  Header: i18next.t('发放时间'),
                  accessor: 'release_time',
                  minWidth: 80,
                  Cell: ({ row: { original } }) => {
                    const { release_time } = original
                    return formatDateTime(release_time)
                  },
                },
                {
                  Header: i18next.t('可见范围'),
                  accessor: 'audience_type',
                  minWidth: 60,
                  Cell: ({ row: { original } }) =>
                    audienceType(original.audience_type),
                },
                {
                  Header: (
                    <TableXUtil.SortHeader
                      onClick={this.handleSort.bind(this, 'give_out_num')}
                      type={
                        sort_type === 'give_out_num' ? sort_direction : null
                      }
                    >
                      {i18next.t('领取数')}
                    </TableXUtil.SortHeader>
                  ),
                  minWidth: 60,
                  accessor: 'give_out_num',
                },
                {
                  Header: (
                    <TableXUtil.SortHeader
                      onClick={this.handleSort.bind(this, 'used_num')}
                      type={sort_type === 'used_num' ? sort_direction : null}
                    >
                      {i18next.t('使用数')}
                    </TableXUtil.SortHeader>
                  ),
                  minWidth: 60,
                  accessor: 'used_num',
                },
                {
                  Header: i18next.t('创建人'),
                  accessor: 'creator',
                  minWidth: 60,
                },
                {
                  Header: i18next.t('创建时间'),
                  accessor: 'create_time',
                  minWidth: 120,
                  Cell: ({ row: { original } }) =>
                    moment(original.create_time).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  Header: i18next.t('状态'),
                  accessor: 'is_active',
                  minWidth: 60,
                  Cell: ({ row: { original } }) => isActive(original.is_active),
                },
                {
                  width: 80,
                  Header: TableXUtil.OperationHeader,
                  accessor: 'operator',
                  Cell: ({ row: { original } }) => (
                    <TableXUtil.OperationCell>
                      <Flex alignCenter justifyCenter>
                        <TableXUtil.OperationDetail
                          onClick={this.handleDetail.bind(this, original.id)}
                        />
                        <OperationIconTip tip={i18next.t('复制')}>
                          <span
                            className='gm-cursor gm-margin-lr-5 gm-text-14 gm-text-hover-primary'
                            onClick={this.handleCopy.bind(this, original.id)}
                          >
                            <SVGCopy />
                          </span>
                        </OperationIconTip>
                      </Flex>
                    </TableXUtil.OperationCell>
                  ),
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default CouponList
