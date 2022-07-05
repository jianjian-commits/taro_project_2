import React, { useEffect, useState } from 'react'
import EditDetail from './edit'
import ReviewDetail from './review'
import store from './store'
import { withRouter } from '../../../../../common/service'

const TransferReceiptDetail = withRouter(
  ({
    location: {
      query: { receiptNo },
    },
  }) => {
    const editStatus = [1, 3]
    const reviewStatus = [2, 4, 5]
    const [showEdit, setShowEdit] = useState(null)
    const [showReview, setShowReview] = useState(null)
    useEffect(() => {
      store.fetchTransferList(receiptNo).then((json) => {
        setShowEdit(editStatus.includes(json.data.status))
        setShowReview(reviewStatus.includes(json.data.status))
      })
    }, [receiptNo])

    console.log('showEdit, showReview', showEdit, showReview)

    return (
      <>
        {showEdit && <EditDetail />}
        {showReview && <ReviewDetail />}
      </>
    )
  },
)

export default TransferReceiptDetail
