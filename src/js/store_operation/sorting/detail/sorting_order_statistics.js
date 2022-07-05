import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import orderStore from './order_store'
import { Flex } from '@gmfe/react'
import { QuickPanel, QuickDetailThird } from '@gmfe/react-deprecated'
import Big from 'big.js'
import { SvgOrderNumScreen, SvgOrderFinished, SvgOrderUnfinished } from 'gm-svg'

@observer
class SortingOrderStatistics extends React.Component {
  render() {
    const { orderData } = orderStore
    return (
      <QuickPanel
        title={
          <span>
            <i
              className='xfont xfont-pie'
              style={{ color: '#f4a558', marginRight: 10, fontSize: 15 }}
            />
            <span>{i18next.t('完成统计')}</span>
          </span>
        }
      >
        <QuickDetailThird
          result={{
            name: (
              <Flex alignCenter>
                <span style={{ color: '#ef4e61', fontSize: '1.5em' }}>
                  <SvgOrderNumScreen />
                </span>
                <Flex flex style={{ fontSize: '1.3em', marginLeft: '10px' }}>
                  {i18next.t('全部订单数')}
                </Flex>
              </Flex>
            ),
            value: orderData.total,
          }}
          process={[
            {
              name: (
                <Flex alignCenter>
                  <span style={{ color: '#ff195a', fontSize: '1.5em' }}>
                    <SvgOrderFinished />
                  </span>
                  <Flex flex className='b-sorting-schedule-item-title'>
                    {i18next.t('完成订单数')}
                  </Flex>
                </Flex>
              ),
              value: orderData.finished,
            },
            {
              name: (
                <Flex alignCenter>
                  <span style={{ color: '#ff195a', fontSize: '1.5em' }}>
                    <SvgOrderUnfinished />
                  </span>
                  <Flex flex className='b-sorting-schedule-item-title'>
                    {i18next.t('未完成订单数')}
                  </Flex>
                </Flex>
              ),
              value: Big(orderData.total).minus(orderData.finished).toFixed(0),
            },
          ]}
          unit=''
        />
      </QuickPanel>
    )
  }
}

export default SortingOrderStatistics
