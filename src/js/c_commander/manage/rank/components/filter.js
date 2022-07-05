import React from 'react'
import { observer } from 'mobx-react'
import { Box, Form, FormItem, FormButton, Button, FormBlock } from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../store'
import { clubDateFilterData } from 'common/enum'
import DateFilter from 'common/components/date_range_filter'
import { DisableDate } from '../../../util'

const dateFilterDataTotal = {
  dateFilterData: [...clubDateFilterData]
}

const Filter = observer(() => {
  const { search_text } = store.filter

  const handleSearch = () => {
    store.fetchList()
  }

  const handleExport = () => {
    store.handleExport().then(res => {
      window.open(res.data.link)
    })
  }

  const handleDateFilterChange = value => {
    if (value.dateType) {
      store.setDateFilterChange({ dateType: value.dateType })
    } else if (value.begin && value.end) {
      store.setDateFilterChange({ begin: value.begin })
      store.setDateFilterChange({ end: value.end })
    }
  }

  const disabledDates = (date, { begin, end }) => {
    return DisableDate(date, begin)
  }

  const limitDates = [disabledDates, disabledDates]

  return (
    <Box hasGap>
      <Form inline onSubmit={handleSearch}>
        <FormBlock col={3}>
          <FormItem colWidth='400px'>
            <DateFilter
              data={dateFilterDataTotal}
              filter={store.filter}
              limitDates={limitDates}
              onDateFilterChange={handleDateFilterChange}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              value={search_text}
              type='text'
              placeholder={t('输入团长姓名搜索')}
              onChange={e => store.setValue('search_text', e.target.value)}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
            <Button className='gm-margin-left-10' onClick={handleExport}>
              {t('导出')}
            </Button>
          </FormButton>
        </FormBlock>
      </Form>
    </Box>
  )
})

export default Filter
