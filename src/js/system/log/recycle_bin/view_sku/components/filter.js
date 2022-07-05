import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormItem,
  FormBlock,
  Button,
  DateRangePicker,
  FormButton,
  MoreSelect,
} from '@gmfe/react'
import store from './store'

const SkuFilter = (props) => {
  const {
    filter: { q, begin_time, end_time, salemenuSelected },

    changeFilter,
    doFirstRequest,
    mergeFilter,
    initFilter,
  } = store
  const saleListFilter = [
    { text: i18next.t('全部报价单'), value: null },
    ...store.saleListFilter.slice(),
  ]

  return (
    <BoxForm
      onSubmit={() => doFirstRequest()}
      btnPosition='left'
      labelWidth='90px'
    >
      <FormBlock col={3}>
        <FormItem label={i18next.t('删除时间')} col={1}>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            onChange={(begin_time, end_time) =>
              mergeFilter({ begin_time, end_time })
            }
          />
        </FormItem>
        <FormItem label={i18next.t('报价单')}>
          <MoreSelect
            id='salemenu_id'
            data={saleListFilter}
            style={{ minWidth: '120px' }}
            selected={salemenuSelected}
            onSelect={(val) => changeFilter('salemenuSelected', val)}
            renderListFilterType='pinyin'
            placeholder={i18next.t('全部报价单')}
          />
        </FormItem>
        <FormItem label={i18next.t('搜索')}>
          <input
            className='form-control'
            type='text'
            value={q}
            name='text'
            placeholder={i18next.t('输入商品名称、规格名或ID')}
            onChange={(e) => changeFilter('q', e.target.value)}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {i18next.t('搜索')}
        </Button>
        <div className='gm-gap-5' />
        <Button onClick={() => initFilter()}>{i18next.t('重置')}</Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(SkuFilter)
