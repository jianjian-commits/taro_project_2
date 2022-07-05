import React, { useContext } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { storeContext } from './details_component'
import { InputNumberV2 } from '@gmfe/react'

const InputNumber = styled(InputNumberV2)`
  width: 180px;
`

const ToSplitCountCell = () => {
  const {
    splitPlan,
    stdUnitName,
    setSourceQuantity,
    sourceQuantity,
    viewType,
  } = useContext(storeContext)

  if (!splitPlan) {
    return '-'
  }

  if (viewType === 'details') {
    return `${sourceQuantity}${stdUnitName}`
  }

  const handleChange = (value) => {
    setSourceQuantity(value)
  }

  return (
    <>
      <InputNumber
        value={sourceQuantity}
        onChange={handleChange}
        placeholder={t('填写数量')}
        className='form-control'
      />
      {stdUnitName}
    </>
  )
}

export default observer(ToSplitCountCell)
