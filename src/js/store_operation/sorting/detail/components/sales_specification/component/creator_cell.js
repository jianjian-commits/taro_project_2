import { observer } from 'mobx-react'
import memoComponentHoc from './memo_component'
import store from '../store/receipt_store'

const CreatorCell = observer((props) => {
  const {
    data: { creator },
  } = props
  const { outStockDetail } = store
  return creator || outStockDetail.creator
})

export default memoComponentHoc(CreatorCell)
