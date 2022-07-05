import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { Button, Modal, Checkbox, Flex } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const StockInModal = (props) => {
  const { onOk, isProcess = false } = props
  const [checked, setChecked] = useState(true)

  const handleSubmit = () => {
    Modal.hide()
    onOk(checked)
  }

  return (
    <>
      <div className='text-center'>
        {isProcess ? (
          <p>{t('确定已有成品可操作入库吗？')}</p>
        ) : (
          <p>{t('当前加工单已生成了待入库单，是否再次入库？')}</p>
        )}

        <p style={{ color: '#f33' }}>
          {t('点击确定后可快速将此加工单转成待入库单')}
        </p>
      </div>
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      >
        {t('合并今日已有成品待入库单')}
      </Checkbox>
      <br />
      <div className='gm-text-red gm-margin-bottom-5'>
        {t(
          '1.勾选，将商品合并进入今日已有成品待入库单，若今日无单则独立生成一个单；',
        )}
        <br />
        {t('2.不勾选，将独立生成一个成品待入库单')}
        <br />
      </div>
      <Flex justifyEnd className='gm-margin-top-5'>
        <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
        <span className='gm-gap-5' />
        <Button htmlType='submit' type='primary' onClick={handleSubmit}>
          {t('确认')}
        </Button>
      </Flex>
    </>
  )
}

StockInModal.propTypes = {
  onOk: PropTypes.func,
  name: PropTypes.string,
  time: PropTypes.string,
  isProcess: PropTypes.bool,
}
export default observer(StockInModal)
