import React, { useState } from 'react'
import { t } from 'gm-i18n'
import {
  Form,
  FormItem,
  Price,
  InputNumberV2,
  Flex,
  Input,
  PopupContentConfirm,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import weightStore from '../../../stores/weight'
import { SvgWeight } from 'gm-svg'
import globalStore from '../../../stores/global'
import Big from 'big.js'
import { observer } from 'mobx-react'

const EditAmountModal = observer((props) => {
  const { data, type, onCancel, onSubmit } = props
  const weigh_check = globalStore.groundWeightInfo.weigh_check

  let amountAndUnit = null

  if (type === 'material') {
    amountAndUnit = parseFloat(data.amount) + data.unit_name
  } else if (type === 'product') {
    amountAndUnit =
      Big(data.amount || 0)
        .div(data.ratio)
        .toFixed(2) + data.sale_unit_name
  }

  const [remark, setRemark] = useState('')
  const [amount, setAmount] = useState(null)

  const handleReadingPound = () => {
    const weightBridgeData =
      type === 'product'
        ? Big(weightStore.data || 0).div(data.ratio)
        : +(weightStore.data || 0)

    setAmount(weightBridgeData)
  }

  const handleSubmit = () => {
    const submitData = { ...data, currentAmount: amount, currentRemark: remark }
    onSubmit(submitData)
    onCancel()
  }

  return (
    <PopupContentConfirm
      type='save'
      title={t('编辑批次库存')}
      onSave={handleSubmit}
      onCancel={onCancel}
    >
      <Form
        className='gm-margin-lr-10'
        onSubmit={handleSubmit}
        labelWidth='96px'
        disabledCol
      >
        <FormItem label={t('商品名')} unLabelTop>
          <div>{data.name}</div>
        </FormItem>
        <FormItem label={t('商品分类')} unLabelTop>
          <div>{data.category_name_2}</div>
        </FormItem>
        <FormItem label={t('所选批次')} unLabelTop>
          <div>{data.batch_num}</div>
        </FormItem>
        {type === 'material' && (
          <FormItem label={t('批次库存均价')} unLabelTop>
            <div>
              {parseFloat(data.avg_price) +
                Price.getUnit() +
                '/' +
                data.unit_name}
            </div>
          </FormItem>
        )}

        {type === 'product' && (
          <FormItem label={t('入库单价')} unLabelTop>
            <div>
              {parseFloat(data.unit_price) +
                Price.getUnit() +
                '/' +
                data.unit_name}
            </div>
          </FormItem>
        )}

        <FormItem label={t('抄盘数')} unLabelTop>
          <div>{amountAndUnit}</div>
          <div className='gm-text-desc'>{t('表示当前批次的剩余库存数')}</div>
        </FormItem>
        <FormItem label={t('实盘数')}>
          <Flex column justifyCenter>
            <InputNumberV2
              style={{ width: '250px', marginRight: '5px' }}
              value={amount}
              onChange={(value) => {
                setAmount(value)
              }}
              className='form-control'
            />
            {!!weigh_check && type !== 'product' && (
              <div
                style={{ cursor: 'pointer', marginLeft: '5px' }}
                onClick={handleReadingPound}
              >
                <SvgWeight style={{ fontSize: '1.4em' }} />
                {t('读磅')}
              </div>
            )}
            {!!weigh_check && type !== 'product' && (
              <div style={{ color: 'red', fontSize: '12px' }}>
                {t('点击读磅操作后，读磅数覆盖原有数据')}
              </div>
            )}
            <div className='gm-text-desc'>
              {t(
                '填入需要修改的库存数，实盘数少于抄盘数计入报损记录，实盘数大于抄盘数计入报溢记录'
              )}
            </div>
          </Flex>
        </FormItem>
        <FormItem label={t('备注')}>
          <Input
            type='text'
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className='form-control'
            style={{ width: '250px' }}
          />
        </FormItem>
      </Form>
    </PopupContentConfirm>
  )
})

EditAmountModal.propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default EditAmountModal
