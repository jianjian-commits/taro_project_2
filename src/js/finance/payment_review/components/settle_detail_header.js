import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { t } from 'gm-i18n'
import {
  Tip,
  Price,
  Flex,
  Input,
  Button,
  Modal,
  Form,
  FormItem,
  InputNumberV2,
  FunctionSet,
  RightSideModal,
  Dialog,
} from '@gmfe/react'
import Big from 'big.js'
import SupplierDel from 'common/components/supplier_del_sign'
import actions from '../../../actions'
import { getEnumValue } from 'common/filter'
import { RECEIPT_TYPE } from 'common/enum'
import { receiptTypeTag } from '../util'
import globalStore from 'stores/global'
import PopupPrintModal from './popup_print_modal'
import { PAY_METHOD_ENUM } from '../../../common/enum'

const renderTotal = ({ total_price = 0, delta_money = 0, real_pay = 0 }) => {
  return [
    {
      text: t('待结款金额'),
      value: (
        <Price
          value={
            +Big(total_price)
              .plus(delta_money)
              .minus(real_pay)
              .div(100)
              .toFixed(2)
          }
        />
      ),
    },
    {
      text: t('已结款金额'),
      value: <Price value={+Big(real_pay).div(100).toFixed(2)} />,
    },
    {
      text: t('单据总金额'),
      value: <Price value={Big(total_price).div(100).toFixed(2)} />,
    },
    {
      text: t('折让总金额'),
      value: <Price value={Big(delta_money).div(100).toFixed(2)} />,
    },
  ]
}

const renderHeaderInfo = ({ id }) => {
  return [
    {
      label: t('结款单号'),
      item: <div style={{ width: '280px' }}>{id || '-'}</div>,
    },
  ]
}

const Remark = ({ isSubmit, remark }) => {
  const handleChangeRemark = (e) => {
    actions.payment_review_change_remark(e.target.value)
  }

  return isSubmit ? (
    <Input type='text' value={remark || ''} onChange={handleChangeRemark} />
  ) : (
    remark || '-'
  )
}

Remark.propTypes = {
  isSubmit: PropTypes.bool.isRequired,
  remark: PropTypes.string,
}

const renderContentInfo = ({
  supplier_status,
  settle_supplier_name,
  customer_id,
  isSubmit,
  remark,
  running_number,
  pay_time,
  pay_method,
  status,
}) => {
  return [
    {
      label: t('供应商名称'),
      item: (
        <Flex>
          {supplier_status === 0 && <SupplierDel />}
          {settle_supplier_name}
        </Flex>
      ),
    },
    {
      label: t('供应商编号'),
      item: customer_id,
    },
    {
      label: t('结款单状态'),
      item: getEnumValue(RECEIPT_TYPE, status, 'key'),
      tag: receiptTypeTag(status),
    },
    {
      label: t('结算周期'),
      item: PAY_METHOD_ENUM[pay_method] || '-',
    },
    {
      label: t('结款日期'),
      item: pay_time || '-',
    },
    {
      label: t('交易流水'),
      item: running_number,
    },
    {
      label: t('结款单摘要'),
      item: <Remark isSubmit={isSubmit} remark={remark} />,
    },
  ]
}

class MarkPaymentModal extends React.Component {
  state = {
    payNumber: '', // 交易流水号
    amount: undefined, // 结款金额
    payRemark: '', // 结款备注
  }

  handleSubmit = () => {
    const { settle_sheet_detail } = this.props
    const { id, total_price } = settle_sheet_detail
    const { payNumber, amount, payRemark } = this.state

    actions
      .payment_review_mark_settle_sheet({
        id,
        payNumber,
        amount: Big(amount).times(100),
        payRemark,
        total_price,
      })
      .then(() => {
        actions.payment_review_settle_sheet_detail(id)
      })

    this.handleHideModal()
  }

  handleHideModal = () => {
    Modal.hide()
  }

  render() {
    const { payNumber, amount, payRemark } = this.state
    return (
      <Form labelWidth='120px' onSubmit={this.handleSubmit}>
        <FormItem label={t('填写交易流水号')} required>
          <input
            autoFocus
            value={payNumber}
            onChange={(e) => {
              const pattern = /^[A-Za-z0-9]{1,50}$/
              const value = e.target.value
              if (pattern.test(value) || value === '')
                this.setState({ payNumber: value })
            }}
          />
        </FormItem>
        <FormItem label={t('结款金额')} required>
          <InputNumberV2
            className='form-control'
            value={amount}
            min={-999999999}
            max={999999999}
            precision={2}
            onChange={(value) => this.setState({ amount: value })}
          />
        </FormItem>
        <FormItem label={t('备注')}>
          <textarea
            value={payRemark}
            onChange={(e) => this.setState({ payRemark: e.target.value })}
          />
        </FormItem>
        <Flex
          className='gm-margin-top-10'
          style={{ flexDirection: 'row-reverse' }}
        >
          <Button
            htmlType='submit'
            type='primary'
            disabled={!payNumber || !amount}
          >
            {t('确认')}
          </Button>
          <Button className='gm-margin-right-5' onClick={this.handleHideModal}>
            {t('取消')}
          </Button>
        </Flex>
      </Form>
    )
  }
}

MarkPaymentModal.propTypes = {
  settle_sheet_detail: PropTypes.object.isRequired,
}

const Action = ({ isSubmit, settle_sheet_detail }) => {
  const { status, id } = settle_sheet_detail

  const handleMark = () => {
    Modal.render({
      children: <MarkPaymentModal settle_sheet_detail={settle_sheet_detail} />,
      title: t('标记结款'),
      onHide: Modal.hide,
    })
  }

  const handleSubmit = () => {
    actions
      .payment_review_modify_settle_sheet(
        Object.assign(
          {},
          settle_sheet_detail,
          { sub_sheets: [] },
          { discount: JSON.stringify(settle_sheet_detail.discount) },
          { op: 'submit' },
          { id: id },
        ),
      )
      .then(() => {
        actions.payment_review_settle_sheet_detail(id)
      })
  }

  const handleSaveDraft = () => {
    actions
      .payment_review_modify_settle_sheet(
        Object.assign(
          {},
          settle_sheet_detail,
          { sub_sheets: JSON.stringify(settle_sheet_detail.sub_sheets) },
          { discount: JSON.stringify(settle_sheet_detail.discount) },
          { op: 'save' },
        ),
      )
      .then(() => {
        Tip.success(t('保存成功'))
        actions.payment_review_settle_sheet_detail(id)
      })
  }

  const handlePrint = () => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: <PopupPrintModal id={id} closeModal={RightSideModal.hide} />,
    })
  }

  const handleExport = () => {
    window.open('/stock/settle_sheet/export?id=' + id)
  }

  const handleRefuse = () => {
    actions
      .payment_review_reject_settle_sheet({
        id: id,
      })
      .then(() => {
        actions.payment_review_settle_sheet_detail(id)
      })
  }

  const handleCancelPay = () => {
    actions
      .payment_review_cancel_settle_sheet_pay({ id: id, op: 'unpay' })
      .then(() => {
        actions.payment_review_settle_sheet_detail(id)
      })
  }

  const handleCancel = () => {
    Dialog.confirm({
      children: t('是否删除此单据?'),
      title: t('确认删除'),
    }).then(
      () => {
        actions.payment_review_del_settle_sheet({ id: id }).then(() => {
          actions.payment_review_settle_sheet_detail(id)
        })
      },
      () => {},
    )
  }

  return (
    <>
      {isSubmit ? (
        <Button
          type='primary'
          className='gm-margin-right-5 gm-margin-tb-5'
          onClick={handleSubmit}
        >
          {t('提交结款单')}
        </Button>
      ) : undefined}
      {(status === 2 || status === 3) && (
        <Button
          type='primary'
          className='gm-margin-right-5 gm-margin-tb-5'
          onClick={handleMark}
        >
          {t('标记结款')}
        </Button>
      )}

      <FunctionSet
        right
        data={[
          {
            text: t('保存草稿'),
            onClick: handleSaveDraft,
            show: status === 1,
          },
          {
            text: t('打印结款单'),
            onClick: handlePrint,
            show: globalStore.hasPermission('print_settle'),
          },
          {
            text: t('导出结款单'),
            onClick: handleExport,
          },
          {
            text: t('审核不通过'),
            onClick: handleRefuse,
            show: settle_sheet_detail.status === 2,
          },
          {
            text: t('取消结款'),
            onClick: handleCancelPay,
            show: status === 4 || status === 3,
          },
          {
            text: t('红冲'),
            onClick: handleCancel,
            show: settle_sheet_detail.status !== -1,
          },
        ]}
      />
    </>
  )
}

Action.propTypes = {
  settle_sheet_detail: PropTypes.object.isRequired,
  isSubmit: PropTypes.bool.isRequired,
}

const Header = (props) => {
  const {
    total_price,
    delta_money,
    real_pay,
    id,
    status,
    remark,
    running_number,
    pay_time,
    pay_method,
    supplier_status,
    settle_supplier_name,
    customer_id,
  } = props.data
  const isSubmit = status === 0 || status === 1

  const getTotal = useMemo(() => {
    return renderTotal({ total_price, delta_money, real_pay })
  }, [total_price, delta_money, real_pay])

  const getHeaderInfo = useMemo(() => {
    return renderHeaderInfo({ id })
  }, [id])

  const getContentInfo = useMemo(() => {
    return renderContentInfo({
      supplier_status,
      settle_supplier_name,
      customer_id,
      isSubmit,
      remark,
      running_number,
      pay_time,
      status,
      pay_method,
    })
  }, [
    supplier_status,
    settle_supplier_name,
    customer_id,
    isSubmit,
    remark,
    running_number,
    pay_time,
    pay_method,
    status,
  ])

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={65}
      contentCol={3}
      HeaderInfo={getHeaderInfo}
      HeaderAction={
        <Action isSubmit={isSubmit} settle_sheet_detail={props.data} />
      }
      ContentInfo={getContentInfo}
      totalData={getTotal}
    />
  )
}

Header.propTypes = {
  data: PropTypes.object,
}

export default Header
