/**
 * @description 报价单列表上方操作按钮
 */
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import {
  Button,
  Dialog,
  Flex,
  FunctionSet,
  Modal,
  Tip,
  RightSideModal,
} from '@gmfe/react'
import { history } from 'common/service'
import qs from 'query-string'
import globalStore from 'stores/global'
import batchImportStore from '../sku_batch_import_list/store'
import BatchImportModal from './batch_import_sku'
import BatchUpdateTechnicModal from './batch_update_technic_modal'
import TaskList from '../../../../../task/task_list'
import { getQueryFilter } from '../util'
import { withRouter } from 'react-router'
@withRouter
@observer
class SaleListAction extends React.Component {
  constructor(props) {
    super(props)
    this.refImportInput = React.createRef()
  }

  handleCreate = () => {
    const { salemenuType, id } = this.props.query
    history.push(
      `/merchandise/manage/sale/sku_detail?salemenuId=${id}&salemenuType=${salemenuType}`,
    )
  }

  handleBatchUpdate = () => {
    this.refImportInput && this.refImportInput.current.click()
  }

  renderTaskList = () => {
    RightSideModal.render({
      children: <TaskList tabKey={1} />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  handleUploadExcel = (e) => {
    const file = e.target.files[0]
    this.refImportInput.current.value = ''

    const { id } = this.props.query
    Dialog.dialog({
      title: i18next.t('提示'),
      children: <div>{i18next.t('是否确定上传') + file.name}</div>,
      onOK: () => {
        store.batchUpload(file, globalStore.stationId, id).then(() => {
          setTimeout(() => {
            this.renderTaskList()
          })
        })
      },
    })
  }

  handleBatchCreate = (typeName) => {
    Modal.render({
      title: i18next.t('批量新建'),
      children: (
        <BatchImportModal
          isCleanFoodType={typeName === 'cleanFood'}
          onCancel={() => Modal.hide()}
          onSubmit={this.handleBatchCreateSubmit}
        />
      ),
      onHide: Modal.hide,
    })
  }

  handleBatchCreateSubmit = (file, isCleanFood, template_id) => {
    const { id, salemenuType, name } = this.props.query
    const req = {
      salemenu_id: id,
      group_id: globalStore.groupId,
      station_id: globalStore.stationId,
      excel: file,
      is_clean_food: isCleanFood ? 1 : 0,
    }

    // 毛菜
    if (!isCleanFood && template_id) {
      batchImportStore.batchImportSku(id, template_id, file).then((json) => {
        if (json.code === 0) {
          Tip.success(i18next.t('导入成功！'))
          history.push(
            `/merchandise/manage/sale/sale_list/sku_batch_import_list?${qs.stringify(
              {
                id,
                name,
                salemenuType,
                template_id,
              },
            )}`,
          )
          Modal.hide()
        }
      })
      // 净菜
    } else {
      store.importSku(req).then((json) => {
        if (json.code === 0) {
          Tip.success(i18next.t('导入成功！'))
          store.doFirstRequest()
          Modal.hide()
        }
      })
    }
  }

  /**
   * 确认批量修改工艺
   * {{excel}} file excel
   */
  handleBatchUpdateTechnicSubmit = (excel) => {
    const { id } = this.props.location.query
    store.updateTechnic({ excel: excel, salemenu_id: id }).then((json) => {
      if (json.code === 0) {
        this.renderTaskList()
      }
    })
  }

  /**
   * 下载修改工艺模版
   * {{excel}} file excel
   */
  handleDownloadTechnic = () => {
    const { id } = this.props.location.query
    const filter = getQueryFilter(store.filter, id)

    const reqData = { ...filter, q: filter.text }
    delete reqData.text

    store.getTechnicTemp(reqData).then((json) => {
      if (json.code === 0) {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      }
    })
  }

  handleBatchUpdateTechic = () => {
    Modal.render({
      title: i18next.t('批量修改工艺'),
      children: (
        <BatchUpdateTechnicModal
          onCancel={() => Modal.hide()}
          onSubmit={this.handleBatchUpdateTechnicSubmit}
          onDownload={this.handleDownloadTechnic}
        />
      ),
      onHide: Modal.hide,
    })
  }

  render() {
    const { id, salemenuType, name } = this.props.query
    const p_editPrioritySupplier = globalStore.hasPermission(
      'edit_priority_supplier',
    )
    const p_add_import_sale_skus = globalStore.hasPermission(
      'add_import_sale_skus',
    )
    const p_edit_sku_batch = globalStore.hasPermission('edit_sku_batch')
    const isCleanFoodStation = globalStore.isCleanFood()
    // const isCleanFoodStation = true
    return (
      <Flex>
        <input
          accept='.xlsx'
          type='file'
          ref={this.refImportInput}
          onChange={this.handleUploadExcel}
          style={{ display: 'none' }}
        />
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={this.handleCreate}
        >
          {i18next.t('新建商品')}
        </Button>
        <FunctionSet
          right
          data={[
            {
              text: i18next.t('批量修改商品'),
              onClick: this.handleBatchUpdate,
              show: p_edit_sku_batch,
            },
            {
              text: isCleanFoodStation
                ? i18next.t('批量新建毛菜商品')
                : i18next.t('批量新建'),
              onClick: () => this.handleBatchCreate('notCleanFood'),
              show: p_add_import_sale_skus,
            },
            isCleanFoodStation && {
              text: i18next.t('批量新建净菜商品'),
              onClick: () => this.handleBatchCreate('cleanFood'),
              show: p_add_import_sale_skus,
            },
            isCleanFoodStation && {
              text: i18next.t('批量修改工艺'),
              onClick: this.handleBatchUpdateTechic,
            },
            {
              text: i18next.t('周期定价'),
              onClick: () =>
                window.open(
                  `#/merchandise/manage/sale/cycle_pricing?salemenu_id=${id}&salemenu_name=${name}`,
                ),
            },
            {
              text: i18next.t('库存设置'),
              onClick: () =>
                window.open(
                  `#/merchandise/manage/sale/stock_setting?station_id=${globalStore.stationId}&id=${id}&salemenuType=${salemenuType}`,
                ),
            },
            {
              text: i18next.t('优先供应商设置'),
              show: p_editPrioritySupplier,
              onClick: () => {
                window.open(
                  `#/merchandise/manage/sale/priority_supplier?salemenu_id=${id}&name=${name}`,
                )
              },
            },
            {
              text: i18next.t('默认服务设置'),
              show: +salemenuType === 2,
              onClick: () => window.open(`/station/config/sku/${id}`),
            },
            {
              text: i18next.t('批量服务设置'),
              show: +salemenuType === 2,
              onClick: () =>
                window.open(`/station/skuproducts/servetype/${id}`),
            },
          ].filter((v) => v)}
        />
      </Flex>
    )
  }
}

SaleListAction.propTypes = {
  query: PropTypes.object,
}

export default SaleListAction
