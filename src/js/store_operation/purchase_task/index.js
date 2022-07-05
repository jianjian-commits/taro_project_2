import classNames from 'classnames'
import { i18next, t } from 'gm-i18n'
import _ from 'lodash'
import React from 'react'
import {
  Dialog,
  Drawer,
  Flex,
  Loading,
  Modal,
  BoxTable,
  RightSideModal,
  FunctionSet,
  Button,
} from '@gmfe/react'
import PropTypes from 'prop-types'

import actions from '../../actions'
import { history } from 'common/service'
import { openNewTab } from '../../common/util'
import './actions.js'
import PurchaseListHeader from './components/purchase_list_header'
import PurchaseSuppliersBar from './components/purchase_suppliers_bar'
import PurchaseTaskPanel from './components/purchase_task_panel'
import ShareQrcode from './components/share_qrcode'
import SidePrintModal from './components/side_print_modal'
import { refPriceTypeHOC } from '../../common/components/ref_price_type_hoc'
import { getSearchOption, getPurchaseTemList } from './util'
import './reducer.js'
import globalStore from '../../stores/global'
import BatchCreateItemModal from './batch_create_item/modal'
import TableTotalText from 'common/components/table_total_text'

@refPriceTypeHOC(2, actions.purchase_task_set_reference_price_type)
class PurchaseOrder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      initLoading: true,
    }
  }

  async componentDidMount() {
    // 江苏一乙定制需求（group:1232,station_id:T39044）
    globalStore.fetchCustomizedConfigs()
    if (
      (globalStore.groupId === 244 && globalStore.stationId === 'T4969') ||
      (globalStore.groupId === 1232 && globalStore.stationId === 'T39044')
    ) {
      const { station_id, station_name } = globalStore.user
      actions.purchase_get_child_stations({ station_id, station_name })
    }
    // 获取服务时间
    await actions.purchase_task_get_service_time()
    this.setState({
      initLoading: false,
    })
    const isSupplierUser = globalStore.isSettleSupply()
    !isSupplierUser && actions.purchase_sourcer_search()
    actions.purchase_task_get_filter_init_data()
    actions.purchase_get_address_label()
    actions.purchase_get_address_list()
  }

  componentWillUnmount() {
    actions.purchase_task_header_filter_clear()
  }

  handleListSearch = (e) => {
    console.log(e, 'eee.....');
    const { limit } = this.props.purchase_task.taskListPagination
    e && e.preventDefault()
    actions.purchase_task_pagination_reset()
    actions.purchase_task_batch_modify_change({
      selectAllPage: 0,
    })
    actions.setPagination({ offset: 0, limit })
    actions.purchase_task_list_search(
      this.getSearchOption({ offset: 0, limit }),
    )
    actions.purchase_list_get_all_supplier_purchaser(
      this.getSearchOption(null, true),
    )
  }

  getSearchOption = (page, isSearchForSupplierBar) => {
    return getSearchOption(
      this.props.purchase_task,
      page,
      isSearchForSupplierBar,
    )
  }

  handleCreatePurchaseItem = () => {
    const { purchase_task } = this.props
    const { serviceTimes } = purchase_task
    const { time_config_id } = purchase_task.headerFilter
    history.push({
      pathname: '/supply_chain/purchase/task/batch_create_specs',
      query: {
        serviceTimes: JSON.stringify(serviceTimes),
        time_config_id: JSON.stringify(time_config_id),
      },
    })
  }

  handleBatchCreatePurchaseItem = () => {
    Modal.render({
      title: i18next.t('导入说明'),
      children: <BatchCreateItemModal />,
      onHide: Modal.hide,
      style: {
        width: '500px',
      },
    })
  }

  getPrintQueryString(obj) {
    const options = this.getSearchOption({})
    delete options.limit
    delete options.offset

    Object.assign(options, obj)

    return _.reduce(
      options,
      (str, option, key) => {
        if (_.isNil(option) || option === '') {
          return str
        }
        return str + `&${key}=${option}`
      },
      '',
    )
  }

  handlePrint = ({ type, isOldPrint }) => {
    if (isOldPrint) {
      const qs = this.getPrintQueryString({ printType: type })
      openNewTab('#/supply_chain/purchase/task/print?' + qs)
    } else {
      const qs = this.getPrintQueryString({ tpl_id: type, print_what: 'task' })
      openNewTab('#/system/setting/distribute_templete/purchase_printer?' + qs)
    }
    RightSideModal.hide()
  }

  showSidePrintModal = async () => {
    const templateList = await getPurchaseTemList()
    let templates = [
      ...templateList,
      {
        type: '-1',
        name: i18next.t('采购明细-系统预设'),
        desc: i18next.t('系统提供的固定模板，商户明细区分展现，无汇总数据'),
        isOldPrint: true,
      },
    ]
    // 定制客户
    if (globalStore.isNBLA()) {
      templates = templates.concat([
        { type: '0', name: i18next.t('绿奥定制'), isOldPrint: true },
      ])
    }
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <SidePrintModal
          name='purchase_task_print'
          onPrint={this.handlePrint}
          templates={templates}
        />
      ),
    })
  }

  /**
   * 获取token分享
   * @param name
   * @param isSupplier {bool}  true:供应商  false: 采购员
   */
  handleShowQrcode = (name, isSupplier) => {
    const options = this.getSearchOption({})
    delete options.limit
    delete options.offset
    // 分享没有多个供应商，处理一下，用settle_supplier_id
    options.settle_supplier_id = JSON.parse(options.settle_supplier_ids)[0]
    delete options.settle_supplier_ids

    if (isSupplier) {
      // 如果是供应商,去掉采购员id
      delete options.purchaser_id
    } else {
      // 如果是采购员,就去掉供应商id
      delete options.settle_supplier_id
    }

    // 去掉null
    const param = {}
    _.each(options, (value, key) => {
      if (value !== null) {
        param[key] = value
      }
    })

    // 根据搜索条件获取token
    actions.purchase_get_task_token(options).then((json) => {
      const token = json.data.token
      param.token = token
      param.group_id = window.g_group_id
      param.station_id = globalStore.stationId

      Dialog.dialog({
        title: i18next.t('采购任务分享'),
        children: (
          <ShareQrcode
            shareType='task'
            shareName={name}
            shareUrlParam={param}
          />
        ),
        OKBtn: false,
        size: 'md',
      })
    })
  }

  handlePopupOverview(isSupplierUser, reference_price_type) {
    if (isSupplierUser) return false
    Drawer.render({
      onHide: Drawer.hide,
      style: { width: '300px', overflowY: 'auto' },
      opacityMask: true,
      children: (
        <div>
          <PurchaseSuppliersBar
            onListSearch={this.handleListSearch}
            handleShare={this.handleShowQrcode}
            sharePermission={globalStore.hasPermission(
              'get_purchase_task_share',
            )}
            onFilterSupplierChange={this.handleFilterSupplierChange}
            reference_price_type={reference_price_type}
          />
        </div>
      ),
    })
  }

  handleGetHistoryData = (e) => {
    e.preventDefault()
    window.open('#/supply_chain/purchase/task/history')
  }

  render() {
    const { purchase_task, refPriceType, postRefPriceType } = this.props
    const {
      taskList,
      reference_price_type,
      supplierPurchaserFilter,
    } = purchase_task

    // 只要有一个供应商 供应不足 添加预警标记
    const supplyNotEnough = _.some(
      supplierPurchaserFilter.suppliers,
      (supplier) => {
        return supplier.warning_spec_count > 0
      },
    )
    const { initLoading } = this.state
    const canExport = globalStore.hasPermission('get_purchase_task_print')
    const isSupplierUser = globalStore.isSettleSupply()

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
          <PurchaseListHeader
            onSearch={this.handleListSearch}
            getSearchOption={this.getSearchOption.bind(this)}
          />
          <BoxTable
            info={
              <Flex>
                <BoxTable.Info>
                  <TableTotalText
                    data={[
                      {
                        label: i18next.t('任务总数'),
                        content:
                          this.props.purchase_task.taskListPagination.count ||
                          0,
                      },
                    ]}
                  />
                </BoxTable.Info>
                <BoxTable.Info>
                  <a
                    onClick={this.handleGetHistoryData}
                    className='gm-margin-left-20 gm-cursor gm-text-14'
                  >
                    {i18next.t('历史数据')}
                  </a>
                </BoxTable.Info>
              </Flex>
            }
            action={
              <div>
                {!isSupplierUser &&
                  globalStore.hasPermission('add_purchase_task_item') && (
                    <Button
                      type='primary'
                      className='gm-margin-right-10'
                      onClick={this.handleCreatePurchaseItem}
                    >
                      {t('新建采购条目')}
                    </Button>
                  )}

                <FunctionSet
                  right
                  data={[
                    {
                      text: i18next.t('批量新建条目'),
                      show:
                        !isSupplierUser &&
                        globalStore.hasPermission(
                          'add_purchase_task_item_import',
                        ),
                      onClick: this.handleBatchCreatePurchaseItem,
                    },
                    {
                      text: i18next.t('单据打印'),
                      show: canExport,
                      onClick: this.showSidePrintModal,
                    },
                  ]}
                />
              </div>
            }
          >
            <Flex column>
              <PurchaseTaskPanel
                purchase_task={purchase_task}
                isSupplierUser={isSupplierUser}
                postRefPriceType={postRefPriceType}
                refPriceType={refPriceType}
                getSearchOption={this.getSearchOption}
              />
            </Flex>
          </BoxTable>
        </div>
        {taskList.length > 0 && (
          <div
            className={classNames('b-overview gm-border gm-padding-5', {
              'b-purchase-red-mark': supplyNotEnough,
            })}
            onClick={() =>
              this.handlePopupOverview(isSupplierUser, reference_price_type)
            }
          >
            {i18next.t('总览')}
          </div>
        )}
      </div>
    )
  }
}
PurchaseOrder.propTypes = {
  purchase_task: PropTypes.Object,
  refPriceType: PropTypes.number,
  postRefPriceType: PropTypes.func,
}
export default PurchaseOrder
