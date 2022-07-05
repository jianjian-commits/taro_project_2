import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Tip, RightSideModal, Popover, Button } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import { UploadImgs, DelUploader } from './uploader_imgs'
import recognizeStore from './store'
import RecognitionTable from './recognition_table'
import globalStore from '../../stores/global'

@observer
class ImgEdit extends React.Component {
  refHeader = React.createRef()

  renderTip = () => {
    return (
      <>
        <i className='ifont xfont-warning-circle' />
        <div className='gm-inline-block'>
          <p className='gm-margin-0'>
            {i18next.t(
              '根据智能菜单模板上传图片内容，系统将根据智能菜单图片上的商品信息进行匹配'
            )}
          </p>
          <p className='gm-margin-0'>
            {i18next.t(
              '可同时上传多张，最多3张图片，支持jpg、png格式图片，大小请保持在1.5Mb以内'
            )}
          </p>
        </div>
      </>
    )
  }

  handleUpload = (index, file, event) => {
    const { imgRecognition } = recognizeStore
    const { isEdit } = imgRecognition
    if (!isEdit) {
      return
    }
    // 判断图片大小
    event.preventDefault()
    let files = recognizeStore.imgList.slice()

    _.each(file, (item) => {
      if (item.size > 1024 * 1024 * 1.5) {
        Tip.warning(i18next.t('图片不能超过1.5mb'))
      } else {
        if (index !== undefined) {
          files.splice(index, 1, item)
        } else {
          files.push(item)
        }
      }
    })

    if (files.length > 3) {
      files = files.slice(0, 3)
      Tip.warning(i18next.t('最多只能上传3张图片'))
    }

    recognizeStore.setImgList(files)
  }

  handleDeleteImg = (index, event) => {
    event.stopPropagation()
    const files = recognizeStore.imgList.slice()
    files.splice(index, 1)
    recognizeStore.setImgList(files)
  }

  handlePictureRecognition = () => {
    const { serviceTime, customer, searchCombineGoods } = this.props
    const files = recognizeStore.imgList
    recognizeStore.skuImgRecognition(
      serviceTime._id,
      customer.address_id,
      files,
      searchCombineGoods
    )
  }

  handleCharge = () => {
    RightSideModal.hide()
  }

  handleToEdit = () => {
    recognizeStore.toEdit('img')
  }

  renderEditImg = () => {
    const { imgList } = recognizeStore

    return _.map(imgList, (image, index) => {
      return (
        <div key={image.name} className='sku-detail-img-box'>
          <UploadImgs
            uploadType='del'
            image={image.preview}
            handleUpload={this.handleUpload.bind(this, index)}
            handleDeleteImg={this.handleDeleteImg.bind(this, index)}
          />
        </div>
      )
    })
  }

  renderRecognizeImg = () => {
    const { imgList } = recognizeStore

    return _.map(imgList, (image, index) => {
      return (
        <Popover
          type='hover'
          center
          key={image.name}
          popup={<img src={image.preview} style={{ height: '420px' }} />}
        >
          <div className='sku-detail-img-box'>
            <DelUploader image={image.preview} />
          </div>
        </Popover>
      )
    })
  }

  getImgHeaderHeight = () => {
    if (this.refHeader && this.refHeader.current) {
      const height = this.refHeader.current.getBoundingClientRect()
      return height.height
    }
    return 0
  }

  render() {
    const { imgList, imgRecognition } = recognizeStore
    const { isEdit } = imgRecognition

    const canViewMenu = globalStore.hasPermission('get_smart_menu')

    return (
      <>
        <div ref={this.refHeader}>
          <Flex className='gm-padding-lr-20'>
            <Flex flex className='b-warning-tips gm-padding-top-10'>
              {this.renderTip()}
            </Flex>
            <Flex alignCenter>
              {isEdit && (
                <Button
                  type='primary'
                  onClick={this.handlePictureRecognition}
                  disabled={!imgList.length}
                >
                  {i18next.t('识别')}
                </Button>
              )}
              {!isEdit && (
                <a onClick={this.handleToEdit}>{i18next.t('重新编辑')}</a>
              )}
            </Flex>
          </Flex>
          <Flex className='gm-padding-20'>
            {!isEdit
              ? this.renderRecognizeImg()
              : imgList.length !== 0 && this.renderEditImg()}
            {imgList.length < 3 && isEdit && (
              <UploadImgs
                uploadType='add'
                handleUpload={this.handleUpload.bind(this, undefined)}
              />
            )}
          </Flex>
          {isEdit && (
            <Flex className='gm-padding-left-20'>
              <span>{i18next.t('智能菜单图片需满足特定模板格式。')}&nbsp;</span>
              {canViewMenu && (
                <a
                  href='#/merchandise/manage/list/smart_menu'
                  onClick={this.handleCharge}
                >
                  {i18next.t('点击管理')}
                </a>
              )}
            </Flex>
          )}
        </div>
        {!isEdit && (
          <RecognitionTable
            type='img'
            onAdd={this.props.onAdd}
            getHeaderHeight={this.getImgHeaderHeight}
          />
        )}
      </>
    )
  }
}

ImgEdit.propTypes = {
  serviceTime: PropTypes.object,
  customer: PropTypes.object,
  tabKey: PropTypes.number,
  searchCombineGoods: PropTypes.bool,
  onAdd: PropTypes.func,
}

export default ImgEdit
