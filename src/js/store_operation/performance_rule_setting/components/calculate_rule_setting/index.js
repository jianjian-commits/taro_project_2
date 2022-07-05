/*
 * @Description: 计件和计重规则设置组件
 */
import React from 'react'
import PropTypes from 'prop-types'
import {
  FormPanel,
  Form,
  FormItem,
  RadioGroup,
  Radio,
  Button,
  Flex,
  RightSideModal,
} from '@gmfe/react'
import { t } from 'gm-i18n'

import SkuTransferModal from '../sku_transfer_modal'
import CalculateRuleTable from '../rule_table'

const TIP_LIST = [
  t(
    '取任务数：表明需要分拣的任务，客户下单2斤白菜，10箱萝卜，实际出库1斤白菜，9箱萝卜，任务数为2；',
  ),
  t(
    '取分拣出库数：表明实际分拣的结果数，客户下单2斤白菜，10箱萝卜，实际出库1斤白菜，9箱萝卜，分拣出库数为10（1+9=10）',
  ),
]
function CalculateRuleSetting(props) {
  const {
    // 是否计件
    isPiece,
    formRef,
    piece_method,
    list,
    disabled,
  } = props

  const { onRadioChange, onDeleteRow, onAddRow, onChange } = props

  function showMerchanseDialog() {
    if (disabled) {
      return
    }
    RightSideModal.render({
      title: t(isPiece ? '设置计件商品' : '设置计重商品'),
      children: <SkuTransferModal isPiece={isPiece} />,
      onHide: RightSideModal.hide,
    })
  }

  return (
    <FormPanel title={t(isPiece ? '计件规则设置' : '计重规则设置')}>
      <Form ref={formRef} labelWidth='180px' disabledCol>
        {isPiece && (
          <FormItem label={isPiece ? '计件方式' : '计重方式'}>
            <RadioGroup
              inline
              name='piece_method'
              value={piece_method}
              onChange={onRadioChange}
            >
              <Radio value={1} disabled={disabled}>
                {t('取任务数')}
              </Radio>
              <Radio value={2} disabled={disabled}>
                {t('取分拣出库数')}
              </Radio>
            </RadioGroup>
            <div className='gm-text-desc gm-margin-top-5'>
              {TIP_LIST.map((tip) => (
                <div key={tip}>{tip}</div>
              ))}
            </div>
          </FormItem>
        )}
        <FormItem label={t(isPiece ? '设置计件商品' : '设置计重商品')}>
          <Flex>
            <Button type='link' onClick={showMerchanseDialog}>
              {t('点此设置')}
            </Button>
          </Flex>
          <div className='gm-text-desc'>
            {t(
              '设置商品绩效方式，此处确认后将直接保存设置并同步修改商品库商品设置，请谨慎操作！',
            )}
          </div>
        </FormItem>
        <FormItem label={t(isPiece ? '计件结算规则' : '计重结算规则')}>
          <CalculateRuleTable
            data={list}
            isPiece={isPiece}
            onAddRow={onAddRow}
            onDeleteRow={onDeleteRow}
            onChange={onChange}
            disabled={disabled}
          />
        </FormItem>
      </Form>
    </FormPanel>
  )
}

CalculateRuleSetting.propTypes = {
  isPiece: PropTypes.bool,
  formRef: PropTypes.object,
  piece_method: PropTypes.number,
  list: PropTypes.array,
  disabled: PropTypes.bool,
  onRadioChange: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onAddRow: PropTypes.func,
  onChange: PropTypes.func,
}
export default CalculateRuleSetting
