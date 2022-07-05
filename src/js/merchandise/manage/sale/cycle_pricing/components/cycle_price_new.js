/**
 * @description 新建/编辑周期定价规则页面
 */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import {
  Flex,
  Form,
  FormItem,
  Validator,
  Button,
  DatePicker,
  FormButton,
  Modal,
  Uploader,
  Tip,
  RightSideModal,
} from '@gmfe/react'
import { Request } from '@gm-common/request'
import store from '../store'
import { createCyclePriceReq, editCyclePriceReq } from '../service'
import { showTimeFormat, disabledEffectiveTime } from '../utils'
import CyclePriceSalemenuSelect from './cycle_price_salemenu_select'
import CyclePriceRequireLabel from './cycle_price_required_label'
import TaskList from '../../../../../task/task_list'

function CyclePriceNew(props) {
  const { isEdit } = props

  const [loading, setLoading] = useState(false)

  const {
    cyclePriceRule: {
      rule_name,
      salemenu_id,
      salemenu_name,
      effective_time,
      file,
      file_name,
      file_url,
    },
  } = store

  function handleRuleChange(type, value) {
    store.changeCyclePriceRule({ [type]: value })
  }

  // 校验报价单
  function checkSalemenu(value) {
    if (value === '') return i18next.t('请选择报价单')
    return ''
  }

  // 校验规则名称
  function checkName(value) {
    if (value === '') {
      return i18next.t('请输入规则名称')
    } else if (value.length > 20) {
      return i18next.t('规则名称不能超过20个字符')
    }
    return ''
  }

  // 校验生效时间
  function checkTime(value) {
    if (value === null) return i18next.t('请选择生效时间')
    return ''
  }

  // 校验文件上传
  function checkFile(value) {
    if (!isEdit && value === null) return i18next.t('请上传文件')
    return ''
  }

  // 下载模版
  function onHandleDownLoadTemplate() {
    if (!salemenu_id) {
      Tip.warning(i18next.t('请选择一个报价单'))
      return
    }

    // 根据报价单下载对应模板
    // const params = {
    //   export: 1,
    //   salemenu_id,
    // }
    // window.open(`/product/sku_salemenu/list?${urlToParams(params)}`)

    const params = {
      salemenu_ids: JSON.stringify([salemenu_id]),
      export_by_salemenu: 1,
    }
    Request('/product/sku/export')
      .data(params)
      .get()
      .then((json) => {
        const { async } = json.data
        // 异步导出
        if (async === 1) {
          RightSideModal.render({
            children: <TaskList />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        }
      })
  }

  // 提交表单
  function handleRuleConfirm() {
    setLoading(true)
    const rules = {
      ...store.cyclePriceRule,
      effective_time: showTimeFormat(effective_time),
    }
    if (isEdit) {
      editCyClePrice(rules)
    } else {
      createCyclePrice(rules)
    }
  }

  // 新建规则
  function createCyclePrice(rules) {
    createCyclePriceReq(rules)
      .then((res) => {
        submitSuccess(res.data)
        // 新建规则，将展示为列表第一页第一条，请求列表第一页数据
        store.doCyclePriceFirstRequest()
      })
      .finally(() => setLoading(false))
  }

  // 修改规则
  function editCyClePrice(rules) {
    editCyclePriceReq(rules)
      .then((res) => {
        submitSuccess(res.data)
        // 编辑成功后不会改变规则在列表中的位置，刷新当前页面数据即可
        store.doCyclePriceCurrentRequest()
      })
      .finally(() => setLoading(false))
  }

  // 表单提交后
  function submitSuccess(data) {
    Modal.hide()
    if (data.async) openTaskList()
  }

  // 打开任务面板
  function openTaskList() {
    RightSideModal.render({
      children: <TaskList tabKey={1} />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  // 取消操作
  function handleCancel(event) {
    event.preventDefault()
    Modal.hide()
  }

  return (
    <Form labelWidth='100px' onSubmitValidated={handleRuleConfirm}>
      {/* 当页面为编辑状态时不展示报价单，报价默认值依据列表页报价单筛选取值 */}
      {!isEdit && (
        <FormItem
          label={<CyclePriceRequireLabel label='报价单' />}
          validate={Validator.create([], salemenu_id, checkSalemenu)}
        >
          <CyclePriceSalemenuSelect
            style={{ width: 210 }}
            salemenuId={salemenu_id}
            salemenuName={salemenu_name}
            type='new'
          />
        </FormItem>
      )}
      <FormItem
        label={<CyclePriceRequireLabel label='规则名称' />}
        validate={Validator.create('', rule_name, checkName)}
      >
        <input
          onChange={(e) => handleRuleChange('rule_name', e.target.value)}
          id='name'
          value={rule_name}
          className='form-control'
          placeholder={i18next.t('输入规则名称')}
        />
      </FormItem>
      <FormItem
        label={<CyclePriceRequireLabel label='生效时间' />}
        validate={Validator.create([], effective_time, checkTime)}
      >
        <DatePicker
          enabledTimeSelect
          date={effective_time}
          placeholder={i18next.t('生效日期')}
          // 可选最小日期
          min={new Date()}
          timeLimit={{
            timeSpan: 60 * 60 * 1000,
            disabledSpan: (time) => disabledEffectiveTime(time),
          }}
          onChange={(value) => handleRuleChange('effective_time', value)}
        />
      </FormItem>
      <FormItem label=''>
        <div className='gm-text-desc'>
          {i18next.t('此时间为导入报价单的开始时间，不代表导入完成时间')}
        </div>
      </FormItem>
      {!isEdit && (
        <FormItem label={i18next.t('下载模板')}>
          <Flex alignCenter>
            <Button type='link' onClick={onHandleDownLoadTemplate}>
              {i18next.t('批量修改商品模板')}
            </Button>
          </Flex>
        </FormItem>
      )}
      <FormItem
        label={<CyclePriceRequireLabel label='选择上传文件' />}
        validate={Validator.create([], file, checkFile)}
      >
        <div>
          <Uploader
            onUpload={(file) => handleRuleChange('file', file)}
            accept='.xlsx'
          >
            <Button type='primary' onClick={(event) => event.preventDefault()}>
              {file ? i18next.t('重新上传') : i18next.t('上传文件')}
            </Button>
          </Uploader>
          {file && (
            <div
              style={{ width: 'max-content' }}
              className='gm-text-desc gm-margin-left-5'
            >
              {file[0].name}
            </div>
          )}
          {!file && isEdit && (
            <Button type='link' onClick={() => window.open(file_url)}>
              {file_name}
            </Button>
          )}
        </div>
      </FormItem>
      <FormButton>
        <Flex row justifyEnd>
          <Button onClick={handleCancel} disabled={loading}>
            {i18next.t('取消')}
          </Button>
          <div className='gm-gap-10' />
          <Button type='primary' htmlType='submit' loading={loading}>
            {i18next.t('确定')}
          </Button>
        </Flex>
      </FormButton>
    </Form>
  )
}

CyclePriceNew.propTypes = {
  isEdit: PropTypes.bool,
}

export default observer(CyclePriceNew)
