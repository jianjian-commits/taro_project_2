import store from './store'
import { observer } from 'mobx-react'
import RuleEdit from './rule_edit'
import goodStore from './components/goods_store'

@observer
class CommissionAdd extends RuleEdit {
  componentDidMount() {
    store.init()
    store.getSales()
    goodStore.initData([{}])
  }
}

export default CommissionAdd
