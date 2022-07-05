import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Box, Flex, Loading } from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Actions from './components/actions'
import Notice from './components/notice'
import globalStore from '../../../stores/global'
import EmptySvg from 'svg/empty.svg'

import store from './store'

@observer
class Component extends React.Component {
  componentDidMount() {
    this.fetchData()
    globalStore.hasPermission('open_app_youzan') && store.youzanCheck()
  }

  componentWillUnmount() {
    store.clear()
  }

  fetchData = () => {
    store.getPlatforms()
  }

  render() {
    const platforms = store.platforms.slice()
    if (store.loading) {
      return (
        <Flex justifyCenter style={{ paddingTop: '100px' }}>
          <Loading text={i18next.t('加载中...')} />
        </Flex>
      )
    }
    return (
      <Box hasGap>
        {!platforms.length ? (
          <Flex alignCenter column style={{ paddingTop: '160px' }}>
            <EmptySvg style={{ height: '160px', width: '160px' }} />
            <p className='gm-text-desc'>{t('没有数据...')}</p>
          </Flex>
        ) : (
          <Flex wrap>
            {_.map(platforms, (item, index) => {
              return (
                <Flex
                  key={index}
                  className='text-left gm-padding-15'
                  style={{ width: '50%' }}
                >
                  <Flex className='gm-padding-lr-5'>
                    <div>
                      <img width='80px' src={item.img_url} />
                    </div>
                  </Flex>
                  <Flex column className='gm-padding-lr-15'>
                    <Flex className='gm-text-14 gm-padding-bottom-5 gm-text-bold'>
                      {item.name}
                    </Flex>
                    <Notice app={item} />
                    <Flex
                      className='gm-padding-bottom-10'
                      style={{ maxWidth: '400px' }}
                    >
                      {item.app_desc}
                    </Flex>
                    <Actions app={item} index={index} />
                  </Flex>
                </Flex>
              )
            })}
          </Flex>
        )}
      </Box>
    )
  }
}

export default Component
