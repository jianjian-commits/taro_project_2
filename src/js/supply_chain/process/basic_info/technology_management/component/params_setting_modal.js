import React, { useEffect } from 'react'
import { observer } from 'mobx-react'

import ParamsTable from './params_table'
import { Button, Flex, RightSideModal, Affix } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from '../store/receipt_store'
import ErrorTips from './error_tips'
import styled from 'styled-components'

const FlexStyled = styled(Flex)`
  height: 50px;
  background: white;
`

const OperatorButton = observer((props) => {
  const handleCancel = () => {
    RightSideModal.hide()
  }

  const handleSave = () => {
    store.saveParamsListData(props.index)
    RightSideModal.hide()
  }
  return (
    <Affix bottom={0}>
      <FlexStyled row justifyCenter alignCenter className='gm-margin-top-20'>
        <Button className='gm-margin-right-5' onClick={handleCancel}>
          {i18next.t('取消')}
        </Button>
        <div className='gm-gap-20' />
        <Button type='primary' htmlType='submit' onClick={handleSave}>
          {i18next.t('保存')}
        </Button>
      </FlexStyled>
    </Affix>
  )
})

const DeleteTip = () => {
  return (
    <ErrorTips
      tips={i18next.t(
        '提示：删除后，绑定该参数的商品，其商品的参数将重置为空!'
      )}
    />
  )
}

const ParamsSetting = observer((props) => {
  const index = props.index
  useEffect(() => {
    store.initParamsListData(index)
    return store.clearParamsListData
  }, [index])

  return (
    <Flex column>
      <DeleteTip />
      <ParamsTable />
      <OperatorButton index={index} />
    </Flex>
  )
})

export default ParamsSetting
