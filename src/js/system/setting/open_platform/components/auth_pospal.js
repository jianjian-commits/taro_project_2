import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { Flex, Modal, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import PospalInfoTable from './pospal_info/index'
import pospalStore from './pospal_info/store'
import store from '../store'

// 非常规授权
const AuthPospal = ({ action, index }) => {
  useEffect(() => {
    pospalStore.setList(action.value || [])
    return () => {
      pospalStore.reset()
    }
  }, [])

  const handleSubmit = () => {
    const { name, action: actionName, sync } = action
    const params = _.map(pospalStore.list, (v) => ({
      ...v,
      customer: {
        customer_id: v.customer.value,
        customer_name: v.customer.text,
      },
    }))
    store
      .updateApp(index, { [`${name}_${actionName}`]: params }, sync)
      .then(() => {
        store.getPlatforms()
        Modal.hide()
      })
  }

  return (
    <Flex column>
      <PospalInfoTable />
      <Flex justifyEnd className='gm-padding-top-15'>
        <div>
          <Button className='gm-margin-right-5' onClick={() => Modal.hide()}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={handleSubmit}>
            {t('授权')}
          </Button>
        </div>
      </Flex>
    </Flex>
  )
}

AuthPospal.propTypes = {
  action: PropTypes.object,
  index: PropTypes.number,
}

export default AuthPospal
