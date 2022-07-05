import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  PopupContentConfirm,
  FormItem,
  Form,
  InputNumberV2,
  Validator,
  FormButton,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import globalStore from 'stores/global'
import weightStore from '../../stores/weight'
import { SvgWeight } from 'gm-svg'

const weigh_check = globalStore.groundWeightInfo.weigh_check

const BatchPopConfirm = ({ value, onCancel, onOk }) => {
  const { remain, std_unit, batch_number } = value
  const [new_remain, changeRemain] = useState(undefined)
  const [remark, changeRemark] = useState('')

  const submitRef = useRef()

  const handleSubmit = () => {
    onOk({ batch_number, new_remain, remark }).then(() => {
      onCancel()
    })
  }

  const simulateClick = () => {
    // 由于Form的submit与气泡确认点击分离，所以需要做一个按钮来做模拟点击
    submitRef.current.click()
  }

  return (
    <PopupContentConfirm
      type='save'
      title={t('编辑批次库存')}
      onSave={simulateClick}
      onCancel={onCancel}
    >
      <Form labelWidth='80px' onSubmitValidated={handleSubmit}>
        <FormItem
          label={t('抄盘数')}
          toolTip={
            <div className='gm-padding-lr-10 gm-padding-tb-5'>
              {t('表示当前批次的剩余库存数')}
            </div>
          }
        >
          <div
            style={{
              height: '30px',
              display: 'inline-block',
              lineHeight: '30px',
            }}
          >
            {parseFloat(Big(remain).toFixed(2))}
            {std_unit}
          </div>
        </FormItem>
        <FormItem
          label={t('实盘数')}
          required
          toolTip={
            <div className='gm-padding-lr-10 gm-padding-tb-5'>
              {!!weigh_check && (
                <div style={{ color: 'red' }} className='gm-margin-bottom-5'>
                  {t('点击读磅操作后，读磅数覆盖原有数据')}
                </div>
              )}
              {t(
                '填入需要修改的库存数，若实盘数少于抄盘数，则计入报损记录；若实盘数大于抄盘数，则计入报溢记录。',
              )}
            </div>
          }
          validate={Validator.create([Validator.TYPE.required], new_remain)}
        >
          <InputNumberV2
            value={new_remain}
            style={{ width: '120px', display: 'inline-block' }}
            onChange={changeRemain}
            className='gm-margin-right-5'
            precision={4}
          />
          {std_unit}
          {!!weigh_check && (
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => {
                changeRemain(+(weightStore.data || 0))
              }}
            >
              <SvgWeight style={{ fontSize: '1.4em' }} />
              {t('读磅')}
            </div>
          )}
        </FormItem>
        <FormItem label={t('备注')}>
          <textarea
            rows='4'
            className='form-control'
            value={remark}
            onChange={({ target: { value } }) => changeRemark(value)}
          />
        </FormItem>
        <FormButton>
          <button ref={submitRef} style={{ display: 'none' }}>
            按钮
          </button>
        </FormButton>
      </Form>
    </PopupContentConfirm>
  )
}

BatchPopConfirm.propTypes = {
  value: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func,
}

export default BatchPopConfirm
