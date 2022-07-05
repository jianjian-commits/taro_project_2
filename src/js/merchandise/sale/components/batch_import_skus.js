import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Tip, Button } from '@gmfe/react'
import _ from 'lodash'

import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'

class BatchImportDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
    }

    this.handleImport = ::this.handleImport
    this.handleCancel = ::this.handleCancel
    this.handleUploadFileSelect = ::this.handleUploadFileSelect
    this.handleUploadFileChoosen = ::this.handleUploadFileChoosen
    this.handleDownload = ::this.handleDownload
  }

  handleImport() {
    const { postData, onImport } = this.props
    const { file } = this.state
    const data = Object.assign({}, postData, { excel: file })
    if (!file) {
      Tip.warning(i18next.t('请选择文件上传！'))
      return
    }

    requireGmXlsx((res) => {
      const { sheetToJson } = res
      sheetToJson(this.refBatchXlsx.files[0]).then((json) => {
        let sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
          return false
        }
        onImport(data)
      })
    })

    this.setState({ file: null })
  }

  handleCancel() {
    this.setState({ file: null })
    this.props.onHide()
  }

  handleUploadFileSelect() {
    this.refBatchXlsx.click()
  }

  handleUploadFileChoosen() {
    this.setState({ file: this.refBatchXlsx.files[0] })
  }

  handleDownload() {
    window.open('/product/sku/export_sku_excel')
  }

  render() {
    const { show, title } = this.props
    const { file } = this.state

    return (
      <Modal
        style={{ width: '480px' }}
        show={show}
        title={title}
        onHide={this.handleCancel}
        disableMaskClose
      >
        <div>
          <div>
            {i18next.t('上传需导入的文件')}
            <div className='gm-gap-10' />
            <Button onClick={this.handleUploadFileSelect}>
              {file ? i18next.t('重新上传') : i18next.t('上传')}
            </Button>
            <input
              type='file'
              multiple='false'
              accept='.xlsx, .xls'
              ref={(ref) => {
                this.refBatchXlsx = ref
              }}
              onChange={this.handleUploadFileChoosen}
              style={{ display: 'none' }}
            />
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
                <span>{i18next.t('SPUID（必填）')}:</span>
                <span>
                  {i18next.t('导入规格的SPUID信息，在分类信息中可导出查看；')}
                </span>
              </li>
              <li>
                <span>{i18next.t('自定义编码（选填）')}:</span>
                <span>{i18next.t('商品的自定义编码信息；')}</span>
              </li>
              <li>
                <span>{i18next.t('商品名（必填）')}：</span>
                <span>{i18next.t('商品名称信息；')}</span>
              </li>
              <li>
                <span>{i18next.t('销售单位/销售规格（必填）')}：</span>
                <span>
                  {i18next.t(
                    '表明商品的规格信息，如SPU单位为斤，要添加按斤销售的商品，填写“销售单位”为“斤”，“销售规格”填写为“1”；'
                  )}
                </span>
                <span>{i18next.t('如3斤/袋销售，填写“3”；')}</span>
              </li>
              <li>
                <span>{i18next.t('损耗率（选填）')}：</span>
                <span>
                  {i18next.t(
                    '必须填写0~100的数值，会在采购任务中额外计算采购量；'
                  )}
                </span>
              </li>
              <li>
                <span>{i18next.t('默认供应商编码（必填）')}：</span>
                <span>
                  {i18next.t('表明商品的默认供应商，在供应商管理中可查看；')}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className='text-right gm-margin-top-10'>
          <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleImport}>
            {i18next.t('确定')}
          </Button>
        </div>
      </Modal>
    )
  }
}

BatchImportDialog.propTypes = {
  title: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
}

export default BatchImportDialog
