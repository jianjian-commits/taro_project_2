import React, { useEffect, useState } from 'react'
import { Select, Button, Flex, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import store from '../store'

const FreightModal = observer(() => {
  const [freightId, setFreightId] = useState('')
  useEffect(() => {
    store.getFreightList()
  }, [])

  const handleOk = () => {
    store.setMemberFreight(freightId)
    Modal.hide()
  }

  const handleSelect = val => {
    setFreightId(val)
  }

  return (
    <Flex column alignCenter>
      <div className='gm-margin-20'>
        <span>{t('运费模板：')}</span>
        <FreightSelected
          value={freightId || store.member_freight_id}
          data={store.freight_list.slice()}
          onChange={handleSelect}
        />
      </div>
      <div>
        <Button type='default' onClick={Modal.hide}>
          {t('取消')}
        </Button>
        <Button type='primary' className='gm-margin-left-10' onClick={handleOk}>
          {t('保存')}
        </Button>
      </div>
    </Flex>
  )
})

const FreightSelected = styled(Select)`
  width: 260px;
`

export default FreightModal
