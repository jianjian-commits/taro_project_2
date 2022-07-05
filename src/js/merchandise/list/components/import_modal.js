import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Flex,
  Form,
  FormButton,
  FormItem,
  Modal,
  MoreSelect,
  Switch,
  Tip,
  Uploader,
  Validator,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { getXlsxURLByLocale } from '../../../common/service'
import { SvgRemove } from 'gm-svg'

function ImportModal({ onOk }) {
  const [check, changeCheck] = useState(false)
  const [orders, changeOrders] = useState([])
  const [excel, changeExcel] = useState()
  const [select, changeSelect] = useState([])
  const [pics, changePics] = useState()

  useEffect(() => {
    // 获取报价单
    Request('/salemenu/list')
      .data({ type: 4, is_active: 1 })
      .get()
      .then(({ data }) => {
        data.forEach((item) => {
          item.text = item.name
          item.value = item.id
        })
        changeOrders(data)
      })
  }, [])

  const handleCheck = (check) => {
    changeCheck(check)
    changeSelect([])
  }

  const handleSelect = (value) => {
    changeSelect(value)
  }

  const handleUploadImg = ([value]) => {
    const { size } = value
    if (size > 50 * 1024 * 1024) {
      Tip.warning(t('压缩包大小不能超过50M'))
      return
    }
    changePics(value)
  }

  const handleUpload = ([value]) => {
    changeExcel(value)
  }

  const validateSelect = (value) => {
    if (check) {
      if (!value.length) {
        return t('请选择销售商品所在报价单')
      }
    }
  }

  const validateExcel = (value) => {
    if (!value) {
      return t('请选择上传文件')
    }
  }

  const handleCancel = (event) => {
    event && event.preventDefault()
    Modal.hide()
  }

  const handleSubmit = () => {
    onOk({
      salemenus: JSON.stringify(select.map((item) => item.id)),
      pic: pics,
      excel,
    })
  }

  return (
    <Form labelWidth='150px' horizontal onSubmitValidated={handleSubmit}>
      <FormItem label={t('下载模板')} unLabelTop className='gm-margin-top-10'>
        {t('点击下载')}
        {/*
          问号后面是防止cdn缓存
           */}
        <a href={getXlsxURLByLocale('station_spu_add_batch.xlsx?v=123134134')}>
          {t('批量新建商品模板')}
        </a>
      </FormItem>
      <FormItem label={t('自动创建销售商品')} unLabelTop>
        <Switch
          checked={check}
          on={t('开启')}
          off={t('关闭')}
          onChange={handleCheck}
          style={{ cursor: 'pointer' }}
        />
        <Flex column className='gm-margin-top-10' style={{ color: '#8c8a8a' }}>
          {t('开启后')}
          <ol className='gm-padding-left-15 gm-margin-top-5'>
            <li>{t('根据导入商品信息自动创建销售商品')}</li>
            <li>
              {t(
                '根据导入商品信息匹配系统已有采购规格，若无匹配则创建新的采购规格'
              )}
            </li>
            <li>
              {t(
                '创建销售商品时为sku自动匹配默认供应商，若无匹配则创建销售商品失败'
              )}
            </li>
          </ol>
        </Flex>
      </FormItem>
      {check && (
        <FormItem
          label={t('销售商品所在报价单')}
          required
          validate={Validator.create([], select, validateSelect)}
        >
          <MoreSelect
            multiple
            selected={select}
            data={orders}
            onSelect={handleSelect}
          />
        </FormItem>
      )}
      <FormItem
        label={t('选择上传文件')}
        required
        validate={Validator.create([], excel, validateExcel)}
      >
        <Flex alignCenter>
          <Uploader onUpload={handleUpload} accept='.xlsx'>
            <Button type='primary' onClick={(event) => event.preventDefault()}>
              {t('上传文件')}
            </Button>
          </Uploader>
          {excel && (
            <p
              className='gm-margin-bottom-0 gm-margin-left-10'
              style={{ color: '#135aa4' }}
            >
              {excel.name}
            </p>
          )}
          <div className='gm-gap-10' />
          {excel && (
            <SvgRemove className='gm-cursor' onClick={() => changeExcel()} />
          )}
        </Flex>
      </FormItem>
      <FormItem label={t('选择上传图片')}>
        <Flex alignCenter>
          <Uploader onUpload={handleUploadImg} accept='.zip'>
            <Button type='primary' onClick={(event) => event.preventDefault()}>
              {t('上传zip压缩包')}
            </Button>
          </Uploader>
          {pics && (
            <p
              className='gm-margin-bottom-0 gm-margin-left-10'
              style={{ color: '#135aa4' }}
            >
              {pics.name}
            </p>
          )}
          <div className='gm-gap-10' />
          {pics && (
            <SvgRemove className='gm-cursor' onClick={() => changePics()} />
          )}
        </Flex>
      </FormItem>
      <FormButton>
        <Flex row justifyEnd>
          <Button onClick={handleCancel}>{t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' htmlType='submit'>
            {t('确定')}
          </Button>
        </Flex>
      </FormButton>
    </Form>
  )
}

ImportModal.propTypes = {
  onOk: PropTypes.func,
}

export default ImportModal
