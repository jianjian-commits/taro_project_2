import { t } from 'gm-i18n'
import React from 'react'
import { Switch, Flex, TimeSpanPicker } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import { HHmmToDate, HHmmToMoment } from '../util'
import store from '../store'
import SVGPlus from 'svg/plus.svg'
import SVGDelete from 'svg/deleted.svg'

const UnReceiveTimeSelector = observer(
  ({ isPre, onChange, onAddItem, onDeleteItem, onTimeChange, disabled }) => {
    const receiveType = isPre ? 'smmPre' : 'smm'
    const { is_undelivery, undelivery_times } = store[receiveType]

    const renderItem = (time) => {
      const date = moment(time).format('YYYY-MM-DD')
      const theSecondDay = moment(date).add(1, 'd')
      const addOneMoreMs = moment(time).add(1, 'ms')
      if (addOneMoreMs.isSame(theSecondDay)) {
        return t('请选择')
      }

      return `${moment(time).format('HH:mm')}`
    }

    const getDisabledSpanOfEndTime = (begin, time) => {
      if (!begin) return false

      // 大于开始时间
      return HHmmToMoment(time.format('HH:mm')).isSameOrBefore(
        HHmmToMoment(begin),
      )
    }

    return (
      <>
        <Switch
          type='primary'
          checked={!!is_undelivery}
          on={t('开启')}
          off={t('关闭')}
          onChange={onChange}
          className='gm-margin-bottom-10'
          disabled={disabled}
        />
        {/** 开启时展示每日时间段选择设置, 限制后面时间选择必须大于前面即可, 选择后校验当前设置时间是否合法 */}
        {!!is_undelivery &&
          _.map(undelivery_times, (item, index) => {
            return (
              <Flex alignCenter key={index} className='gm-margin-bottom-10'>
                <span className='gm-margin-right-20'>{t('每天')}</span>
                <TimeSpanPicker
                  date={
                    item.start
                      ? HHmmToDate(item.start)
                      : moment().endOf('day').toDate()
                  }
                  onChange={(time) => onTimeChange(index, 'start', time)}
                  style={{ width: '80px' }}
                  renderItem={renderItem}
                  disabled={disabled}
                />
                <div className='gm-gap-20' />
                ~
                <div className='gm-gap-20' />
                <TimeSpanPicker
                  date={
                    item.end
                      ? HHmmToDate(item.end)
                      : moment().endOf('day').toDate()
                  }
                  onChange={(time) => onTimeChange(index, 'end', time)}
                  style={{ width: '80px' }}
                  renderItem={renderItem}
                  disabledSpan={(time) =>
                    getDisabledSpanOfEndTime(item.start, time)
                  }
                  disabled={disabled}
                />
                <SVGPlus
                  className={classNames('gm-margin-lr-10', {
                    'gm-not-allowed': disabled,
                  })}
                  onClick={disabled ? _.noop : onAddItem}
                />
                <SVGDelete
                  className={classNames('gm-margin-right-10', {
                    'gm-not-allowed': disabled,
                  })}
                  onClick={() => (disabled ? _.noop : onDeleteItem(index))}
                />
              </Flex>
            )
          })}
      </>
    )
  },
)

UnReceiveTimeSelector.propTypes = {
  isPre: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
}

export default UnReceiveTimeSelector
