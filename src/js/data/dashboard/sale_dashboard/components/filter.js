import React from 'react'
import { Button, Flex, DateRangePicker } from '@gmfe/react'
import { t } from 'gm-i18n'

import moment from 'moment'
import SvgNext from 'svg/next.svg'
import { history } from 'common/service'
import { observer } from 'mobx-react'
import store from '../store'
import mapStore from 'common/../home/old/full_screen_store'
import ButtonGroup from 'common/components/button_group'

const buttons = [
  {
    text: t('date_range', {
      day: 7,
    }),
    value: 7,
    begin_time: moment().subtract(6, 'd'),
    end_time: moment(),
  },
  {
    text: t('date_range', {
      day: 15,
    }),
    value: 15,
    begin_time: moment().subtract(14, 'd'),
    end_time: moment(),
  },
  {
    text: t('date_range', {
      day: 30,
    }),
    value: 30,
    begin_time: moment().subtract(29, 'd'),
    end_time: moment(),
  },
  {
    text: t('自定义日期'),
    value: 'custom',
  },
]

const Filter = () => {
  const {
    filter: { begin_time, end_time },
  } = store

  const handleClick = (value) => {
    const { begin_time, end_time } = value
    if (!begin_time || !end_time) return
    store.setFilter({ begin_time, end_time })
  }

  const customDate = (begin, end) => {
    if (!begin || !end) return
    handleClick({
      begin_time: moment(begin),
      end_time: moment(end),
    })
  }

  const handleFullScreen = () => {
    store.location.merchantData = ''
    history.push(
      `/data/dashboard/sale_dashboard/fullscreen?begin=${moment(
        begin_time,
      ).format('YYYY-MM-DD')}&end=${moment(end_time).format(
        'YYYY-MM-DD',
      )}&areaCode=${mapStore.city.id}`,
    )
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
              onChange={customDate}
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

export default observer(Filter)
