import { t } from 'gm-i18n'
import React from 'react'
import { Request } from '@gm-common/request'
import { Flex } from '@gmfe/react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import PropTypes from 'prop-types'
import SvgWaitSortOrder from 'svg/wait_sort_order.svg'
import SvgSortingOrder from 'svg/sorting_order.svg'
import SvgUnpayCount from 'svg/unpay_count.svg'
import SvgWaitPayNum from 'svg/wait_pay_num.svg'

import globalStore from 'stores/global'
import Panel from 'common/components/report/panel'
import { getDateRangeByType } from 'common/util'
const SORT_LIST = [
  'wait_sort_order',
  'sorting_order',
  'unpay_count',
  'wait_pay_num',
]
const CONFIG = {
  wait_sort_order: {
    name: t('等待分拣订单'),
    to: {
      pathname: '/order_manage/order/list',
      state: { orderStatus: 1 },
    },
    icon: <SvgWaitSortOrder />,
  },
  sorting_order: {
    name: t('分拣中订单'),
    to: {
      pathname: '/order_manage/order/list',
      state: { orderStatus: 5 },
    },
    icon: <SvgSortingOrder />,
  },
  unpay_count: {
    name: t('未支付订单'),
    to: {
      pathname: '/order_manage/order/list',
      state: { payStatus: 1, begin: getDateRangeByType('4').begin_time },
    },
    icon: <SvgUnpayCount />,
  },
  wait_pay_num: {
    name: t('待支付结款单'),
    to: globalStore.hasPermission('get_settle_review')
      ? '/sales_invoicing/finance/payment_review'
      : '',
    icon: <SvgWaitPayNum />,
  },
}

const getSortList = () => {
  const { isCStation } = globalStore.otherInfo
  if (isCStation) {
    return _.filter(SORT_LIST, (s) => s !== 'unpay_count')
  }
  return SORT_LIST
}

// 处理 b / c 首页链接跳转
const getConfig = () => {
  const { isCStation } = globalStore.otherInfo
  if (isCStation) {
    const config = { ...CONFIG }
    _.forEach(config, (value, key) => {
      if (_.includes(value.to.pathname, '/order_manage/order/list')) {
        value.to.pathname = isCStation ? 'c_retail/order/list' : ''
      }
    })
    delete config.unpay_count
    return config
  }
  return CONFIG
}

const Item = ({ accessor, value, config }) => {
  return (
    <Link
      className='b-home-border-bottom gm-flex gm-flex-flex gm-flex-align-end gm-padding-right-10 gm-padding-bottom-20 gm-margin-bottom-20 gm-flex-justify-between b-home-ready-bills-item'
      to={config[accessor].to}
    >
      <Flex>
        <span
          style={{ lineHeight: '34px' }}
          className='gm-margin-left-5 gm-text-14'
        >
          {config[accessor].name}
        </span>
      </Flex>
      <Flex alignBaseline style={{ fontSize: '30px', fontFamily: 'Helvetica' }}>
        {value}
        <Flex className='gm-text-14' style={{}}>
          {t('笔')}
        </Flex>
      </Flex>
    </Link>
  )
}
Item.propTypes = {
  accessor: PropTypes.string,
  value: PropTypes.any,
  config: PropTypes.object,
}

class ReadyBills extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      readyBillsCount: {},
    }
  }

  componentDidMount() {
    Request('/home_page/data_analyse/ready_bills_count')
      .get()
      .then((json) => {
        // 待处理订单
        this.setState({
          readyBillsCount: json.data,
        })
      })
  }

  render() {
    const { readyBillsCount } = this.state
    const sort_list = getSortList()
    const config = getConfig()
    return (
      <Panel title={t('待处理单据')} className='b-home-read-bills'>
        <Flex
          column
          className='gm-padding-right-10'
          style={{ height: '381px' }}
        >
          {_.map(sort_list, (key) => {
            const accessor = key
            const value = readyBillsCount[key]
            return (
              <Item
                key={key}
                accessor={accessor}
                value={value}
                config={config}
              />
            )
          })}
        </Flex>
      </Panel>
    )
  }
}

export default ReadyBills
