import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import {
  PRODUCT_ACTION_TYPE,
  PRODUCT_METHOD_TYPE,
  PRODUCT_REASON_TYPE,
} from '../../../../common/enum'
import { InputNumber } from '@gmfe/react'
import { TreeSelect } from '@gmfe/react-deprecated'
import { t } from 'gm-i18n'
import store from '../store/receipt_store'

const ShareFormDialog = observer(() => {
  const { stockInShareProductList } = store
  const { money, in_sku_logs } = store.stockInOperatedShare

  const handleReasonChange = (e) => {
    store.changeOperatedShareItem('reason', e.target.value)
  }

  const handleActionChange = (e) => {
    store.changeOperatedShareItem('action', e.target.value)
  }

  const handleMoneyChange = (value) => {
    store.changeOperatedShareItem('money', value)
  }

  const handleRemarkChange = (e) => {
    store.changeOperatedShareItem('remark', e.target.value)
  }

  const handleMethodChange = (e) => {
    store.changeOperatedShareItem('method', e.target.value)
  }

  const handleShareProductSelect = (selected) => {
    // store.changeOperatedShareItem('selected', selected)
    store.changeOperatedShareItem('in_sku_logs', selected)
  }

  return (
    <div className='form-horizontal gm-padding-15'>
      <div className='form-group'>
        <label htmlFor='share-reason' className='col-sm-3 control-label'>
          {t('分摊原因')}：
        </label>
        <div className='col-sm-9'>
          <select
            onChange={handleReasonChange}
            id='share-reason'
            className='form-control input-sm'
          >
            <option value='0'>{t('请选择')}</option>
            {_.map(PRODUCT_REASON_TYPE, (value, key) => {
              return (
                <option value={key} key={key}>
                  {value}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='share-action' className='col-sm-3 control-label'>
          {t('分摊类型')}：
        </label>
        <div className='col-sm-9'>
          <select
            onChange={handleActionChange}
            id='share-action'
            className='form-control input-sm'
          >
            <option value='0'>{t('请选择')}</option>
            {_.map(PRODUCT_ACTION_TYPE, (value, key) => {
              return (
                <option value={key} key={key}>
                  {value}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='share-money' className='col-sm-3 control-label'>
          {t('分摊金额')}：
        </label>
        <div className='col-sm-9'>
          <InputNumber
            min={0}
            onChange={handleMoneyChange}
            value={money}
            className='form-control'
            placeholder={t('金额')}
            precision={2}
          />
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='share-method' className='col-sm-3 control-label'>
          {t('分摊方式')}：
        </label>
        <div className='col-sm-9'>
          {_.map(PRODUCT_METHOD_TYPE, (value, key) => {
            return (
              <label key={key} className='radio-inline'>
                <input
                  type='radio'
                  value={key}
                  defaultChecked={key === '1'}
                  onChange={handleMethodChange}
                  name='share-method'
                />
                {value}
              </label>
            )
          })}
        </div>
      </div>
      <div className='form-group'>
        <label htmlFor='share-method' className='col-sm-3 control-label'>
          {t('分摊商品')}：
        </label>
        <div className='col-sm-9'>
          <TreeSelect
            list={stockInShareProductList.slice()}
            label={t('选择全部商品')}
            disabledSelected={false}
            selected={in_sku_logs.slice()}
            onSelect={handleShareProductSelect}
          />
        </div>
      </div>
      <div className='form-group'>
        <label htmlFor='share-remark' className='col-sm-3 control-label'>
          {t('备注')}：
        </label>
        <div className='col-sm-9'>
          <textarea
            onChange={handleRemarkChange}
            className='form-control'
            id='share-remark'
          />
        </div>
      </div>
    </div>
  )
})

export default ShareFormDialog
