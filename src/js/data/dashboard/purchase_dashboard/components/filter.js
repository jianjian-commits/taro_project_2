import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { Flex, DateRangePicker, Button } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import moment from 'moment'
import SvgNext from 'svg/next.svg'
import { history } from 'common/service'
import store from '../store'

import ButtonGroup from 'common/components/button_group'

const buttons = [
  {
    text: t('date_range', {
      day: 7,
    }),
    value: 7,
    begin_time: moment().subtract(7, 'days'),
    end_time: moment(),
  },
  {
    text: t('date_range', {
      day: 15,
    }),
    value: 15,
    begin_time: moment().subtract(15, 'days'),
    end_time: moment(),
  },
  {
    text: t('date_range', {
      day: 30,
    }),
    value: 30,
    begin_time: moment().subtract(30, 'days'),
    end_time: moment(),
  },
  {
    text: t('自定义日期'),
    value: 'custom',
  },
]

const Filter = () => {
  const {
    filter,
    filter: { begin_time, end_time },
  } = store

  useEffect(() => {
    console.log('begin_time', begin_time)
  }, [filter])

  const handleClick = (btn) => {
    const { begin_time, end_time, value } = btn
    if (value === 'custom') return
    store.setFilter({ begin_time, end_time })
  }

  const onChange = (begin, end) => {
    if (!begin || !end) return
    handleClick({
      begin_time: moment(begin),
      end_time: moment(end),
    })
  }

  const handleFullScreen = () => {
    history.push('/data/dashboard/purchase_dashboard/fullscreen')
  }

  return (
    <Flex className='gm-padding-tb-10 gm-padding-lr-20'>
      <ButtonGroup
        onChange={handleClick}
        data={buttons}
        renderBtn={(btn) => {
          return btn.value === 'custom' ? (
            <DateRangePicker
              begin={begin_time}
              end={end_time}
              onChange={onChange}
            >
              <div
                style={{
                  padding: '6px 8px',
                }}
              >
                {t('自定义日期')}
              </div>
            </DateRangePicker>
          ) : (
            <div
              style={{
                padding: '6px 8px',
              }}
            >
              {btn.text}
            </div>
          )
        }}
        addon={
          <Button onClick={handleFullScreen}>
            {t('投屏模式')} <SvgNext />
          </Button>
        }
      />
    </Flex>
  )
}

Filter.propTypes = {
  xxxx: PropTypes.bool,
}
export default observer(Filter)
