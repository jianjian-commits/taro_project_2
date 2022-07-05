// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Dialog, Tip, Button } from '@gmfe/react'
import { isLK } from '../util'
import orderDetailStore from './detail_store_old'

class TempImportDialogOld extends React.Component {
  handleOrderImport = () => {
    const { isImporting } = this.props
    if (isImporting) {
      Tip.info(i18next.t('正在上传中，请稍后 ~'))
      return
    }
    orderDetailStore.importChange({ importShow: false })
  }

  hideImportDialog = () => {
    orderDetailStore.importChange({ importShow: false })
  }

  handleExport = () => {
    const order = this.props.order
    const isEditPage = !isLK(order._id) && order.status <= 5

    const { customer } = order
    const sid = customer.address_id
    const time_config_id = order.time_config_info._id

    if (isEditPage) {
      window.open(
        `/station/order/import?time_config_id=${time_config_id}&order_id=${order._id}&sid=${sid}`
      )
    } else {
      window.open(
        `/station/order/import?time_config_id=${time_config_id}&sid=${sid}`
      )
    }
  }

  handleImport = () => {
    this.fileSelector.value = ''
    this.fileSelector.click()
  }

  handleFileChoosen = () => {
    orderDetailStore.importChange({ isImporting: true })

    const postData = {
      file: this.fileSelector.files[0],
      sid: this.props.order.customer.address_id,
      time_config_id: this.props.order.time_config_info._id,
    }
    if (this.props.modify) {
      postData.order_id = this.props.order._id
    }
    orderDetailStore
      .skuUpload(postData)
      .then(() => {
        Tip.success(i18next.t('上传成功'))

        orderDetailStore.importChange({
          isImporting: false,
          importShow: false,
        })
      })
      .catch(() => {
        orderDetailStore.importChange({
          isImporting: false,
        })
        Tip.warning(i18next.t('上传失败'))
      })
  }

  render() {
    const { show, isImporting } = this.props

    return (
      <Dialog
        show={show}
        title={i18next.t('模板导入')}
        onOK={this.handleOrderImport}
        onCancel={this.hideImportDialog}
        disableMaskClose
      >
        <div>
          <div>
            {i18next.t('第一步：下载当前运营时间下的')}
            <a onClick={this.handleExport} href='javascript:;' target='_blank'>
              {i18next.t('xlsx模板')}
            </a>
            {i18next.t('后，请根据以下要求填入内容')}
          </div>
          <ul style={{ fontSize: '12px' }}>
            <li>{i18next.t('商户ID：若为空，则读取上一行的商户ID')}</li>
            <li>
              {i18next.t(
                '商品ID：若与自定义编码列同时存在，则优先读取商品ID列，此时不得为空'
              )}
            </li>
            <li>
              {i18next.t('自定义编码：若通过自定义编码识别商品，则需')}
              <span className='gm-text-red'>{i18next.t('删除')}</span>
              {i18next.t('商品ID列，此时不得为空')}
            </li>
            <li>{i18next.t('下单数：必填')}</li>
            <li>{i18next.t('单价：若为空，则读取默认单价')}</li>
            <li>{i18next.t('备注：商品备注，可为空')}</li>
            <li>
              {i18next.t(
                '可以为辅助信息增加列（如“商品名”、“单位”），但系统不做解析'
              )}
            </li>
          </ul>
        </div>
        <div>
          <div>{i18next.t('第二步：上传xlsx文件')}</div>
          <div style={{ display: 'inline-block' }}>
            <input
              type='file'
              accept='.xlsx, xls'
              ref={(ref) => {
                this.fileSelector = ref
              }}
              onChange={this.handleFileChoosen}
              style={{ display: 'none' }}
            />
            <Button
              type='primary'
              plain
              onClick={this.handleImport}
              disabled={isImporting}
              className='gm-margin-left-10'
            >
              {isImporting ? i18next.t('上传中...') : i18next.t('上传')}
              &nbsp;&nbsp;
              <i className='ifont ifont-upload' />
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }
}

TempImportDialogOld.propTypes = {
  show: PropTypes.bool.isRequired,
  isImporting: PropTypes.bool.isRequired,
  order: PropTypes.object.isRequired,
  modify: PropTypes.bool,
}

export default TempImportDialogOld
