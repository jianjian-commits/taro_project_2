import React from 'react'
import { i18next } from 'gm-i18n'
import { Tip, Flex, Modal, Button } from '@gmfe/react'
import store from '.././store'
import PaymentSlipTable from './payment_slip_table_modal'
import PropTypes from 'prop-types'

const PaymentModal = (props) => {
  const { countList } = props
  const { selectedList, fetchList, paymentSelected } = store

  // 新建结款单或加入已存在结款单 isAdd：true为新建，false为加入已存在
  const handleAddCount = () => {
    const params = {
      op: 'add',
      sheet_nos: JSON.stringify(Array.from(selectedList)),
      settle_supplier_id: countList[0].settle_supplier_id,
    }

    store.handleSettleCount(params).then((json) => {
      Tip.success(
        i18next.t('KEY19', {
          VAR1: json.data.sheet_no,
        }) /* src:'加入结款单' + json.data.sheet_no + '成功' => tpl:加入结款单${VAR1}成功 */,
      )
      fetchList()
    })
  }

  const handleAppendCount = () => {
    const params = {
      op: 'append',
      sheet_nos: JSON.stringify(Array.from(selectedList)),
      id: store.paymentSelected[0],
      settle_supplier_id: countList[0].settle_supplier_id,
    }

    store.handleSettleCount(params).then((json) => {
      Tip.success(
        i18next.t('KEY19', {
          VAR1: paymentSelected,
        }),
      )
      fetchList()
    })
  }

  const handleAddExistCountList = () => {
    Modal.hide()
    Modal.render({
      title: i18next.t('加入结款单'),
      onHide: Modal.hide,
      children: (
        <PaymentSlipTable
          onOk={() => {
            handleAppendCount()
            Modal.hide()
          }}
          onCancel={() => Modal.hide()}
        />
      ),
    })
  }

  return (
    <div>
      <span>
        {i18next.t('当前供应商已有待提交结款单，是否加入已有结款单?')}
      </span>
      <Flex
        className='gm-margin-top-10'
        style={{ flexDirection: 'row-reverse' }}
      >
        <Button type='primary' onClick={() => handleAddExistCountList()}>
          {i18next.t('加入已有结款单')}
        </Button>
        <Button
          className='gm-margin-right-5'
          onClick={() => {
            handleAddCount(true)
            Modal.hide()
          }}
        >
          {i18next.t('新建结款单')}
        </Button>
      </Flex>
    </div>
  )
}

PaymentModal.propTypes = {
  countList: PropTypes.array,
}

export default PaymentModal
