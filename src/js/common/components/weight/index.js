import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import weightStore from '../../../stores/weight'
import classNames from 'classnames'

// 独立一个组件，这样数据更新也只刷新此组件，效率更好点

@observer
class Weight extends React.Component {
  render() {
    const { className, ...rest } = this.props
    return (
      <span {...rest} className={classNames('b-white', className)}>
        {i18next.t('读数:') + weightStore.data + weightStore.weightUnit}
      </span>
    )
  }
}

export default Weight
