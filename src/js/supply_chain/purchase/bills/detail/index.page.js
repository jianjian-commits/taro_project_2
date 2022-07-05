import React from 'react'
import { observer } from 'mobx-react'
import store from './store'
import { i18next } from 'gm-i18n'
import Header from './header'
import ViewTable from './view_table'
import EditTable from './edit_table'
import TableListTips from '../../../../common/components/table_list_tips'
import globalStore from '../../../../stores/global'
import TaskFinishDialog from './components/task_finnish_dialog'

@observer
class Detail extends React.Component {
  async componentDidMount() {
    const { id } = this.props.location.query
    await store.getSupplyList()
    store.getDetail(id).then((json) => {
      const { settle_supplier_id, purchaser_id } = json.data.purchase_sheet
      store.getPurchaserList(settle_supplier_id).then(() => {
        // 初始化采购员
        store.changeBillDetail('purchaser_id', purchaser_id)
      })
    })
    store.getReferencePriceType(2)
  }

  componentWillUnmount() {
    store.clear()
  }

  handleOpenInStockDetail = () => {
    const { in_stock_sheet_id, in_stock_sheet_status } = store

    const model = in_stock_sheet_status === 1 ? 'create' : 'detail'
    // 判断是否从pc客户端进入的,是就不新开窗口
    const targetName = window.navigator.userAgent.includes('Electron')
      ? '_self'
      : '_blank'
    window.open(
      `#/sales_invoicing/stock_in/product/${model}?id=${in_stock_sheet_id}`,
      targetName,
    )
  }

  render() {
    const { id } = this.props.location.query
    const {
      in_stock_sheet_id,
      billDetail: { status },
    } = store
    // status -1:已删除 2：已提交 3：未提交
    const edit =
      globalStore.hasPermission('edit_purchase_sheet') && status === 3

    return (
      <div>
        <Header id={id} />
        <TableListTips
          tips={[
            <span key='tips'>
              {i18next.t('当前采购单据已关联入库单据')}
              <a href='javascript:;' onClick={this.handleOpenInStockDetail}>
                {in_stock_sheet_id}
              </a>
            </span>,
          ]}
        />
        {edit ? <EditTable id={id} /> : <ViewTable id={id} />}

        <TaskFinishDialog />
      </div>
    )
  }
}

export default Detail
