import { i18next } from 'gm-i18n'
import React, { useRef, useState } from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Popover, Flex, List, Input } from '@gmfe/react'
import _ from 'lodash'
import SVGMore from 'svg/more.svg'
import CookbookStore from '../store'

const CookbookSetting = (props) => {
  const [isRevamp, setRevamp] = useState(false)
  const popover = useRef(null)
  const { mealTimesIndex } = props
  const {
    setMealTimesValue,
    setMove,
    deleteCookbook,
    initDataList,
  } = CookbookStore
  const onRevamp = () => {
    setRevamp(true)
  }

  const onMove = (type) => {
    setMove(mealTimesIndex, type)
  }

  const onDelete = (type) => {
    deleteCookbook(mealTimesIndex)
  }

  const handleMealTimesValue = (value) => {
    setMealTimesValue(value, mealTimesIndex)
  }

  const renderPopup = () => {
    const menu = [
      {
        key: 'revamp',
        name: i18next.t('修改'),
        handle: onRevamp,
      },
      {
        key: 'moveUp',
        name: i18next.t('上移'),
        handle: () => onMove(-1),
      },
      {
        key: 'moveDown',
        name: i18next.t('下移'),
        handle: () => onMove(1),
      },
      {
        key: 'delete',
        name: i18next.t('删除'),
        handle: onDelete,
      },
    ]
    const listData = _.map(menu, (v, i) => {
      return { value: i, text: v.name }
    })

    const handleSelect = (value) => {
      popover.current.setActive(false)
      menu[value].handle()
    }
    return (
      <List
        data={listData.filter((_) => _)}
        onSelect={handleSelect}
        className='gm-border-0 b-salemenu-more'
      />
    )
  }
  const name = initDataList.cookbook_info?.[mealTimesIndex]?.name ?? ''
  return (
    <Flex alignCenter justifyBetween>
      {isRevamp ? (
        <Input
          className='b-order-remark form-control input-sm'
          value={name}
          onChange={(e) => handleMealTimesValue(e.target.value)}
          style={{ width: 70 }}
        />
      ) : (
        name
      )}
      <Popover ref={popover} right showArrow type='hover' popup={renderPopup()}>
        <div className='gm-padding-right-5 b-card-info'>
          <SVGMore className='gm-text-16' />
        </div>
      </Popover>
    </Flex>
  )
}
CookbookSetting.propTypes = {
  // mealTimesValue: PropTypes.string.isRequired,
  mealTimesIndex: PropTypes.number.isRequired,
}
export default observer(CookbookSetting)
