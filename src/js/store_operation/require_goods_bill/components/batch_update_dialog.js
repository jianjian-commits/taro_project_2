import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Dialog, Tip, Button } from '@gmfe/react'
import requireStore from '../store'

@observer
class ImportDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
      file_msg: null,
    }

    this.handleUploadFileSelect = ::this.handleUploadFileSelect
    this.handleUploadFileChoosen = ::this.handleUploadFileChoosen
    this.handleRequireGoodsUpload = ::this.handleRequireGoodsUpload
    this.handleRequireGoodsUploadCancel = ::this.handleRequireGoodsUploadCancel
  }

  handleRequireGoodsUpload() {
    const { file } = this.state

    if (!file) {
      this.setState({
        file_msg: i18next.t('请选择文件上传!'),
      })
      return false
    }

    requireStore
      .updateRequireGoodsBatchImport(this.props.require_goods_id, file)
      .then(() => {
        Tip.success(i18next.t('导入成功'))
        window.location.reload()
      })
      .catch(() => {
        this.props.onHide()
      })
  }

  handleRequireGoodsUploadCancel() {
    this.setState({
      file: null,
      file_msg: null,
    })
    this.props.onHide()
  }

  handleUploadFileChoosen() {
    this.setState({ file: this.refBatchXlsx.files[0] })
  }

  handleUploadFileSelect() {
    this.refBatchXlsx.click()
  }

  render() {
    const { show } = this.props
    const { file, file_msg } = this.state

    return (
      <Dialog
        show={show}
        title={i18next.t('批量修改要货单据')}
        onOK={this.handleRequireGoodsUpload}
        onCancel={this.handleRequireGoodsUploadCancel}
        disableMaskClose
      >
        <div>
          {i18next.t(
            '说明：本工具用来修改要货单据已有商品的数量和单价，无法添加商品'
          )}
        </div>
        <div className='gm-margin-top-10'>
          <div>
            {i18next.t('第一步：导出')}
            <a
              href={`/stock/require_goods_sheet/detail/export?id=${this.props.require_goods_id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {i18next.t('当前要货单据')}
            </a>
            {i18next.t('后，请根据以下要求填入内容')}
          </div>
          <div>
            <ul style={{ fontSize: '12px' }}>
              <li>{i18next.t('供货数量：若不为空，则默认读取本列')}</li>
              <li>{i18next.t('供货单价：使用基本单位，若为空则不修改单价')}</li>
              <li>
                {i18next.t(
                  '可以增加辅助信息列（如“商品名”、“单位”），但系统不做解析'
                )}
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div>{i18next.t('第二步：上传xlsx文件')}</div>
          <div>
            <Button onClick={this.handleUploadFileSelect}>
              {file ? i18next.t('重新上传') : i18next.t('上传')}
            </Button>
            <input
              type='file'
              ref={(ref) => {
                this.refBatchXlsx = ref
              }}
              onChange={this.handleUploadFileChoosen}
              style={{ display: 'none' }}
            />
            {file ? (
              <span className='gm-text-desc gm-margin-left-5'>{file.name}</span>
            ) : null}
          </div>
          {file_msg && <span className='gm-text-red'>{file_msg}</span>}
        </div>
      </Dialog>
    )
  }
}

ImportDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  require_goods_id: PropTypes.number.isRequired,
  onHide: PropTypes.func.isRequired,
}

export default ImportDialog
