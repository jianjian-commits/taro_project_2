import store from './store'
import { observer } from 'mobx-react'
import RuleEdit from './rule_edit'
import goodStore from './components/goods_store'

@observer
class CommissionDetail extends RuleEdit {
  async componentDidMount() {
    store.init()
    store.getSales()
    const data = await store.getDetail(this.id)

    goodStore.initData(data.skus_detail)
  }
}

export default CommissionDetail
