import React from 'react'
import PropTypes from 'prop-types'
import { Dialog, RightSideModal, MoreSelect, Button } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { history } from '../../../common/service'
import { observer } from 'mobx-react'
import store from './store'
import TaskList from '../../../task/task_list'

@observer
class ImportQuotation extends React.Component {
  constructor(props) {
    super(props)
    store.init()
  }

  componentDidMount() {
    store.getSuppliers()
  }

  handleFileInput = () => {
    store.setFileData(this.refFileInput.files[0])
  }

  handleUploadFileSelect = () => {
    this.refFileInput.click()
  }

  handleDownloadExcel = async () => {
    await this.props.getSpecListFunc({
      settle_supplier_id: store.selectedSupplier.value,
      settle_supplier_name: store.selectedSupplier.value
        ? store.selectedSupplier.text
        : null,
    })
    RightSideModal.render({
      children: <TaskList />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  handleSupplierSelected = (selected) => {
    store.setSelectedSupplier(selected)
  }

  render() {
    const { fileData, selectedSupplier, suppliers } = store
    const lis = [
      i18next.t('采购规格ID：必填，若为空，则导入时系统对该行数据不做解析；'),
      i18next.t('供应商编号：必填，若为空，则导入时系统对该行数据不做解析；'),
      i18next.t('询价（基本单位）：必填，请填写正数，最多两位小数；'),
      i18next.t('若同一个供应商填写了多次询价价格，则系统将记录多次询价；'),
      i18next.t('询价页面仅显示最近询价，其他询价信息可在询价记录中查看；'),
    ]
    return (
      <div>
        <div>{i18next.t('第一步：选择供应商')}</div>
        <div
          className='gm-padding-left-20 gm-margin-tb-10'
          style={{ width: '150px' }}
        >
          <MoreSelect
            selected={selectedSupplier}
            data={suppliers}
            renderListFilterType='pinyin'
            onSelect={this.handleSupplierSelected}
          />
        </div>
        <div>
          {i18next.t('第二步：下载')}{' '}
          <a href='javascript:' onClick={this.handleDownloadExcel}>
            {i18next.t('xlsx 模板')}
          </a>
          {i18next.t('，请根据以下要求输入内容')}
        </div>
        <div className='gm-padding-left-20 gm-margin-tb-10'>
          <ul>
            {_.map(lis, (li, index) => (
              <li key={index}>{li}</li>
            ))}
          </ul>
        </div>
        <div>{i18next.t('第三步：上传 xlsx 文件')}</div>
        <div className='gm-padding-left-20 gm-margin-tb-10'>
          <Button onClick={this.handleUploadFileSelect}>
            {!fileData ? i18next.t('上传') : i18next.t('重新上传')}
          </Button>
          <input
            type='file'
            accept='.xlsx'
            ref={(ref) => {
              this.refFileInput = ref
            }}
            onChange={this.handleFileInput}
            style={{ display: 'none' }}
          />
          {fileData ? (
            <span className='gm-text-desc gm-margin-left-5'>
              {fileData.name}
            </span>
          ) : null}
        </div>
      </div>
    )
  }
}

ImportQuotation.propTypes = {
  getSpecListFunc: PropTypes.func,
}

function importModal(getSpecListFunc) {
  Dialog.confirm({
    title: i18next.t('批量导入询价'),
    size: 'md',
    children: <ImportQuotation getSpecListFunc={getSpecListFunc} />,
  }).then(
    () => {
      requireGmXlsx((res) => {
        const { sheetToJson } = res
        sheetToJson(store.fileData.slice()).then((json) => {
          const sheetData = _.values(json[0])[0]

          history.push('/supply_chain/purchase/information/import_quotation')
          store.getQuotationImportList(sheetData)
        })
      })
    },
    () => {}
  )
}

export default importModal
