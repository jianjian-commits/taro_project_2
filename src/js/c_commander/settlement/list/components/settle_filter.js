import React from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Button,
  FormBlock,
  RightSideModal
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../store'
import LevelListSelect from '../../../common/level_list_select'
import { clubDateFilterData } from 'common/enum'
import DateFilter from 'common/components/date_range_filter'
import { DisableDate } from '../../../util'
import TaskList from '../../../../task/task_list'

const dateFilterDataTotal = {
  dateFilterData: [...clubDateFilterData]
}

const SettleFilter = observer(() => {
  const { levelSelected, q } = store.filter

  const handleSearch = () => {
    store.apiDoFirstRequest()
  }

  const handleDateFilterChange = value => {
    if (value.dateType) {
      store.setDateFilterChange({ dateType: value.dateType })
    } else if (value.begin && value.end) {
      store.setDateFilterChange({ begin: value.begin })
      store.setDateFilterChange({ end: value.end })
    }
  }

  const handleExport = async () => {
    await store.handleExport()
    RightSideModal.render({
      children: <TaskList />,
      onHide: RightSideModal.hide,
      style: {
        width: '300px'
      }
    })
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
          <FormItem label={t('团长等级')}>
            <LevelListSelect
              selected={levelSelected}
              onSelect={value => store.setValue('levelSelected', value)}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              value={q}
              type='text'
              placeholder={t('输入社区门店/账号')}
              onChange={e => store.setValue('q', e.target.value)}
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

export default SettleFilter
