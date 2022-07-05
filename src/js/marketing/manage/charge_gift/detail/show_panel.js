import React from 'react'
import { t } from 'gm-i18n'
import { Flex, Price, InputNumberV2, Button } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import { observer } from 'mobx-react'

import { money } from '../util'
import store from './store'
import titleImg from 'img/charge_gift_title.png'

@observer
class ShowPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      charge: null,
      selected: null,
    }
  }

  // 自定义数额
  handleChangeDiy = (charge) => {
    this.setState({ charge })
  }

  // 改变充值金额列表赠送数额
  handleChangeGiftList = (data) => {
    return _.map(data, (item) => ({
      charge: item.charge,
      gift: this.handleGetGift(item.charge),
    }))
  }

  // 根据赠送规则，改变赠送数额
  handleGetGift = (charge) => {
    const { gift_section, rule_type, gift_rate } = store
    // 1 按比例赠送，2 按固定值赠送
    if (rule_type === 1) {
      return _.toNumber(
        Big(charge)
          .times(gift_rate || 0)
          .div(100)
          .toFixed(2)
      )
    } else if (rule_type === 2) {
      return _.reduce(
        gift_section.slice(),
        (res, { start, end, gift }) => {
          if (charge >= start && charge < end) {
            return gift || 0
          } else if (start !== null && charge >= start && end === undefined) {
            return gift | 0
          } else {
            return res
          }
        },
        0
      )
    }
  }

  render() {
    const { gift_type } = store
    const { charge, selected } = this.state
    const charge_list = this.handleChangeGiftList([
      {
        charge: 10000,
        gift: 0,
      },
      {
        charge: 50000,
        gift: 0,
      },
      {
        charge: 100000,
        gift: 0,
      },
      {
        charge: 500000,
        gift: 0,
      },
      {
        charge: 1000000,
        gift: 0,
      },
      {
        charge: 2000000,
        gift: 0,
      },
    ])
    const unit = gift_type === 1 ? Price.getUnit() : t('积分')

    return (
      <div
        className='gm-border gm-margin-top-15'
        style={{ width: '375px', overflow: 'hidden' }}
      >
        <div>
          <img src={titleImg} alt={t('优惠券')} style={{ width: '375px' }} />
        </div>
        <div
          className='gm-padding-tb-10 gm-padding-left-20'
          style={{ backgroundColor: '#f9f9f9' }}
        >
          {t('请选择充值金额')}
        </div>
        <Flex wrap justifyAround>
          {_.map(charge_list, (item, index) => (
            <div
              key={index}
              className='gm-border gm-padding-5 gm-margin-top-20 text-center'
              style={{
                width: '160px',
                borderRadius: '4px',
                color: selected === index ? '#fff' : '#666',
                backgroundColor: selected === index ? '#6cca28' : '#fff',
                cursor: 'point',
              }}
              onClick={() =>
                this.setState({
                  selected: selected === index ? null : index,
                })
              }
            >
              <div>
                <Price value={money(item.charge)} currencyScale={0} />
                {Price.getUnit()}
              </div>
              {item.gift !== 0 && (
                <div style={{ color: '#6cca28' }}>
                  {t('送')}
                  <Price value={money(item.gift)} currencyScale={0} />
                  {unit}
                </div>
              )}
            </div>
          ))}
        </Flex>
        <div
          className='gm-margin-top-20'
          style={{ width: '345px', marginLeft: '14px' }}
        >
          <InputNumberV2
            min={0}
            value={charge}
            onChange={this.handleChangeDiy}
            placeholder={t('输入自定义充值金额')}
            className='text-center gm-border gm-padding-tb-10'
            style={{
              width: '100%',
              borderRadius: '4px',
            }}
          />
          {this.handleGetGift(+Big(charge || 0).times(100)) !== 0 && (
            <div className='gm-margin-top-5' style={{ color: '#6cca28' }}>
              {t('送')}
              <Price
                value={money(this.handleGetGift(+Big(charge || 0).times(100)))}
                currencyScale={0}
              />
              {unit}
            </div>
          )}
          <div className='text-center'>
            <Button
              className='btn gm-margin-top-20'
              style={{
                backgroundColor: '#6cca28',
                color: '#fff',
                width: '175px',
                height: '40px',
                borderRadius: '20px',
              }}
            >
              {t('充值')}
            </Button>
          </div>
        </div>
        <div
          className='gm-margin-top-20 gm-padding-10'
          style={{ backgroundColor: '#f9f9f9', width: '100%' }}
        >
          <div className='gm-margin-bottom-10'>{t('余额说明')}</div>
          <div>{t('1.支付时将优先使用充值余额，后使用赠送余额')}</div>
          <div>{t('2.赠送余额可用于支付订单，发生退款时优先退还赠送余额')}</div>
          <div>{t('3.如有其他疑问请及时联系客服沟通')}</div>
        </div>
      </div>
    )
  }
}

export default ShowPanel
