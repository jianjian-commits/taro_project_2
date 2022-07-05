import React from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Dialog,
  Price,
  Tip,
  DatePicker,
  FunctionSet,
  Modal,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from './store'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { history } from '../../../../common/service'
import { closeWindowDialog } from '../../util'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { receiptTypeTag } from '../../../stock_out/product/util'
import moment from 'moment'
import { FINISHED_PRODUCT_STATUS } from 'common/enum'
import SubmitModal from './components/submit_modal'

const HeaderAction = observer((props) => {
  const {
    status,
    sheetDetail,
    sheetDetail: { id, is_frozen },
  } = store

  const handleDelete = () => {
    Dialog.confirm({
      children: t('是否删除此单据?'),
      title: t('确认删除'),
    }).then(() => {
      store.handleDelete(id).then(() => {
        if (status === 'add') {
          history.push(`/sales_invoicing/stock_in/product/add?id=${id}`)
        }
      })
    })
  }

  // 保存草稿
  const handleSaveDraft = () => {
    // 校验是否填写商品明细
    return store.handleSubmit(1)?.then((json) => {
      if (json.code === 20) {
        store.doShelfError(json.msg)
      } else {
        Tip.success(t('保存成功'))
      }
    })
  }

  /**
   * 提交入库单
   * @param {bool} isShowClosePage 是否显示关闭窗口提示
   */
  const handleEnsureSubmit = (isShowClosePage) => {
    // 校验加工是否有已完成的加工单
    return store.handleSubmit(2).then((json) => {
      if (json.code === 20) store.doShelfError(json.msg)

      if (isShowClosePage) {
        if (json.data?.proc_order_info?.length) {
          Modal.render({
            children: (
              <SubmitModal
                dataSource={json.data.proc_order_info}
                onFinish={store.handleFinishTask}
                onHide={() => {
                  Modal.hide()
                  window.closeWindow()
                }}
              />
            ),
            onHide: () => {
              Modal.hide()
              window.closeWindow()
            },
            title: t('确认计划状态'),
            style: { width: '600px' },
          })
        } else {
          closeWindowDialog('入库单已提交成功')
        }
      }
    })
  }

  // 提交入库单的逻辑
  const handleSubmit = () => {
    const canSubmitType = store.verifyData(2)
    if (canSubmitType === 0) return
    if (canSubmitType === 1) return handleEnsureSubmit(true)
    if (canSubmitType === 2)
      return Dialog.confirm({
        children: t(
          '入库单中存在超过所设置的最高入库单价的商品，是否确定继续入库？',
        ),
        title: t('提示'),
        onOK: () => handleEnsureSubmit(false),
      })
  }

  return (
    <>
      {(status === 'add' || status === 'edit') && (
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handleSubmit}
        >
          {t('提交入库单')}
        </Button>
      )}
      <FunctionSet
        right
        data={[
          {
            text: t('保存草稿'),
            onClick: handleSaveDraft,
            show: status === 'add' || status === 'edit',
          },
          {
            text: t('冲销'),
            onClick: handleDelete,
            show: status !== 'add' && sheetDetail.status !== -1 && !is_frozen, // -1为已删除，不可进行冲销操作
          },
        ]}
      />
    </>
  )
})

const StockInTime = observer((props) => {
  const {
    sheetDetail: { submit_time },
    status,
  } = store

  const handleChangeDate = (selected) => {
    const value = moment(selected).format('YYYY-MM-DD HH:mm')
    store.onDetailChange('submit_time', value)
  }

  return (
    <>
      {status !== 'detail' ? (
        <DatePicker
          date={moment(submit_time === '-' ? new Date() : submit_time)}
          onChange={handleChangeDate}
          enabledTimeSelect
          disabledClose // 不可清空，入库时间为必选
        />
      ) : (
        <div className='b-stock-in-content'>
          {moment(submit_time).format('YYYY-MM-DD HH:mm')}
        </div>
      )}
    </>
  )
})

const StockInRemark = observer(({ type }) => {
  // 确保在最后一行
  const {
    status,
    sheetDetail: { sheet_remark },
  } = store

  const handleListRemarkChange = (e) => {
    const { value } = e.target
    store.onDetailChange('sheet_remark', value)
  }

  return status !== 'detail' ? (
    <input
      type='text'
      value={sheet_remark || ''}
      className='form-control'
      maxLength={100}
      style={{ width: '800px' }}
      onChange={handleListRemarkChange}
    />
  ) : (
    <div style={{ width: '800px' }} className='b-stock-in-content'>
      {sheet_remark || '-'}
    </div>
  )
})

const HeaderDetail = observer((props) => {
  const {
    sheetDetail,
    sheetDetail: { operator, id, is_frozen },
    itemDetailList,
  } = store

  const sku_money = Array.from(itemDetailList)
    .map((item) => +item.money)
    .reduce((prev, curr) => prev + curr)

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={70}
      contentBlockWidth={250}
      HeaderInfo={[
        {
          label: t('入库单号'),
          item: (
            <>
              <div style={{ width: '280px' }}>{id || '-'}</div>
              <div style={{ width: '280px' }}>
                {is_frozen ? t('历史单据，不允许修改') : ''}
              </div>
            </>
          ),
        },
      ]}
      contentCol={3}
      HeaderAction={<HeaderAction />}
      ContentInfo={[
        {
          label: t('入库时间'),
          item: <StockInTime />,
        },
        {
          label: t('入库单状态'),
          item: FINISHED_PRODUCT_STATUS[sheetDetail.status],
          tag: receiptTypeTag(sheetDetail.status),
        },
        {
          label: t('建单人'),
          item: operator || '-',
        },
        {
          label: t('备注'),
          item: <StockInRemark />,
        },
      ]}
      totalData={[
        {
          text: t('入库金额'),
          value: <Price value={+Big(sku_money || 0).toFixed(2)} />,
          left: true,
        },
      ]}
    />
  )
})

HeaderDetail.propTypes = {
  type: PropTypes.string.isRequired,
}

export default HeaderDetail
