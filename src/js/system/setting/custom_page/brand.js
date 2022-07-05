import React, { useEffect, useState, useRef } from 'react'
import { i18next, t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { FormGroup, Dialog, FormPanel, Form, FormItem } from '@gmfe/react'

import ImgUploader from './component/img_uploader'
import brandImg from '../../../../img/enterprise_brand.jpg'
import store from './store/brand_store'

const handleCancel = () => {
  Dialog.confirm({
    title: i18next.t('取消'),
    children: <div>{i18next.t('确认放弃此次修改吗?')}</div>,
  }).then(() => {
    store.fetchData()
  })
}
const handleChange = (field, e) => {
  const value = e.target.value
  store.handleChange(field, value)
}
const TextArea = observer((props) => {
  const { field, maxLength, ...rest } = props
  const { enterprise_brand } = store
  const value = enterprise_brand[field]
  return (
    <>
      <textarea
        rows='8'
        maxLength={maxLength}
        className='form-control'
        {...rest}
        value={value}
        onChange={handleChange.bind(null, field)}
      />
      <div className='gm-text-desc gm-margin-top-5'>
        {t(
          /* tpl: 请输入${maxLength}以内的文字介绍 */ 'home_brand_text_length',
          { maxLength }
        )}
      </div>
    </>
  )
})
TextArea.defaultProps = {
  maxLength: 200,
}

const Brand = () => {
  const refform = useRef(null)
  const [show, setShow] = useState(false)
  const { enterprise_brand, handleImageChange, handleSubmit } = store
  const {
    corporate_style, // 企业风采 图片
    worksite, // 作业现场 图片
    company_qualification, // 公司资质 图片
    customer_case, // 客户案例 图片
  } = enterprise_brand
  useEffect(() => {
    store.fetchData()
    const close = () => {
      setShow(false)
    }
    document.body.addEventListener('click', close)
    return () => {
      document.body.removeEventListener('click', close)
    }
  }, [])

  return (
    <FormGroup
      formRefs={[refform]}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    >
      <FormPanel title={i18next.t('基础信息')}>
        <Form
          disabledCol
          labelWidth='122px'
          ref={refform}
          style={{ width: '700px' }}
        >
          <FormItem label={i18next.t('企业介绍')} required>
            <TextArea field='corporate_profile' rows={5} />
          </FormItem>
          <FormItem label={i18next.t('企业图片')}>
            <ImgUploader
              maxLength={3}
              imgSize='194*258'
              imgArray={corporate_style.slice()}
              onImageChange={handleImageChange.bind(null, 'corporate_style')}
            />
          </FormItem>
          <FormItem label={i18next.t('作业说明')}>
            <TextArea field='work_description' rows={5} />
          </FormItem>
          <FormItem label={i18next.t('作业现场')}>
            <ImgUploader
              maxLength={2}
              imgSize='256*358'
              imgArray={worksite.slice()}
              onImageChange={handleImageChange.bind(null, 'worksite')}
            />
          </FormItem>
          <FormItem label={i18next.t('资质说明')}>
            <TextArea field='qualification_description' maxLength={500} />
          </FormItem>
          <FormItem label={i18next.t('公司资质')}>
            <ImgUploader
              maxLength={6}
              imgSize='164*232'
              imgArray={company_qualification.slice()}
              onImageChange={handleImageChange.bind(
                null,
                'company_qualification'
              )}
            />
          </FormItem>
          <FormItem label={i18next.t('合作企业')}>
            <ImgUploader
              maxLength={10}
              imgSize='100*100'
              imgArray={customer_case.slice()}
              onImageChange={handleImageChange.bind(null, 'customer_case')}
            />
          </FormItem>
          <a
            className='gm-cursor gm-inline-block gm-padding-bottom-20'
            style={{ marginLeft: '122px' }}
            onClick={() => {
              setShow(!show)
            }}
          >
            点击查看示例
          </a>
        </Form>
        {show && (
          <img
            src={brandImg}
            width={360}
            style={{ marginLeft: '122px' }}
            className='gm-padding-bottom-20'
          />
        )}
      </FormPanel>
    </FormGroup>
  )
}

Brand.displayName = 'Brand'
export default observer(Brand)
