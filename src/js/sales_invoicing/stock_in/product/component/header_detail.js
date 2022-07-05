import React, { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Dialog,
  Price,
  Tip,
  RightSideModal,
  DatePicker,
  FunctionSet,
  MoreSelect,
  Flex,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../store/receipt_store'
import Big from 'big.js'
import globalStore from '../../../../stores/global'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { history } from '../../../../common/service'

import { closeWindowDialog } from '../../util'

import PopupPrintModal from './popup_print_modal'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { receiptTypeTag } from '../../../stock_out/product/util'
import moment from 'moment'
import { PRODUCT_STATUS } from 'common/enum'
import { toJS } from 'mobx'
import SupplierDel from 'common/components/supplier_del_sign'

const HeaderAction = observer((props) => {
  const [isSubmit, setIsSubmit] = useState(false)
  const { status, id, is_frozen } = store.stockInReceiptDetail

  // 当status: 0-审核不通过 1-待提交 时可保存
  const can_submit_in_stock =
    globalStore.hasPermission('edit_in_stock') && _.includes([0, 1], +status)

  // 是否处于审核状态
  const isCheck = status === 2
  // 是否可以冲销
  const canDeleteStatus = [0, 1, 2]
  const canDelete =
    globalStore.hasPermission('delete_in_stock') &&
    _.includes(canDeleteStatus, status)
  // 是否可以打印
  const canPrint = globalStore.hasPermission('print_in_stock')

  const isAdd = props.type === 'add'

  const isAlreadyExit = !!id

  const handlePrint = () => {
    const {
      stockInReceiptDetail: { id, details },
    } = store

    // 根据后台返回数据来判断，与编辑数据无关
    if (details.length === 0) {
      Tip.warning(t('请先保存草稿后再进行打印'))
      return
    }

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupPrintModal closeModal={RightSideModal.hide} data_ids={[id]} />
      ),
    })
  }

  const handleExport = () => {
    const {
      stockInReceiptDetail: { id },
    } = store

    window.open(`/stock/in_stock_sheet/material/new_detail?id=${id}&export=1`)
  }

  const handleNotApproved = () => {
    const {
      stockInReceiptDetail: { id },
    } = store

    return store
      .notApprovedStockInReceiptList({ id })
      .then((json) => {
        if (json.code === 5) {
          Dialog.confirm({
            children: t(json.msg || '该操作会导致负库存，是否确认继续?'),
            title: t('提示'),
          }).then(() => {
            store
              .notApprovedStockInReceiptList({ id, allow_negative: 1 })
              .then(() => {
                history.push(
                  `/sales_invoicing/stock_in/product/create?id=${id}`,
                )
              })
          })
        } else {
          history.push(`/sales_invoicing/stock_in/product/create?id=${id}`)
        }
      })
      .catch(() => {})
  }

  const handleDelete = () => {
    const {
      stockInReceiptDetail: { id },
    } = store

    Dialog.confirm({
      children: t('是否删除此单据?'),
      title: t('确认删除'),
    }).then(() => {
      store.deleteStockInReceiptList(id).then(() => {
        if (props.type === 'add') {
          history.push(`/sales_invoicing/stock_in/product/detail?id=${id}`)
        } else if (props.type === 'detail') {
          store.fetchStockInReceiptList()
        }
      })
    })
  }

  const handleSaveDraft = () => {
    if (store.verifyData(1)) {
      return store.postStockReceiptData(1).then((json) => {
        if (json.code === 20) {
          store.doShelfError(json.msg)
        } else {
          Tip.success(t('保存成功'))
          store.fetchStockInReceiptList()
        }
      })
    }
  }

  /**
   * 提交入库单
   * @param {bool} isShowClosePage 是否显示关闭窗口提示
   */
  const handleEnsureSubmit = (isShowClosePage) => {
    setIsSubmit(true)
    return store
      .postStockReceiptData(2)
      .then((json) => {
        if (json.code === 20) {
          store.doShelfError(json.msg)
        } else {
          if (isShowClosePage) {
            closeWindowDialog('入库单已提交成功')
            history.push(`/sales_invoicing/stock_in/product`)
          }

          history.push(
            `/sales_invoicing/stock_in/product/detail?id=${store.stockInReceiptDetail.id}`,
          )
        }
      })
      .finally(() => setIsSubmit(false))
  }

  const handleSubmit = () => {
    const canSubmitType = store.verifyData(2)
    if (canSubmitType !== 0) {
      if (canSubmitType === 2) {
        return Dialog.confirm({
          children: t(
            '入库单中存在超过所设置的最高入库单价的商品，是否确定继续入库？',
          ),
          title: t('提示'),
          onOK: () => handleEnsureSubmit(false),
        })
      }

      if (canSubmitType === 1) {
        return handleEnsureSubmit(true)
      }
    }
  }

  return (
    <>
      {isAdd && can_submit_in_stock ? (
        <Button
          loading={isSubmit}
          type='primary'
          className='gm-margin-right-5'
          onClick={handleSubmit}
        >
          {t('提交入库单')}
        </Button>
      ) : null}
      <FunctionSet
        right
        data={[
          {
            text: t('保存草稿'),
            onClick: handleSaveDraft,
            show: isAdd,
          },
          {
            text: t('打印入库单'),
            onClick: handlePrint,
            show: isAlreadyExit && canPrint,
          },
          {
            text: t('导出入库单'),
            onClick: handleExport,
            show: isAlreadyExit,
          },
          {
            text: t('审核不通过'),
            onClick: handleNotApproved,
            show: isAlreadyExit && !isAdd && isCheck && !is_frozen,
          },
          {
            text: t('冲销'),
            onClick: handleDelete,
            show: isAlreadyExit && canDelete && !is_frozen,
          },
        ]}
      />
    </>
  )
})

const StockInTime = observer((props) => {
  const { submit_time_new } = store.stockInReceiptDetail

  const isAdd = props.type === 'add'

  const handleChangeDate = (selected) => {
    const value = moment(selected).format('YYYY-MM-DD HH:mm')
    store.changeStockInReceiptDetail('submit_time_new', value)
  }

  return (
    <>
      {isAdd ? (
        <DatePicker
          date={moment(submit_time_new === '-' ? new Date() : submit_time_new)}
          onChange={handleChangeDate}
          enabledTimeSelect
          disabledClose // 不可清空，入库时间为必选
        />
      ) : (
        <div className='b-stock-in-content'>{submit_time_new}</div>
      )}
    </>
  )
})

const StockInRemark = observer(({ type }) => {
  // 确保在最后一行
  const { remark } = store.stockInReceiptDetail

  const isAdd = type === 'add'

  const handleListRemarkChange = (e) => {
    const { value } = e.target

    store.changeStockInReceiptDetail('remark', value)
  }

  return isAdd ? (
    <input
      type='text'
      value={remark || ''}
      className='form-control'
      maxLength={100}
      style={{ width: '800px' }}
      onChange={handleListRemarkChange}
    />
  ) : (
    <div style={{ width: '800px' }} className='b-stock-in-content'>
      {remark}
    </div>
  )
})

const SupplierName = observer((props) => {
  const { supplierList, supplierSelected, stockInReceiptDetail } = store
  const {
    supplier_name,
    supplier_customer_id,
    supplier_status,
  } = stockInReceiptDetail

  const { type } = props
  const targetRef = useRef(null)

  const isAdd = type === 'add'

  useEffect(() => {
    if (isAdd) {
      store.fetchSupplierList()
    }
  }, [isAdd])

  const handleSelect = (selected) => {
    store.changeSupplierSelected(selected)
  }

  // enter
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      targetRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  return (
    <Flex alignCenter>
      {/* supplier_status:0 为已删除，空为没有供应商 */}
      {supplier_status === 0 && <SupplierDel />}
      {isAdd ? (
        <MoreSelect
          ref={targetRef}
          data={toJS(supplierList)}
          selected={supplierSelected}
          isGroupList
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          renderListFilterType='pinyin'
          placeholder={t('请选择入库供应商')}
          disabledClose
        />
      ) : (
        <span>{`${supplier_name}(${supplier_customer_id})`}</span>
      )}
    </Flex>
  )
})

const HeaderDetail = observer((props) => {
  const { type } = props

  const renderHeaderInfo = () => {
    const { id, is_frozen } = store.stockInReceiptDetail
    return [
      {
        label: t('入库单号'),
        item: (
          <>
            <div style={{ width: '280px' }}>{id || '-'}</div>
            <div>{is_frozen ? t('历史单据，不允许修改') : ''}</div>
          </>
        ),
      },
    ]
  }

  const renderContentInfo = (type) => {
    const { status, creator } = store.stockInReceiptDetail
    return [
      {
        label: t('供应商名称'),
        item: <SupplierName type={type} />,
      },
      {
        label: t('入库时间'),
        item: <StockInTime type={type} />,
      },
      {
        label: t('入库单状态'),
        item: PRODUCT_STATUS[status],
        tag: receiptTypeTag(status),
      },
      {
        label: t('建单人'),
        item: creator || '-',
      },
      {
        label: t('备注'),
        item: <StockInRemark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const { sku_money, delta_money } = store.stockInReceiptDetail

    return [
      {
        text: t('入库金额'),
        value: (
          <Price
            value={
              +Big(sku_money || 0)
                .plus(delta_money || 0)
                .toFixed(2)
            }
          />
        ),
      },
      {
        text: t('商品金额'),
        value: <Price value={sku_money || 0} />,
      },
      {
        text: t('折让金额'),
        value: <Price value={delta_money || 0} />,
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={65}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

HeaderDetail.propTypes = {
  type: PropTypes.string.isRequired,
}

export default HeaderDetail
