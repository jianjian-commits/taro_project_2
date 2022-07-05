import { i18next } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, FormButton, FormBlock, Button } from '@gmfe/react'
import { clubDateFilterData } from 'common/enum'
import store from '../store'
import { observer } from 'mobx-react'

import DateFilter from 'common/components/date_range_filter'
import { DisableDate } from '../../../util'

const dateFilterDataTotal = {
  dateFilterData: [...clubDateFilterData]
}

@observer
class Filter extends React.Component {
  handleChangeSearch = e => {
    this.handleSelectChange('q', e.target.value)
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleSelectChange(name, value) {
    store.filterChange({ [name]: value })
  }

  handleDateFilterChangeOnce = value => {
    if (value.dateType) {
      this.handleSelectChange('dateType', value.dateType)
    } else if (value.begin && value.end) {
      this.handleSelectChange('begin', value.begin)
      this.handleSelectChange('end', value.end)
    }
  }

  disabledDates = (date, { begin, end }) => {
    return DisableDate(date, begin)
  }

  render() {
    const { q } = store.filter

    const limitDates = [this.disabledDates]
    return (
      <Box hasGap>
        <Form
          inline
          onSubmit={this.handleSearch}
          labelWidth='90px'
          colWidth='380px'
        >
          <FormBlock col={3}>
            <DateFilter
              data={dateFilterDataTotal}
              filter={store.filter}
              limitDates={limitDates}
              onDateFilterChange={this.handleDateFilterChangeOnce}
            />

            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                name='search_text'
                value={q}
                placeholder='请输入社区店名称、团长名'
                onChange={this.handleChangeSearch}
              />
            </FormItem>

            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </FormBlock>
        </Form>
      </Box>
    )
  }
}

export default Filter
