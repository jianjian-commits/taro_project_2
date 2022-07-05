import React, { useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { Flex, Button, Modal, Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import _ from 'lodash'
import store from '../store/batch_import_store'
import { history } from 'common/service'

const BatchImportTechnology = observer((props) => {
  const refBatchXlsx = useRef(null)
  const [file, setFile] = useState(null)

  const handleCancel = () => {
    Modal.hide()
  }

  const handleImport = () => {
    if (refBatchXlsx.current.files.length === 0) {
      return Tip.warning(i18next.t('请选择需要导入的文件'))
    }

    requireGmXlsx((res) => {
      const { sheetToJson } = res

      sheetToJson(refBatchXlsx.current.files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]

        const requiredFieldArray = ['工艺名称', '工艺编号']
        let isValid = true

        _.forEach(requiredFieldArray, (item) => {
          // 若表头无必填项，则报错
          if (!_.includes(sheetData[0], item)) {
            Tip.warning(
              i18next.t('表格模板格式不正确，请确认表格格式为模板格式')
            )
            isValid = false

            return false
          }
        })

        if (!isValid) {
          return false
        }

        // 含表头
        if (sheetData.length <= 1) {
          Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
        }

        store.setUploadTechnologyData(sheetData)

        setFile(null)

        Modal.hide()
        history.push(
          '/supply_chain/process/basic_info/technology_management/batch_import'
        )
      })
    })
  }

  const handleSelectFile = () => {
    refBatchXlsx.current.click()
  }

  const handleUploadFileChoosen = () => {
    setFile(refBatchXlsx.current.files[0])
  }

  const handleDownloadTemplate = () => {
    window.open(
      '//js.guanmai.cn/static_storage/files/process_add_settle.xlsx?v3single'
    )
  }

  return (
    <Flex className='gm-padding-10' column>
      <Flex row alignCenter>
        <span>{i18next.t('上传需导入文件')}</span>
        <div className='gm-gap-10' />
        <Button onClick={handleSelectFile}>{i18next.t('上传')}</Button>
        <input
          type='file'
          accept='.xlsx, .xls'
          ref={refBatchXlsx}
          onChange={handleUploadFileChoosen}
          style={{ display: 'none' }}
        />
        {file ? (
          <span className='gm-text-desc gm-margin-left-5'>{file.name}</span>
        ) : null}
        <div className='gm-gap-10' />
        <a style={{ cursor: 'pointer' }} onClick={handleDownloadTemplate}>
          {i18next.t('下载导入模板')}
        </a>
      </Flex>
      <div className='gm-gap-10' />
      <Flex column>
        <span>{i18next.t('填写说明：')}</span>
        <span className='gm-margin-top-10 gm-margin-left-20'>
          {i18next.t('工艺名称：必填项，填写工艺名称，不可重复')}
        </span>
        <span className='gm-margin-left-20'>
          {i18next.t('工艺编号：必填项，填写工艺对应编号，不可重复')}
        </span>
      </Flex>
      <div className='gm-gap-10' />
      <Flex column>
        <span>{i18next.t('其他说明：')}</span>
        <span className='gm-margin-left-20 gm-margin-top-10'>
          {i18next.t(
            '若同一个工艺关联了多个自定义字段，可在表格中对同一个工艺填写多个自定义字段信息'
          )}
        </span>
      </Flex>
      <div className='text-right gm-margin-top-10'>
        <Button onClick={handleCancel}>{i18next.t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleImport}>
          {i18next.t('确定')}
        </Button>
      </div>
    </Flex>
  )
})

export default BatchImportTechnology
