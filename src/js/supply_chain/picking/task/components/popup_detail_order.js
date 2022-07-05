import React from 'react'
import { Flex, Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { orderState } from 'common/filter'
import store from '../store/store_order'
import { observer } from 'mobx-react'
import { Table } from '@gmfe/table'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { getFiledData } from 'common/components/customize'
import globalStore from 'stores/global'
@observer
class PopupDetail extends React.Component {
  componentDidMount() {
    store.getPickDetail(this.props.orderID)
  }

  render() {
    const {
      order_id,
      order_status,
      address_name,
      route_name,
      sort_num,
      details = [],
    } = store.pickDetail || {}
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) => v.permission.read_station_picking,
    )
    const { loadingDetail } = store
    return (
      <Flex column>
        <Flex column className='gm-padding-tb-10 gm-padding-lr-20 gm-back-bg'>
          <Flex alignCenter>
            <span style={{ fontWeight: 900, fontSize: 16 }}>{order_id}</span>
            <span
              className={classNames('gm-inline-block b-order-status-tag', {
                'gm-bg-primary': order_status !== 15,
              })}
              style={{
                margin: '0 7px',
              }}
            />
            <span>{orderState(order_status)}</span>
          </Flex>
          <div className='gm-margin-top-10'>
            <span className='gm-margin-right-20'>
              {i18next.t('商户名')}：{address_name}
            </span>
            <span className='gm-margin-right-20'>
              {i18next.t('线路')}：{route_name}
            </span>
            <span className='gm-margin-right-20'>
              {i18next.t('分拣序号')}：{sort_num}
            </span>
          </div>
        </Flex>
        <Flex className='gm-padding-tb-15 gm-padding-lr-20'>
          <Table
            style={{ width: '100%' }}
            loading={loadingDetail}
            data={details.slice()}
            columns={[
              {
                Header: i18next.t('商品名'),
                accessor: 'sku_name',
                width: 'auto',
                fixed: 'left',
              },
              {
                Header: i18next.t('分类'),
                width: 'auto',
                fixed: 'left',
                Cell: ({
                  original: { category_name_1, category_name_2, pinlei_name },
                }) =>
                  category_name_1 + '/' + category_name_2 + '/' + pinlei_name,
              },
              {
                Header: i18next.t('建议取货货位'),
                width: 'auto',
                fixed: 'left',
                Cell: ({ original: { shelf_name = [] } }) => {
                  /*
                   * 根据建议取货货位，以3条为最大，
                   * 超过就hover Popver来显示，然后根据...显示
                   */
                  return shelf_name.length > 3 ? (
                    <Popover
                      type='hover'
                      showArrow
                      top
                      offset={shelf_name.length}
                      popup={
                        <div className='gm-padding-10'>
                          {shelf_name.join('，')}
                        </div>
                      }
                    >
                      <div>
                        {shelf_name.slice(0, 3).map((item, i) => (
                          <div key={item}>{i === 2 ? item + '...' : item}</div>
                        ))}
                      </div>
                    </Popover>
                  ) : (
                    <>
                      {shelf_name.length > 0
                        ? shelf_name.map((item) => <div key={item}>{item}</div>)
                        : '-'}
                    </>
                  )
                },
              },
              {
                Header: i18next.t('库存'),
                width: 'auto',
                fixed: 'left',
                Cell: ({ original: { remain, std_unit_name } }) =>
                  remain + std_unit_name,
              },
              {
                Header: i18next.t('计划拣货'),
                width: 'auto',
                fixed: 'left',
                Cell: ({ original: { picking_amount, std_unit_name } }) =>
                  picking_amount + std_unit_name,
              },
              ..._.map(detailConfigs, (v) => ({
                Header: v.field_name,
                accessor: `detail_customized_field.${v.id}`,
                diyGroupName: i18next.t('基础字段'),
                Cell: (cellProps) => {
                  const detail = cellProps.original
                  return (
                    <div>{getFiledData(v, detail.detail_customized_field)}</div>
                  )
                },
              })),
            ]}
          />
        </Flex>
      </Flex>
    )
  }
}

PopupDetail.propTypes = {
  orderID: PropTypes.string.isRequired,
}

export default PopupDetail
