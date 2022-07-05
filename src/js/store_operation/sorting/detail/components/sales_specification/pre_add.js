import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { Flex, Tip, Button } from '@gmfe/react'
import { isNumOrEnglish } from 'common/util'
import { history, WithBreadCrumbs } from 'common/service'
import _ from 'lodash'
import store from './store/pre_add_store'
import { observer } from 'mobx-react'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'

const OutStockPreAdd = observer(() => {
  useEffect(() => {
    return function clean() {
      store.changeValue('outStockId', '')
      store.changeValue('outStockObject', '')
    }
  }, [])

  const handleNextStep = (event) => {
    event.preventDefault()
    const { outStockId } = store

    // 手动新建的入库单号只能为数字和字母，不能以LK或PL开头
    if (!isNumOrEnglish(outStockId)) {
      Tip.warning(i18next.t('出库单号只能输入数字和字母'))
      return false
    } else if (
      _.startsWith(_.toUpper(outStockId), 'LK') ||
      _.startsWith(_.toUpper(outStockId), 'PL')
    ) {
      Tip.warning(i18next.t('手动新建的出库单号不能以LK、lk、PL、pl开头'))
      return false
    }

    store.postData().then((json) => {
      history.push(
        `/sales_invoicing/stock_out/product/receipt?id=${json.data.id}`
      )
    })
  }

  const handleCancel = () => {
    window.closeWindow()
  }

  const handleOutStockObjectChange = (event) => {
    event.preventDefault()
    store.changeValue('outStockObject', event.target.value)
  }

  const handleOutStockId = (event) => {
    event.preventDefault()
    store.changeValue('outStockId', event.target.value)
  }

  const { outStockObject, outStockId } = store

  return (
    <div>
      <WithBreadCrumbs breadcrumbs={[i18next.t('新建出库单')]} />

      <ReceiptHeaderDetail
        contentLabelWidth={70}
        contentBlockWidth={250}
        HeaderInfo={[
          {
            label: i18next.t('出库单号'),
            item: (
              <input
                type='text'
                style={{ width: '220px' }}
                className='gm-paddingLR5 form-control'
                placeholder={i18next.t('手动出库请填写出库单号便于记录')}
                value={outStockId}
                onChange={handleOutStockId}
              />
            ),
          },
        ]}
        HeaderAction={
          <Flex justifyEnd className='gm-bg'>
            <Button className='gm-margin-right-5' onClick={handleCancel}>
              {i18next.t('取消')}
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              onClick={handleNextStep}
              disabled={!outStockObject || !outStockId}
            >
              {i18next.t('保存')}
            </Button>
          </Flex>
        }
        ContentInfo={[
          { item: <div>-</div>, label: '出库单状态' },
          { item: <div>-</div>, label: '出库时间' },
          { item: <div>-</div>, label: '建单人' },
          {
            item: (
              <input
                type='text'
                className='gm-paddingLR5 form-control'
                placeholder={i18next.t('手动出库需填写出库对象')}
                value={outStockObject}
                onChange={handleOutStockObjectChange}
              />
            ),
            label: '出库对象',
          },
        ]}
      />
    </div>
  )
})

export default OutStockPreAdd
