import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from './store'
import Header from './header'
import EditList from './edit_list'
import TableListTips from '../../../../common/components/table_list_tips'
import { refPriceTypeHOC } from '../../../../common/components/ref_price_type_hoc'

@refPriceTypeHOC(1)
@observer
class Detail extends React.Component {
  componentDidMount() {
    store.changeViewType('create')
  }

  componentWillUnmount() {
    store.init()
  }

  render() {
    return (
      <>
        <Header />
        <TableListTips
          tips={[t('商品库已删除的商品，在抢购系统中会同步删除')]}
        />
        <EditList {...this.props} />
      </>
    )
  }
}

export default Detail
