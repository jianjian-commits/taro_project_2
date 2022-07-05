import { t } from 'gm-i18n'
import React, { useState } from 'react'
import { Button, Uploader, Modal, FormItem, Form } from '@gmfe/react'
import PropTypes from 'prop-types'

const ImportLine = ({ onImport }) => {
  const [file, setFile] = useState(null)
  const handleUploadFile = (files) => {
    setFile(files[0])
  }
  const handleCancel = () => {
    Modal.hide()
    setFile(null)
  }
  const handleImport = () => {
    onImport(file)
  }
  return (
    <Form colWidth='auto'>
      <div className='gm-margin-top-10'>{t('注意：')}</div>
      <div className='gm-margin-top-10 gm-margin-left-20'>
        {t('1.请勿修改客户资料')}
      </div>
      <div className='gm-margin-left-20'>
        {t('2.《客户线路维护表》线路信息仅支持从《线路表》复制填入')}
      </div>
      <FormItem
        label={t('选择上传文件')}
        required
        className='gm-margin-top-15 gm-margin-left-20'
      >
        <div className='gm-gap-10' />
        <Uploader onUpload={handleUploadFile} accept='.xlsx'>
          <Button type='primary'>{file ? t('重新上传') : t('上传文件')}</Button>
        </Uploader>
        <div style={{ marginLeft: 10 }}>
          {file ? (
            <div className='gm-text-desc'>{file.name}</div>
          ) : (
            <div className='gm-margin-bottom-10' />
          )}
        </div>
      </FormItem>
      <div className='text-right gm-margin-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleImport}>
          {t('确定')}
        </Button>
      </div>
    </Form>
  )
}

ImportLine.propTypes = {
  onImport: PropTypes.func.isRequired,
}

export default ImportLine
