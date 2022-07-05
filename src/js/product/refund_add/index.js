import { i18next } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import {
  Tip,
  Flex,
  Dialog,
  Button,
  DatePicker,
  FunctionSet,
  Price,
  Input,
  MoreSelect,
} from '@gmfe/react'
import DiscountPanel from 'common/components/discount_panel'
import _ from 'lodash'
import moment from 'moment/moment'
import Big from 'big.js'
import globalStore from '../../stores/global'
import Detail from './detail'
import { history, withRouter } from 'common/service'
import {
  PRODUCT_ACTION_TYPE,
  PRODUCT_REASON_TYPE,
  PRODUCT_STATUS,
} from 'common/enum'
import { observer } from 'mobx-react'
import { closeWindowDialog, PRODUCT_STATUS_TAGS } from '../util'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'

import refundAddStore from './store'

const Filter = withRouter(
  observer((props) => {
    const {
      params: { id },
    } = props

    const [isSubmit, setIsSubmit] = useState(false)

    const totalMoney = Big(refundAddStore.data.sku_money || 0)
      .plus(refundAddStore.data.delta_money || 0)
      .toFixed(2)

    const submitRefund = (is_submit, type = 'modify') => {
      const { stock_method } = globalStore.user

      if (!refundAddStore.data.settle_supplier) {
        Tip.warning(i18next.t('请选择供应商'))
        return
      }

      // 空的忽略，不参与判断
      const details = _.filter(refundAddStore.data.details, (detail) => {
        return !(
          detail.id === null &&
          detail.quantity === null &&
          detail.unit_price === null &&
          detail.money === null
        )
      })

      if (!_.find(details, (v) => v.id)) {
        Tip.warning(i18next.t('请添加商品明细'))
        return
      }

      const invalid = _.find(details, (value) => {
        return !(
          value.name &&
          value.quantity &&
          !_.isNil(value.money) &&
          !_.isNil(value.unit_price)
        )
      })

      if (!_.isEmpty(invalid)) {
        Tip.warning(i18next.t('商品明细填写不完善'))
        return
      }

      // 如果进销存计算方式为先进先出，则批次为必填字段
      if (
        stock_method === 2 &&
        _.find(details, (d) => {
          return !d.batch_number
        })
      ) {
        Tip.warning(i18next.t('请选择退货批次'))
        return false
      }

      if (refundAddStore.data.submit_time === '-') {
        refundAddStore.data.submit_time = moment(new Date()).format(
          'YYYY-MM-DD',
        )
      } else {
        refundAddStore.data.submit_time = moment(
          refundAddStore.data.submit_time,
        ).format('YYYY-MM-DD')
      }

      // 补齐操作人
      _.each(details, (detail) => {
        if (detail.operator) {
          detail.operator = globalStore.user.name
        }
      })

      setIsSubmit(true)
      return refundAddStore
        .postData(is_submit, details, type)
        .then(({ data }) => {
          if (is_submit === 1) {
            Tip.success(i18next.t('保存成功'))
            if (id) {
              refundAddStore.fetchData(id)
            } else {
              history.push(`/sales_invoicing/stock_out/refund/add/${data.id}`)
            }
          } else {
            closeWindowDialog('退货单已提交成功')
            // history.push(`/sales_invoicing/stock_out/refund`)
          }
        })
        .finally(() => setIsSubmit(false))
    }

    const handleSubmit = () => {
      // 2 提交退货单
      return submitRefund(2)
    }

    const handleSaveDraft = () => {
      // 1 保存退货单
      return submitRefund(1)
    }

    const handleDate = (date) => {
      refundAddStore.setData('submit_time', date)
    }

    const handlePrint = () => {
      if (refundAddStore.data.details.length === 0) {
        Tip.warning(i18next.t('请先保存草稿后在进行打印!'))
        return
      }
      window.open(
        `#/sales_invoicing/stock_out/refund/print?print_type=2&return_ids=${JSON.stringify(
          [id],
        )}`,
      )
    }

    const handleExport = () => {
      window.open(`/stock/return_stock_sheet/detail?id=${id}&export=1`)
    }

    const handleCancel = () => {
      Dialog.confirm({
        children: i18next.t('是否删除此单据?'),
        title: i18next.t('确认删除'),
      }).then(() => {
        refundAddStore.postCancel(id).then(() => {
          history.push(`/sales_invoicing/stock_out/refund/detail/${id}`)
        })
      })
    }

    const handleDetailChange = (name, value) => {
      refundAddStore.setData(name, value)
    }

    const handleCreate = () => {
      return submitRefund(2, 'new_create')
    }

    const handleCreateSaveDraft = () => {
      return submitRefund(1, 'new_create')
    }

    const { data, settleSupplierList } = refundAddStore
    const {
      settle_supplier,
      submit_time,
      status,
      creator,
      return_sheet_remark,
      is_frozen,
    } = data

    return (
      <ReceiptHeaderDetail
        contentLabelWidth={75}
        customeContentColWidth={[370, 260, 260]}
        HeaderInfo={[
          {
            label: i18next.t('退货单号'),
            item: (
              <>
                <div>{id ?? '-'}</div>
                <div>{is_frozen ? i18next.t('历史单据，不允许修改') : ''}</div>
              </>
            ),
          },
          {
            label: i18next.t('供应商名称'),
            item: (
              <div style={{ width: '100%' }}>
                <MoreSelect
                  disabledClose
                  selected={settle_supplier}
                  data={settleSupplierList.slice()}
                  onSelect={(value) =>
                    handleDetailChange('settle_supplier', value)
                  }
                  placeholder={i18next.t('请选择供应商')}
                />
              </div>
            ),
          },
        ]}
        totalData={[
          { text: '退货金额', value: Price.getCurrency() + totalMoney },
          {
            text: '商品金额',
            value: Price.getCurrency() + refundAddStore.data.sku_money || 0,
          },
          {
            text: '折让金额',
            value: Price.getCurrency() + refundAddStore.data.delta_money || 0,
          },
        ]}
        HeaderAction={
          id ? (
            <Flex justifyEnd>
              {globalStore.hasPermission('edit_return_stock') && (
                <Button
                  loading={isSubmit}
                  type='primary'
                  className='gm-margin-right-5'
                  onClick={handleSubmit}
                >
                  {i18next.t('提交退货单')}
                </Button>
              )}
              <FunctionSet
                right
                data={[
                  {
                    text: i18next.t('保存草稿'),
                    onClick: handleSaveDraft,
                  },
                  {
                    text: i18next.t('打印退货单'),
                    onClick: handlePrint,
                  },
                  {
                    text: i18next.t('导出退货单'),
                    onClick: handleExport,
                  },
                  {
                    text: i18next.t('冲销'),
                    onClick: handleCancel,
                    show: !is_frozen,
                  },
                ]}
              />
            </Flex>
          ) : (
            <>
              {globalStore.hasPermission('add_return_stock') && (
                <Button
                  loading={isSubmit}
                  type='primary'
                  className='gm-margin-right-5'
                  onClick={handleCreate}
                >
                  {i18next.t('提交退货单')}
                </Button>
              )}
              <Button onClick={handleCreateSaveDraft}>
                {i18next.t('保存草稿')}
              </Button>
            </>
          )
        }
        ContentInfo={[
          {
            label: i18next.t('退货单状态'),
            item: <span>{PRODUCT_STATUS[status] ?? '-'}</span>,
            tag: !!status && PRODUCT_STATUS_TAGS(status),
          },
          {
            label: i18next.t('建单人'),
            item: <span>{creator ?? '-'}</span>,
          },
          {
            label: i18next.t('退货时间'),
            item: (
              <DatePicker
                disabledClose
                date={moment(
                  submit_time === '-' ? new Date() : submit_time,
                ).toDate()}
                onChange={handleDate}
              />
            ),
          },
          {
            label: i18next.t('退货备注'),
            item: (
              <Input
                type='text'
                className='gm-paddingLR5 form-control'
                style={{ width: '800px' }}
                maxLength={100}
                name='return_sheet_remark'
                value={return_sheet_remark}
                onChange={(e) =>
                  handleDetailChange(e.target.name, e.target.value)
                }
              />
            ),
          },
        ]}
      />
    )
  }),
)

const Discount = observer(() => {
  const handleAdd = (discount) => {
    refundAddStore.addDiscount(discount)
  }

  const handleDel = (index) => {
    refundAddStore.removeDiscount(index)
  }

  return (
    <DiscountPanel
      list={refundAddStore.data.discount.slice()}
      reasonMap={PRODUCT_REASON_TYPE}
      actionMap={PRODUCT_ACTION_TYPE}
      editable
      onAdd={handleAdd}
      onDel={handleDel}
    />
  )
})

const RefundAdd = withRouter(
  observer((props) => {
    const {
      params: { id },
    } = props

    useEffect(() => {
      async function init() {
        await refundAddStore.fetchSettleSupplierList()
        id && refundAddStore.fetchData(id)
      }

      init()
    }, [])

    return (
      <>
        <Filter />
        {refundAddStore.data.settle_supplier && (
          <>
            <Detail />
            <Discount />
          </>
        )}
      </>
    )
  }),
)

export default RefundAdd
