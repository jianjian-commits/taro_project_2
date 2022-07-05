import React, { useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  FormGroup,
  Form,
  FormItem,
  Validator,
  RadioGroup,
  Radio,
  Flex,
  Input,
  Tip,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import Relation from '../components/relation'
import WriteConfig from '../components/write_config'
import ShowConfig from '../components/show_config'
import store from '../store'
import { history } from 'common/service'
import { belongType, fieldType } from '../enum'

const Component = () => {
  const form = useRef(null)
  useEffect(() => {
    return () => {
      store.initDetail()
    }
  }, [])

  function handleChange(key, value) {
    store.updateDetail(key, value)
  }

  function handleCheck(params) {
    const list = store.detail.radio_list.slice()
    if (!list.length || !list[0].name) {
      return t('至少填写一项')
    }
  }

  function handleSubmit() {
    store.create().then(() => {
      Tip.success(t('创建成功'))
      history.replace('/order_manage/order/customize')
    })
  }

  return (
    <FormGroup
      className='gm-margin-top-20 gm-margin-top-20'
      formRefs={[form]}
      onCancel={() => history.go(-1)}
      onSubmitValidated={handleSubmit}
    >
      <Form
        disableCol
        ref={form}
        labelWidth='200px'
        colWidth='800px'
        hasButtonInGroup
      >
        <FormItem
          label={t('自定义字段名')}
          required
          validate={Validator.create([], store.detail.field_name)}
        >
          <Flex column className='gm-inline-block'>
            <Input
              className='form-control'
              value={store.detail.field_name}
              placeholder={t('请输入填写字段名')}
              onChange={(e) => handleChange('field_name', e.target.value)}
            />
          </Flex>
        </FormItem>
        <FormItem label={t('所属对象')} required>
          <RadioGroup
            inline
            name='object_type'
            value={store.detail.object_type}
            validate={Validator.create([], store.detail.object_type)}
            onChange={handleChange.bind(undefined, 'object_type')}
          >
            {_.map(belongType, (v) => (
              <Radio value={v.value} key={v.validate}>
                {v.text}
              </Radio>
            ))}
          </RadioGroup>
        </FormItem>
        <FormItem label={t('设置字段格式')} required>
          <RadioGroup
            inline
            name='field_type'
            value={store.detail.field_type}
            validate={Validator.create([], store.detail.field_type)}
            onChange={handleChange.bind(undefined, 'field_type')}
          >
            {_.map(fieldType, (v) => (
              <Radio value={v.value} key={v.validate}>
                {v.text}
              </Radio>
            ))}
          </RadioGroup>
          {store.detail.field_type === 1 && (
            <div className='gm-text-desc'>
              <p alignCenter className='gm-margin-top-5'>
                {t('注：文字格式最多输入30个英文字符或15个汉字')}
              </p>
            </div>
          )}
        </FormItem>
        {store.detail.field_type === 2 && (
          <FormItem
            label={t('设置选择的项目名')}
            required
            validate={Validator.create(
              [],
              store.detail.radio_list,
              handleCheck,
            )}
          >
            <Relation isCreate />
          </FormItem>
        )}
        <FormItem label={t('录入配置模块')}>
          <WriteConfig />
        </FormItem>
        <FormItem label={t('配置展现和筛选模块')}>
          <ShowConfig />
        </FormItem>
      </Form>
    </FormGroup>
  )
}

export default observer(Component)
