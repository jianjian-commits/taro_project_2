import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  Button,
  Drawer,
  Form,
  FormButton,
  FormItem,
  InputNumberV2,
} from '@gmfe/react'
import store from '../store'

const ScanBarcode = observer(({ onSearch }) => {
  const scanRef = useRef()
  const handleClick = () => {
    const marginTop = scanRef.current.offsetTop
    Drawer.render({
      onHide: Drawer.hide,
      style: { width: '260px', height: '42px', marginTop: marginTop },
      opacityMask: true,
      children: <ScanBarcodeInput onSearch={onSearch} />,
    })
  }

  return (
    <div
      className='b-overview gm-padding-5'
      onClick={handleClick}
      ref={scanRef}
    >
      {t('扫码')}
    </div>
  )
})

ScanBarcode.propTypes = {
  onSearch: PropTypes.func,
}

export default ScanBarcode

const ScanBarcodeInput = observer(({ onSearch }) => {
  const {
    filterReceiveSearchData: { code },
  } = store

  useEffect(() => {
    return () => {
      handleChange(undefined)
    }
  }, [])
  const [error, changeError] = useState(false)

  const handleChange = (value) => {
    store.setReceiveMaterialFilter('code', value)
  }

  const handleSearch = () => {
    if (!code) {
      changeError(true)
      return
    }
    changeError(false)
    onSearch && onSearch()
  }

  return (
    <Form inline className='gm-padding-5' onSubmit={handleSearch}>
      <FormItem className='gm-margin-right-0' error={error}>
        <InputNumberV2
          maxLength={13}
          className='form-control input-sm gm-inline-block'
          onChange={handleChange}
          value={code}
          autoFocus
          precision={0}
          autoComplete='off'
          style={{ width: '200px' }}
          placeholder={t('请扫描规格条码搜索')}
        />
      </FormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </Form>
  )
})

ScanBarcodeInput.propTypes = {
  onSearch: PropTypes.func,
}
