import React from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Button,
  FormBlock,
  Select,
  RightSideModal
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from './store'
import { clubDateFilterData, SETTLE_STATUS } from 'common/enum'
import DateFilter from 'common/components/date_range_filter'
import { DisableDate } from '../../../util'
import TaskList from '../../../../task/task_list'

const dateFilterDataTotal = {
  dateFilterData: [...clubDateFilterData]
}
const settleStatus = [{ value: '', text: t('全部状态') }, ...SETTLE_STATUS]

const DetailFilter = observer(props => {
  const { status, q } = store.filter

  const handleSearch = () => {
    store.apiDoFirstRequest()
  }

  const handleExport = async () => {
    const { distributor_id } = props.location.query
    await store.handleExport(distributor_id)
    RightSideModal.render({
      children: <TaskList />,
      onHide: RightSideModal.hide,
      style: { width: '300px' }
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
          <FormItem label={t('结款状态')}>
            <Select
              data={settleStatus}
              value={status}
              onChange={value => store.setValue('status', value)}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              value={q}
              type='text'
              placeholder={t('输入订单号/用户名')}
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

export default DetailFilter
