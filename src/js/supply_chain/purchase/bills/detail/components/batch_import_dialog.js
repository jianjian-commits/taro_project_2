import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Flex, Tip, Button } from '@gmfe/react'
import store from '../store'

@observer
class BatchImportDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
      file_msg: null,
    }
  }

  handleOrderUpload = () => {
    const { file } = this.state

    if (!file) {
      this.setState({
        file_msg: i18next.t('请选择文件上传!'),
      })
      return false
    }

    store
      .batchImport(this.props.id, file)
      .then(() => {
        Tip.success(i18next.t('导入成功'))
        window.location.reload()
      })
      .catch(() => {
        this.props.onHide()
      })
  }

  handleOrderUploadCancel = () => {
    this.setState({
      file: null,
      file_msg: null,
    })
    this.props.onHide()
  }

  handleUploadFileChoosen = () => {
    this.setState({ file: this.refBatchXlsx.files[0] })
  }

  handleUploadFileSelect = () => {
    this.refBatchXlsx.click()
  }

  render() {
    const { file, file_msg } = this.state

    return (
      <div>
        <Flex row>
          <div style={{ minWidth: '38px' }}>{i18next.t('说明：')}</div>
          <div>
            <div>
              {i18next.t(
                '本工具用来修改采购单据已有商品的数量和单价，无法添加商品',
              )}
            </div>
            <div>
              {i18next.t(
                '若已发送要货申请，修改后数据不会同步更新到供应商系统，如需更新，请在页面修改后点击保存草稿',
              )}
            </div>
          </div>
        </Flex>

        <div className='gm-margin-top-10'>
          <div>
            {i18next.t('第一步：导出')}
            <a
              href={`/stock/purchase_sheet/export?sheet_id=${this.props.id}`}
              target='_blank'
            >
              {i18next.t('当前采购单据')}
            </a>
            {i18next.t('后，请根据以下要求填入内容')}
          </div>
          <div>
            <ul style={{ fontSize: '12px' }}>
              <li>{i18next.t('采购规格ID：商品识别码，请不要修改')}</li>
              <li>
                {i18next.t(
                  '采购数量(采购单位)：若和“采购数量(基本单位)”都不为空，则默认读取本列',
                )}
              </li>
              <li>
                {i18next.t(
                  '采购数量(基本单位)：说明同上，若两列都为空，则不修改采购数量',
                )}
              </li>
              <li>{i18next.t('采购单价：使用基本单位，若为空则不修改单价')}</li>
              <li>
                {i18next.t(
                  '可以增加辅助信息列（如“商品名”、“单位”），但系统不做解析',
                )}
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div>{i18next.t('第二步：上传xlsx文件')}</div>
          <div>
            <Button type='default' onClick={this.handleUploadFileSelect}>
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
        <div className='text-right gm-margin-top-10'>
          <Button type='default' onClick={this.handleOrderUploadCancel}>
            {i18next.t('取消')}
          </Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleOrderUpload}>
            {i18next.t('确定')}
          </Button>
        </div>
      </div>
    )
  }
}

BatchImportDialog.propTypes = {
  id: PropTypes.string.isRequired,
  onHide: PropTypes.func,
}

export default BatchImportDialog
