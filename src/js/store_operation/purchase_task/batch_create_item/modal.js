import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Modal, Uploader, Button, Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import store from './store'
import { history } from '../../../common/service'

class BatchImportDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
    }
  }

  handleImport = () => {
    const { file } = this.state
    if (!file) {
      Tip.warning(t('请选择文件！'))
      return
    }

    Request('/purchase/task/import')
      .data({ file })
      .post()
      .then((json) => {
        store.setData(json.data)

        history.push('/supply_chain/purchase/task/batch_create_item')
        Tip.success('导入完成！')
        Modal.hide()
      })
  }

  handleCancel = () => {
    Modal.hide()
  }

  handleUploadFileChoosen = (files) => {
    this.setState({ file: files[0] })
  }

  handleDownload() {
    // TODO: 修改url找到地方
    window.open('/purchase/task/export_excel?export_type=1')
  }

  handleDownloadAll() {
    window.open('/purchase/task/export_excel?export_type=2')
  }

  render() {
    const { file } = this.state

    return (
      <div>
        <div>
          <div>
            {i18next.t('上传文件')}
            <div className='gm-gap-10' />

            <Uploader onUpload={this.handleUploadFileChoosen} accept='.xlsx'>
              <Button type='primary' plain>
                {file ? i18next.t('重新上传') : i18next.t('上传')}
                <i className='ifont ifont-upload gm-margin-left-5' />
              </Button>
            </Uploader>

            {file ? <div className='gm-text-desc'>{file.name}</div> : <br />}

            <div className='gm-margin-top-10'>
              <a style={{ cursor: 'pointer' }} onClick={this.handleDownload}>
                {i18next.t('下载导入模板(空)')}
              </a>
            </div>
            <div>
              <a style={{ cursor: 'pointer' }} onClick={this.handleDownloadAll}>
                {i18next.t('下载导入模板(所有采购规格)')}
              </a>
            </div>
          </div>
          <br />
          <div>
            {i18next.t('填写说明')}：
            <ol
              className='gm-text-desc gm-padding-0 gm-margin-left-20'
              style={{ fontSize: '12px' }}
            >
              <li>
                {t('请务必填写')}
                <span className='gm-text-red'>{t('采购规格ID')}</span>
                {t('与')}
                <span className='gm-text-red'>{t('采购量')}</span>
                {t('，系统将根据此ID定位到相关商品，以补充到计划采购数量；')}
              </li>
              <li>
                {t(
                  '供应商若填写，系统将以导入的数据优先；若为空，则在二次确认页面上选择供应商',
                )}
              </li>
            </ol>
          </div>
        </div>
        <div className='text-right gm-margin-top-10'>
          <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleImport}>
            {i18next.t('确定')}
          </Button>
        </div>
      </div>
    )
  }
}

export default BatchImportDialog
