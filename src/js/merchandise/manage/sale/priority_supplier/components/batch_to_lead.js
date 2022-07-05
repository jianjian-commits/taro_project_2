import React, { useState } from 'react'
import {
  Button,
  Flex,
  Form,
  FormButton,
  FormItem,
  Modal,
  Uploader,
  Validator,
  RightSideModal,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { SvgRemove } from 'gm-svg'
import TaskList from '../../../../../task/task_list'
import { Request } from '@gm-common/request'

const BatchToLead = (props) => {
  const { salemenu_id, sku_id } = props
  const [file, setFile] = useState()

  // 下载模版，模板任务也是异步
  const handleDownload = () => {
    Request(
      salemenu_id
        ? `/supplier/priority_supplier/tpl_for_salemenu?salemenu_id=${salemenu_id}`
        : `/supplier/priority_supplier/tpl_for_sku?sku_id=${sku_id}`,
    )
      .get()
      .then(() => handleSyncTask())
  }

  const handleSyncTask = (tabKey) => {
    RightSideModal.render({
      children: <TaskList tabKey={tabKey} />,
      onHide: RightSideModal.hide,
      style: { width: '300px' },
    })
  }

  const handleUpload = ([value]) => {
    setFile(value)
  }

  const validatefile = (value) => {
    if (!value) return t('请选择上传文件')
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleSubmit = () => {
    const params = {
      salemenu_id,
      file,
      sku_id,
    }
    Request(
      salemenu_id
        ? `/supplier/priority_supplier/upload_for_salemenu`
        : '/supplier/priority_supplier/upload_for_sku',
    )
      .data(params)
      .post()
      .then(() => handleSyncTask(1))
  }

  console.log(file)
  return (
    <Form labelWidth='100px' horizontal onSubmit={handleSubmit}>
      <FormItem label={t('下载模板')} unLabelTop className='gm-margin-top-10'>
        <span>
          {t('点击下载')}
          <a onClick={handleDownload}>{t('批量修改优先供应商模板')}</a>
        </span>
      </FormItem>

      <FormItem
        label={t('选择上传文件')}
        required
        validate={Validator.create([], file, validatefile)}
      >
        <Flex>
          <Uploader onUpload={handleUpload} accept='.xlsx'>
            <Button type='primary' onClick={(event) => event.preventDefault()}>
              {t('上传文件')}
            </Button>
          </Uploader>
          {file && (
            <p
              className='gm-margin-bottom-0 gm-margin-left-10'
              style={{ color: '#135aa4' }}
            >
              {file.name}
            </p>
          )}
          <div className='gm-gap-10' />
          {file && (
            <SvgRemove className='gm-cursor' onClick={() => setFile()} />
          )}
        </Flex>
      </FormItem>
      <FormButton>
        <div className='text-right'>
          <Button className='gm-margin-right-15' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' htmlType='submit' disabled={!file}>
            {t('确认')}
          </Button>
        </div>
      </FormButton>
    </Form>
  )
}

BatchToLead.propTypes = {
  salemenu_id: PropTypes.string,
  sku_id: PropTypes.string,
}

export default BatchToLead
