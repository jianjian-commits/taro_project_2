import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import store from '../store'
import { Button, Checkbox, Flex, Popover } from '@gmfe/react'
import { t } from 'gm-i18n'

const Extend = () => {
  const {
    params: { aggregate_by_day },
    mergeParams,
    paginationRef,
  } = store
  const popoverRef = useRef()
  const handleCheck = (checked) => {
    mergeParams('aggregate_by_day', checked)
    popoverRef.current.apiDoSetActive()
    paginationRef.current.apiDoFirstRequest()
  }

  return (
    <Popover
      ref={popoverRef}
      right
      popup={<Popup onChange={handleCheck} value={aggregate_by_day} />}
    >
      <Button plain type='primary'>
        {t('展开查看')}
      </Button>
    </Popover>
  )
}

export default observer(Extend)

const View = styled.div`
  min-width: 250px;
  min-height: 100px;
`

const Popup = ({ value, onChange }) => {
  const [checked, setChecked] = useState(!!value)

  const handleCheck = (event) => {
    const { checked } = event.target
    setChecked(checked)
  }

  const handleConfirm = () => {
    onChange(+checked)
  }

  return (
    <View className='gm-margin-10 gm-padding-10 gm-border'>
      <Checkbox checked={checked} onChange={handleCheck}>
        {t('按每日')}
      </Checkbox>
      <Flex justifyEnd className='gm-margin-top-20'>
        <Button type='primary' onClick={handleConfirm}>
          {t('确定')}
        </Button>
      </Flex>
    </View>
  )
}

Popup.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}
