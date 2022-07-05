import { i18next } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Flex,
  Select,
  Option,
  ToolTip,
  Uploader,
  Tip,
  Input,
  InputNumberV2,
  Loading,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'

import { history } from '../common/service'
import { ORDER_IMPORT_TYPE } from '../common/enum'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import RelationList from './relation_list'
import globalStore from '../stores/global'

import store from './store'

export default observer((props) => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)

  const handleBack = () => {
    history.goBack()
  }

  const handleSave = async () => {
    const { id } = props.location.query
    await store.validate().catch((err) => {
      Tip.info(err.message)
      return Promise.reject(err)
    })
    store.save(id).then(() => {
      Tip.info(i18next.t('保存成功'))
      id ? store.getDetail(id) : handleBack()
    })
  }

  const handleChange = (key, value) => {
    store.detailChange(key, value)
  }

  const getRelationColumns = (sheetData) => {
    store.operateNewRelationColumns(sheetData).catch((err) => {
      Tip.info(err.message)
    })
  }

  const handleUpload = (files) => {
    requireGmXlsx((res) => {
      const { sheetToJson } = res
      setFile(files[0])
      sheetToJson(files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        getRelationColumns(sheetData)
      })
    })
  }
  const { detail, validateExcel } = store
  const { name, type, row_title, row_address, cycle_start, cycle_col } = detail
  const { id } = props.location.query
  const addPermission = globalStore.hasPermission('add_order_import_template')
  const editPermission = globalStore.hasPermission('edit_order_import_template')

  useEffect(() => {
    const { id } = props.location.query
    globalStore.fetchCustomizedConfigs()
    if (id) {
      setLoading(true)
      store.getDetail(id).then(() => {
        setLoading(false)
      })
    } else {
      store.initDetail()
    }
    return () => {
      store.reset()
    }
  }, [])

  if (loading) {
    return (
      <Flex justifyCenter style={{ paddingTop: '120px' }}>
        <Loading text={i18next.t('加载中...')} />
      </Flex>
    )
  }

  return (
    <FormGroup
      onSubmit={handleSave}
      onCancel={handleBack}
      disabled={(id && !editPermission) || (!id && !addPermission)}
    >
      <FormPanel title={i18next.t('模板信息')}>
        <Form className='gm-margin-15' labelWidth='160px'>
          <FormItem label={i18next.t('模板名称')} required>
            <Flex alignCenter>
              <Input
                maxLength={20}
                value={name}
                className='form-control'
                style={{ width: '300px' }}
                onChange={(e) => {
                  handleChange('name', e.target.value)
                }}
                placeholder={i18next.t('请输入模板名称（20字以内）')}
              />
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('模板类型')}>
            <Select
              value={type}
              style={{ minWidth: '120px' }}
              onChange={(value) => {
                handleChange('type', value)
                setFile(null)
              }}
            >
              {ORDER_IMPORT_TYPE.map(({ text, value }) => {
                return (
                  <Option key={value} value={value}>
                    {text}
                  </Option>
                )
              })}
            </Select>
          </FormItem>
          <FormItem label={i18next.t('标题所在行')} required>
            <Flex alignCenter>
              <InputNumberV2
                value={row_title}
                className='form-control'
                style={{ width: '120px' }}
                min={0}
                max={99999}
                onChange={(value) => {
                  handleChange('row_title', value)
                }}
                placeholder={i18next.t('输入标题所在行')}
              />
              <ToolTip
                popup={
                  <div className='gm-padding-10 gm-bg'>
                    {i18next.t('表格内订单表头信息所在行')}
                  </div>
                }
                className='gm-text-14 gm-padding-lr-5'
              />
            </Flex>
          </FormItem>
          {type === 2 ? (
            <FormItem label={i18next.t('商户所在行')} required>
              <Flex alignCenter>
                <input
                  value={row_address}
                  className='form-control'
                  style={{ width: '120px' }}
                  onChange={(e) => {
                    handleChange('row_address', e.target.value)
                  }}
                  placeholder={i18next.t('输入商户所在行')}
                />
                <ToolTip
                  popup={
                    <div className='gm-padding-10 gm-bg'>
                      {i18next.t(
                        '商户需独立一行存在，不可出现其他信息否则将无法成功导入订单',
                      )}
                    </div>
                  }
                  className='gm-text-14 gm-padding-lr-5'
                />
              </Flex>
            </FormItem>
          ) : null}
          {type === 2 ? (
            <FormItem label={i18next.t('开始循环列')} required>
              <Flex alignCenter>
                <InputNumberV2
                  value={cycle_start}
                  className='form-control'
                  style={{ width: '120px' }}
                  onChange={(value) => {
                    handleChange('cycle_start', value)
                  }}
                  placeholder={i18next.t('输入开始循环列')}
                />
                <ToolTip
                  popup={
                    <div className='gm-padding-10 gm-bg'>
                      {i18next.t('表头信息出现重复内容的第一列')}
                    </div>
                  }
                  className='gm-text-14 gm-padding-lr-5'
                />
              </Flex>
            </FormItem>
          ) : null}
          {type === 2 ? (
            <FormItem label={i18next.t('循环间隔列数')} required>
              <Flex alignCenter>
                <InputNumberV2
                  value={cycle_col}
                  className='form-control'
                  style={{ width: '120px' }}
                  onChange={(value) => {
                    handleChange('cycle_col', value)
                  }}
                  placeholder={i18next.t('循环间隔列数')}
                />
                <ToolTip
                  popup={
                    <div className='gm-padding-10 gm-bg'>
                      {i18next.t(
                        '重复信息最小单元覆盖的列数，如单个商户下单信息覆盖的列数',
                      )}
                    </div>
                  }
                  className='gm-text-14 gm-padding-lr-5'
                />
              </Flex>
            </FormItem>
          ) : null}
          <FormItem label={i18next.t('导入表格')}>
            <Flex alignCenter>
              <Uploader onUpload={handleUpload} accept='.xlsx'>
                <Button plain disabled={validateExcel}>
                  {file ? i18next.t('重新上传') : i18next.t('上传文件')}
                </Button>
              </Uploader>
              <span className='gm-padding-lr-5'>{file && file.name}</span>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('对应关系')} required>
            <RelationList />
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})
