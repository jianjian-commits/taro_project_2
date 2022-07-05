import React from 'react'
import { FullTab } from '@gmfe/frame'
import { i18next } from 'gm-i18n'
import CombineGoodsList from './combine_goods_list'
import Statistics from './data_statistics'

class CombinationGoods extends React.Component {
  render() {
    return (
      <FullTab tabs={[i18next.t('组合商品'), i18next.t('数据统计')]}>
        <CombineGoodsList />
        <Statistics />
      </FullTab>
    )
  }
}

export default CombinationGoods
