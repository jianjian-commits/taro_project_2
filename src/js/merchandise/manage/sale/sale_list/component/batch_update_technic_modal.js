import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Tip, Uploader, Button } from '@gmfe/react'
import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'

class BatchImportModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
    }
  }

  handleUploadFileSelect = (files) => {
    this.setState({
      file: files[0],
    })
  }

  handleDownload = () => {
    this.props.onDownload()
  }

  handleCancel = () => {
    this.setState({
      file: null,
    })
    this.props.onCancel()
  }

  handleImport = () => {
    const { file } = this.state
    if (!file) {
      Tip.warning(i18next.t('请选择文件上传！'))
      return
    }

    requireGmXlsx((res) => {
      const { sheetToJson } = res
      sheetToJson(file).then((json) => {
        const sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
          return false
        }
        this.props.onSubmit(file)
      })
    })
    this.setState({
      file: null,
    })
  }

  render() {
    const { file } = this.state

    return (
      <>
        <div>
          {i18next.t('上传需导入的文件')}
          <div className='gm-gap-10' />
          <Uploader onUpload={this.handleUploadFileSelect} accept='.xlsx'>
            <Button>{file ? i18next.t('重新上传') : i18next.t('上传')}</Button>
          </Uploader>
          {file ? <div className='gm-text-desc'>{file.name}</div> : <br />}
          <a style={{ cursor: 'pointer' }} onClick={this.handleDownload}>
            {i18next.t('下载导入模板')}
          </a>
        </div>
        <br />
        <div>
          {i18next.t('填写说明')}：
          <ul className='gm-text-desc' style={{ fontSize: '12px' }}>
            <li>
              <span>{i18next.t('商品ID（SKUID）')}：</span>
              <span>{i18next.t('报价单中销售商品的ID，不可删除')}</span>
            </li>
            <li>
              <span>{i18next.t('物料ID')}：</span>
              <span>{i18next.t('报价单中销售商品组成物料的ID，不可删除')}</span>
            </li>
            <li>
              <span>{i18next.t('工艺信息')}：</span>
              <span>
                {i18next.t(
                  '导出工艺资料中的所有工艺，可在所需工艺下填写或选择工艺信息'
                )}
              </span>
            </li>
          </ul>
        </div>

        <div className='text-right gm-margin-top-10'>
          <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleImport}>
            {i18next.t('确定')}
          </Button>
        </div>
      </>
    )
  }
}

BatchImportModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
}

export default BatchImportModal
