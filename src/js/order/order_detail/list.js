import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { BoxPanel } from '@gmfe/react'
import { observer, Observer } from 'mobx-react'

import { refPriceTypeHOC } from '../../common/components/ref_price_type_hoc'

import { isLK } from '../util'
import TempImportDialog from './components/temp_import_dialog'
import Action from './components/action'
import PanelTitle from './components/panel_title'
import Summary from './components/summary'
import TurnoverAll from './components/turnover_all'
import ViewTable from './view_table'
import EditTable from './edit_table'
import Permission from '../../common/components/permission'

import orderDetailStore from '../store'
// 若修改了列表相关字段，记得修改这里，因为localStorage会缓存!!!
const FILTER_STORAGE = '_sku_detail_filterBox_V1.2'

@refPriceTypeHOC(3, orderDetailStore.refPriceTypeSet)
@observer
class Component extends React.Component {
  render() {
    const {
      isQuantityEditable,
      modify,
      cleanFoodStation,
      postRefPriceType,
      isPriceEditable,
      showOuterId,
    } = this.props
    const { orderDetail } = orderDetailStore
    const { viewType, repair, _id } = orderDetail

    // 是否是详情页
    const isIdDetail = this.props.query && this.props.query.id
    const isLKOrder = isLK(_id)

    return (
      <div>
        <Observer>
          {() => {
            const { totalPay } = orderDetailStore.summary
            return totalPay < 0 ? (
              <div className='gm-padding-10 b-warning-tips'>
                <i className='ifont xfont-warning-circle' />
                {i18next.t(
                  '当前销售额已小于0，保存订单后优惠券将被返还至用户账户，订单按原价计算',
                )}
              </div>
            ) : null
          }}
        </Observer>
        <BoxPanel
          icon='bill'
          title={i18next.t('订单明细')}
          summary={
            <>
              <PanelTitle isIdDetail={isIdDetail} />
              <Observer>
                {() => {
                  const { details: skus } = orderDetail
                  return (
                    <>
                      <Summary skus={skus.slice()} viewType={viewType} />
                      {isIdDetail && (
                        <Permission field='get_turnover_loan_sheet'>
                          <TurnoverAll
                            skus={skus.slice()}
                            viewType={viewType}
                          />
                        </Permission>
                      )}
                    </>
                  )
                }}
              </Observer>
            </>
          }
          collapse
          right={<Action isLKOrder={!!isLKOrder} repair={repair} />}
        >
          {viewType === 'view' ? (
            <ViewTable
              postRefPriceType={postRefPriceType}
              showOuterId={showOuterId}
              filterStorageKey={FILTER_STORAGE + 'view'}
              cleanFoodStation={cleanFoodStation}
              isPriceEditable={isPriceEditable}
              isQuantityEditable={isQuantityEditable}
            />
          ) : (
            <EditTable
              filterStorageKey={FILTER_STORAGE + 'edit'}
              showOuterId={showOuterId}
              isPriceEditable={isPriceEditable}
              postRefPriceType={postRefPriceType}
              cleanFoodStation={cleanFoodStation}
              isQuantityEditable={isQuantityEditable}
            />
          )}
          {!repair && !isLKOrder ? (
            <Observer>
              {() => {
                const { orderListImport } = orderDetailStore
                return (
                  <TempImportDialog
                    show={orderListImport.importShow}
                    isImporting={orderListImport.isImporting}
                    modify={modify}
                    order={orderDetail}
                  />
                )
              }}
            </Observer>
          ) : null}
        </BoxPanel>
        <div style={{ height: '300px' }} />
      </div>
    )
  }
}

Component.propTypes = {
  isPriceEditable: PropTypes.bool, // 价格可编辑
  cleanFoodStation: PropTypes.bool, // 净菜站点
  showOuterId: PropTypes.bool, // 自定义编码
  refPriceType: PropTypes.number,
  postRefPriceType: PropTypes.func,
  query: PropTypes.object,
  isQuantityEditable: PropTypes.bool,
  modify: PropTypes.bool,
}

export default Component
