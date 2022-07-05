import React, { useState } from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { BoxPanel, Dialog, Price, Tip } from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import {
  TableX,
  fixedColumnsTableXHOC,
  TableXUtil,
  editTableXHOC,
} from '@gmfe/table-x'
import _ from 'lodash'
import {
  PRODUCT_ACTION_TYPE,
  PRODUCT_METHOD_TYPE,
  PRODUCT_REASON_TYPE,
} from 'common/enum'
import ShareFormDialog from './share_form_dialog'
import PropTypes from 'prop-types'

const FixedColumnsEditTablex = fixedColumnsTableXHOC(editTableXHOC(TableX))
const { OperationHeader, EditOperation, TABLE_X } = TableXUtil

const StockInSharePanel = observer((props) => {
  const { stockInShareList } = store
  const [loading, setLoading] = useState(false)

  const verifyShareData = () => {
    const { action, reason, money, in_sku_logs } = store.stockInOperatedShare

    if (action === '0') {
      Tip.warning(t('请选择分摊类型'))
      return false
    }
    if (reason === '0') {
      Tip.warning(t('请选择分摊原因'))
      return false
    }
    if (money === '') {
      Tip.warning(t('请填写分摊金额'))
      return false
    }
    if (in_sku_logs.length === 0) {
      Tip.warning(t('请选择分摊商品'))
      return false
    }
  }

  const handleEnsureShareAdd = () => {
    store.addShareList()
    store.postStockReceiptData(1).then((json) => {
      if (json.code === 20) {
        store.doShelfError(json.msg)
      } else {
        store.fetchStockInReceiptList().then(() => {
          Tip.success(t('保存成功'))
        })
      }
    })
  }

  const handleOpenShareAdd = () => {
    setLoading(true)
    // 相对于执行保存操作
    if (store.verifyData(1)) {
      store
        .postStockReceiptData(1)
        .then((json) => {
          if (json.code === 20) {
            store.doShelfError(json.msg)
            setLoading(false)
          } else {
            store.fetchStockInReceiptList().then((response) => {
              store.fetchShareProductList().then(() => {
                Tip.success(t('保存成功'))
                setLoading(false)
                Dialog.confirm({
                  children: <ShareFormDialog />,
                  title: t('费用分摊'),
                  size: 'md',
                  onOK: () => verifyShareData(),
                }).then(() => {
                  handleEnsureShareAdd()
                })
              })
            })
          }
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }

  const handleShareDel = () => {
    Dialog.confirm({
      children: t('是否删除此记录?'),
      title: t('确认删除'),
    }).then(() => {
      if (store.verifyData(1)) {
        store.deleteShareList() // 删除分摊
        store.postStockReceiptData(1).then((json) => {
          if (json.code === 20) {
            store.doShelfError(json.msg)
          } else {
            // 保存数据
            store.fetchStockInReceiptList().then(() => {
              Tip.success(t('保存成功'))
            }) // 获取新数据
          }
        })
      }
    })
  }

  return (
    <BoxPanel
      icon='bill'
      title={t('费用分摊')}
      collapse
      summary={[
        {
          text: i18next.t('合计'),
          value: _.isEmpty(stockInShareList[0]) ? 0 : stockInShareList.length,
        },
      ]}
    >
      <FixedColumnsEditTablex
        data={stockInShareList.slice()}
        columns={[
          {
            Header: OperationHeader,
            accessor: 'action',
            show: props.type === 'add',
            fixed: 'left',
            width: TABLE_X.WIDTH_OPERATION,
            Cell: () => {
              return (
                <EditOperation
                  onAddRow={
                    !stockInShareList[0].action && !loading
                      ? handleOpenShareAdd
                      : undefined
                  }
                  onDeleteRow={
                    stockInShareList[0].action ? handleShareDel : undefined
                  }
                />
              )
            },
          },
          {
            Header: t('操作时间'),
            accessor: 'create_time',
            minWidth: 100,
          },
          {
            Header: t('分摊原因'),
            accessor: 'reason',
            minWidth: 100,
            Cell: ({ row }) => {
              return PRODUCT_REASON_TYPE[row.original.reason] || '-'
            },
          },
          {
            Header: t('分摊类型'),
            accessor: 'action',
            minWidth: 100,
            Cell: ({ row }) => {
              return PRODUCT_ACTION_TYPE[row.original.action] || '-'
            },
          },
          {
            Header: t('分摊金额'),
            accessor: 'money',
            minWidth: 100,
            Cell: ({ row }) => {
              return row.original.money
                ? row.original.money + Price.getUnit()
                : '-'
            },
          },
          {
            Header: t('分摊方式'),
            accessor: 'method',
            minWidth: 100,
            Cell: ({ row }) => {
              return PRODUCT_METHOD_TYPE[row.original.method] || '-'
            },
          },
          {
            Header: t('备注'),
            minWidth: 100,
            accessor: 'remark',
          },
          {
            Header: t('操作人'),
            minWidth: 100,
            accessor: 'operator',
          },
        ]}
      />
    </BoxPanel>
  )
})

StockInSharePanel.propTypes = {
  type: PropTypes.string.isRequired,
}

export default StockInSharePanel
