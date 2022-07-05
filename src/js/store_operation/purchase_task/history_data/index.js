import { i18next } from 'gm-i18n'
import React from 'react'
import { Loading, Box, Tip } from '@gmfe/react'
import { observer } from 'mobx-react'
import actions from '../../../actions'
import '../actions.js'
import PurchaseHistoryListHeader from '../components/purchase_history_list_header'
import PurchaseTaskHistoryPanel from '../components/purchase_task_history_panel'
import { refPriceTypeHOC } from '../../../common/components/ref_price_type_hoc'
import TableListTips from '../../../common/components/table_list_tips'

import '../reducer.js'
import purchaseTaskHistoryStore from './store'
import { toJS } from 'mobx'

@refPriceTypeHOC(2, actions.purchase_task_set_reference_price_type)
@observer
class PurchaseTaskHistory extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      initLoading: true,
    }

    this.handleListSearch = ::this.handleListSearch
    this.onHandleToPage = ::this.onHandleToPage
  }

  async componentDidMount() {
    // 获取服务时间
    await actions.purchase_task_get_service_time()
    purchaseTaskHistoryStore.init()
    this.handleListSearch()

    this.setState({
      initLoading: false,
    })
    actions.purchase_task_get_filter_init_data()
  }

  handleListSearch(e) {
    e && e.preventDefault()

    purchaseTaskHistoryStore.resetPagination()
    purchaseTaskHistoryStore.fetchPurchaseTaskHistoryData()
  }

  onHandleToPage(page) {
    purchaseTaskHistoryStore.fetchPurchaseTaskHistoryData(page).then((data) => {
      if (!(data && data.length)) {
        Tip.info(i18next.t('没有更多数据'))
      }
    })
  }

  render() {
    const { refPriceType, postRefPriceType } = this.props
    const {
      taskList,
      taskListLoading,
      taskListPagination,
    } = purchaseTaskHistoryStore

    const { initLoading } = this.state

    if (initLoading) {
      return (
        <Loading
          style={{
            marginTop: 50,
          }}
        />
      )
    }
    return (
      <div className='b-purchase-task'>
        <div className='b-purchase-list-module-inner'>
          <PurchaseHistoryListHeader onSearch={this.handleListSearch} />
          <TableListTips
            tips={[i18next.t('本页面仅支持查询三个月之前的历史数据')]}
          />
          <Box>
            <PurchaseTaskHistoryPanel
              loading={taskListLoading}
              list={toJS(taskList)}
              pagination={taskListPagination}
              toPage={this.onHandleToPage}
              postRefPriceType={postRefPriceType}
              refPriceType={refPriceType}
            />
          </Box>
        </div>
      </div>
    )
  }
}

export default PurchaseTaskHistory
