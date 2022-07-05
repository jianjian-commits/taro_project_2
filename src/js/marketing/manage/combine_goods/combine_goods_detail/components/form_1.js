import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import CombineSpuTable from './combine_spu_table'
import UnitSearchSelector from './unit_search_selector'
import {
  FormItem,
  ImgUploader,
  Tip,
  Switch,
  Validator,
  Form,
  ToolTip,
  RadioGroup,
  Radio,
  Flex,
} from '@gmfe/react'
import PropTypes from 'prop-types'

const Form1 = React.forwardRef((props, ref) => {
  const handleSetDetailFields = (key, value) => {
    props.store.setDetailFields(key, value)
  }

  const handleUploadImg = (files) => {
    if (files.some((v) => v.size > 1024 * 1024)) {
      Tip.warning(i18next.t('图片不能超过1MB'))
      return
    }

    return props.store.uploadImg(files)
  }

  const { detailFields, images, setImages, type } = props.store
  const { name, combine_level, state, desc, sale_unit_name } = detailFields

  return (
    <Form colWidth='700px' labelWidth='170px' ref={ref}>
      <FormItem
        required
        label={i18next.t('组合商品名')}
        validate={Validator.create([], name)}
      >
        <input
          type='text'
          value={name}
          onChange={(e) => handleSetDetailFields('name', e.target.value)}
        />
      </FormItem>
      <FormItem label={i18next.t('类型')}>
        <Flex>
          <RadioGroup
            name='combine_level'
            inline
            value={combine_level}
            onChange={(combine_level) =>
              handleSetDetailFields('combine_level', combine_level)
            }
            style={{ minWidth: '200px', marginTop: '4px' }}
          >
            {/* 详情页不可修改类型 */}
            <Radio value={2} disabled={type === 'edit'}>
              {i18next.t('二级组合商品')}
            </Radio>
            <Radio value={3} disabled={type === 'edit'}>
              {i18next.t('三级组合商品')}
            </Radio>
          </RadioGroup>
          <div className='gm-gap-5' />
          <ToolTip
            className='gm-margin-top-5'
            popup={
              <div className='gm-padding-5'>
                <div className='gm-text-bold'>
                  {i18next.t('设置当前组合商品包含的组成商品的类型')}
                </div>
                <div className='gm-margin-top-5'>
                  {i18next.t('二级组合：组成商品仅可添加普通商品')}
                </div>
                <div className='gm-margin-top-5'>
                  {i18next.t('三级组合：组成商品可添加二级组合商品和普通商品')}
                </div>
              </div>
            }
          />
        </Flex>
      </FormItem>
      <FormItem label={i18next.t('描述')}>
        <textarea
          value={desc}
          maxLength={60}
          onChange={(e) => handleSetDetailFields('desc', e.target.value)}
        />
      </FormItem>
      <FormItem label={i18next.t('商品图片')} colWidth='600px'>
        <ImgUploader
          data={images.slice()}
          onUpload={handleUploadImg}
          onChange={setImages}
          accept='image/*'
          multiple
        />
        <div className='gm-text-desc gm-margin-top-5'>
          {i18next.t(
            '图片大小请不要超过1Mb，推荐尺寸宽度为720，支持jpg/png格式'
          )}
        </div>
      </FormItem>
      <FormItem
        required
        label={i18next.t('销售单位')}
        validate={Validator.create([], sale_unit_name)}
      >
        <UnitSearchSelector
          selected={sale_unit_name}
          onSelect={(sale_unit_name) =>
            handleSetDetailFields('sale_unit_name', sale_unit_name)
          }
        />
      </FormItem>
      <FormItem label={i18next.t('组成商品')}>
        <CombineSpuTable />
      </FormItem>
      <FormItem label={i18next.t('销售状态')}>
        <Switch
          on={i18next.t('上架')}
          off={i18next.t('下架')}
          checked={Boolean(state)}
          onChange={(bool) => handleSetDetailFields('state', Number(bool))}
        />
      </FormItem>
    </Form>
  )
})

Form1.propTypes = {
  store: PropTypes.object,
  ref: PropTypes.object,
}

export default observer(Form1)
