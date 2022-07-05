import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Big from 'big.js'
import { saleReferencePrice } from '../../../common/enum'
import actions from '../../../actions'
import { Flex, Popover, Price } from '@gmfe/react'
import { QuickTab } from '@gmfe/react-deprecated'
import classNames from 'classnames'
import { connect } from 'react-redux'

class PurchaseSuppliersBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tabKey: 0,
    }
    this.handleClickSuppliers = ::this.handleClickSuppliers
    this.handleChangeTab = ::this.handleChangeTab
    this.handleShareQrcode = ::this.handleShareQrcode
  }

  componentDidMount() {
    const { supplierPurchaserId } = this.props.purchase_task
    // 供应商是以T开头是字符串 采购员是数字类型 由此来区分供应商和采购员
    if (_.isNil(supplierPurchaserId)) {
      return this.setState({ tabKey: 0 })
    }
    this.setState({
      tabKey: _.isString(supplierPurchaserId) ? 0 : 1,
    })
  }

  handleClickSuppliers(data) {
    const { onListSearch } = this.props
    const chooseId =
      (data.purchaser && data.purchaser.id) ||
      (data.supplier && (data.supplier.id || '-1')) ||
      null
    // 更新最近的选中的id
    actions.purchase_task_side_bar_choose_id(chooseId)
    // 先添加最近的supplier的筛选方式，然后刷新页面的列表tasklist，onListSearch(supplier);
    actions.purchase_task_header_filter_change(data, true)
    onListSearch()
  }

  handleChangeTab(key) {
    this.setState({ tabKey: key })
  }

  handleShareQrcode(isSupplier, item, e) {
    e.stopPropagation()
    const name = isSupplier ? item.settle_supplier_name : item.purchaser_name
    const data = isSupplier
      ? { supplier: { id: item.settle_supplier_id } }
      : { purchaser: { id: item.purchaser_id } }
    const { handleShare } = this.props

    this.handleClickSuppliers(data)
    handleShare(name, isSupplier)
  }

  renderSupplierBarList(title, filterDataDetail, isSupplier) {
    const me = this
    const assignedContent = []
    const { reference_price_type, purchase_task, sharePermission } = this.props // sharePermission 分享权限
    const { supplierPurchaserId } = purchase_task
    let referencePriceFlag = ''

    _.find(saleReferencePrice, (item) => {
      if (item.type === reference_price_type) {
        referencePriceFlag = item.flag
        return true
      }
    })

    const supplierArr = _.sortBy(filterDataDetail, (supplier) => {
      return supplier[referencePriceFlag]
    })
    _.each(supplierArr, (item) => {
      const purchaserStatusText =
        !isSupplier && item.purchaser_status ? `(${item.purchaser_status})` : ''
      assignedContent.push(
        <div
          key={isSupplier ? item.settle_supplier_id : item.purchaser_id}
          className={classNames('b-purchase-suppliers-distance', {
            'b-purchase-suppliers-distance active':
              supplierPurchaserId ===
              (isSupplier ? item.settle_supplier_id : item.purchaser_id),
          })}
          onClick={me.handleClickSuppliers.bind(
            this,
            isSupplier
              ? { supplier: { id: item.settle_supplier_id } }
              : { purchaser: { id: item.purchaser_id } },
          )}
        >
          <div className='b-purchase-suppliers-name'>
            {isSupplier
              ? item.settle_supplier_name
              : item.purchaser_name + purchaserStatusText}
          </div>
          <div className='b-clearfix'>
            <span className='b-purchase-suppliers-block-50'>
              {i18next.t('菜品')}：{item.purchase_amount} {i18next.t('种')}
              {
                // 供应商剩余可供应小于0 显示预警
                isSupplier && item.warning_spec_count > 0 && (
                  <Popover
                    showArrow
                    component={<div />}
                    type='hover'
                    popup={
                      <div
                        className='gm-border gm-padding-5 gm-bg'
                        style={{ width: '150px' }}
                      >
                        {i18next.t(
                          /* src:`预警菜品：${item.warning_spec_count}种` => tpl:预警菜品：${num}种 */ 'purchase_supplier_warning_spec',
                          { num: item.warning_spec_count },
                        )}
                      </div>
                    }
                  >
                    <i className='xfont xfont-warning-circle gm-text-red text-danger gm-padding-left-5' />
                  </Popover>
                )
              }
            </span>
            <Flex row justifyBetween>
              <span className='b-purchase-suppliers-block-50'>
                {i18next.t('参考成本')}：
                {Big(item[referencePriceFlag] || 0)
                  .div(100)
                  .toFixed(2)}
                {Price.getUnit()}
              </span>

              {sharePermission && (
                <a
                  className='gm-margin-right-10'
                  onClick={this.handleShareQrcode.bind(this, isSupplier, item)}
                >
                  <i className='xfont xfont-share-bold' />
                </a>
              )}
            </Flex>
          </div>
        </div>,
      )
    })

    return (
      <div className='b-purchase-suppliers-bar' id='purchase-suppliers-bar'>
        <div className='b-purchase-suppliers-content'>
          <div
            onClick={this.handleClickSuppliers.bind(
              this,
              isSupplier ? { supplier: null } : { purchaser: null },
            )}
            className={classNames(
              'b-purchase-suppliers-distance gm-padding-tb-20',
              {
                'b-purchase-suppliers-distance active':
                  supplierPurchaserId === null,
              },
            )}
          >
            {title}
          </div>
          {assignedContent}
        </div>
      </div>
    )
  }

  render() {
    const { tabKey } = this.state
    const { purchase_task } = this.props
    const { supplierPurchaserFilter } = purchase_task

    return (
      <Flex column>
        <QuickTab
          active={tabKey}
          justified
          tabs={[i18next.t('供应商'), i18next.t('采购员')]}
          onChange={this.handleChangeTab}
          isStatic
        >
          {this.renderSupplierBarList(
            i18next.t('全部供应商'),
            supplierPurchaserFilter.suppliers,
            true,
          )}
          {this.renderSupplierBarList(
            i18next.t('全部采购员'),
            supplierPurchaserFilter.purchaser,
            false,
          )}
        </QuickTab>
      </Flex>
    )
  }
}

PurchaseSuppliersBar.propTypes = {
  fliterData: PropTypes.object,
  purchase_task: PropTypes.object,
  handleShare: PropTypes.func,
  onListSearch: PropTypes.func,
  reference_price_type: PropTypes.string,
  sharePermission: PropTypes.bool,
}

PurchaseSuppliersBar.defaultProps = {
  fliterData: {},
}

export default connect((state) => ({
  purchase_task: state.purchase_task,
}))(PurchaseSuppliersBar)
