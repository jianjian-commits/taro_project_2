import { t } from 'gm-i18n'
import React from 'react'
import {
  FormBlock,
  FormItem,
  FormButton,
  Form,
  Button,
  Select,
  Box,
  DateRangePicker
} from '@gmfe/react'
import { observer } from 'mobx-react'

import { searchDateTypes } from 'common/enum'
import { disabledDate } from '../../../order/components/date_range_limit'
import { refundStatusFliter } from '../util'
import store from './store'

const RefundFilter = observer(props => {
  const { filter } = store
  const { begin, end, refundStatus, search_text } = filter

  const handleSearch = () => {
    store.apiDoFirstRequest()
  }

  const handleFilterChange = obj => {
    store.filterChange(obj)
  }

  const disabledDates = (d, { begin, end }) => {
    const _filter = { ...filter, dateType: searchDateTypes.ORDER.type }
    return disabledDate({ filter: _filter }, d, { begin, end })
  }

  return (
    <Box hasGap>
      <Form inline labelWidth='80px' colWidth='370px' onSubmit={handleSearch}>
        <FormBlock col={3}>
          <FormItem label={t('按下单时间')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={(begin, end) => handleFilterChange({ begin, end })}
              disabledDate={disabledDates}
              enabledTimeSelect
            />
          </FormItem>
          <FormItem label={t('退款状态')}>
            <Select
              data={refundStatusFliter}
              value={refundStatus}
              onChange={value => handleFilterChange({ refundStatus: value })}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              name='refundInput'
              className='gm-inline-block form-control gm-margin-right-10'
              value={search_text}
              onChange={e =>
                handleFilterChange({ search_text: e.target.value })
              }
              placeholder={t('请输入订单号、商户名搜索')}
            />
          </FormItem>
        </FormBlock>

        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
        </FormButton>
      </Form>
    </Box>
  )
})

export default RefundFilter
