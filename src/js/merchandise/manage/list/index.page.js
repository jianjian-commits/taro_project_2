import React from 'react'
import { observer } from 'mobx-react'
import manageStore from '../store'
import listStore from './list_store'
import MerchandiseListFilter from './component/filter'
import MerchandiseTableList from './component/expand_list'

import InitImportGoods from '../../../guides/init/guide/init_import_goods'
import InitMatchImages from '../../../guides/init/guide/init_match_images'

@observer
class MerchandiseList extends React.Component {
  componentDidMount() {
    // 批量修改商品规格 要用到list的store 所以不能componentWillUnmount的时候清掉
    // 但b和c的商品库共用，两边的筛选条件不能混合，所以进入时init一下
    listStore.initFilter()

    manageStore.getActiveSelfSalemenuList()
    manageStore.getRefPriceType(1)
    manageStore.fetchProcessLabelList()
  }

  render() {
    return (
      <>
        <MerchandiseListFilter />
        <MerchandiseTableList />
        <InitImportGoods ready refMoreAction={listStore.refMoreAction} />
        <InitMatchImages
          ready={listStore.list.length > 0}
          refMoreAction={listStore.refMoreAction}
        />
      </>
    )
  }
}

export default MerchandiseList
