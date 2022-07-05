import React from 'react'
import SpuListCard from './spu_list_card'
import { Flex } from '@gmfe/react'
import { store } from '../../store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { scrollToLoad } from '../../utils'

const NegativeList = observer(() => {
  const { negativeList } = store
  let negativeListContainer

  const scroll = () => {
    const { negativeListMore } = store
    const event = () => {
      store.getNegativeList()
    }
    scrollToLoad(negativeListContainer, event, negativeListMore)
  }

  return (
    <div
      style={{ maxHeight: '400px', overflow: 'auto', minHeight: '200px' }}
      ref={(ref) => (negativeListContainer = ref)}
      onScroll={_.throttle(scroll, 500)}
    >
      <Flex row wrap justifyBetween className='gm-padding-5'>
        {negativeList.length
          ? _.map(negativeList, (item, index) => (
              <SpuListCard data={item} key={index} negative />
            ))
          : '没有数据'}
      </Flex>
    </div>
  )
})

export default NegativeList
