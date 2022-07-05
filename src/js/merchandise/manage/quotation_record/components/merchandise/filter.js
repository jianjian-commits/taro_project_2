import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  BoxForm,
  FormItem,
  Flex,
  FormButton,
  MoreSelect,
  FormBlock,
  DateRangePicker,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import CategoryPinleiFilter from 'common/components/category_filter_hoc'
import { observer } from 'mobx-react'

import { merchandiseStore as store, commonStore } from '../../store'

const MerchandiseFilter = observer(() => {
  useEffect(() => {
    commonStore.getSaleMenuList()
    return () => store.initMerchandiseFilter()
  }, [])

  const handleReset = () => {
    store.initMerchandiseFilter()
  }

  const handleSearch = () => {
    store.doMerchandiseFirstRequest()
  }

  const handleChange = (name, e) => {
    const value = e.target.value
    store.changeMerchandiseFilter({ [name]: value })
  }

  const handleSelect = (name, value) => {
    store.changeMerchandiseFilter({ [name]: value || {} })
  }

  const { salemenuList } = commonStore
  const {
    text,
    begin,
    end,
    categoryFilter,
    salemenu,
  } = store.merchandise_filter

  return (
    <BoxForm onSubmit={handleSearch} btnPosition='left' labelWidth='90px'>
      <FormBlock col={3}>
        <FormItem label={t('报价日期')}>
          <DateRangePicker
            max={moment()}
            begin={begin}
            end={end}
            onChange={(begin, end) => {
              store.changeMerchandiseFilter({ begin, end })
            }}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <input
            type='text'
            className='form-control'
            placeholder={t('输入商品名称、规格名或ID')}
            value={text}
            onChange={handleChange.bind(this, 'text')}
          />
        </FormItem>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={t('商品筛选')} col={2}>
              <CategoryPinleiFilter
                selected={categoryFilter}
                onChange={handleSelect.bind(this, 'categoryFilter')}
              />
            </FormItem>
            <FormItem label={t('报价单')}>
              <MoreSelect
                data={salemenuList.slice()}
                selected={_.has(salemenu, 'id') ? salemenu : null}
                renderListFilterType='pinyin'
                placeholder={t('全部报价单')}
                renderListItem={(v) => (
                  <Flex justifyBetween>
                    <div>{v.text}</div>
                    <div className='gm-text-desc gm-text-12'>
                      {v.type === -1 && t('已删除')}
                    </div>
                  </Flex>
                )}
                onSelect={handleSelect.bind(this, 'salemenu')}
              />
            </FormItem>
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <Button onClick={handleReset}>{t('重置')}</Button>
        </FormButton>
      </FormBlock>
    </BoxForm>
  )
})

export default MerchandiseFilter
