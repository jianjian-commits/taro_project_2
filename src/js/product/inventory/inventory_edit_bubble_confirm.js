import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  FormItem,
  Flex,
  FormButton,
  Button,
  Validator,
  Tip,
  InputNumberV2,
} from '@gmfe/react'
import SvgWeight from 'gm-svg/src/Weight'
import weightStore from '../../stores/weight'
import { t } from 'gm-i18n'
import globalStore from '../../stores/global'
import Big from 'big.js'
import './actions'
import './reducer'
import actions from '../../actions'

const { weigh_check } = globalStore.groundWeightInfo
const InventoryEditBubbleConfirm = ({ data, onCancel, onOk }) => {
  const { remain, std_unit_name, spu_id } = data
  const [new_stock, changeStock] = useState(undefined)
  const [remark, changeRemark] = useState(undefined)

  const handleReadPounds = () => {
    changeStock((new_stock || 0) + (weightStore.data || 0))
  }

  const handleCancel = (event) => {
    event.preventDefault()
    onCancel()
  }

  const handleOk = () => {
    actions
      .product_inventory_stock_edit({ spu_id, new_stock, remark })
      .then(() => {
        Tip.success(t('修改库存成功'))
        onOk()
        onCancel()
      })
  }

  return (
    <div className='gm-padding-tb-15'>
      <div
        style={{
          borderLeft: '3px solid #56a3f2',
          paddingLeft: '10px',
          marginLeft: '37px',
          marginBottom: '20px',
        }}
      >
        {t('库存盘点')}
      </div>
      <Form
        labelWidth='80px'
        className='gm-margin-lr-20 gm-margin-tb-15'
        onSubmitValidated={handleOk}
      >
        <FormItem label={t('抄盘数')} unLabelTop>
          <div>
            {parseFloat(Big(remain).toFixed(2))}
            {std_unit_name}
          </div>
        </FormItem>
        <FormItem
          label={t('实盘数')}
          required
          toolTip={
            <div className='gm-padding-tb-15 gm-padding-lr-20'>
              {!!weigh_check && (
                <div style={{ color: 'red' }}>
                  {t('点击读磅操作后，读磅数覆盖原有数据')}
                </div>
              )}
              <div>
                {t(
                  '实盘数小于抄盘数的数据将计入报损记录，实盘数大于抄盘数的数据将计入报溢记录',
                )}
              </div>
            </div>
          }
          validate={Validator.create(Validator.TYPE.required, new_stock)}
        >
          <Flex alignCenter>
            <InputNumberV2
              onChange={(value) => changeStock(value)}
              value={new_stock}
              style={{ width: '170px' }}
              className='form-control'
              max={999999}
            />
            {std_unit_name}
            {!!weigh_check && (
              <div
                className='gm-cursor gm-margin-left-5'
                onClick={handleReadPounds}
              >
                <SvgWeight style={{ fontSize: '1.4em' }} />
                {t('读磅')}
              </div>
            )}
          </Flex>
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
          <Flex justifyEnd>
            <Button onClick={handleCancel}>{t('取消')}</Button>
            <div className='gm-gap-10' />
            <Button type='primary' htmlType='submit'>
              {t('确定')}
            </Button>
          </Flex>
        </FormButton>
      </Form>
    </div>
  )
}

InventoryEditBubbleConfirm.propTypes = {
  data: PropTypes.object.isRequired,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}
export default InventoryEditBubbleConfirm
