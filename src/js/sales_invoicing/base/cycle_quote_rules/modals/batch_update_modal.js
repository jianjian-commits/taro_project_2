import { Request } from '@gm-common/request'
import {
  Button,
  Flex,
  Form,
  FormItem,
  Modal,
  MoreSelect,
  RightSideModal,
  Select,
  Tip,
  Uploader,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import React, { useEffect, useState } from 'react'
import globalStore from '../../../../stores/global'
import TaskList from '../../../../task/task_list'

/**
 * 批量修改规则对话框组件函数，用于展示批量修改供应商周期报价对话框
 */
const BatchUpdateRulesModal = (props) => {
  const IMPORT_TEMPLATE_DOWNLOAD_LINK = '/stock/cycle_quote/tpl_for_update'
  const UPDATE_CYCLE_QUOTED_RULES_LINK = '/stock/cycle_quote/import_for_update'

  const { suppliers, onHide } = props

  const isSupplier = globalStore.isSettleSupply()

  const supplierList = [
    {
      value: 0,
      text: i18next.t('全部供应商'),
    },
    ...suppliers.map((supplier) => ({
      value: supplier.settle_supplier_id,
      text: supplier.name,
      ...supplier,
    })),
  ]

  const statusOptions = [
    {
      value: 0,
      text: i18next.t('全部状态'),
    },
    {
      value: 2,
      text: i18next.t('未开始'),
    },
    {
      value: 3,
      text: i18next.t('生效中'),
    },
  ]

  const [file, setFile] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierId, setSupplierId] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setSelectedSupplier(supplierList[0])
    setStatus(3)
  }, [])

  useEffect(() => {
    if (selectedSupplier && selectedSupplier.value) {
      setSupplierId(selectedSupplier.value)
    } else {
      setSupplierId(null)
    }
  }, [selectedSupplier])

  /**
   * 更新已选供应商
   * @param {Object} 已选供应商
   */
  const updateSelectedSupplier = (selected) => {
    setSelectedSupplier(selected)
  }

  /**
   * 更新报价规则状态
   * @param {number} selected 供应商周期报价规则状态，0 全部状态 2 未开始 3 生效中
   */
  const updateStatus = (selected) => {
    setStatus(selected)
  }

  /**
   * 设置上传文件
   * @param {Array} files 上传的文件
   */
  const setUploadFile = (files) => {
    setFile(files[0])
  }

  /**
   * 下载导入模板
   */
  const downloadImportTemplate = () => {
    const params = {
      settle_supplier_id: isSupplier ? globalStore.stationId : supplierId,
    }
    if (status) {
      params.status = status
    }
    Request(`${IMPORT_TEMPLATE_DOWNLOAD_LINK}?${queryString.stringify(params)}`)
      .get()
      .then((data) => {
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
   * 点击确定时触发的动作，检查上传文件并导入
   */
  const handleImport = () => {
    if (!file) {
      Tip.warning(i18next.t('请选择文件！'))
      return
    }

    Request(UPDATE_CYCLE_QUOTED_RULES_LINK)
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
        {isSupplier ? null : ( // 若用户为供应商则不显示，直接使用用户自己的供应商ID
          <FormItem label={i18next.t('选择供应商')}>
            <Flex>
              <MoreSelect
                data={supplierList}
                selected={selectedSupplier}
                onSelect={updateSelectedSupplier}
              />
            </Flex>
          </FormItem>
        )}
        <FormItem label={i18next.t('状态筛选')}>
          <Flex>
            <Select
              data={statusOptions}
              value={status}
              style={{ width: '160px' }}
              onChange={updateStatus}
            />
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('下载模板')}>
          <Flex style={{ paddingTop: '6px' }}>
            <label className='margin:0 auto'>{i18next.t('点击下载')}</label>
            <div className='gm-gap-10' />
            <a style={{ cursor: 'pointer' }} onClick={downloadImportTemplate}>
              {i18next.t('批量导入模板')}
            </a>
          </Flex>
          <div className='gm-text-desc'>
            {i18next.t('供应商选择和状态筛选仅作用于筛选下载模板内的数据')}
          </div>
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
            {i18next.t(
              '批量导入修改时仅支持修改生效中、未开始的规则，表格中若存在系统中不存在的规则则不会进行新建',
            )}
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
 * 设置BatchUpdateRulesModal的属性规则
 * suppliers: Array 必选
 * onHide: function 必选
 */
BatchUpdateRulesModal.propTypes = {
  suppliers: PropTypes.array.isRequired,
  onHide: PropTypes.func.isRequired,
}

export default BatchUpdateRulesModal
