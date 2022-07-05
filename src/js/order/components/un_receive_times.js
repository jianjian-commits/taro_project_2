import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import moment from 'moment'

import SVGQuestion from 'svg/question-circle-o.svg'

const UnReceiveTimes = ({ unReceiveTimes }) => {
  if (!unReceiveTimes.length) {
    return null
  }

  // 先针对已包含的时间段做处理
  const _result = []
  _.forEach(
    _.orderBy(unReceiveTimes, (t) => t.start),
    (time) => {
      // 若result已包含该时间段，则无需加入
      const isIn = _.find(
        _result,
        (r) =>
          moment(r.start, 'HH:mm').isSameOrBefore(
            moment(time.start, 'HH:mm'),
          ) && moment(r.end, 'HH:mm').isSameOrAfter(moment(time.end, 'HH:mm')),
      )

      if (!isIn) {
        _result.push(time)
      }
    },
  )

  const result = _result.slice()
  // 将存在交叉的时间段进行合并
  _.forEach(result, (r, index) => {
    if (index !== result.length - 1) {
      // end1 < end2 && end1 > start2
      if (
        r !== null &&
        moment(r.end, 'HH:mm').isSameOrBefore(
          moment(result[index + 1].end, 'HH:mm'),
        ) &&
        moment(r.end, 'HH:mm').isSameOrAfter(
          moment(result[index + 1].start, 'HH:mm'),
        )
      ) {
        // 说明两个可以合并展示
        const new_item = { start: r.start, end: result[index + 1].end }
        result[index + 1] = new_item
        result[index] = null
      }
    }
  })

  const renderTimes = () => {
    const times = _.filter(result, (r) => r !== null)
    return (
      <div>
        {times.length > 0 && t('不配送时间：')}
        {_.map(times, (item, index) => {
          return (
            <span key={index}>
              {item.start} ~ {item.end}
              {index !== times.length - 1 && <span>；</span>}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <Popover
      showArrow
      type='hover'
      popup={
        <div
          className='gm-bg gm-padding-10'
          style={{ width: '405px', wordBreak: 'break-all' }}
        >
          {renderTimes()}
        </div>
      }
    >
      <div className='gm-text-red gm-text-left gm-inline gm-margin-left-5'>
        <SVGQuestion />
      </div>
    </Popover>
  )
}

UnReceiveTimes.propTypes = {
  unReceiveTimes: PropTypes.array.isRequired,
}

export default UnReceiveTimes
