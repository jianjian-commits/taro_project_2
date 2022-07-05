import React from 'react'
import {
  FormItem,
  Select,
  FormButton,
  Button,
  BoxForm,
  FormBlock,
  DateRangePicker,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import _ from 'lodash'

import { INVENTORY_CHANGES_TYPE, INVENTORY_EXAMINE_TYPE } from 'common/enum'
import { observer } from 'mobx-react'
import { utils } from './utils'
import store from './store'

const { More } = BoxForm

const inventoryChangeType = () => {
  return _.map(INVENTORY_CHANGES_TYPE(), (item) => ({
    value: item.value,
    text: item.name,
  }))
}

const Filter = observer(() => {
  const {
    q_spu,
    q_sheet_num,
    q_operator,
    change_type,
    examine_type,
    begin,
    end,
  } = store.filter

  const handleReset = (event) => {
    event.preventDefault()
    store.handleResetFilter()
  }
  return (
    <BoxForm labelWidth='70px' onSubmit={utils.handleSearch} btnPosition='left'>
      <FormBlock col={3}>
        <FormItem label={t('按日期')}>
          <DateRangePicker
            begin={begin}
            end={end}
            onChange={utils.handleChangeRangePick}
          />
        </FormItem>
        <FormItem label={t('搜索')} colWidth='240'>
          <input
            type='text'
            className='form-control'
            placeholder={t('请输入商品信息搜索')}
            value={q_spu}
            onChange={(e) => utils.handleChangeText(e, 'q_spu')}
          />
        </FormItem>
        <FormItem colWidth='160'>
          <input
            type='text'
            className='form-control'
            placeholder={t('请输入单据号搜索')}
            value={q_sheet_num}
            onChange={(e) => utils.handleChangeText(e, 'q_sheet_num')}
          />
        </FormItem>
        <FormItem colWidth='160'>
          <input
            type='text'
            className='form-control'
            placeholder={t('请输入操作人搜索')}
            value={q_operator}
            onChange={(e) => utils.handleChangeText(e, 'q_operator')}
          />
        </FormItem>
      </FormBlock>
      <More>
        <FormBlock col={3}>
          <FormItem label={t('变动类型')}>
            <Select
              onChange={utils.handleSelect}
              value={change_type}
              data={inventoryChangeType()}
            />
          </FormItem>
          <FormItem label={t('审核状态')}>
            <Select
              onChange={(value) => {
                store.setFilterExamineType(value)
              }}
              value={examine_type}
              data={INVENTORY_EXAMINE_TYPE}
            />
          </FormItem>
        </FormBlock>
      </More>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <More>
          <div className='gm-gap-10' />
          <Button onClick={handleReset}>{t('重置')}</Button>
        </More>
        <div className='gm-gap-10' />
        <Button onClick={utils.handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
