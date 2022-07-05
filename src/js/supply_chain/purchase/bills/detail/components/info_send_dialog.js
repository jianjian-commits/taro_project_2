import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Modal, Flex, Tip } from '@gmfe/react'
import PropTypes from 'prop-types'
import store from '../store'

@observer
class PurchaseSendDialog extends React.Component {
  handleSaveDraft = (isSend) => {
    const {
      id,
      settle_supplier_id,
      purchaser_id,
      sheet_remark,
      params,
    } = this.props
    store
      .save(id, settle_supplier_id, purchaser_id, sheet_remark, params, isSend)
      .then(() => {
        Tip.success(i18next.t('保存草稿成功'))
      })
    Modal.hide()
  }

  render() {
    return (
      <Flex column>
        <div className='text-left'>
          {i18next.t('是否将已修改单据信息发送给供应商？')}
        </div>
        <div className='gm-gap-10' />
        <Flex justifyEnd className='gm-padding-5'>
          <button
            className='btn btn-default gm-margin-right-10'
            onClick={() => this.handleSaveDraft(0)}
          >
            {i18next.t('不发送，仅保存')}
          </button>
          <button
            className='btn btn-primary'
            onClick={() => this.handleSaveDraft(1)}
          >
            {i18next.t('保存并发送')}
          </button>
        </Flex>
      </Flex>
    )
  }
}

PurchaseSendDialog.propTypes = {
  id: PropTypes.string.isRequired,
  settle_supplier_id: PropTypes.string.isRequired,
  purchaser_id: PropTypes.string,
  sheet_remark: PropTypes.string,
  params: PropTypes.object.isRequired,
}

export default PurchaseSendDialog
