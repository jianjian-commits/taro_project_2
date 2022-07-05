import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Tip, Button } from '@gmfe/react'
import _ from 'lodash'

import './actions'
import './reducer'
import actions from '../../actions'

import styles from './style.module.less'
import { history } from '../../common/service'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'

class BatchImportDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
    }
  }

  handleImport = () => {
    if (!this.refBatchXlsx.files.length) {
      return Tip.warning(i18next.t('请选择需要导入的文件'))
    }

    this.setState({ file: null })

    requireGmXlsx((res) => {
      const { sheetToJson } = res

      sheetToJson(this.refBatchXlsx.files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        // 判断字段是否一致
        if (
          !_.isEqual(['供应商编号', '供应商名称'], sheetData[0].slice(0, 2))
        ) {
          Tip.warning(i18next.t('没有导入正确的表格文件，请确认表格正确'))
          return false
        }
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
        }
        actions.supplier_batch_import(sheetData)
        history.push('/sales_invoicing/base/supplier/batch_import')
      })
    })
  }

  handleCancel = () => {
    this.setState({ file: null })
    this.props.onHide()
  }

  handleUploadFileSelect = () => {
    this.refBatchXlsx.click()
  }

  handleUploadFileChoosen = () => {
    this.setState({ file: this.refBatchXlsx.files[0] })
  }

  handleDownload = () => {
    // 暂时没有多语模板，写死为中文的
    window.open(
      `//js.guanmai.cn/static_storage/files/supplier_add_settle.xlsx?${Math.random()}`,
    )
  }

  render() {
    const { show, title } = this.props
    const { file } = this.state

    return (
      <Modal
        show={show}
        title={title}
        onHide={this.handleCancel}
        disableMaskClose
      >
        <div>
          <div>
            {i18next.t('上传需导入文件')}
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
            {file ? (
              <span className='gm-text-desc gm-margin-left-5'>{file.name}</span>
            ) : null}
            <div className='gm-gap-10' />
            <a style={{ cursor: 'pointer' }} onClick={this.handleDownload}>
              {i18next.t('下载导入模板')}
            </a>
          </div>
          <div>
            {i18next.t('填写说明')}：
            <ul className={styles.dialog}>
              <li>
                <span>{i18next.t('供应商编号')}：</span>
                {i18next.t('必填项，填写供应商的编号，不可重复')}
              </li>
              <li>
                <span>{i18next.t('供应商名称')}：</span>
                {i18next.t('必填项，填写供应商的名称')}
              </li>
              <li>
                <span>{i18next.t('可供应商品')}：</span>
                {i18next.t(
                  '必填项，导入时默认选中全部商品，如需修改可在导入供应商后进入详情修改',
                )}
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
  onHide: PropTypes.func,
}

export default BatchImportDialog
