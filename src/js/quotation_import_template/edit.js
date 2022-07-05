import { i18next, t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Flex,
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
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import RelationList from './relation_list'
import globalStore from '../stores/global'
import { explainList } from './util'
import store from './store'

export default observer((props) => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [show, setShow] = useState(false)

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

  const handleUpload = (files) => {
    requireGmXlsx((res) => {
      const { sheetToJson } = res
      setFile(files[0])
      sheetToJson(files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        store.operateNewRelationColumns(sheetData).catch((err) => {
          Tip.info(err.message)
        })
      })
    })
  }
  const { detail, validateExcel } = store
  const { name, row_title, type } = detail
  const { id } = props.location.query
  // 权限
  const addPermission = globalStore.hasPermission(
    'add_salemenu_import_template',
  )
  const editPermission = globalStore.hasPermission(
    'edit_salemenu_import_template',
  )

  useEffect(() => {
    const { id } = props.location.query
    if (id) {
      // 编辑
      setLoading(true)
      store.getDetail(id).then(() => {
        setLoading(false)
      })
    } else {
      // 新建
      store.initDetail()
    }
    return () => store.reset()
  }, [])

  if (loading) {
    return (
      <Flex justifyCenter style={{ paddingTop: '120px' }}>
        <Loading text={i18next.t('加载中...')} />
      </Flex>
    )
  }

  const showExplainTable = () => {
    const style = { textAlign: 'center' }
    return (
      <Flex
        column
        className='gm-margin-top-10'
        style={{
          marginLeft: 160,
          width: '60%',
        }}
      >
        <table className='table table-hover gm-border' border='1'>
          <tbody>
            <tr className='gm-text-bold' style={{ backgroundColor: '#cccccc' }}>
              <td width='60px' align='center' style={style}>
                {t('序号')}
              </td>
              <td align='center' style={style}>
                {t('系统名称')}
              </td>
              <td align='center' style={style}>
                {t('填写规范')}
              </td>
              <td align='center' style={style}>
                {t('未填写或填写不规范时取值')}
              </td>
            </tr>
            {_.map(explainList, (item, index) => {
              return (
                <tr key={index}>
                  <td align='center' className='gm-text-bold' style={style}>
                    {index + 1}
                  </td>
                  <td align='center' style={style}>
                    {item.name || '-'}
                  </td>
                  <td align='center' style={style}>
                    {item.standard || '-'}
                  </td>
                  <td align='center' style={style}>
                    {item.isRequired || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
                    {i18next.t('表格内表头信息所在行')}
                  </div>
                }
                className='gm-text-14 gm-padding-lr-5'
              />
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('导入表格')} required>
            <Flex alignCenter>
              <Uploader onUpload={handleUpload} accept='.xlsx'>
                {/* 如果是系统模板，type === 1，不允许上传文件 */}
                <Button plain disabled={validateExcel || type === 1}>
                  {file ? i18next.t('重新上传') : i18next.t('上传文件')}
                </Button>
              </Uploader>
              <span className='gm-padding-lr-5'>{file && file.name}</span>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('对应关系')} required>
            <RelationList />
            <div
              className='gm-text-primary gm-margin-top-5 gm-cursor'
              onClick={() => {
                setShow(!show)
              }}
            >
              {t(`${!show ? '查看' : '收起'}填写说明`)}
            </div>
          </FormItem>
          {show && showExplainTable()}
        </Form>
      </FormPanel>
    </FormGroup>
  )
})
