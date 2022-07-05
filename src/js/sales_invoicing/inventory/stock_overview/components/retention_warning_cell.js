import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { TableUtil } from '@gmfe/table'
import _ from 'lodash'
import store from '../store'
import EditCellConfirm from './edit_cell_confirm'

const { EditButton } = TableUtil

const isNotSet = (data) => data === null || data === undefined || data === ''

const RetentionWaringCell = (props) => {
  const {
    original,
    original: { retention_warning, retention_warning_day },
  } = props

  const handlePageChange = () => {
    return store.apiDoFirstRequest()
  }

  return (
    <Flex
      style={
        retention_warning && !_.isNil(retention_warning_day)
          ? {
              color: '#fff',
              backgroundColor: 'red',
              padding: '2px',
              marginBottom: 0,
            }
          : {}
      }
    >
      <div>
        {isNotSet(retention_warning_day)
          ? t('未设置')
          : parseFloat(Big(retention_warning_day).toFixed(2)) + t('天')}
      </div>

      <EditButton
        popupRender={(close) => (
          <EditCellConfirm
            value={original}
            onCancel={close}
            onOk={handlePageChange}
            type='delayStock'
          />
        )}
      />
    </Flex>
  )
}

RetentionWaringCell.propTypes = {
  original: PropTypes.object,
}

export default observer(RetentionWaringCell)
