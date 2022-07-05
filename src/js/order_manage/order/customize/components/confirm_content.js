import { t } from 'gm-i18n'
import React, { useState } from 'react'
import { Button, Checkbox, Flex } from '@gmfe/react'
import PropTypes from 'prop-types'

const ConfirmContent = ({ onSuccess, original, onCancel }) => {
  const [checked, setChecked] = useState(false)
  function handleChecked() {
    const bool = !checked
    setChecked(bool)
  }

  function handleOk() {
    onSuccess()
  }
  return (
    <div>
      <div>
        <div className='gm-margin-bottom-5'>
          {t('确定要删除选项：') + original.name || '-' + '?'}
        </div>
        <div className='gm-text-red gm-margin-bottom-5'>
          {t('1. 删除选项后，已有订单中的选中该选项的字段将无法正常显示；')}
          <br />
          {t('2. 删除后新创建订单，该字段选项列表中，将不再展示该选项；')}
          <br />
          {t('3. 删除选项后，相关数据将无法恢复。请谨慎操作；')} <br />
        </div>
        <Checkbox checked={checked} onChange={handleChecked}>
          {t('我已阅读以上提示，确认要删除该选项')}
        </Checkbox>
      </div>
      <Flex justifyEnd className='gm-margin-top-5'>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <span className='gm-gap-5' />
        <Button
          htmlType='submit'
          type='primary'
          onClick={handleOk}
          disabled={!checked}
        >
          {t('确认')}
        </Button>
      </Flex>
    </div>
  )
}

ConfirmContent.propTypes = {
  original: PropTypes.object,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
}

export default ConfirmContent
