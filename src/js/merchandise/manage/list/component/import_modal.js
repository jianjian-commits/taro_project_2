import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Request } from '@gm-common/request'
import store from '../list_store'
import {
  Button,
  Flex,
  Form,
  FormItem,
  MoreSelect,
  Switch,
  Tip,
  Uploader,
} from '@gmfe/react'
import { getXlsxURLByLocale } from '../../../../common/service'
import { t } from 'gm-i18n'
import { SvgRemove } from 'gm-svg'
import globalStore from 'stores/global'
import PropTypes from 'prop-types'

@observer
class ImportModal extends Component {
  state = {
    orders: [],
  }

  componentDidMount() {
    store.setChecked(false)
    store.setPic()
    store.setExcel()
    store.setSalemenus([])
    Request('/salemenu/list')
      .data({ type: 4, is_active: 1 })
      .get()
      .then(({ data }) => {
        data.forEach((item) => {
          item.text = item.name
          item.value = item.id
        })
        this.setState({ orders: data })
      })
  }

  handleCheck = (checked) => {
    store.setChecked(checked)
    if (this.props.retail && checked) {
      store.setSalemenus([{ value: globalStore.c_salemenu_id }])
    } else {
      store.setSalemenus([])
    }
  }

  handleUpload = ([value]) => {
    const { name } = value
    const extensionName = name.split('.')[name.split('.').length - 1]

    if (extensionName !== 'xlsx') {
      Tip.warning(t('只能上传.xlsx格式'))
      return
    }
    store.setExcel(value)
  }

  handleUploadImg = ([value]) => {
    const { name } = value
    const extensionName = name.split('.')[1]
    if (extensionName !== 'zip' && extensionName !== 'rar') {
      Tip.warning(t('请上传zip或rar格式的压缩包'))
      return
    }
    store.setPic(value)
  }

  render() {
    const { orders } = this.state
    const { checked, salemenus, excel, pic } = store
    const isCleanFoodType = this.props.typeName === 'cleanFood'
    const isCleanFoodStation = globalStore.isCleanFood()
    const excelUrl =
      isCleanFoodStation && isCleanFoodType
        ? 'station_spu(jingcai)_add_batch.xlsx?v=cleanfood2' // 净菜商品模版
        : 'station_spu_add_batch.xlsx?v=123134134'

    let text = t('批量新建商品模版')

    if (isCleanFoodStation) {
      text = isCleanFoodType
        ? t('批量新建净菜商品模版')
        : t('批量新建毛菜商品模版')
    }

    return (
      <Form labelWidth='150px' colWidth='400px'>
        <FormItem label={t('下载模板')} unLabelTop>
          <span>{t('点击下载')}</span>
          <a href={getXlsxURLByLocale(excelUrl)}>{text}</a>
        </FormItem>
        {!isCleanFoodType && (
          <FormItem label={t('自动创建销售商品')}>
            <Switch
              checked={checked}
              on={t('开启')}
              off={t('关闭')}
              onChange={this.handleCheck}
              style={{ cursor: 'pointer' }}
            />
            <Flex
              column
              className='gm-margin-top-10'
              style={{ color: '#8c8a8a', width: '420px' }}
            >
              {t('开启后')}
              <ol className='gm-padding-left-15 gm-margin-top-5'>
                <li>{`${t('根据导入商品信息自动创建')}${
                  globalStore.isCleanFood() ? t('未开启加工的') : ''
                }${t('销售商品')}`}</li>
                <li>
                  {t(
                    '根据导入商品信息匹配系统已有采购规格，若无匹配则创建新的采购规格',
                  )}
                </li>
                <li>
                  {t(
                    '创建销售商品时为sku自动匹配默认供应商，若无匹配则创建销售商品失败',
                  )}
                </li>
              </ol>
            </Flex>
          </FormItem>
        )}
        {!this.props.retail && !isCleanFoodType && checked && (
          <FormItem label={t('销售商品所在报价单')} required>
            <MoreSelect
              multiple
              selected={salemenus.slice()}
              data={orders}
              style={{ width: '400px' }}
              onSelect={(value) => store.setSalemenus(value)}
            />
          </FormItem>
        )}
        <FormItem label={t('选择上传文件')} required>
          <Flex alignCenter>
            <Uploader onUpload={this.handleUpload} accept='.xlsx'>
              <Button
                type='primary'
                onClick={(event) => event.preventDefault()}
              >
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
              <SvgRemove
                className='gm-cursor'
                onClick={() => store.setExcel()}
              />
            )}
          </Flex>
        </FormItem>
        <FormItem label={t('选择上传图片')}>
          <Flex alignCenter>
            <Uploader onUpload={this.handleUploadImg} accept='.zip,.rar'>
              <Button
                type='primary'
                onClick={(event) => event.preventDefault()}
              >
                {t('上传压缩包')}
              </Button>
            </Uploader>
            {pic && (
              <p
                className='gm-margin-bottom-0 gm-margin-left-10'
                style={{ color: '#135aa4' }}
              >
                {pic.name}
              </p>
            )}
            <div className='gm-gap-10' />
            {pic && (
              <SvgRemove className='gm-cursor' onClick={() => store.setPic()} />
            )}
          </Flex>
        </FormItem>
      </Form>
    )
  }
}

ImportModal.propTypes = {
  typeName: PropTypes.string,
  retail: PropTypes.bool,
}

export default ImportModal
