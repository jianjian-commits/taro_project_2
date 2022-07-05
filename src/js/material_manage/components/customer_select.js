import { i18next } from 'gm-i18n'
import React from 'react'
import { FilterSelect } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'
import commonStore from '../store'
import { observer } from 'mobx-react'

@observer
class CustomerSelect extends React.Component {
  renderListCell(customer) {
    return customer.resname
  }
  doFilter(list, query) {
    return pinYinFilter(list, query, (value) => value.resname)
  }
  render() {
    // 商户选择 目前 还包含了子站点
    const { customerList } = commonStore
    const { selected, onSelect } = this.props
    return (
      <FilterSelect
        id={'customerList' + Date.now()}
        list={customerList}
        selected={selected}
        withFilter={this.doFilter.bind(this)}
        onSelect={onSelect}
        placeholder={i18next.t('输入商户名搜索')}
        renderItemName={this.renderListCell}
        isScrollToSelected
      />
    )
  }
}
export default CustomerSelect
