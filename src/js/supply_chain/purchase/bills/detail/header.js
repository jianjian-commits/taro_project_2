import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  Button,
  Dialog,
  Flex,
  FunctionSet,
  Input,
  Modal,
  MoreSelect,
  RightSideModal,
  Tip,
} from '@gmfe/react'
import moment from 'moment'
import { getPurchaseSheetStatus } from '../../../../common/filter'
import ReceiptHeaderDetail from '../../../../common/components/receipt_header_detail'
import store from './store'
import listStore from '../store'
import globalStore from '../../../../stores/global'
import _ from 'lodash'
import Big from 'big.js'
import { history } from 'common/service'
import { smartToFixed, getPurchaseTemList } from '../util'
import { isValid } from '../../util'
import PurchaseSendDialog from './components/info_send_dialog'
import BatchImportDialog from './components/batch_import_dialog'
import SidePrintModal from '../../components/side_print_modal'
import { openNewTab } from '../../../../common/util'
import ShareQrcode from '../../components/share_qrcode'
import PropTypes from 'prop-types'
import SupplierDel from 'common/components/supplier_del_sign'

// 是补货的
const isUnReplenishment = (task) => task.release_id !== undefined

@observer
class Header extends React.Component {
  constructor(props) {
    super(props)

    this.create = !this.props.id

    this.targetSupplierRef = React.createRef()
    this.targetPurchaserRef = React.createRef()

    this.state = {
      isSaving: false,
    }
  }

  handleSupplierSelect = (selected) => {
    store.changeEditTask(true)
    store.changeBillDetail('settle_supplier_id', selected.value)
    selected && store.getPurchaserList(selected.value)
  }

  handleSupplierKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      this.targetSupplierRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  handlePurchaserSelect = (selected) => {
    store.changeEditTask(true)
    store.changeBillDetail('purchaser_id', selected.value)
  }

  handlePurchaserKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      this.targetPurchaserRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  handleChangeBillRemark = (event) => {
    store.changeEditTask(true)
    store.changeBillDetail('sheet_remark', event.target.value)
  }

  getDetail = (id) => {
    const sheet_no = id || this.props.id
    store.getDetail(sheet_no)
  }

  checkParams = () => {
    const {
      billDetail: { purchaser_id, status },
      tasks,
    } = store
    const p_edit = globalStore.hasPermission('edit_purchase_sheet')
    const p_price_edit = this.create || (p_edit && status === 3)

    const params = []
    let isComplete = true
    if (!purchaser_id) {
      Tip.info(i18next.t('请选择采购员！'))
      return
    }

    _.find(tasks, (task) => {
      const obj = {}
      let purchase_price = null

      if (isUnReplenishment(task)) {
        if (!isValid(task.purchase_amount)) {
          Tip.info(i18next.t('数据未填写完整，请检查！'))
          isComplete = false
          return
        }

        if (p_price_edit && !isValid(task.purchase_price)) {
          Tip.info(i18next.t('数据未填写完整，请检查！'))
          isComplete = false
          return
        }

        purchase_price = p_price_edit
          ? Big(task.purchase_price).times(100).toString()
          : null
      } else {
        if (!(isValid(task.purchase_price) && isValid(task.purchase_amount))) {
          Tip.info(i18next.t('数据未填写完整，请检查！'))
          isComplete = false
          return
        }

        purchase_price = Big(task.purchase_price).times(100).toString()
      }
      if (task.purchase_price_value) {
        purchase_price = Big(
          task.purchase_price_value / task.purchase_amount,
        ).times(100)
      }

      if (
        task.spec_id === undefined ||
        task.spec_id === null ||
        task.spec_id === ''
      ) {
        Tip.info(i18next.t('数据未填写完整，请检查！'))
        isComplete = false
        return
      }

      obj.spec_id = task.spec_id
      if (task.id) obj.id = task.id
      obj.purchase_amount = _.toNumber(smartToFixed(task.purchase_amount))
      obj.purchase_price = _.toNumber(purchase_price)
      obj.goods_remark = task.goods_remark
      obj.purchase_money = _.toNumber(task.purchase_money)
      params.push(obj)
    })

    if (!isComplete) {
      return
    }

    return params
  }

  handleSubmit = () => {
    const { id } = this.props
    const {
      billDetail: { settle_supplier_id, purchaser_id, sheet_remark },
    } = store
    const params = this.checkParams()
    if (!params) return

    this.setState({
      isSaving: true,
    })
    // 新建即提交，create： submit为1
    if (!id) {
      return store
        .create(settle_supplier_id, purchaser_id, sheet_remark, params, 1)
        .then(() => {
          Tip.success(i18next.t('保存并提交成功'))
          history.push('/supply_chain/purchase/bills')
        })
        .finally(() => {
          this.setState({
            isSaving: false,
          })
        })
    } else if (store.isEditTask) {
      return this.handleSaveDraft(true).then((json) => {
        return store
          .submit(id)
          .then(() => this.getDetail(id))
          .finally(() => {
            this.setState({
              isSaving: false,
            })
          })
      })
    } else {
      return store
        .submit(id)
        .then(() => this.getDetail(id))
        .finally(() => {
          this.setState({
            isSaving: false,
          })
        })
    }
  }

  handleSaveDraft = (bool) => {
    const { id } = this.props
    const {
      billDetail: {
        settle_supplier_id,
        purchaser_id,
        sheet_remark,
        require_goods_sheet_status,
      },
    } = store
    const params = this.checkParams()
    if (!params) return

    // bool --true表示保存并提交，false表示保存草稿
    if (bool) {
      // 新建
      if (!id) {
        return store
          .create(settle_supplier_id, purchaser_id, sheet_remark, params, 1)
          .then(() => {
            Tip.success(i18next.t('保存并提交成功'))
            history.push('/supply_chain/purchase/bills')
          })
      }
      return store
        .save(id, settle_supplier_id, purchaser_id, sheet_remark, params, 0)
        .then(() => this.getDetail(id))
    } else {
      // 新建
      if (!id) {
        return store
          .create(settle_supplier_id, purchaser_id, sheet_remark, params, 0)
          .then(() => {
            Tip.success(i18next.t('保存草稿成功'))
            history.push('/supply_chain/purchase/bills')
          })
      }
      if (require_goods_sheet_status === 3) {
        return store
          .save(id, settle_supplier_id, purchaser_id, sheet_remark, params)
          .then(() => {
            Tip.success(i18next.t('修改成功'))
          })
          .then(() => this.getDetail(id))
      } else {
        return store.checkResend(id).then((json) => {
          const { resend } = json.data
          // 若单据已发送过供应商，则点击保存草稿的时候给出弹窗
          if (resend === 1) {
            Modal.render({
              children: (
                <PurchaseSendDialog
                  id={id}
                  settle_supplier_id={settle_supplier_id}
                  purchaser_id={purchaser_id}
                  sheet_remark={sheet_remark}
                  params={params}
                />
              ),
              title: i18next.t('提示'),
              size: 'sm',
              onHide: Modal.hide,
            })
          } else {
            return store
              .save(id, settle_supplier_id, purchaser_id, sheet_remark, params)
              .then(() => {
                Tip.success(i18next.t('修改成功'))
              })
              .then(() => this.getDetail(id))
          }
        })
      }
    }
  }

  handleHideModal = () => {
    Modal.hide()
  }

  handleBatchDialogToggle = () => {
    const { id } = this.props
    Modal.render({
      children: <BatchImportDialog id={id} onHide={this.handleHideModal} />,
      title: i18next.t('批量修改采购单据'),
      onHide: this.handleHideModal,
    })
  }

  handlePrint = ({ type }) => {
    openNewTab(
      `#/system/setting/distribute_templete/purchase_printer?sheet_no=${this.props.id}&tpl_id=${type}&print_what=bill`,
    )
    RightSideModal.hide()
  }

  handlePrintModal = async () => {
    const templates = await getPurchaseTemList()

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <SidePrintModal
          name='purchase_task_sheet_print'
          onPrint={this.handlePrint}
          templates={templates}
        />
      ),
    })
  }

  // 分享采购单据
  handleShareQrcode = (supplier_name, id) => {
    // 根据采购单id获取token
    listStore.getShareToken(id).then((json) => {
      const query = {
        group_id: globalStore.groupId,
        sheet_no: id,
        station_id: globalStore.user.station_id,
        token: json.data.token,
      }

      Dialog.dialog({
        title: i18next.t('采购单据分享'),
        children: (
          <ShareQrcode
            shareType='order'
            shareName={supplier_name}
            shareUrlParam={query}
          />
        ),
        OKBtn: false,
        size: 'md',
      })
    })
  }

  render() {
    const { id } = this.props
    const {
      billDetail: {
        purchase_sheet_id,
        settle_supplier_id,
        purchaser_id,
        sheet_remark,
        require_goods_sheet_status,
        status,
        supplier_name,
        purchaser_name,
        submit_time,
        operator,
        supplier_status,
      },
      purchaserList,
      supplyList,
    } = store
    const supplySelected = _.find(
      supplyList,
      (v) => v.value === settle_supplier_id,
    )
    const purchaserSelected = _.find(
      purchaserList,
      (v) => v.value === purchaser_id,
    )

    const p_edit = globalStore.hasPermission('edit_purchase_sheet')
    const p_export = globalStore.hasPermission('get_purchase_sheet_print')
    const p_share = globalStore.hasPermission('get_purchase_sheet_share')
    const p_submit_permission = globalStore.hasPermission(
      'submit_purchase_sheet',
    )
    console.log(globalStore.hasPermission('submit_purchase_sheet'), 'asdasd')

    const p_edit_remark = this.create || (p_edit && status === 3)
    const p_edit_supply =
      this.create ||
      (p_edit && require_goods_sheet_status === 1 && status === 3)
    const p_edit_purchaser = this.create || (p_edit && status !== 2)
    const p_submit = this.create || status !== 2

    return (
      <ReceiptHeaderDetail
        contentLabelWidth={60}
        contentCol={4}
        customeContentColWidth={[330, 280, 280, 280]}
        HeaderInfo={[
          {
            label: i18next.t('采购单据'),
            item: <div>{purchase_sheet_id || '-'}</div>,
          },
          {
            label: i18next.t('供应商'),
            item: (
              <Flex alignCenter>
                {supplier_status === 0 && <SupplierDel />}
                {p_edit_supply ? (
                  <Flex>
                    <MoreSelect
                      name='settle_supplier_id'
                      data={supplyList.slice()}
                      selected={supplySelected}
                      onSelect={this.handleSupplierSelect}
                      renderListFilterType='pinyin'
                      placeholder={i18next.t('请选择供应商')}
                      ref={this.targetSupplierRef}
                      onKeyDown={this.handleSupplierKeyDown}
                    />
                  </Flex>
                ) : (
                  <div>{supplier_name}</div>
                )}
              </Flex>
            ),
          },
          {
            label: i18next.t('采购员'),
            item: p_edit_purchaser ? (
              <MoreSelect
                name='purchaser_id'
                data={purchaserList.slice()}
                selected={purchaserSelected}
                onSelect={this.handlePurchaserSelect}
                renderListFilterType='pinyin'
                placeholder={i18next.t('请选择采购员')}
                ref={this.targetPurchaserRef}
                onKeyDown={this.handlePurchaserKeyDown}
              />
            ) : (
              <div>{purchaser_name}</div>
            ),
          },
        ]}
        ContentInfo={[
          {
            label: i18next.t('状态'),
            item: <div>{status ? getPurchaseSheetStatus(status) : '-'}</div>,
          },
          {
            label: i18next.t('提交时间'),
            item: (
              <div>
                {submit_time
                  ? moment(submit_time).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </div>
            ),
          },
          {
            label: i18next.t('创建人'),
            item: <div>{operator || '-'}</div>,
          },
          {
            label: i18next.t('单据备注'),
            item: p_edit_remark ? (
              <Input
                className='form-control'
                value={sheet_remark}
                maxLength={50}
                onChange={this.handleChangeBillRemark}
                name='sheet_remark'
                type='text'
              />
            ) : (
              <div>{sheet_remark}</div>
            ),
          },
        ]}
        HeaderAction={
          <Flex>
            {p_submit_permission && p_submit && (
              <Button
                loading={this.state.isSaving}
                type='primary'
                className='gm-margin-right-10'
                onClick={this.handleSubmit}
              >
                {i18next.t('保存并提交')}
              </Button>
            )}
            {(this.create ||
              (p_edit && status !== 2) ||
              p_export ||
              p_share) && (
              <FunctionSet
                right
                data={[
                  (this.create || status === 3) && {
                    text: i18next.t('保存草稿'),
                    onClick: this.handleSaveDraft.bind(this, false),
                  },
                  !this.create &&
                    p_edit &&
                    status !== 2 && {
                      text: i18next.t('批量修改'),
                      onClick: this.handleBatchDialogToggle,
                    },
                  !this.create &&
                    p_export && {
                      text: i18next.t('打印'),
                      onClick: this.handlePrintModal,
                    },
                  !this.create &&
                    p_share && {
                      text: i18next.t('分享单据'),
                      onClick: this.handleShareQrcode.bind(
                        this,
                        supplier_name,
                        id,
                      ),
                    },
                ].filter((_) => _)}
              />
            )}
          </Flex>
        }
      />
    )
  }
}

Header.propTypes = {
  id: PropTypes.string,
}

export default Header
