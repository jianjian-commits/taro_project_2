import React, { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { t } from 'gm-i18n'
import {
  FormGroup,
  Form,
  FormItem,
  Validator,
  Flex,
  Input,
  Tip,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import Relation from '../components/relation'
import WriteConfig from '../components/write_config'
import ShowConfig from '../components/show_config'
import store from '../store'
import { belongTypeMap, fieldTypeMap } from '../enum'
import { history } from 'common/service'

const Detail = () => {
  const form = useRef(null)
  const location = useLocation()

  function handleCheck(params) {
    const list = store.detail.radio_list.slice()
    if (!list.length || !list[0].name) {
      return t('至少填写一项')
    }
  }

  function handleCancel() {
    history.replace('/order_manage/order/customize')
  }

  function handleSubmit() {
    store.update().then((json) => {
      history.replace('/order_manage/order/customize')
      Tip.success(t('更新成功'))
    })
  }

  useEffect(() => {
    const id = location.query.id
    store.getDetailById(id)

    return () => {
      store.initDetail()
    }
  }, [location.query.id])

  return (
    <FormGroup
      className='gm-margin-top-20 gm-margin-top-20'
      formRefs={[form]}
      onCancel={handleCancel}
      onSubmitValidated={handleSubmit}
    >
      <Form
        disableCol
        ref={form}
        labelWidth='200px'
        colWidth='800px'
        hasButtonInGroup
      >
        <FormItem label={t('自定义字段名')}>
          <Flex column className='gm-inline-block'>
            <Input
              disabled
              className='form-control'
              value={store.detail.field_name}
            />
          </Flex>
        </FormItem>
        <FormItem label={t('所属对象')}>
          <Flex column className='gm-inline-block'>
            <Input
              disabled
              className='form-control'
              value={belongTypeMap[store.detail.object_type] || t('未知')}
            />
          </Flex>
        </FormItem>
        <FormItem label={t('设置字段格式')}>
          <Flex column className='gm-inline-block'>
            <Input
              disabled
              className='form-control'
              value={fieldTypeMap[store.detail.field_type] || t('未知')}
            />
          </Flex>
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
            <Relation />
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

export default observer(Detail)
