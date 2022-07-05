import { t } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
import { Request } from '@gm-common/request'
import Big from 'big.js'

import Bulletin from 'common/components/report/bulletin'
import { bulletinConfig } from './util'

const core = ['place_order_money', 'refund_price', 'all_money']
class TodaySituation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      infos: ''
    }
  }

  doTransform = (today, yesterday) => {
    const ret = {}
    for (const key in today) {
      console.log('key', key, today)
      ret[key] = {
        tAcount: bulletinConfig(key, today[key]).tAcount,
        tName: bulletinConfig(key).tName,
        color: bulletinConfig(key).color,
        tLink: bulletinConfig(key).tLink,
        yLink: bulletinConfig(key).yLink
      }
    }
    for (const key in yesterday) {
      ret[key] = {
        ...ret[key],
        yAcount: bulletinConfig(key, null, yesterday[key]).yAcount,
        yName: bulletinConfig(key).yName,
        tLink: bulletinConfig(key).tLink,
        yLink: bulletinConfig(key).yLink
      }
    }
    return ret
  }

  getAllMoney = data => {
    const { place_order_money, refund_price } = data
    const all_money = Big(place_order_money)
      .minus(Big(refund_price))
      .toFixed(2)

    return { ...data, all_money }
  }

  componentDidMount() {
    // 获取数据 -- 新接口
    Request('/home_page/data_analyse/lasted_orders_count_toC')
      .get()
      .then(json => {
        const { today, yesterday } = json.data
        const _today = {
          place_order_money: today.place_order_money || 0,
          refund_price: today.refund_price || 0
        }
        const _yesterday = {
          place_order_money: yesterday.place_order_money || 0,
          refund_price: yesterday.refund_price || 0
        }
        const infos = this.doTransform(
          this.getAllMoney(_today),
          this.getAllMoney(_yesterday)
        )
        this.setState({ infos })
      })
  }

  render() {
    const { infos } = this.state
    return (
      <Flex column className='b-home-panel'>
        <Flex className='gm-text-16 gm-text-bold'>{t('今日概况')}</Flex>
        <Flex style={{ height: '146px' }} className='gm-text-white'>
          {core.map((key, index) => {
            return (
              infos && (
                <Bulletin
                  className={`gm-margin-10 b-home-bulletin-${index}`}
                  key={key}
                  flip
                  options={infos[key]}
                />
              )
            )
          })}
        </Flex>
      </Flex>
    )
  }
}

export default TodaySituation
