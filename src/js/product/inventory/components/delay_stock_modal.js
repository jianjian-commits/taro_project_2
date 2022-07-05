import React, { useState } from 'react'
import { Flex, InputNumberV2, Select, Button, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const SelectStyled = styled(Select)`
  width: 80px;
`

const InputNumberStyled = styled(InputNumberV2)`
  width: 220px;
`

const DelayStock = (props) => {
  const { isSelectAll, onOk } = props
  const [isSet, setIsSet] = useState(false)
  const [value, setValue] = useState(null)

  const handleOk = () => {
    onOk && onOk({ value, isSet })
    Modal.hide()
  }

  const handleCancel = () => {
    Modal.hide()
  }

  return (
    <Flex column className='gm-margin-lr-10'>
      <span>
        {t('delay_stock_select', {
          VAR1: isSelectAll ? t('所有页') : t('当前页'),
        })}
      </span>
      <Flex alignCenter className='gm-margin-top-10'>
        <SelectStyled
          onChange={setIsSet}
          data={[
            { value: true, text: t('设置') },
            { value: false, text: t('未设置') },
          ]}
          value={isSet}
          isInPopup
        />
        <span className='gm-gap-10' />
        <InputNumberStyled
          onChange={setValue}
          placeholder={t('请输入呆滞预警天数')}
          disabled={!isSet}
          className='form-control gm-margin-right-5'
          value={value}
          precision={0}
          max={999999}
          min={1}
        />
      </Flex>

      <Flex justifyEnd className='gm-margin-top-10'>
        <Button
          type='default'
          className='gm-margin-right-10'
          onClick={handleCancel}
        >
          {t('取消')}
        </Button>

        <Button type='primary' onClick={handleOk}>
          {t('确定')}
        </Button>
      </Flex>
    </Flex>
  )
}

DelayStock.propTypes = {
  isSelectAll: PropTypes.bool,
  onOk: PropTypes.func,
}

export default DelayStock
