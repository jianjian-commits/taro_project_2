import { i18next } from 'gm-i18n'
import React from 'react'
import { MoreSelect } from '@gmfe/react'
import store from './store'
import { observer } from 'mobx-react'

@observer
class CustomerSelect extends React.Component {
  componentDidMount() {
    store.fetchCustomerList()
  }

  renderSelected(customer) {
    return customer.resname
  }

  render() {
    const { customerList } = store
    const { selected, onSelect } = this.props
    return (
      <MoreSelect
        data={customerList.slice()}
        selected={selected}
        onSelect={onSelect}
        renderSelected={this.renderSelected}
        renderListFilterType='pinyin'
        placeholder={i18next.t('输入商户名搜索')}
      />
    )
  }
}
export default CustomerSelect
