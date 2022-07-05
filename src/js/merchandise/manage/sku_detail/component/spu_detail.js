import { i18next } from 'gm-i18n'
import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import store from '../spu_store'
import skuStore from '../sku_store'
import manageStore from '../../store'
import globalStore from '../../../../stores/global'
import {
  Form,
  FormPanel,
  FormBlock,
  FormItem,
  FormGroup,
  Switch,
  Flex,
  ImgUploader,
  Uploader,
  Select,
  Tip,
  Dialog,
  Input,
  InputNumberV2,
  Button,
  RadioGroup,
  Radio,
} from '@gmfe/react'
import { System } from '../../../../common/service'
import Url from '../../../../common/components/url'
import _ from 'lodash'
import { createProductDetailUrl } from '../util'
import CategoryPinleiLevalSelect from '../../../../common/components/category_filter_hoc/level_select'
import NutrientTable from './nutrient_table'
import { renderRecommendImageModal } from '../../component/recommend_image_modal'
import SpreadImg from '../../component/spread_img'

// 绩效方式Option
const performanceWayOptions = [
  { label: i18next.t('计重'), value: 1 },
  { label: i18next.t('计件'), value: 2 },
]
/**
 * spu详情
 * */
@observer
class SpuDetail extends React.Component {
  constructor(props) {
    super(props)
    this.refform1 = React.createRef()
  }

  handleSave = () => {
    const { id } = store.spuDetail
    if (id) {
      return store.updateSpu().then(() => Tip.success(i18next.t('修改成功')))
    } else {
      return store.createSpu().then((json) => {
        Tip.success(i18next.t('新增成功'))
        store.getSpuDetail(json.data)
        return skuStore.getSkuListDetail(json.data).then((list) => {
          // 拉取采购规格列表
          return skuStore.getPurchaseSpecList(
            json.data,
            list[0] && list[0].supplier_id,
          )
        })
      })
    }
  }

  handleSaveAndCreate() {
    if (this.refform1.current.apiDoValidate()) {
      this.handleSave().then(() => {
        store.init()
      })
    }
  }

  handleCancel = () => {
    window.closeWindow()
  }

  handleDetectedChange = () => {
    store.changeSpu(
      'need_pesticide_detect',
      !store.spuDetail.need_pesticide_detect,
    )
  }

  handleNutrientsChange = () => {
    store.changeSpu(
      'is_open_nutrition',
      _.toNumber(!store.spuDetail.is_open_nutrition),
    )
  }

  handleInputChange = (e) => {
    const name = e.target.name
    let value = e.target.value
    // 税收分类编码只能输入数字
    if (name === 'tax_id_for_bill') {
      e.target.value = e.target.value.replace(/[^\d]/g, '')
      value = e.target.value
    }

    if (name === 'alias') {
      value = value.split(/\s+/g)
    }

    store.changeSpu(name, value)
  }

  handleUploadImg = (files) => {
    const res = _.map(files, (item) => manageStore.uploadImg(item))
    return Promise.all(res).then((json) => _.map(json, (i) => i.data))
  }

  handleChangeImg = (data) => {
    store.changeSpu('image_list', data)
  }

  handleUploadDetailImg = (files) => {
    return manageStore.uploadImg(files[0]).then((json) => {
      store.changeSpu('detail_image_list', [json.data])
    })
  }

  handleRecommendImage = () => {
    const { spuDetail } = store
    const { name, image_list, id } = spuDetail
    const image = image_list[0]
    renderRecommendImageModal({
      info: { name, spu_id: id, defaultImages: image ? [image] : [] },
      onUpload: async (files) => {
        const imgs = await this.handleUploadImg(files)
        this.handleChangeImg(image_list.concat(imgs))
      },
      onSubmit: (imgs) => {
        const newList = _.uniqBy(image_list.slice().concat(imgs), 'id')
        this.handleChangeImg(newList)
      },
    })
  }

  handleSyncImg = () => {
    Dialog.confirm({
      title: i18next.t('同步商品图片'),
      children: (
        <div>
          {i18next.t(
            '同步后，商品图片将覆盖此商品所有销售规格图片，是否确认？',
          )}
        </div>
      ),
      onOK: async () => {
        const {
          spuDetail: { id },
        } = store
        const { skuList } = skuStore
        // 若是报价单进入的则只同步改报价单的商品
        // 若是零售进入的则只同步零售报价单的商品
        let salemenuId = this.props.location.query.salemenuId
        if (System.isC()) salemenuId = globalStore.c_salemenu_id

        if (skuList.length !== 0) {
          // 先保存spu图片
          await this.handleSave()
          // 同步spu图片至sku中
          store.syncImgToSku(id, salemenuId).then((json) => {
            if (json.code === 0) {
              Tip.success(i18next.t('同步成功！'))
              // todo 更新了sku的图片 相应拉取最新数据  后续把sku的逻辑都放到sku_detail上
              skuStore.getSkuListDetail(id)
            }
          })
        } else {
          Tip.success(i18next.t('同步失败，无销售规格！'))
        }
      },
    })
  }

  handleSelectChange = (name, value) => {
    store.changeSpu(name, value)
  }

  handlePinleiSelect = (selected) => {
    store.changePinleiSelect(selected)
    store.getPinleiSpu(selected[2])
  }

  render() {
    const { spuDetail } = store
    const {
      need_pesticide_detect,
      is_open_nutrition,
      desc,
      std_unit_name,
      p_type,
      name,
      image_list,
      detail_image_list,
      dispatch_method,
      cms_key,
      cshop_cms_key,
      alias,
      pinlei_id,
      category_id_2,
      category_id_1,
      id,
      new_customize_code,
      picking_type,
      tax_id_for_bill,
      tax_rate_for_bill,
      perf_method,
    } = spuDetail
    // 是否显示固定URL,没有有效的sku不显示
    const showUrl = skuStore.skuList && skuStore.skuList.length
    const shopName = System.isB() ? 'bshop' : 'cshop'
    const cmsKey = System.isB() ? cms_key : cshop_cms_key

    const aliasString = alias && alias.join(' ')
    // 是否可编辑检测报告权限
    const p_editSpuDetectedReport = globalStore.hasPermission(
      'edit_pesticidedetect',
    )
    // 是否可编辑商品税收信息
    const isEditGoodsTax = globalStore.hasPermission('edit_goods_tax')
    const hasViewNutrient = globalStore.hasPermission('view_nutrition_info')
    const hasEditNutrient = globalStore.hasPermission('edit_nutrition_info')
    const pinleiSelected = pinlei_id
      ? [category_id_1, category_id_2, pinlei_id]
      : []

    return (
      <FormGroup
        formRefs={[this.refform1]}
        onSubmitValidated={this.handleSave}
        onCancel={this.handleCancel}
        actions={
          <>
            <Button
              type='primary'
              onClick={this.handleSaveAndCreate.bind(this)}
              className='gm-margin-left-10'
            >
              {i18next.t('保存并新建')}
            </Button>
          </>
        }
      >
        <FormPanel title={i18next.t('基础信息')}>
          <Form ref={this.refform1} colWidth='480px' labelWidth='170px'>
            <FormBlock col={2}>
              <FormItem label={i18next.t('所属分类')} required>
                <Flex column>
                  <CategoryPinleiLevalSelect
                    selected={pinleiSelected}
                    onChange={this.handlePinleiSelect}
                  />
                  <div className='gm-gap-5' />
                  <div>
                    {i18next.t('无合适分类，去')}&nbsp;
                    <Link
                      to={
                        System.isC()
                          ? '/c_retail/basic_info/category_management'
                          : '/merchandise/manage/category_management'
                      }
                    >
                      {i18next.t('新建分类')}
                    </Link>
                  </div>
                </Flex>
              </FormItem>
              <FormItem label={i18next.t('商品名称')} required>
                <input
                  name='name'
                  type='text'
                  onChange={this.handleInputChange}
                  value={name || ''}
                />
              </FormItem>
              <FormItem label={i18next.t('商品别名')}>
                <input
                  name='alias'
                  type='text'
                  placeholder={i18next.t('选填；可输入多个别名，以空格区分')}
                  onChange={this.handleInputChange}
                  value={aliasString || ''}
                />
              </FormItem>
              <FormItem label={i18next.t('商品类型')} required>
                {/* 0 通用 1 本站 */}
                <div className='gm-margin-top-5'>
                  {p_type === 0 ? i18next.t('通用') : i18next.t('本站')}
                </div>
              </FormItem>
              <FormItem label={i18next.t('自定义编码')}>
                <Input
                  name='new_customize_code'
                  value={new_customize_code}
                  placeholder={i18next.t('请填写自定义编码')}
                  className='form-control'
                  onChange={this.handleInputChange}
                />
              </FormItem>
              <FormItem label={i18next.t('投框方式')}>
                <Select
                  onChange={this.handleSelectChange.bind(
                    this,
                    'dispatch_method',
                  )}
                  name='dispatch_method'
                  data={[
                    { value: 1, text: i18next.t('按订单投框') },
                    { value: 2, text: i18next.t('按司机投框') },
                  ]}
                  value={+dispatch_method}
                />
              </FormItem>
              {System.isB() && (
                <FormItem label={i18next.t('采购类型')}>
                  <Select
                    onChange={this.handleSelectChange.bind(
                      this,
                      'picking_type',
                    )}
                    name='picking_type'
                    data={[
                      { value: 1, text: i18next.t('临采') },
                      { value: 2, text: i18next.t('非临采') },
                    ]}
                    value={picking_type}
                  />
                </FormItem>
              )}
              <FormItem label={i18next.t('基本单位')}>
                <div className='gm-margin-top-5'>{std_unit_name}</div>
              </FormItem>
              <FormItem label={i18next.t('商品图片')} colWidth='480px'>
                <Flex column>
                  <ImgUploader
                    data={image_list}
                    onUpload={this.handleUploadImg}
                    onChange={this.handleChangeImg}
                    accept='image/*'
                    multiple
                    imgRender={(img) => <SpreadImg src={img.url} />}
                  >
                    <div className='gm-uploader gm-img-uploader-item'>
                      <Uploader.DefaultImage
                        onClick={this.handleRecommendImage}
                      />
                    </div>
                  </ImgUploader>
                  <Flex alignCenter className='gm-margin-top-5'>
                    <a className='gm-cursor' onClick={this.handleSyncImg}>
                      {i18next.t('点击同步')}
                    </a>
                    <div className='gm-gap-5' />
                    <span>
                      ({i18next.t('可将所有商品图片同步至销售规格图片')})
                    </span>
                  </Flex>
                </Flex>
              </FormItem>
              <FormItem label={i18next.t('绩效方式')}>
                <RadioGroup
                  inline
                  name='perf_method'
                  value={perf_method}
                  onChange={(perf_method) =>
                    this.handleSelectChange('perf_method', perf_method)
                  }
                >
                  {performanceWayOptions.map(({ label, value }) => (
                    <Radio value={value} key={value}>
                      {label}
                    </Radio>
                  ))}
                </RadioGroup>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t('此方式将用于商品分拣绩效统计规则')}
                </div>
              </FormItem>
            </FormBlock>

            <FormItem label={i18next.t('描述')} colWidth='480px'>
              <Flex column>
                <textarea
                  className='form-control'
                  name='desc'
                  rows='4'
                  value={desc}
                  onChange={this.handleInputChange}
                />
                <div className='gm-margin-top-5 gm-text-desc'>
                  {i18next.t('对商品进行描述，长度小于等于100个字')}
                </div>
              </Flex>
            </FormItem>
            <FormItem label={i18next.t('商品详情图')} colWidth='580px'>
              <Uploader
                accept='image/jpeg, image/png'
                onUpload={this.handleUploadDetailImg}
                style={{ height: '64px', width: '64px' }}
              >
                {detail_image_list[0] && (
                  <img
                    style={{ height: '100%', width: '100%' }}
                    src={detail_image_list[0].url}
                    alt=''
                  />
                )}
              </Uploader>
              <div className='gm-margin-top-5 gm-text-desc'>
                {i18next.t('图片推荐尺寸宽度为720，支持jpg/png格式')}
              </div>
            </FormItem>
            <FormItem label={i18next.t('固定URL')} colWidth='700px'>
              <div className='gm-margin-top-5'>
                {showUrl ? (
                  <Flex column>
                    <Url
                      target='_brank'
                      href={createProductDetailUrl(id, cmsKey, shopName)}
                    />
                    <div className='gm-margin-top-5 gm-text-desc'>
                      {i18next.t(
                        '固定URL可用于外部推广，通过链接跳转至相应商品详情',
                      )}
                    </div>
                  </Flex>
                ) : (
                  '-'
                )}
              </div>
            </FormItem>
            {System.isB() && isEditGoodsTax && (
              <>
                <FormItem label={i18next.t('税收分类编码')} colWidth='480px'>
                  <Flex column>
                    <Input
                      name='tax_id_for_bill'
                      value={tax_id_for_bill}
                      placeholder={i18next.t('请填写税收分类编码')}
                      className='form-control'
                      onChange={this.handleInputChange}
                    />
                    <div className='gm-margin-top-5 gm-text-desc'>
                      {i18next.t('填写19位税收分类编码用于开票')}
                    </div>
                  </Flex>
                </FormItem>
                <FormItem label={i18next.t('税收税率')} colWidth='480px'>
                  <Flex column>
                    <InputNumberV2
                      className='form-control'
                      value={tax_rate_for_bill}
                      min={0}
                      max={100}
                      precision={0}
                      placeholder={i18next.t('请填写税收税率')}
                      onChange={(value) => {
                        store.changeSpu('tax_rate_for_bill', value)
                      }}
                    />
                    <div className='gm-margin-top-5 gm-text-desc'>
                      {i18next.t('填写分类税率，可填数0-100，填写0表示免税')}
                    </div>
                  </Flex>
                </FormItem>
              </>
            )}
            {System.isB() && p_editSpuDetectedReport && (
              <FormItem label={i18next.t('检测报告')}>
                <Switch
                  type='primary'
                  checked={!!need_pesticide_detect}
                  on={i18next.t('显示')}
                  off={i18next.t('不显示')}
                  onChange={this.handleDetectedChange}
                />
              </FormItem>
            )}
            {System.isB() && hasViewNutrient && (
              <FormItem label={i18next.t('营养素')}>
                <Switch
                  type='default'
                  checked={!!is_open_nutrition}
                  disabled={!hasEditNutrient}
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  onChange={this.handleNutrientsChange}
                />
              </FormItem>
            )}
            {System.isB() && (
              <FormItem label=''>
                <div>
                  {is_open_nutrition && hasViewNutrient ? (
                    <NutrientTable store={store} />
                  ) : null}
                </div>
              </FormItem>
            )}
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default SpuDetail
