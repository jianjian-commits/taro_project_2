import React, { useState, useRef } from 'react'
import {
  Flex,
  Form,
  FormItem,
  Validator,
  MoreSelect,
  Button,
  Tip,
} from '@gmfe/react'
import { t } from 'gm-i18n'

import Upload from './upload'
import ModalButton from './modal_button'
import globalStore from 'stores/global'
import store from '../store/detail'

const maxContent = { width: 'max-content' }
function ImportModal() {
  const isSupply = globalStore.isSettleSupply()
  const { supplierList } = store

  const [selected, setSelected] = useState(null)

  const [loading, setLoading] = useState(false)
  const [file, changeFile] = useState()

  const targetRef = useRef()

  // enter
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      targetRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  function onHandleDownLoadTemplate() {
    if (!isSupply && !selected) {
      Tip.warning(t('请选择供应商'))
      return
    }
    // 供应商账号登录的话，用该供应商id
    store.exportList(isSupply ? globalStore.user.station_id : selected.value)
  }
  function handleUpload([value]) {
    changeFile(value)
  }

  function validateFile(value) {
    if (!value) {
      return t('请选择上传文件')
    }
  }

  function handleSubmit() {
    setLoading(true)
    store.uploadFile(file, () => setLoading(false))
  }

  return (
    <Form labelWidth='150px' horizontal onSubmitValidated={handleSubmit}>
      {!isSupply && (
        <FormItem label={t('选择供应商')}>
          <MoreSelect
            ref={targetRef}
            data={supplierList.slice()}
            selected={selected}
            isGroupList
            onSelect={setSelected}
            onKeyDown={handleKeyDown}
            renderListFilterType='pinyin'
            placeholder={t('请选择入库供应商')}
            disabledClose
            style={{ width: 150 }}
          />
        </FormItem>
      )}
      <FormItem label={t('下载模板')}>
        <Flex alignCenter style={maxContent}>
          {t('点击下载')}
          <Button type='link' onClick={onHandleDownLoadTemplate}>
            {t('批量导入商品模板')}
          </Button>
        </Flex>
      </FormItem>
      <FormItem
        label={t('选择上传文件')}
        required
        validate={Validator.create([], file, validateFile)}
      >
        <div style={maxContent}>
          <Upload onUpload={handleUpload} file={file} />
          <div className='gm-text-desc gm-margin-top-5'>
            {t(
              '文件最多支持上传5000条数据，超出时可删除不需要定价的商品条目。',
            )}
          </div>
          <div className='gm-text-desc'>
            {t('批量导入时将清空已添加商品列表，以上传商品信息为准。')}
          </div>
        </div>
      </FormItem>
      <ModalButton loading={loading} />
    </Form>
  )
}

export default ImportModal
