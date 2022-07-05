import React, { forwardRef } from 'react'
import { observer } from 'mobx-react'
import { Form, FormItem, ImgUploader, Tip, Validator } from '@gmfe/react'
import { store } from '../../store'
import { t } from 'gm-i18n'

const TestImages = forwardRef((_, ref) => {
  const { images } = store
  const handleUploader = (result) => {
    if (images.length >= 20 || images.length + result.length > 20) {
      Tip.warning(t('最多可上传20张检测报告'))
      return
    }
    if (result.some((item) => item.size > 1024 * 1024)) {
      Tip.warning(t('图片不能超过1M'))
      return
    }
    return store.uploadImages(result)
  }

  const handleChange = (files) => {
    store.setImages(files)
  }

  const handleValidate = (value) => {
    return value.length ? null : t('请添加图片')
  }

  return (
    <Form ref={ref} disabledCol>
      <FormItem
        label=''
        validate={Validator.create([], images.slice(), handleValidate)}
      >
        <ImgUploader
          onChange={handleChange}
          data={images.slice()}
          onUpload={handleUploader}
          accept='image/jpg, image/png'
          multiple
        />
      </FormItem>
    </Form>
  )
})

export default observer(TestImages)
