import React from 'react'
import { MoreSelect, Flex, Tip } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import CookbookStore from '../store'
import _ from 'lodash'

const CombinedGoodsSelector = (props) => {
  const { mealTimesIndex, week, itemIndex } = props
  const {
    setCombinedGoods,
    changeCombined,
    combineGoodsList,
    initDataList,
  } = CookbookStore

  const handleChangeCombined = (type) => {
    changeCombined(mealTimesIndex, itemIndex, type, week)
  }

  const data = _.map([props.selectedValue], (item) => {
    return {
      ...item,
      text: item.name ?? item.text,
      value: item.value ?? item.id,
    }
  })
  const handleCombinedGoods = (value) => {
    _.find(
      initDataList.cookbook_info[mealTimesIndex][week],
      (item) => (item?.value ?? item?.id) === (value?.value ?? value?.id),
    )
      ? Tip.danger(t('组合商品已经存在'))
      : setCombinedGoods(value, week, mealTimesIndex, itemIndex)
  }
  return (
    <Flex alignCenter key={Math.random()}>
      <div
        className='b-cookbook-combined-good-selector'
        onClick={() => handleChangeCombined(1)}
      >
        +
      </div>
      <div
        className='b-cookbook-combined-good-selector'
        onClick={() => handleChangeCombined(-1)}
      >
        -
      </div>
      <MoreSelect
        data={combineGoodsList.slice()}
        selected={data.slice()[0]}
        onSelect={handleCombinedGoods}
        // onSearch={handleSearch}
        placeholder={t('请输入搜索')}
        renderListFilterType='pinyin'
        style={{ width: 100 }}
      />
    </Flex>
  )
}

CombinedGoodsSelector.propTypes = {
  selectedValue: PropTypes.array.isRequired,
  mealTimesIndex: PropTypes.number.isRequired,
  week: PropTypes.number.isRequired,
  itemIndex: PropTypes.number.isRequired,
}

export default observer(CombinedGoodsSelector)
