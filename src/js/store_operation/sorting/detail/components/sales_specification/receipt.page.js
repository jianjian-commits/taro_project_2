import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store/receipt_store'
import DetailReceipt from './detail'

const ReceiptPage = observer((props) => {
  useEffect(() => {
    function init() {
      store.fetchOutStockList(props.location.query.id)
      store.initCurrentStatus()
    }
    init()
  }, [props.location.query.id])

  return <DetailReceipt />
})

export default ReceiptPage
