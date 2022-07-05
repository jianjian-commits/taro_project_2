import { i18next } from 'gm-i18n'
import React from 'react'
import SPUInfo from './component/spu_info_head'
import { Tip, Dialog } from '@gmfe/react'
import actions from '../../actions'
import PropTypes from 'prop-types'

import '../actions'
import '../reducer'
import '../list/actions'
import '../list/reducer'

class SPUWrap extends React.Component {
  async componentDidMount() {
    actions.merchandise_common_get_all()
    await actions.merchandise_list_spu_detail({
      spu_id: this.props.location.query.spu_id,
    })
    actions.merchandise_list_spu_detail_change(
      'new_customize_code',
      this.props.merchandiseDetail.spuDetail.customize_code
    )
  }

  handleConfirm = (isAsync) => {
    const { spuDetail, spuImg } = this.props.merchandiseDetail
    const detailImg = spuImg.detail || {}

    let alias = []
    const spuImgList = spuDetail.imgUrlList || []

    if (spuDetail.alias && spuDetail.alias.length >= 1) {
      alias = JSON.stringify(spuDetail.alias)
    } else {
      delete spuDetail.alias
    }

    // 传给后端的,图片文件名数组
    const imagesPathId = JSON.stringify(
      spuImgList.map((img) => {
        const arr = img.split('/')
        return arr[arr.length - 1]
      })
    )

    // 获取商品详情图片的默认值
    const defaultDetailImage =
      (spuDetail.detail_images && spuDetail.detail_images[0]) || ''

    const arr = defaultDetailImage.split('/')
    const defaultImageId = arr[arr.length - 1]

    let detail_images = detailImg.img_path_id || defaultImageId
    detail_images = detail_images ? JSON.stringify([detail_images]) : ''

    spuDetail.need_pesticide_detect = ~~spuDetail.need_pesticide_detect || 0

    // 不把imgUrlList传给后台
    const {
      imgUrlList,
      new_customize_code,
      customize_code,
      ...rest
    } = spuDetail

    const option = {
      ...rest,
      id: this.props.location.query.spu_id,
      alias,
      detail_images,
      images: imagesPathId,
    }

    if (new_customize_code.length > 50) {
      Tip.warning(i18next.t('自定义编码的最长长度为50'))
      return
    }

    if (new_customize_code !== customize_code) {
      option.customize_code = new_customize_code
    }

    return actions
      .merchandise_list_spu_update(option)
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

  handleCancel = () => {
    return actions.merchandise_list_spu_detail({
      spu_id: this.props.location.query.spu_id,
    })
  }

  handleDelete = () => {
    Dialog.dialog({
      title: i18next.t('删除商品'),
      children: (
        <div>
          {i18next.t(
            '删除该商品，该商品下的所有销售规格和采购规格将同时被删除!'
          )}
        </div>
      ),
      onOK: () => {
        actions
          .merchandise_spu_delete({ id: this.props.location.query.spu_id })
          .then(() => {
            Tip.success(i18next.t('删除成功'))
            window.closeWindow()
          })
      },
    })
  }

  handleDetailChange = (name, value) => {
    actions.merchandise_list_spu_detail_change(name, value)
  }

  handleSpuUpload = (file, type, index) => {
    actions.merchandise_spu_img_upload(file, type, index)
  }

  render() {
    const {
      spuDetail,
      spuImg,
      skuList,
      skuDetail,
    } = this.props.merchandiseDetail
    const { categories } = this.props.merchandiseCommon
    const { query } = this.props.location

    const isShowAsyncButton = true // 详情页显示同步图片按钮

    return (
      <div>
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
          images={spuDetail.imgUrlList}
          query={query}
          isShowAsyncButton={isShowAsyncButton}
          skuDetail={skuDetail}
        />
      </div>
    )
  }
}

SPUWrap.propTypes = {
  merchandiseDetail: PropTypes.object.isRequired,
  merchandiseCommon: PropTypes.object.isRequired,
}

export default SPUWrap
