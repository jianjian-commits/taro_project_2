import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  FormButton,
  FormItem,
  Input,
  Select,
  DateRangePicker,
  BoxForm,
  FormBlock,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { DELAY_STOCK_TYPE, BATCH_STATUS, BATCH_STOCK_STATUS } from 'common/enum'
import moment from 'moment'

const { More } = BoxForm

// 这个组件货位和批次都在用，虽然看起来不像
// 现在不是了
function BatchBatchFilter({
  onSearch,
  onExport,
  defaultFilter,
  placeholder,
  hasDelayStock,
}) {
  const [text, changeText] = useState(defaultFilter?.text || '')
  const [delayType, changeDelayType] = useState(defaultFilter?.delayType || 0)
  const [status, changeStatus] = useState(defaultFilter?.status || 0)
  const [stockStatus, changeStockStatus] = useState(
    defaultFilter?.remain_status || 0,
  )
  const [time, changeTime] = useState({
    start_time: new Date().setMonth(new Date().getMonth() - 3),
    end_time: new Date(),
  })

  const handleSearch = () => {
    const { start_time, end_time } = time
    const req = {
      text,
      status,
      remain_status: stockStatus,
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
    }

    hasDelayStock && (req.delayType = delayType)
    onSearch(req)
  }

  const handleExport = () => {
    const { start_time, end_time } = time
    const req = {
      text,
      status,
      remain_status: stockStatus,
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
    }

    hasDelayStock && (req.delayType = delayType)
    onExport(req)
  }

  return (
    <BoxForm colWidth='360px' btnPosition='left'>
      <FormBlock col={3}>
        <FormItem label={t('搜索')}>
          <Input
            value={text}
            onChange={({ target: { value } }) => changeText(value)}
            className='form-control'
            placeholder={placeholder}
          />
        </FormItem>

        <FormItem label={t('入库日期')}>
          <DateRangePicker
            begin={time.start_time}
            end={time.end_time}
            onChange={(begin, end) => {
              changeTime({ start_time: begin, end_time: end })
            }}
            disabledDate={(d, { begin }) => {
              if (begin) {
                if (+moment(d) < +moment(begin)) {
                  if (+moment(d) < +moment(begin).subtract('month', 12)) {
                    return true
                  }
                } else if (+moment(d) > +moment(begin).add('month', 12)) {
                  return true
                }
              }
              return false
            }}
          />
        </FormItem>
      </FormBlock>
      <More>
        <FormBlock col={3}>
          {hasDelayStock && (
            <FormItem label={t('呆滞库存')}>
              <Select
                value={delayType}
                onChange={changeDelayType}
                data={DELAY_STOCK_TYPE}
              />
            </FormItem>
          )}
          <FormItem label={t('批次状态')}>
            <Select
              value={status}
              onChange={changeStatus}
              data={BATCH_STATUS}
            />
          </FormItem>
          <FormItem label={t('库存')}>
            <Select
              value={stockStatus}
              onChange={changeStockStatus}
              data={BATCH_STOCK_STATUS}
            />
          </FormItem>
        </FormBlock>
      </More>
      <FormButton>
        <Button type='primary' onClick={handleSearch}>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
}

BatchBatchFilter.propTypes = {
  onSearch: PropTypes.func,
  onExport: PropTypes.func,
  defaultFilter: PropTypes.object,
  placeholder: PropTypes.string,
  hasDelayStock: PropTypes.bool,
}

export default BatchBatchFilter
