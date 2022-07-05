import React, { useState } from 'react'
import { Checkbox, Button, Flex, Modal } from '@gmfe/react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'

const UpdateCardModal = observer(({ onOk }) => {
  const [agree, setAgree] = useState(false)

  const handleOk = () => {
    onOk()
    Modal.hide()
  }

  const handleCheck = () => {
    setAgree(!agree)
  }

  return (
    <div>
      <div className='gm-padding-10'>
        <p>{t('请确定已做好如下设置，否则消费者权益可能受影响；')}</p>
        <p>{t('1.会员卡定价改动可能会对已购买的客户产生影响；')}</p>
        <p>{t('2.会员的运费,折扣商品,优惠券已有设置；')}</p>
        <p>
          {t(
            '3.会员卡开启后消费者可购买，会员卡关闭后不可购买且无法看到相关权益；'
          )}
        </p>
        <Flex alignCenter>
          <Checkbox
            checked={agree}
            onChange={handleCheck}
            className='station-tree-checkbox'
          />
          <span>{t('我已阅读以上提示，确认要更新会员卡设置')}</span>
        </Flex>
      </div>
      <Flex justifyEnd>
        <Button type='default' onClick={Modal.hide}>
          {t('取消')}
        </Button>
        <Button
          type='primary'
          disabled={!agree}
          className='gm-margin-left-10'
          onClick={handleOk}
        >
          {t('确认')}
        </Button>
      </Flex>
    </div>
  )
})

UpdateCardModal.propTypes = {
  onOk: PropTypes.func.isRequired
}

export default UpdateCardModal
