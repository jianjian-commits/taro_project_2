import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Sheet, SheetColumn, RightSideModal, Price } from '@gmfe/react'
import { Trigger, QuickPanel } from '@gmfe/react-deprecated'
import { ManagePaginationV2 } from '@gmfe/business'
import StockInList from './store/clean_food_store'
import Big from 'big.js'

import SearchFilter from 'common/components/product_search_filter'
import CompletedTaskList from '../../components/completed_task_list'

@observer
class SemiInStock extends React.Component {
  constructor(props) {
    super(props)

    this.handleSearch = ::this.handleSearch
    this.handleExport = ::this.handleExport
  }

  componentDidMount() {
    StockInList.setDoFirstRequest(this.pagination.doFirstRequest)
    this.pagination.apiDoFirstRequest()
  }

  handleSearch(filter) {
    Promise.resolve(StockInList.changeFilter('semi', filter)).then(() => {
      // doFirstRequest有ManagePaginationV2提供
      StockInList.doFirstRequest()
    })
  }

  handleExport(filter) {
    StockInList.exportSemiProduct('semi', filter)
  }

  handleShowSemiTasList(batch_num) {
    RightSideModal.render({
      children: <CompletedTaskList batch_num={batch_num} />,
      onHide: RightSideModal.hide,
      title: i18next.t('已完成工艺信息'),
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  hoverTips(tips) {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ minWidth: '160px', color: '#333' }}
      >
        {tips}
      </div>
    )
  }

  render() {
    const { semi_list, skuCategories, getSemiList } = StockInList

    return (
      <div>
        <SearchFilter
          list={skuCategories.slice()}
          tab={i18next.t('入库')}
          handleSearch={this.handleSearch}
          handleExport={this.handleExport}
          placeholder={i18next.t('输入商品信息或操作人')}
        />

        <QuickPanel icon='bill' title={i18next.t('入库列表')}>
          <ManagePaginationV2
            id='pagination_in_clean_dishes_semi_stock_in_list'
            onRequest={getSemiList}
            ref={(ref) => {
              this.pagination = ref
            }}
          >
            <Sheet list={semi_list.slice()} enableEmptyTip>
              <SheetColumn field='batch_num' name={i18next.t('入库批次号')}>
                {(batch_num) => {
                  return (
                    <a
                      onClick={this.handleShowSemiTasList.bind(this, batch_num)}
                    >
                      {batch_num}
                    </a>
                  )
                }}
              </SheetColumn>
              <SheetColumn field='spu_id' name={i18next.t('商品ID')} />
              <SheetColumn field='spu_name' name={i18next.t('商品名')} />
              <SheetColumn
                field='amount'
                name={
                  <span className='gm-inline-block text-center'>
                    {i18next.t('入库数')}
                    <br />
                    {i18next.t('(基本单位)')}
                  </span>
                }
              >
                {(amount, index) => {
                  return amount + semi_list[index].std_unit_name
                }}
              </SheetColumn>
              <SheetColumn field='unit_price' name={i18next.t('入库单价')}>
                {(unit_price, index) => {
                  return (
                    unit_price +
                    Price.getUnit() +
                    '/' +
                    semi_list[index].std_unit_name
                  )
                }}
              </SheetColumn>
              <SheetColumn field='shelf_name' name={i18next.t('存放货位')}>
                {(shelf_name) => {
                  const len = shelf_name ? shelf_name.length : 0

                  if (Big(len).gt(7)) {
                    return (
                      <Trigger
                        showArrow
                        component={<div />}
                        type='hover'
                        popup={this.hoverTips(shelf_name)}
                      >
                        <p
                          style={{
                            width: '86px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {shelf_name}
                        </p>
                      </Trigger>
                    )
                  }
                  return shelf_name || '-'
                }}
              </SheetColumn>
              <SheetColumn field='in_stock_time' name={i18next.t('入库时间')} />
              <SheetColumn field='creator' name={i18next.t('操作人')} />
            </Sheet>
          </ManagePaginationV2>
        </QuickPanel>
      </div>
    )
  }
}

export default SemiInStock
