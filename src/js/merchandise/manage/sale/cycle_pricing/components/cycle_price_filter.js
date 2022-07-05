/**
 * @description 周期定价表筛选
 */
import React from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormItem,
  FormBlock,
  Select,
  DateRangePicker,
  Button,
  FormButton,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from '../store'
import { STATUS_TYPE } from '../enum'
import CyclePriceSalemenuSelect from './cycle_price_salemenu_select'

function CyclePriceFilter(props) {
  const {
    cyclePriceFilter: {
      rule_status,
      start_time,
      end_time,
      rule_name,
      salemenu_id,
      salemenu_name,
    },
  } = store

  function handleInputKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleFilterChange()
    }
  }

  // 当非input框的筛选条件发上变化时，sendReq为true，向后台请求对应数据
  function handleFilterChange(ruleObj = {}) {
    if (ruleObj.rule_name !== undefined) {
      ruleObj.rule_id = ''
    }
    store.filterChange(ruleObj)
  }

  return (
    <>
      <BoxForm
        onSubmit={() => store.doCyclePriceFirstRequest()}
        btnPosition='left'
        labelWidth='90px'
      >
        <FormBlock col={3}>
          <FormItem label={i18next.t('状态筛选')}>
            <Select
              data={STATUS_TYPE}
              value={rule_status}
              onChange={(value) => handleFilterChange({ rule_status: value })}
            />
          </FormItem>
          <FormItem label={i18next.t('报价单')}>
            <CyclePriceSalemenuSelect
              salemenuId={salemenu_id}
              salemenuName={salemenu_name}
              type='filter'
            />
          </FormItem>
          <FormItem label={i18next.t('生效时间')}>
            <DateRangePicker
              begin={start_time}
              end={end_time}
              onChange={(start_time, end_time) =>
                handleFilterChange({ start_time, end_time })
              }
            />
          </FormItem>
          <FormItem label={i18next.t('规则名')}>
            <input
              className='form-control'
              type='text'
              value={rule_name}
              name='text'
              placeholder={i18next.t('输入定价规则名称')}
              onChange={(e) =>
                handleFilterChange({ rule_name: e.target.value })
              }
              onKeyDown={handleInputKeyDown}
            />
          </FormItem>
        </FormBlock>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
        </FormButton>
      </BoxForm>
    </>
  )
}

export default observer(CyclePriceFilter)
