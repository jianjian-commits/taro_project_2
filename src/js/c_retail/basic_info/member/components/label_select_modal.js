import React, { useEffect, useState } from 'react'
import { Select, Button, Flex, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import _ from 'lodash'
import styled from 'styled-components'

import store from '../store'

const LabelSelectModal = observer(({ onOk }) => {
  const [select, setSelect] = useState(-1)
  useEffect(() => {
    store.getUserLabelList({ limit: 0 })
  }, [])

  const handleOk = () => {
    onOk(select)
    Modal.hide()
  }

  const handleSelect = val => {
    setSelect(val)
  }
  const { list_label } = store
  const new_list_label = _.concat(
    [{ value: -1, text: '设置空标签' }],
    list_label.slice()
  )

  return (
    <Flex column alignCenter>
      <div className='gm-margin-20'>
        <span>{t('客户标签：')}</span>
        <FreightSelected
          value={select}
          data={new_list_label.slice()}
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

LabelSelectModal.propTypes = {
  onOk: PropTypes.func.isRequired
}

const FreightSelected = styled(Select)`
  width: 260px;
`

export default LabelSelectModal
