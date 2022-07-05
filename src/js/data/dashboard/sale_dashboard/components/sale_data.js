import React, { useState, useEffect } from 'react'
import { Flex, Modal, Storage, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Gird from 'common/components/grid'
import store from '../store'
import moment from 'moment'
import Panel from 'common/components/dashboard/panel'
import SortModal from 'common/components/dashboard/sort_modal'
import Bulletin from 'common/components/dashboard/bulletin'
import { requestSaleData } from '../service'
import { colors, icons } from 'common/dashboard/sale/theme'

const core = [
  'orderData',
  'saleData',
  'customerPrice',
  'shopId',
  'saleProfit',
  'saleProfitRate',
]

const infos = {
  saleData: {
    text: t('销售额(元)'),
    value: 0,
    preValue: 0,
    color: colors.Blue,
    icon: icons.Money,
  },
  orderData: {
    text: t('订单数(个)'),
    value: 0,
    preValue: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
    decimal: 0,
  },
  shopId: {
    text: t('下单客户数(个)'),
    value: 0,
    preValue: 0,
    color: colors.Sunrise_Yellow,
    icon: icons.Person,
    decimal: 0,
  },
  saleProfit: {
    text: t('销售毛利(元)'),
    value: 0,
    preValue: 0,
    color: colors.Dark_Green,
    icon: icons.Money2,
  },
  saleProfitRate: {
    text: t('销售毛利率(%)'),
    value: 0,
    preValue: 0,
    color: colors.Golden_Purple,
    icon: icons.Rate,
    isPercent: true,
  },
  customerPrice: {
    text: t('客单价(元)'),
    value: 0,
    preValue: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Task,
  },
}

const SaleData = ({ className, theme }) => {
  const {
    filter,
    filter: { begin_time, end_time },
  } = store
  const [data, setData] = useState({})
  const [sortList, setSortList] = useState(
    Storage.get('market_drive_v2') || core,
  )
  useEffect(() => {
    fetchSaleData()
  }, [filter])

  const fetchSaleData = () => {
    const dif = moment(end_time).diff(moment(begin_time), 'd')

    const nextTimeRange = {
      begin_time: moment(end_time)
        .subtract(+dif * 2 + 1, 'd')
        .format('YYYY-MM-DD'),
      end_time: moment(end_time)
        .subtract(+dif + 1, 'd')
        .format('YYYY-MM-DD'),
      time_field: 'order_time',
    }

    const params = store.getParams()
    params.time_range.push(nextTimeRange)

    requestSaleData(params).then((data) => {
      setData(data)
    })
  }

  const handleConfig = () => {
    Modal.render({
      title: t('运营简报'),
      size: 'lg',
      children: (
        <SortModal infos={infos} onConfirm={handleSort} core={sortList} />
      ),
      onHide: Modal.hide,
    })
  }

  const handleSort = (display) => {
    setSortList(display)
    Storage.set('market_drive_v2', display)
    Tip.success('保存成功')
  }

  return (
    <Panel
      theme={theme}
      title={t('销售数据')}
      className={classNames('gm-bg', className)}
      right={
        <Flex alignCenter style={{ paddingBottom: 4 }}>
          <span
            className='text-primary gm-text-12 gm-cursor'
            onClick={() => handleConfig(infos)}
          >
            {t('自定义设置')}
          </span>
        </Flex>
      }
    >
      <Gird column={3} className='gm-bg gm-padding-0'>
        {sortList.map((key, index) => {
          const options = {
            ...infos[key],
            value: data[key]?.value || 0,
            preValue: data[key]?.preValue || 0,
          }
          return <Bulletin key={key} flip options={options} />
        })}
      </Gird>
    </Panel>
  )
}

SaleData.propTypes = {
  theme: PropTypes.string,
  className: PropTypes.string,
}
export default observer(SaleData)
