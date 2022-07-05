import { t } from 'gm-i18n'
import React, { useState, useMemo } from 'react'
import { Flex, Modal, Storage, Tip, ToolTip } from '@gmfe/react'

import Grid from 'common/components/grid'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { colors, icons } from 'common/dashboard/sale/theme'
import SortModal from 'common/components/dashboard/sort_modal'
import Panel from 'common/components/dashboard/panel'
import Bulletin from 'common/components/dashboard/bulletin'
import PropTypes from 'prop-types'
import moment from 'moment'
import store from './store'

const defaultDisplay = [
  // 'unreleased_purchase_task',
  'orderWaitSort',
  'orderSorting',
  'UnDistributeDriverTask',
  'orderUnPay',
  'wait_pay_num',
  // 'unback_turnover_of_content',
  'uncount_shops_7_day',
  'uncount_shops_30_day',
]

const begin_seven = moment().subtract(7, 'days').format('YYYY-MM-DD')
const begin_thirty = moment().subtract(30, 'days').format('YYYY-MM-DD')

const bulletinConfig = (key) => {
  switch (key) {
    // case 'unreleased_purchase_task':
    //   return {
    //     text: t('采购任务待发布（个）'),
    //     icon: icons.Bell,
    //     color: colors.Blue,
    //   }
    case 'orderWaitSort':
      return {
        text: t('等待分拣订单（笔）'),
        decimal: 0,
        color: colors.Cyan,
        icon: icons.Order,
        tLink: '/order_manage/order/list',
      }
    case 'orderSorting':
      return {
        text: t('分拣中订单（笔）'),
        decimal: 0,
        icon: icons.Order,
        color: colors.Sunrise_Yellow,
        tLink: '/supply_chain/sorting/detail?tab=1',
      }

    case 'UnDistributeDriverTask':
      return {
        text: t('待分配司机任务（个）'),
        decimal: 0,
        icon: icons.Person,
        color: colors.Daybreak_Blue,
        tLink: '/supply_chain/distribute/task',
      }
    case 'orderUnPay':
      return {
        text: t('未支付订单（笔）'),
        decimal: 0,
        icon: icons.Order,
        color: colors.Dust_Red,
        tLink: '/order_manage/order/list',
      }
    case 'wait_pay_num':
      return {
        text: t('待支付结款单（个）'),
        icon: icons.Order,
        decimal: 0,
        color: colors.Blue,
        tLink: '/sales_invoicing/finance/payment_review',
      }
    // case 'unback_turnover_of_content':
    //   return {
    //     text: t('未归还周转物'),
    //     icon: icons.Merchant,
    //     color: colors.Daybreak_Blue,
    //   }
    case 'uncount_shops_7_day':
      return {
        text: t('未下单商户数（近7日）'),
        decimal: 0,
        icon: icons.Merchant,
        color: colors.Daybreak_Blue,
        tLink: `/order_manage/no_order?begin=${begin_seven}`,
      }
    case 'uncount_shops_30_day':
      return {
        text: t('未下单商户数（近30日）'),
        decimal: 0,
        icon: icons.Merchant,
        color: colors.Daybreak_Blue,
        tLink: `/order_manage/no_order?begin=${begin_thirty}`,
      }

    default:
      return null
  }
}

const HomeTodo = ({ className }) => {
  const todoData = useMemo(() => {
    return _.reduce(
      store.todoData,
      (t, v, k) => {
        return { ...t, [k]: { ...v, ...bulletinConfig(k) } }
      },
      {},
    )
  }, [store.todoData])

  const [display, setDisplay] = useState(
    Storage.get('operating_bulletin_v2') || defaultDisplay,
  )
  // 默认需要高度的样式
  const height = '110px'
  const handleConfig = (infos) => {
    Modal.render({
      title: (
        <Flex alignCenter>
          <span className='gm-custom-setting'>{t('自定义设置')}</span>
          <span className='gm-custom-subSetting'>
            {t('（可拖动卡片进行排序）')}
          </span>
        </Flex>
      ),
      size: 'lg',
      children: (
        <SortModal
          infos={infos}
          decimal={0}
          onConfirm={handleSort}
          core={display}
          height={height}
        />
      ),
      onHide: Modal.hide,
    })
  }

  const handleSort = (display) => {
    setDisplay(display)
    Storage.set('operating_bulletin_v2', display)
    Tip.success('保存成功')
  }

  return (
    <Panel
      className={className}
      title={
        <>
          <span className='gm-margin-right-5 '>{t('待办事项')}</span>
          <ToolTip
            popup={
              <div className='gm-padding-5'>
                {t('仅展示最近30天的待办数据')}
              </div>
            }
          />
        </>
      }
      right={
        <Flex alignCenter style={{ paddingBottom: 4 }}>
          <span
            className='text-primary gm-text-12 gm-cursor'
            onClick={() => handleConfig(todoData)}
          >
            {t('自定义设置')}
          </span>
        </Flex>
      }
    >
      <Grid column={4} className='gm-padding-0 gm-bg'>
        {!_.isEmpty(todoData) &&
          display.map((key, index) => {
            const config = bulletinConfig(key)
            const data = { ...todoData[key], ...config }
            return <Bulletin key={key} options={data} />
          })}
      </Grid>
    </Panel>
  )
}

HomeTodo.propTypes = {
  isForeign: PropTypes.bool.isRequired,
  className: PropTypes.string,
}

export default observer(HomeTodo)
