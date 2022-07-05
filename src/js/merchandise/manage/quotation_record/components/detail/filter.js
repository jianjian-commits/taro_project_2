import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  DateRangePicker,
} from '@gmfe/react'
import moment from 'moment'

import { detailStore as store } from '../../store'

const DetailFilter = observer(() => {
  const handleSearch = () => {
    return store.getDetailList()
  }

  const handleExport = () => {
    store.export()
  }

  const { start_time, end_time, sku_id, sku_name } = store.detail_filter

  return (
    <BoxForm onSubmit={handleSearch}>
      <FormBlock col={3}>
        <FormItem label={t('规格名')} style={{ alignItems: 'flex-end' }}>
          <div>
            {sku_name}
            {sku_id}
          </div>
        </FormItem>
        <FormItem label={t('报价日期')}>
          <DateRangePicker
            max={moment()}
            begin={start_time}
            end={end_time}
            onChange={(start_time, end_time) => {
              store.changeDetailFilter({ start_time, end_time })
            }}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default DetailFilter
