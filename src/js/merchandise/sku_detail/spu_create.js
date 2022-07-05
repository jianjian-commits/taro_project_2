import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import {
  Tip,
  Dialog,
  Switch,
  Form,
  FormItem,
  FormGroup,
  MoreSelect,
  Input,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import _ from 'lodash'
import SPUInfo from './component/spu_info_head'
import { Select, Option } from './component/default_select'
import { history } from '../../common/service'
import actions from '../../actions'
import globalStore from '../../stores/global'
import '../actions'
import '../reducer'
import './actions'
import './reducer'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import UploadDeleteImgs from './component/upload_delete_imgs'

@observer
class SPUCreate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // 新建SPU
      isAddSPU: false,
      // 选中已有的SPU
      isSelectSPU:
        !!this.props.location.query.spu_id ||
        !!this.props.merchandiseDetail.spuDetail.id,
    }
    this.form = React.createRef()
  }

  componentWillMount() {
    // 分类管理点进来的新建
    if (this.props.location.query.realCreate) {
      this.setState({
        isAddSPU: true,
      })
    }
  }

  componentDidMount() {
    // 若已有spu 则不刷新数据
    if (this.state.isSelectSPU) {
      return
    }

    const { spu_id, pinLei } = this.props.location.query
    actions.merchandise_common_get_all()
    if (spu_id) {
      actions.merchandise_list_spu_detail({
        spu_id,
      })
      // 获取某个spu下所有的sku
      actions.merchandise_sku_common_sku_list(spu_id, null)
    } else {
      console.log('看看是不是调用了这个接口')
      actions.merchandise_spu_category({
        id: pinLei,
      })
      actions.merchandise_list_spu_list({
        pinlei_id: pinLei,
      })
      actions.merchandise_list_spu_detail_init()
      // 默认 detail
      actions.merchandise_list_spu_detail_change('name', '')
      actions.merchandise_list_spu_detail_change('desc', '')
      actions.merchandise_list_spu_detail_change('imgUrlList', '')
      actions.merchandise_list_spu_detail_change('p_type', '0')
      actions.merchandise_list_spu_detail_change('std_unit_name', '')
      actions.merchandise_list_spu_detail_change('dispatch_method', '2')
    }
  }

  handleInputChange = (e) => {
    const name = e.target.name
    let value = e.target.value
    if (name === 'alias') {
      value = value.split(/\s+/g)
    }
    actions.merchandise_list_spu_detail_change(name, value)
  }

  handleSelectChange = (id, name) => {
    actions.merchandise_list_spu_detail_change(name, id)
  }

  handleSelectUnitName = (name, selected) => {
    actions.merchandise_list_spu_detail_change(name, selected.value)
  }

  handleDetectedChange = () => {
    const { spuDetail } = this.props.merchandiseDetail
    const currentDetected = !spuDetail.need_pesticide_detect
    actions.merchandise_list_spu_detail_change(
      'need_pesticide_detect',
      ~~currentDetected,
    )
  }

  handleConfirm = (isAsync) => {
    const spuDetail = Object.assign({}, this.props.merchandiseDetail.spuDetail)
    const { spuImg, spuCreate } = this.props.merchandiseDetail

    const detailImg = spuImg.detail || {}
    let isEmpty = false
    let alias = []
    const spuImgList = spuDetail.imgUrlList || []

    if (spuDetail.new_customize_code.length > 50) {
      Tip.warning(i18next.t('自定义编码的最长长度为50'))
      return
    }

    if (spuDetail.new_customize_code === spuDetail.customize_code) {
      delete spuDetail.customize_code
    } else {
      spuDetail.customize_code = spuDetail.new_customize_code
    }

    if (spuDetail.alias && spuDetail.alias.length >= 1) {
      alias = JSON.stringify(spuDetail.alias)
    } else {
      delete spuDetail.alias
    }
    spuDetail.need_pesticide_detect = ~~spuDetail.need_pesticide_detect

    // 传给后端的，图片文件名数组
    const imagesPathId = JSON.stringify(
      spuImgList.map((img) => {
        const arr = img.split('/')
        return arr[arr.length - 1]
      }),
    )

    // 获取商品详情图片的默认值
    const defaultDetailImage =
      (spuDetail.detail_images && spuDetail.detail_images[0]) || ''

    const arr = defaultDetailImage.split('/')
    const defaultImageId = arr[arr.length - 1]

    let detail_images = detailImg.img_path_id || defaultImageId
    detail_images = detail_images ? JSON.stringify([detail_images]) : ''

    // 不把imgUrlList传给后台
    const { imgUrlList, ...rest } = spuDetail

    _.forEach(spuDetail, (v, k) => {
      if (k === 'imgUrlList' || k === 'desc' || k === 'detail_images') {
        return true
      }
      if (v === '') {
        isEmpty = true
      }
    })

    if (isEmpty) {
      Tip.info(i18next.t('请填写完整!'))
      return false
    }

    return actions
      .merchandise_list_spu_update({
        ...rest,
        id: this.props.location.query.spu_id || spuCreate,
        alias,
        detail_images,
        images: imagesPathId,
      })
      .then(() => {
        if (!isAsync) {
          Tip.success(i18next.t('更新成功!'))
        }
        return true
      })
      .catch(() => {
        return false
      })
  }

  handleCreateConfirm = () => {
    const { spuCreate } = this.props.merchandiseDetail
    const spuDetail = Object.assign({}, this.props.merchandiseDetail.spuDetail)

    let isEmpty = false
    let alias = []
    const spuImgList = spuDetail.imgUrlList || []

    if (spuDetail.customize_code && spuDetail.customize_code.length > 50) {
      Tip.warning(i18next.t('自定义编码的最长长度为50'))
      return
    }

    const p_addSpu = globalStore.hasPermission('add_spu')
    const p_addSpuPrivate = globalStore.hasPermission('add_spu_private')
    const allowAll = p_addSpu && p_addSpuPrivate
    if (!allowAll) {
      spuDetail.p_type = p_addSpu ? '0' : '1'
    }

    if (spuDetail.alias && spuDetail.alias.length >= 1) {
      alias = JSON.stringify(spuDetail.alias)
    } else {
      delete spuDetail.alias
    }

    spuDetail.need_pesticide_detect = spuDetail.need_pesticide_detect || 0

    // 传给后端的，图片文件名数组
    const imagesPathId = JSON.stringify(
      spuImgList.map((img) => {
        const arr = img.split('/')
        return arr[arr.length - 1]
      }),
    )

    // 不把imgUrlList传给后台
    const { imgUrlList, ...rest } = spuDetail

    _.forEach(spuDetail, (v, k) => {
      if (k === 'imgUrlList' && (v === '' || v === undefined)) {
        delete spuDetail.imgUrlList
      }
      if (k === 'imgUrlList' || k === 'desc') {
        return true
      }
      if (v === '') {
        isEmpty = true
      }
    })

    if (isEmpty) {
      Tip.info(i18next.t('请填写完整!'))
      return false
    }

    if (spuCreate) {
      return actions
        .merchandise_list_spu_update({
          ...rest,
          id: spuCreate,
          alias,
          images: imagesPathId,
        })
        .then(() => {
          Tip.success(i18next.t('更新成功!'))
        })
    } else {
      delete spuDetail.id
      return actions
        .merchandise_list_spu_create({
          ...rest,
          pinlei_id: spuDetail.pinlei_id || this.props.location.query.pinLei,
          alias,
          images: imagesPathId,
        })
        .then((json) => {
          actions
            .merchandise_list_spu_detail({ spu_id: json.data })
            .then(() => {
              this.setState({
                isSelectSPU: true,
              })
              Tip.success(i18next.t('新建成功!'))
              this.props.onSuccess()
            })
        })
    }
  }

  handleCancel = () => {
    const { spuCreate } = this.props.merchandiseDetail
    if (spuCreate) {
      return actions.merchandise_list_spu_detail({ spu_id: spuCreate })
    } else {
      history.go(-1)
    }
  }

  handleDelete = () => {
    Dialog.dialog({
      title: i18next.t('删除商品'),
      children: (
        <div>
          {i18next.t(
            '删除该商品，该商品下的所有销售规格和采购规格将同时被删除!',
          )}
        </div>
      ),
      onOK: () => {
        const { spuCreate } = this.props.merchandiseDetail
        if (spuCreate) {
          actions.merchandise_spu_delete({ id: spuCreate }).then(() => {
            Tip.success(i18next.t('删除成功'))
            history.go(-1)
          })
        } else {
          return true
        }
      },
    })
  }

  handleUpload = (type, index, file, event) => {
    // index 用于标识上传图片时是新建还是修改
    event.preventDefault()
    file.forEach((item) => {
      if (type === 'logo' && item.size > 1024 * 100) {
        Tip.warning(i18next.t('图片不能超过100kb'))
        return
      }
      // 更新spuImg
      actions.merchandise_spu_img_upload(item, type, index)
    })
  }

  handleDefaultSelectChange = (id) => {
    actions.merchandise_list_spu_detail({ spu_id: id }).then(() => {
      this.setState({
        isSelectSPU: true,
      })
      this.props.onSuccess()
    })
  }

  handleCustomOptionClick = () => {
    this.setState({
      isAddSPU: true,
    })
  }

  handleDetailChange = (name, value) => {
    actions.merchandise_list_spu_detail_change(name, value)
  }

  handleSpuUpload = (file, type, index) => {
    actions.merchandise_spu_img_upload(file, type, index)
  }

  handleDeleteImg = (index, event) => {
    // 阻止事件冒泡，删除图片但不触发上传图片事件
    event.stopPropagation()

    actions.merchandise_spu_delete_image(index)
  }

  render() {
    const { categories } = this.props.merchandiseCommon
    const {
      spuDetail,
      spuList,
      spuCategory,
      spuImg,
      skuList,
    } = this.props.merchandiseDetail

    const { isAddSPU, isSelectSPU } = this.state
    const images = spuDetail.imgUrlList || []

    const belongs = spuCategory.category_name_1
      ? spuCategory.category_name_1 +
        '/' +
        spuCategory.category_name_2 +
        '/' +
        spuCategory.name
      : '-'
    const aliasString = (spuDetail.alias && spuDetail.alias.join(' ')) || ''
    // todo unitName后续需要改为{value, text}
    const unitNameList = _.map(globalStore.unitName, (v) => ({
      value: v.id,
      text: v.name,
    }))
    const unitNameSelected =
      _.find(unitNameList, (v) => v.value === spuDetail.std_unit_name) || null

    // 通用
    const p_addSpu = globalStore.hasPermission('add_spu')
    // 本站
    const p_addSpuPrivate = globalStore.hasPermission('add_spu_private')
    // 是否有编辑检测报告的权限
    const p_editSpuDetectedReport = globalStore.hasPermission(
      'edit_pesticidedetect',
    )
    const allowAll = p_addSpu && p_addSpuPrivate
    const denyAll = !p_addSpu && !p_addSpuPrivate

    const itemWidth = { width: '410px' }
    const isShowAsyncButton = false // 新建时不显示同步图片按钮

    if (isSelectSPU) {
      return (
        <SPUInfo
          detail={spuDetail}
          handleDetailChange={this.handleDetailChange}
          categories={categories}
          onConfirm={this.handleConfirm}
          onCancel={this.handleCancel}
          onDelete={this.handleDelete}
          onUpload={this.handleSpuUpload}
          spuImg={spuImg}
          skuList={skuList}
          images={images}
          isShowAsyncButton={isShowAsyncButton}
        />
      )
    } else {
      return (
        <FormGroup
          formRefs={[this.form]}
          onSubmit={this.handleCreateConfirm}
          onCancel={this.handleCancel}
        >
          <QuickPanel
            icon='todo'
            iconColor='#4fb7de'
            title={i18next.t('基础信息')}
          >
            <Form
              horizontal
              labelWidth='110px'
              className='spu-info'
              ref={this.form}
              hasButtonInGroup
            >
              <FormItem label={i18next.t('所属分类')}>
                <input
                  style={itemWidth}
                  disabled
                  className='gm-margin-bottom-10'
                  value={belongs}
                />
              </FormItem>
              <FormItem label={i18next.t('商品名称')}>
                <div className='gm-margin-bottom-10'>
                  {isAddSPU ? (
                    <input
                      name='name'
                      type='text'
                      className='form-control'
                      onChange={this.handleInputChange}
                      placeholder={i18next.t('请填写商品名...')}
                      value={spuDetail.name}
                      style={itemWidth}
                    />
                  ) : (
                    <Select
                      list={spuList}
                      onSelectChange={this.handleDefaultSelectChange}
                      name='name'
                      selectedId={spuDetail.id}
                    >
                      {!denyAll && (
                        <Option
                          name={i18next.t('新建SPU商品+')}
                          id='add'
                          onOptionClick={this.handleCustomOptionClick}
                        />
                      )}
                    </Select>
                  )}
                </div>
              </FormItem>
              <FormItem label={i18next.t('自定义编码')}>
                <div className='gm-margin-bottom-10'>
                  <Input
                    className='form-control'
                    placeholder={i18next.t('请填写自定义编码')}
                    style={itemWidth}
                    value={spuDetail.customize_code}
                    onChange={({ target }) =>
                      this.handleDetailChange('customize_code', target.value)
                    }
                  />
                </div>
              </FormItem>
              <FormItem label={i18next.t('商品别名')}>
                <input
                  type='text'
                  name='alias'
                  className='gm-margin-bottom-10'
                  placeholder={i18next.t('选填；可输入多个别名，以空格区分')}
                  disabled={denyAll}
                  value={denyAll ? '-' : aliasString}
                  onChange={this.handleInputChange}
                  style={itemWidth}
                />
              </FormItem>
              <FormItem label={i18next.t('商品类型')}>
                <div className='gm-margin-bottom-10'>
                  {allowAll ? (
                    <Select
                      short
                      list={[
                        {
                          name: i18next.t('通用'),
                          id: '0',
                        },
                        {
                          name: i18next.t('本站'),
                          id: '1',
                        },
                      ]}
                      onSelectChange={this.handleSelectChange}
                      name='p_type'
                      selectedId={spuDetail.p_type}
                    />
                  ) : (
                    <div className='gm-margin-top-5'>
                      {p_addSpu
                        ? i18next.t('通用')
                        : p_addSpuPrivate
                        ? i18next.t('本站')
                        : '-'}
                    </div>
                  )}
                </div>
              </FormItem>
              <FormItem label={i18next.t('基本单位')}>
                <div className='gm-margin-bottom-10' style={{ width: '130px' }}>
                  {denyAll ? (
                    '-'
                  ) : (
                    <MoreSelect
                      data={unitNameList}
                      selected={unitNameSelected}
                      onSelect={this.handleSelectUnitName.bind(
                        this,
                        'std_unit_name',
                      )}
                      renderListFilterType='pinyin'
                    />
                  )}
                </div>
              </FormItem>
              <FormItem label={i18next.t('投框方式')}>
                <div className='gm-margin-bottom-10'>
                  {denyAll ? (
                    '-'
                  ) : (
                    <Select
                      short
                      list={[
                        {
                          id: '1',
                          name: i18next.t('按订单投框'),
                        },
                        {
                          id: '2',
                          name: i18next.t('按司机投框'),
                        },
                      ]}
                      onSelectChange={this.handleSelectChange}
                      name='dispatch_method'
                      selectedId={spuDetail.dispatch_method}
                    />
                  )}
                </div>
              </FormItem>
              <FormItem label={i18next.t('商品图片')}>
                <div className='sku-detail-logo-wrap'>
                  {denyAll ? (
                    '-'
                  ) : (
                    <UploadDeleteImgs
                      imgArray={images}
                      handleUpload={this.handleUpload}
                      handleDeleteImg={this.handleDeleteImg}
                    />
                  )}
                </div>
              </FormItem>
              <FormItem label={i18next.t('描述')}>
                <div className='gm-margin-bottom-10'>
                  {denyAll ? (
                    '-'
                  ) : (
                    <textarea
                      name='desc'
                      rows='4'
                      className='form-control'
                      value={spuDetail.desc || undefined}
                      onChange={this.handleInputChange}
                      style={itemWidth}
                    />
                  )}
                </div>
              </FormItem>
              {p_editSpuDetectedReport && (
                <FormItem label={i18next.t('是否显示检测报告')}>
                  <Switch
                    type='primary'
                    checked={!!spuDetail.need_pesticide_detect}
                    on={i18next.t('显示')}
                    off={i18next.t('不显示')}
                    onChange={this.handleDetectedChange}
                  />
                </FormItem>
              )}
            </Form>
          </QuickPanel>
        </FormGroup>
      )
    }
  }
}

SPUCreate.propTypes = {
  merchandiseDetail: PropTypes.Object,
  merchandiseCommon: PropTypes.Object,
  onSuccess: PropTypes.func,
}

export default connect((state) => ({
  merchandiseDetail: state.merchandiseDetail,
  merchandiseCommon: state.merchandiseCommon,
}))(SPUCreate)
