import { Request } from '@gm-common/request'
import {
  Button,
  Flex,
  Form,
  FormItem,
  Modal,
  RightSideModal,
  Tip,
  Uploader,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import TaskList from '../../../../task/task_list'

/**
 * 批量新建规则对话框组件函数，用于展示批量新建供应商周期报价对话框
 */
const BatchAddRulesModal = ({ onHide }) => {
  const IMPORT_TEMPLATE_DOWNLOAD_LINK = '/stock/cycle_quote/tpl_for_create'
  const CREATE_CYCLE_QUOTED_RULES_LINK = '/stock/cycle_quote/import_for_create'

  const [file, setFile] = useState(null)

  const setUploadFile = (files) => {
    setFile(files[0])
  }

  const downloadImportTemplate = () => {
    Request(IMPORT_TEMPLATE_DOWNLOAD_LINK)
      .get()
      .then(() => {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
  }

  /**
   * 点击取消时触发的动作，隐藏对话框
   */
  const handleCancel = () => {
    Modal.hide()
  }

  /**
   * 点击确定时触发的动作，检查上传文件并开启异步任务
   */
  const handleImport = () => {
    if (!file) {
      Tip.warning(i18next.t('请选择文件！'))
      return
    }

    Request(CREATE_CYCLE_QUOTED_RULES_LINK)
      .data({ file })
      .post()
      .then((data) => {
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: () => {
            RightSideModal.hide()
            onHide()
          },
          style: {
            width: '300px',
          },
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div>
      <Form labelWidth='160px' colWidth='560px'>
        <FormItem label={i18next.t('下载模板')} className='gm-margin-top-10'>
          <Flex style={{ paddingTop: '6px' }}>
            <label className='margin:0 auto'>{i18next.t('点击下载')}</label>
            <div className='gm-gap-10' />
            <a style={{ cursor: 'pointer' }} onClick={downloadImportTemplate}>
              {i18next.t('批量导入模板')}
            </a>
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('选择上传文件')} required>
          <Flex>
            <Uploader onUpload={setUploadFile} accept='.xlsx'>
              <Button type='primary'>
                {file ? i18next.t('重新上传') : i18next.t('上传文件')}
              </Button>
              <span className='gm-text-desc gm-margin-left-5'>
                {file ? file.name : ''}
              </span>
            </Uploader>
          </Flex>
          <div className='gm-text-desc gm-margin-top-5'>
            {i18next.t('根据导入模板表格中的要求进行填写即可')}
          </div>
        </FormItem>
      </Form>
      <div className='text-right gm-margin-top-10'>
        <Button onClick={handleCancel}>{i18next.t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleImport}>
          {i18next.t('确定')}
        </Button>
      </div>
    </div>
  )
}

/**
 * 设置BatchAddRulesModal的属性规则
 * onHide: function 必选
 */
BatchAddRulesModal.propTypes = {
  onHide: PropTypes.func.isRequired,
}

export default BatchAddRulesModal
