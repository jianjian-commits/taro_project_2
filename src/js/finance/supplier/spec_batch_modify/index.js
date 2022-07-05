import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { Flex, Modal, Button, Tip } from '@gmfe/react'
import store from './store'
import { history } from '../../../common/service'
import PropTypes from 'prop-types'

@observer
class PurchaseSpecBtachModifyModal extends React.Component {
  constructor(props) {
    super(props)
    this.refFileInput = React.createRef()
  }

  componentDidMount() {
    store.init()
  }

  handleFileInput = () => {
    store.setFileData(this.refFileInput.current.files[0])
  }

  handleUploadFileSelect = () => {
    this.refFileInput.current.click()
  }

  handleExportTemp = (e) => {
    this.props.onExportTemp()
  }

  handleCancel = () => {
    Modal.hide()
  }

  handleSubmit = () => {
    if (store.fileData) {
      requireGmXlsx((res) => {
        const { sheetToJson } = res
        sheetToJson(store.fileData.slice()).then((json) => {
          const sheetData = _.values(json[0])[0]
          // 批量导入数据过大会导致接口报错，目前暂定方案：前端判断数据量超过2000条，进行分批导入提示
          if (sheetData.length - 1 > 2000) {
            Tip.warning('数据量过大，请分批导入')
          } else {
            store.generateSpecBatchModifyList(sheetData)
            history.push('/supply_chain/purchase/information/spec_batch_modify')
          }
        })
      })
    }
    Modal.hide()
  }

  render() {
    const lis = [
      i18next.t(
        '采购规格 ID ：不可修改，若修改后的采购规格 ID 与在系统中匹配不正确，则不对该行数据进行导入',
      ),
      i18next.t('基本单位：不可修改'),
      i18next.t(
        '表格中的“规格系数”、“基本单位”、“采购单位”三个字段构成采购规格列表中的“采购规格”',
      ),
      i18next.t(
        '最高入库单价：0为不设置，若设置最高入库单价请填写正数，最多两位小数',
      ),
      i18next.t('字段的值为空时不做解析'),
    ]
    const { fileData } = store

    return (
      <Flex column>
        <div>
          <div>
            {i18next.t('第一步：下载')}{' '}
            <a href='javascript:;' onClick={this.handleExportTemp}>
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
        </div>
        <div>
          <div>{i18next.t('第二步：上传 xlsx 文件')}</div>
          <div className='gm-padding-left-20 gm-margin-tb-10'>
            <Button onClick={this.handleUploadFileSelect}>
              {!fileData ? i18next.t('上传') : i18next.t('重新上传')}
            </Button>
            <input
              type='file'
              accept='.xlsx'
              ref={this.refFileInput}
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
        <Flex justifyEnd>
          <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
          <div className='gm-margin-lr-10' />
          <Button type='primary' onClick={this.handleSubmit}>
            {i18next.t('确认')}
          </Button>
        </Flex>
      </Flex>
    )
  }
}

PurchaseSpecBtachModifyModal.propTypes = {
  onExportTemp: PropTypes.func.isRequired,
}

export default PurchaseSpecBtachModifyModal
