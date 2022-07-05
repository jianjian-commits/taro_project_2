import React, { useState } from 'react'
import { Flex, InputNumberV2, Select, Button, Modal, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import _ from 'lodash'

const SelectStyled = styled(Select)`
  width: 80px;
`
const SpanStyled = styled.span`
  width: 60px;
`

const InputNumberStyled = styled(InputNumberV2)`
  width: 220px;
`

const SafeStock = (props) => {
  const { isSelectAll, onOk } = props
  const [isSetUp, setIsSetUp] = useState(true)
  const [isSetDown, setIsSetDown] = useState(true)
  const [upValue, setUpValue] = useState(null)
  const [downValue, setDownValue] = useState(null)

  const handleOk = () => {
    const isBothSet = isSetUp && isSetDown
    if (
      isBothSet &&
      !_.isNil(upValue) &&
      !_.isNil(downValue) &&
      upValue < downValue
    ) {
      Tip.warning('安全库存下限不能大于上限')
      return
    }
    onOk && onOk({ upValue, downValue, isSetUp, isSetDown })
    Modal.hide()
  }

  const handleCancel = () => {
    Modal.hide()
  }

  return (
    <Flex column className='gm-margin-lr-10'>
      <span>
        {t('safe_stock_select', {
          VAR1: isSelectAll ? t('所有页') : t('当前页'),
        })}
      </span>
      <Flex alignCenter className='gm-margin-top-10'>
        <SelectStyled
          onChange={setIsSetUp}
          data={[
            { value: true, text: t('设置') },
            { value: false, text: t('未设置') },
          ]}
          value={isSetUp}
          isInPopup
        />
        <span className='gm-gap-10' />
        <SpanStyled>{t('库存上限：')}</SpanStyled>
        <InputNumberStyled
          onChange={setUpValue}
          placeholder={t('请输入库存上限')}
          disabled={!isSetUp}
          className='form-control gm-margin-right-5'
          value={upValue}
          max={999999}
          min={0}
        />
      </Flex>
      <Flex alignCenter className='gm-margin-top-10'>
        <SelectStyled
          onChange={setIsSetDown}
          data={[
            { value: true, text: t('设置') },
            { value: false, text: t('未设置') },
          ]}
          value={isSetDown}
          isInPopup
        />
        <span className='gm-gap-10' />
        <SpanStyled>{t('库存下限：')}</SpanStyled>
        <InputNumberStyled
          onChange={setDownValue}
          placeholder={t('请输入库存下限')}
          disabled={!isSetDown}
          className='form-control gm-margin-right-5'
          value={downValue}
          max={999999}
          min={-999999}
        />
      </Flex>
      <div className='gm-margin-top-10'>
        {t('说明：库存上下限为空时不改动原有配置')}
      </div>

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

SafeStock.propTypes = {
  isSelectAll: PropTypes.bool,
  onOk: PropTypes.func,
}

export default SafeStock
