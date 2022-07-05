import React from 'react'
import store from '../store'
import { i18next } from 'gm-i18n'
import GroupTransfer from 'common/components/group_transfer'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'

const renderItem = (leaf) => {
  return (
    <span style={{ wordBreak: 'break-all' }}>
      {leaf.name}
      {leaf.employee_rule_name && (
        <span className='gm-text-desc'>({leaf.employee_rule_name})</span>
      )}
    </span>
  )
}

@observer
class Transfer extends React.Component {
  handleSelectClick = (selectedValue, type) => {
    const { rightSales, leftSales } = store
    let newRight = []
    const move = []
    // left -> right
    if (type === 'left') {
      leftSales.forEach((v) => {
        if (selectedValue.includes(v.value)) {
          move.push(v)
          return false
        }
        return true
      })
      newRight = rightSales.concat(move)
    } else {
      // right -> left
      newRight = rightSales.filter((v) => !selectedValue.includes(v.value))
    }
    store.changeSaleMenuGroup(newRight)
  }

  render() {
    const { leftSales, rightSales } = store

    return (
      <GroupTransfer
        leftTree={{
          leftPlaceholder: i18next.t('搜索'),
          leftTitle: i18next.t('全部销售经理'),
          leftList: toJS(leftSales),
        }}
        rightTree={{
          rightPlaceholder: i18next.t('搜索'),
          rightTitle: i18next.t('已选销售经理'),
          rightList: toJS(rightSales),
        }}
        onToRightClick={(selected) => this.handleSelectClick(selected, 'left')}
        onToLeftClick={(selected) => this.handleSelectClick(selected, 'right')}
        onLeafItemRender={renderItem}
        onSearch={(list, query) =>
          list.filter(({ name }) => name.includes(query))
        }
      />
    )
  }
}

export default Transfer
