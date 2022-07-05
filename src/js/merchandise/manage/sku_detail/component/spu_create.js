import { i18next } from 'gm-i18n'
import React from 'react'
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
  MoreSelect,
  Tip,
  Validator,
  Input,
  InputNumberV2,
  Button,
} from '@gmfe/react'
import { Link } from 'react-router-dom'
import CategoryPinleiLevalSelect from '../../../../common/components/category_filter_hoc/level_select'
import { renderRecommendImageModal } from '../../component/recommend_image_modal'
import SpreadImg from '../../component/spread_img'
import _ from 'lodash'
import { System } from '../../../../common/service'
import NutrientTable from './nutrient_table'

/**
 * spu新建
 * */
@observer
class SpuCreate extends React.Component {
  constructor(props) {
    super(props)
    this.refform1 = React.createRef()
    this.state = {
      isAddNewSpu: false, // 是选择已有spu，还是新建SPU商品
    }
  }

  componentDidMount() {
    // url自带one two pinLei的为已经选好所属分类了
    const { one, two, pinLei, isStation } = this.props.location.query
    if (pinLei) {
      store.changePinleiSelect([one, two, pinLei])
      store.getPinleiSpu(pinLei)
    }
    // 新建商品营养素设定初值
    store.initNutritionInfo()

    // 零售商品 采购类型默认临采
    if (System.isC()) {
      store.changeSpu('picking_type', 1)
    }

    // 如果说本站分类只能创建本站商品
    if (isStation === '1') {
      store.changeCanEditPType(false)
    } else {
      store.changeSpu('p_type', 0)
    }
  }

  handleSave = () => {
    const { id } = store.spuDetail
    if (id) {
      return store.updateSpu().then(() => Tip.success(i18next.t('修改成功')))
    } else {
      return store.createSpu().then((json) => {
        Tip.success(i18next.t('新增成功'))
        // 拉取spu详情
        store.getSpuDetail(json.data)
        // 拉取有效的自售报价单
        manageStore.getActiveSelfSalemenuList()
        // 拉取供应商列表
        manageStore.getSpuSupplierList(json.data)
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

  handlePinleiSelect = (selected, data) => {
    // 获取一级分类信息
    const category1 = _.find(data, (v) => v.id === selected[0])
    // 如果一级分类为本站，则spu类型只能是本站
    if (category1 && category1.station_id) {
      store.changeCanEditPType(false)
      store.changeSpu('p_type', 1)
    } else {
      store.changeCanEditPType(true)
    }

    store.changePinleiSelect(selected)
    store.getPinleiSpu(selected[2])

    this.setState({
      isAddNewSpu: false,
    })
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

  handleSpuSelect = (value) => {
    // 新建spu
    if (value === -1) {
      this.setState({
        isAddNewSpu: true,
      })
    } else {
      store.selectSpu(value)
      // 拉取spu详情
      store.getSpuDetail(value)
      // 拉取有效的自售报价单
      manageStore.getActiveSelfSalemenuList()
      // 拉取该spu下的sku list
      skuStore.getSkuListDetail(value).then((list) => {
        // 拉取采购规格列表
        skuStore.getPurchaseSpecList(value, list[0] && list[0].supplier_id)
      })
      // 拉取供应商列表
      manageStore.getSpuSupplierList(value)
    }
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

  handleSelectChange = (name, value) => {
    store.changeSpu(name, value)
  }

  handleMoreSelect = (name, selected) => {
    store.changeSpu(name, selected.value)
  }

  handleUploadImg = (files) => {
    const res = _.map(files, (item) => manageStore.uploadImg(item))
    return Promise.all(res).then((json) => _.map(json, (i) => i.data))
  }

  handleChangeImg = (data) => {
    store.changeSpu('image_list', data)
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

  render() {
    const {
      canEditPType,
      spuDetail: {
        name,
        std_unit_name,
        dispatch_method,
        alias,
        p_type,
        desc,
        need_pesticide_detect,
        is_open_nutrition,
        image_list,
        id,
        pinlei_id,
        category_id_1,
        category_id_2,
        customize_code,
        picking_type,
        tax_id_for_bill,
        tax_rate_for_bill,
      },
      spuList,
    } = store
    const { isAddNewSpu } = this.state
    const aliasString = alias && alias.join(' ')
    const unitNameList = _.map(globalStore.unitName, (v) => ({
      value: v.id,
      text: v.name,
    }))
    const unitNameSelected =
      _.find(unitNameList, (v) => v.value === std_unit_name) || null
    const spuSelected = _.find(spuList, (v) => v.value === id) || null
    const pinleiSelected = pinlei_id
      ? [category_id_1, category_id_2, pinlei_id]
      : []

    // 通用
    const p_addSpu = globalStore.hasPermission('add_spu')
    // 本站
    const p_addSpuPrivate = globalStore.hasPermission('add_spu_private')
    // 是否有编辑检测报告的权限
    const p_editSpuDetectedReport = globalStore.hasPermission(
      'edit_pesticidedetect',
    )
    // 是否可编辑商品税收信息
    const isEditGoodsTax = globalStore.hasPermission('edit_goods_tax')
    const hasViewNutrient = globalStore.hasPermission('view_nutrition_info')
    const hasEditNutrient = globalStore.hasPermission('edit_nutrition_info')
    const allowAll = p_addSpu || p_addSpuPrivate
    // 是否可编辑： 选择了spu or 命名了商品名称
    const canEdit = !!id || !!name
    const list = spuList.slice()
    if (p_addSpu || p_addSpuPrivate) {
      list.unshift({ text: i18next.t('新建SPU商品+'), value: -1 })
    }

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
          <Form ref={this.refform1} colWidth='400px' labelWidth='170px'>
            <FormBlock col={2}>
              <FormItem
                label={i18next.t('所属分类')}
                required
                validate={Validator.create([], pinlei_id)}
              >
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
              <FormItem
                label={i18next.t('商品名称')}
                required
                validate={Validator.create([], name)}
              >
                {isAddNewSpu ? (
                  <input
                    name='name'
                    type='text'
                    onChange={this.handleInputChange}
                    value={name || ''}
                  />
                ) : (
                  <Select
                    disabled={!pinlei_id}
                    value={spuSelected}
                    onChange={this.handleSpuSelect}
                    data={list}
                  />
                )}
              </FormItem>
              <FormItem label={i18next.t('商品别名')}>
                <input
                  name='alias'
                  type='text'
                  disabled={!canEdit || !allowAll}
                  placeholder={i18next.t('选填；可输入多个别名，以空格区分')}
                  onChange={this.handleInputChange}
                  value={aliasString || ''}
                />
              </FormItem>
              <FormItem label={i18next.t('商品类型')} required>
                {/* 0 通用 1 本站 */}
                {canEditPType ? (
                  <Select
                    disabled={!canEdit}
                    value={p_type}
                    data={[
                      { value: 0, text: i18next.t('通用') },
                      { value: 1, text: i18next.t('本站') },
                    ]}
                    onChange={this.handleSelectChange.bind(this, 'p_type')}
                  />
                ) : (
                  <div className='gm-margin-top-5'>
                    {p_type ? i18next.t('本站') : i18next.t('通用')}
                  </div>
                )}
              </FormItem>
              <FormItem label={i18next.t('自定义编码')}>
                <Input
                  name='customize_code'
                  value={customize_code}
                  disabled={!canEdit}
                  placeholder={i18next.t('请填写自定义编码')}
                  className='form-control'
                  onChange={this.handleInputChange}
                />
              </FormItem>
              <FormItem label={i18next.t('投框方式')} required>
                {allowAll ? (
                  <Select
                    disabled={!canEdit}
                    onChange={this.handleSelectChange.bind(
                      this,
                      'dispatch_method',
                    )}
                    data={[
                      { value: 1, text: i18next.t('按订单投框') },
                      { value: 2, text: i18next.t('按司机投框') },
                    ]}
                    name='dispatch_method'
                    value={+dispatch_method}
                  />
                ) : (
                  <div className='gm-margin-top-5'>-</div>
                )}
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
              <FormItem
                label={i18next.t('基本单位')}
                required
                validate={Validator.create([], std_unit_name)}
              >
                {allowAll ? (
                  <MoreSelect
                    disabled={!canEdit}
                    data={unitNameList}
                    selected={unitNameSelected}
                    onSelect={this.handleMoreSelect.bind(this, 'std_unit_name')}
                    renderListFilterType='pinyin'
                  />
                ) : (
                  <div className='gm-margin-top-5'>{std_unit_name || '-'}</div>
                )}
              </FormItem>
            </FormBlock>
            <FormItem label={i18next.t('商品图片')} colWidth='480px'>
              <ImgUploader
                disabled={!canEdit}
                data={image_list}
                onUpload={this.handleUploadImg}
                onChange={this.handleChangeImg}
                imgRender={(img) => <SpreadImg src={img.url} />}
                accept='image/*'
                multiple
              >
                <div className='gm-uploader gm-img-uploader-item'>
                  <Uploader.DefaultImage onClick={this.handleRecommendImage} />
                </div>
              </ImgUploader>
            </FormItem>
            <FormItem label={i18next.t('描述')} colWidth='480px'>
              <Flex column>
                <textarea
                  disabled={!canEdit}
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
            {System.isB() && isEditGoodsTax && (
              <>
                <FormItem label={i18next.t('税收分类编码')} colWidth='480px'>
                  <Flex column>
                    <Input
                      name='tax_id_for_bill'
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                  disabled={!canEdit}
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
                  disabled={!canEdit && !hasEditNutrient}
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  onChange={this.handleNutrientsChange}
                />
              </FormItem>
            )}
            <FormItem label=''>
              <div>
                {is_open_nutrition && hasViewNutrient ? (
                  <NutrientTable store={store} />
                ) : null}
              </div>
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default SpuCreate
