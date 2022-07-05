import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Table } from '@gmfe/table'
import { i18next } from 'gm-i18n'
import { orderState } from 'common/filter'
import _ from 'lodash'
import { getFiledData } from 'common/components/customize'
import globalStore from 'stores/global'

@observer
class PopupDetail extends React.Component {
  render() {
    const {
      sku_name,
      shelf_names,
      remain,
      std_unit_name,
      picking_amount,
      order_list,
    } = this.props.data
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) => v.permission.read_station_picking,
    )
    return (
      <Flex column>
        <Flex column className='gm-padding-tb-10 gm-padding-lr-20 gm-back-bg'>
          <Flex alignCenter>
            <span style={{ fontWeight: 900, fontSize: 16 }}>{sku_name}</span>
          </Flex>
          <div className='gm-margin-top-10'>
            <span className='gm-margin-right-20'>
              {i18next.t('建议取货货位')}：
              {shelf_names.length > 0
                ? shelf_names.map((item) => (
                    <span style={{ marginRight: '10px' }} key={item}>
                      {item}
                    </span>
                  ))
                : '-'}
            </span>
            <div className='gm-margin-top-10'>
              <span className='gm-margin-right-20'>
                {i18next.t('库存')}：{remain + std_unit_name}
              </span>
              <span className='gm-margin-right-20'>
                {i18next.t('计划拣货')}：{picking_amount + std_unit_name}
              </span>
            </div>
          </div>
        </Flex>
        <Flex className='gm-padding-tb-15 gm-padding-lr-20'>
          <Table
            style={{ width: '100%' }}
            data={order_list}
            columns={[
              {
                Header: i18next.t('订单号'),
                accessor: 'order_id',
                width: 'auto',
                fixed: 'left',
              },
              {
                Header: i18next.t('订单状态'),
                accessor: 'order_status',
                width: 'auto',
                fixed: 'left',
                Cell: ({ value }) => orderState(value),
              },
              {
                Header: i18next.t('计划拣货'),
                accessor: 'picking_amount',
                width: 'auto',
                fixed: 'left',
                Cell: ({ value }) => value + std_unit_name,
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
  data: PropTypes.object.isRequired,
}

export default PopupDetail
