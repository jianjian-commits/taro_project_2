import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _ from 'lodash'
import { changeDomainName } from '../../../common/service'
import globalStore from '../../../stores/global'
import Copy from '../../../common/components/copy'
import { Select } from './default_select'
import CategoryPinLeiSelect from './category_pinlei_select'
import UploadDeleteImgs from './upload_delete_imgs'
import {
  Flex,
  Popover,
  Switch,
  Tip,
  Form,
  FormItem,
  FormGroup,
  Uploader,
  Dialog,
  Button,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import actions from '../../../actions'
import '../actions'
import '../reducer'

const createProductDetailUrl = (id, key) =>
  key
    ? `${changeDomainName(
        'station',
        'bshop'
      )}?cms_key=${key}#/product/detail/${id}`
    : `${changeDomainName('station', 'bshop')}#/product/detail/${id}`

class SPUInfo extends Component {
  constructor(props) {
    super(props)
    this.form = React.createRef()
  }

  componentDidMount() {
    const {
      detail: { customize_code },
    } = this.props
    actions.merchandise_list_spu_detail_change(
      'new_customize_code',
      customize_code
    )
  }

  handleConfirm = (isAsync) => {
    const name = this.props.detail.name
    if (name.trim() === '') {
      Tip.info(i18next.t('请填写完整!'))
      return false
    }

    return this.props.onConfirm(isAsync).then((res) => {
      return !!res
    })
  }

  handleCancel = () => {
    if (this.props.onCancel && this.props.onCancel()) {
      // 所属分类
    }
  }

  handleDelete(spu_id) {
    this.props.onDelete && this.props.onDelete(spu_id)
  }

  handleDetectedChange = () => {
    const { detail } = this.props
    const currentDetected = !detail.need_pesticide_detect
    this.props.handleDetailChange('need_pesticide_detect', ~~currentDetected)
  }

  handleInputChange = (e) => {
    const name = e.target.name
    let value = e.target.value
    if (name === 'alias') {
      value = value.split(/\s+/g)
    }
    this.props.handleDetailChange(name, value)
  }

  handleSelectChange = (id, name) => {
    this.props.handleDetailChange(name, id)
  }

  handlePinleiSelect = (selected) => {
    selected.one &&
      this.props.handleDetailChange('category_id_1', selected.one.id)
    selected.two &&
      this.props.handleDetailChange('category_id_2', selected.two.id)
    selected.pinLei &&
      this.props.handleDetailChange('pinlei_id', selected.pinLei.id)
  }

  handleUpload = (type, index, file, event) => {
    event.preventDefault()
    const { images } = this.props
    file.forEach((item) => {
      if (type === 'detail' && item.size > 1024 * 1024) {
        Tip.warning(i18next.t('图片不能超过1M'))
        return
      }
      if (type === 'logo' && item.size > 1024 * 100) {
        Tip.warning(i18next.t('图片不能超过100kb'))
        return
      }
      if (images[index]) {
        this.props.onUpload(item, type, index)
      } else {
        this.props.onUpload(item, type)
      }
    })
  }

  handleDeleteImg = (index, event) => {
    // 阻止事件冒泡，删除图片但不触发上传图片事件
    event.stopPropagation()
    actions.merchandise_spu_delete_image(index)
  }

  handleSyncConfirm() {
    Dialog.confirm({
      title: i18next.t('同步商品图片'),
      children: (
        <div>
          {i18next.t(
            '同步后，商品图片将覆盖此商品所有销售规格图片，是否确认？'
          )}
        </div>
      ),
      onOK: async () => {
        const { skuList = [], query } = this.props

        const spuId = query.spu_id
        const salemenuId = query.salemenuId

        if (skuList.length !== 0) {
          // 先保存spu图片
          const isSuccess = await this.handleConfirm(true)
          // 同步spu图片至sku中
          if (isSuccess) {
            await actions.merchandise_spu_sync_img_to_sku(spuId, salemenuId)
            Tip.success(i18next.t('同步成功！'))
          }
        } else {
          Tip.success(i18next.t('同步失败，无销售规格！'))
        }
      },
    })
  }

  render() {
    const { detail, categories, skuList, isShowAsyncButton } = this.props
    const { images } = this.props
    const {
      p_type,
      category_id_1,
      category_id_2,
      pinlei_id,
      cms_key,
      alias,
      detail_images,
      new_customize_code,
      name,
      std_unit_name,
      dispatch_method,
      desc,
      need_pesticide_detect,
    } = detail
    // 通用:0  本站:1

    const type = +p_type
    // 通用spu权限
    const p_deletePublicSpu = globalStore.hasPermission('delete_public_spu')
    const p_editSpu = globalStore.hasPermission('edit_spu')
    // 本站spu权限
    const p_deletePrivateSpu = globalStore.hasPermission('delete_private_spu')
    const p_editSpuPrivate = globalStore.hasPermission('edit_spu_private')

    // 是否可编辑检测报告权限
    const p_editSpuDetectedReport = globalStore.hasPermission(
      'edit_pesticidedetect'
    )

    // 所属分类
    const category_1 = _.find(categories, (v) => v.id === category_id_1) || null
    const category_2 =
      category_1 && category_1.id
        ? _.find(category_1.children, (v) => v.id === category_id_2)
        : null
    const pinLei =
      category_2 && category_2.id
        ? _.find(category_2.children, (v) => v.id === pinlei_id)
        : null

    const aliasString = alias && alias.join(' ')

    const show_editSpu =
      (type === 0 && p_editSpu) || (type === 1 && p_editSpuPrivate)
    const show_deleteSpu =
      (type === 0 && p_deletePublicSpu) || (type === 1 && p_deletePrivateSpu)

    const spuImg = this.props.spuImg || {}
    const detailImg = spuImg.detail || {}

    const detailImgUrl =
      detailImg.image_url || (detail_images && detail_images[0])

    const productDetailUrl = createProductDetailUrl(detail.id, cms_key)
    const itemWidth = { width: '410px' }

    return (
      <FormGroup
        formRefs={[this.form]}
        onCancel={this.handleCancel}
        onSubmit={this.handleConfirm}
        disabled={!show_editSpu}
      >
        <QuickPanel
          icon='todo'
          iconColor='#4fb7de'
          title={i18next.t('基础信息')}
          right={
            show_deleteSpu ? (
              <Button
                type='primary'
                plain
                onClick={this.handleDelete.bind(this, detail.id)}
              >
                <i className='xfont xfont-delete' />
              </Button>
            ) : (
              ''
            )
          }
        >
          <Form
            horizontal
            labelWidth='110px'
            className='spu-info'
            ref={this.form}
            hasButtonInGroup
          >
            <FormItem label={i18next.t('商品名称')}>
              <input
                name='name'
                type='text'
                className='item-content gm-margin-bottom-10'
                style={itemWidth}
                onChange={this.handleInputChange}
                value={name || ''}
              />
            </FormItem>
            <FormItem label={i18next.t('自定义编码')}>
              <input
                name='new_customize_code'
                className='item-content gm-margin-bottom-10'
                placeholder={i18next.t('请填写自定义编码')}
                style={itemWidth}
                value={new_customize_code || ''}
                onChange={this.handleInputChange}
              />
            </FormItem>
            <FormItem label={i18next.t('商品别名')}>
              <input
                name='alias'
                type='text'
                className='item-content gm-margin-bottom-10'
                placeholder={i18next.t('选填；可输入多个别名，以空格区分')}
                style={itemWidth}
                onChange={this.handleInputChange}
                value={aliasString || ''}
              />
            </FormItem>
            <FormItem label={i18next.t('所属分类')}>
              <div className='gm-margin-bottom-10'>
                <CategoryPinLeiSelect
                  selected={{ one: category_1, two: category_2, pinLei }}
                  categories={categories}
                  onSelect={this.handlePinleiSelect}
                />
              </div>
            </FormItem>
            <FormItem label={i18next.t('商品类型')}>
              {/* 0 通用 1 本站 */}
              <div className='gm-margin-top-5 gm-margin-bottom-10'>
                {p_type === 0 ? i18next.t('通用') : i18next.t('本站')}
              </div>
            </FormItem>
            <FormItem label={i18next.t('基本单位')}>
              <div className='gm-margin-top-5 gm-margin-bottom-10'>
                {std_unit_name}
              </div>
            </FormItem>
            <FormItem label={i18next.t('投框方式')}>
              <div className='gm-margin-bottom-10'>
                <Select
                  short
                  list={[
                    {
                      name: i18next.t('按订单投框'),
                      id: 1,
                    },
                    {
                      name: i18next.t('按司机投框'),
                      id: 2,
                    },
                  ]}
                  onSelectChange={this.handleSelectChange}
                  name='dispatch_method'
                  selectedId={+dispatch_method}
                />
              </div>
            </FormItem>
            <FormItem label={i18next.t('商品图片')}>
              <div className='sku-detail-logo-wrap gm-margin-bottom-10'>
                <UploadDeleteImgs
                  imgArray={images}
                  handleUpload={this.handleUpload}
                  handleDeleteImg={this.handleDeleteImg}
                />
              </div>
              {isShowAsyncButton ? (
                <div className='sku-detail-sync-spu'>
                  <span
                    className='sku-detail-sync-spu-to-sku-link'
                    onClick={this.handleSyncConfirm.bind(this)}
                  >
                    {i18next.t('点击同步')}
                  </span>
                  <span>
                    {i18next.t('（可将所有商品图片同步至销售规格图片）')}
                  </span>
                </div>
              ) : null}
            </FormItem>
            <FormItem label={i18next.t('描述')}>
              <textarea
                name='desc'
                rows='4'
                className='gm-margin-bottom-10 form-control'
                value={desc || undefined}
                onChange={this.handleInputChange}
                style={itemWidth}
              />
            </FormItem>
            <FormItem label={i18next.t('商品详情')}>
              <div className='sku-detail-logo-wrap'>
                <Uploader
                  onUpload={this.handleUpload.bind(this, 'detail', 0)}
                  accept='image/jpg, image/png'
                >
                  <div className='sku-detail-uploader'>
                    {detailImgUrl ? (
                      <div className='sku-detail-logo'>
                        <img
                          src={detailImgUrl}
                          className='sku-detail-logo-img'
                        />
                      </div>
                    ) : (
                      <div className='sku-detail-logo'>
                        <span className='sku-detail-logo-img sku-detail-default-plus'>
                          +
                        </span>
                      </div>
                    )}
                  </div>
                </Uploader>
              </div>
              <div className='desc-wrap gm-text-desc gm-text-12 gm-margin-bottom-10'>
                {i18next.t(
                  '图片大小请不要超过1Mb，推荐尺寸宽度为720，支持jpg/png格式'
                )}
              </div>
            </FormItem>
            <FormItem label={i18next.t('固定URL')}>
              {/* 新建spu之后 还未创建sku之前，不显示 */}
              {skuList && skuList.length ? (
                <Flex column className='gm-margin-top-5 gm-margin-bottom-10'>
                  <Copy text={productDetailUrl}>
                    <div>
                      <span className='gm-cursor'>{productDetailUrl}</span>
                      <Popover
                        type='hover'
                        popup={
                          <span className='gm-inline-block gm-padding-5'>
                            {i18next.t('复制')}
                          </span>
                        }
                        showArrow
                        top
                      >
                        <i className='gm-margin-left-15 gm-cursor ifont ifont-clipboard' />
                      </Popover>
                    </div>
                  </Copy>
                  <div className='gm-text-desc gm-text-12'>
                    {i18next.t(
                      '固定URL可用于外部推广，通过链接跳转至相应商品详情'
                    )}
                  </div>
                </Flex>
              ) : (
                <div className='gm-margin-top-5 gm-margin-bottom-10'>-</div>
              )}
            </FormItem>
            {p_editSpuDetectedReport && (
              <FormItem label={i18next.t('是否显示检测报告')}>
                <Switch
                  type='primary'
                  checked={!!need_pesticide_detect}
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
SPUInfo.propTypes = {
  detail: PropTypes.object,
  spuImg: PropTypes.object,
  skuList: PropTypes.array,
  images: PropTypes.array,
  query: PropTypes.object,
  categories: PropTypes.array,
  isShowAsyncButton: PropTypes.bool,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onConfirm: PropTypes.func,
  handleDetailChange: PropTypes.func,
  onUpload: PropTypes.func,
}
export default SPUInfo
