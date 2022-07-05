import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Tip, Button } from '@gmfe/react'
import _ from 'lodash'
import styles from '../product.module.less'

import '../actions'
import '../reducer'
import actions from '../../actions'

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
        let sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          return Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
        }

        if (this.props.type === 'stockin') {
          actions.product_in_stock_batch_import(sheetData)
          history.push('/sales_invoicing/stock_in/product/batch_import')
        } else {
          actions.product_refund_stock_batch_import(sheetData)
          history.push('/sales_invoicing/stock_out/refund/batch_import')
        }
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
    if (this.props.type === 'stockin') {
      window.open('/stock/in_stock_sheet/material/download_template')
    } else {
      window.open('/stock/return_stock_sheet/download_template')
    }
  }

  render() {
    const { show, title } = this.props
    const { file } = this.state
    const isInStock = this.props.type === 'stockin'

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
                {i18next.t('必填项，用于识别供应商，可在供应商管理中查询；')}
              </li>
              {isInStock ? (
                <li>
                  <span>{i18next.t('入库数')}：</span>
                  {i18next.t('填写入库的数量；')}
                </li>
              ) : (
                <li>
                  <span>{i18next.t('退货数')}：</span>
                  {i18next.t('必填项，填写退货的数量；')}
                </li>
              )}
              {isInStock ? (
                <li>
                  <span>{i18next.t('入库单价')}：</span>
                  {i18next.t('表明商品入库单价；')}
                </li>
              ) : (
                <li>
                  <span>{i18next.t('退货单价')}：</span>
                  {i18next.t('必填项，表明商品退货单价；')}
                </li>
              )}
              {isInStock && (
                <li>
                  <span>{i18next.t('入库金额')}：</span>
                  {i18next.t('表明商品此次的入库金额；')}
                </li>
              )}
              {isInStock && (
                <li className='gm-padding-left-10'>
                  {i18next.t(
                    '入库数，入库单价，入库金额必须三个里面填至少2个；',
                  )}
                </li>
              )}
              {isInStock && (
                <li className='gm-padding-left-10'>
                  {i18next.t(
                    '如果只填任意两个，则自动依据 入库数 x 入库单价 = 入库金额 来计算，如填写了入库数，入库金额，导入后自动计算入库单价；',
                  )}
                </li>
              )}
              {isInStock && (
                <li className='gm-padding-left-10'>
                  {i18next.t(
                    '如三个都填写，则优先识别入库数和入库金额，通过 入库金额除以入库数，算出入库单价（小数点保留后2位）；',
                  )}
                </li>
              )}
              {isInStock && (
                <li className='gm-padding-left-10'>
                  {i18next.t(
                    '填写入库数据时，请选择基本单位或包装单位中的一种来进行填写，如同时填写将默认以基本单位入库；',
                  )}
                </li>
              )}
              {isInStock ? (
                <li className='gm-padding-left-10'>
                  {i18next.t(
                    '入库数，入库单价，入库金额，仅支持精确到小数点后两位；',
                  )}
                </li>
              ) : (
                <li className='gm-padding-left-10'>
                  {i18next.t('退货数及退货单价仅支持精确到小数点后两位')}
                </li>
              )}
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
