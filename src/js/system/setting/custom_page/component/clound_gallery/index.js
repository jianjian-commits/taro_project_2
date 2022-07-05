import React from 'react'
import { Button, Flex, Dropper, Tip, LazyImg } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'

import defaultImg from '../../../../../../img/ad_default_3_1.png'
import { isCStationAndC, System } from '../../../../../common/service'

class CloundGallery extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      // 当前是否“我的图片”
      isMyPic: false,
      // 全部设计图库
      allPic: [],
      // 显示的图片
      listPic: [],
      currentSpecies: '',
      currentPic: [],
      // 用户的图库
      all_banner_urls: [],
      uploadDisable: false,
      limitPic: 100,
    }
    this.bPic = React.createRef()
  }

  componentDidMount() {
    this.getAllPic()
  }

  getAllPic = () => {
    Request('/station/category/image/list').data({ is_retail_interface: System.isC() ? 1 : null })
      .get()
      .then((json) => {
        const data = json.data

        data.sort((a, b) => {
          return a.sort_id - b.sort_id
        })

        data.unshift({
          category_name: i18next.t('全部分类'),
        })
        data.push({
          category_name: i18next.t('我的图片'),
        })

        this.setState({
          allPic: data,
        })
        this.selectSpecies(i18next.t('全部分类'))
      })

    this.getAllBannerUrls()
  }

  getAllBannerUrls = () => {
    let url = '/station/customized'
    if (isCStationAndC()) {
      url = '/station/cshop/customized_info/get'
    }
    Request(url)
      .get()
      .then((json) => {
        const data = json.data
        const all_banner_urls = []
        let uploadDisable = false
        for (let i = 0; i < data.all_banner_urls.length; i++) {
          all_banner_urls.push({
            image_url: data.all_banner_urls[i],
            img_path_id: data.all_banner_ids[i],
          })
        }
        if (all_banner_urls.length >= this.state.limitPic) {
          uploadDisable = true
        }

        this.setState({
          all_banner_urls,
          uploadDisable,
        })
      })
  }

  showSpecies = () => {
    const { allPic, currentSpecies } = this.state

    return _.map(allPic, (item, index) => {
      return (
        <div
          onClick={this.selectSpecies.bind(this, item.category_name)}
          className={`${
            currentSpecies === item.category_name + ''
              ? 'b-species-item-active'
              : 'b-species-item'
          }`}
          key={index}
        >
          {item.category_name}
        </div>
      )
    })
  }

  showPic = () => {
    const { listPic, isMyPic, isFull } = this.state

    if (!listPic.length && isMyPic) {
      return (
        <h4 className='b-tip-nopic'>
          {i18next.t('还未上传任何图片，快去上传图片吧~')}
        </h4>
      )
    }
    return _.map(listPic, (item, index) => {
      return (
        <div
          key={index}
          onClick={this.selectPic.bind(this, item.img_path_id, item.image_url)}
          className={`b-picture-item-wrap
            ${
              this.isSelectedPic(item.img_path_id)
                ? 'b-picture-item-active'
                : ''
            }
            ${this.isUsedPic(item.img_path_id) ? 'b-picture-item-added' : ''}
            ${
              isFull && !this.isSelectedPic(item.img_path_id)
                ? 'b-picture-item-not-allowed'
                : ''
            }`}
        >
          <LazyImg
            className='b-picture-item'
            src={item.image_url}
            targetId='b-picture-scroll'
            placeholder={defaultImg}
          />
          {this.isSelectedPic(item.img_path_id) ? (
            <i className='xfont xfont-ok icon-ok' />
          ) : (
            ''
          )}
          {isMyPic && !this.isSelectedPic(item.img_path_id) ? (
            <i
              onClick={this.deletePic.bind(this, item.img_path_id)}
              className='xfont xfont-delete icon-delete'
            />
          ) : (
            ''
          )}
        </div>
      )
    })
  }

  selectSpecies = (id, e) => {
    if (e) e.preventDefault()
    const { allPic, all_banner_urls } = this.state
    let listPic = []
    // 默认滚动到顶部
    this.bPic.current.scrollTo(0, 0)

    if (id === i18next.t('全部分类')) {
      // ‘-1’是因为不遍历“我的图片”
      for (let i = 0; i < allPic.length - 1; i++) {
        if (allPic[i].category_name !== i18next.t('全部分类')) {
          listPic.push(...allPic[i].img_path_infos)
        }
      }

      this.setState({
        currentSpecies: id,
        listPic,
        isMyPic: false,
      })
      return
    }

    if (id === i18next.t('我的图片')) {
      this.setState({
        currentSpecies: id,
        listPic: all_banner_urls,
        isMyPic: true,
      })
      return
    }

    listPic = allPic.filter((item) => item.category_name === id)[0]
      .img_path_infos

    this.setState({
      currentSpecies: id,
      listPic,
      isMyPic: false,
    })
  }

  isUsedPic = (id) => {
    const { banners_with_url } = this.props
    for (let i = 0; i < banners_with_url.length; i++) {
      if (banners_with_url[i].id === id) return true
    }

    return false
  }

  isSelectedPic = (id) => {
    return _.some(this.state.currentPic, ['img_path_id', id])
  }

  // 上传
  handleUpload = (file, event) => {
    event.preventDefault()

    const { all_banner_urls, listPic, limitPic } = this.state
    if (file[0].size > 3 * 1024 * 100) {
      Tip.warning(i18next.t('轮播图不能超过300kb'))
      return
    }

    Request('/station/image/upload')
      .data({
        image_file: file[0],
      })
      .post()
      .then((json) => {
        const data = json.data
        let uploadDisable = false

        if (all_banner_urls.length + 1 >= limitPic) uploadDisable = true

        this.setState(
          {
            all_banner_urls: [
              {
                img_path_id: data.img_path_id,
                image_url: data.image_url,
              },
              ...all_banner_urls,
            ],
            listPic: [
              {
                img_path_id: data.img_path_id,
                image_url: data.image_url,
              },
              ...listPic,
            ],
            uploadDisable,
          },
          () => {
            this.selectSpecies(i18next.t('我的图片'))
          }
        )
      })
  }

  // 删除
  deletePic = (id, e) => {
    e.preventDefault()
    e.stopPropagation()

    const { all_banner_urls, listPic, limitPic } = this.state
    let uploadDisable = false

    if (all_banner_urls.length - 1 >= limitPic) uploadDisable = true

    this.setState({
      all_banner_urls: _.filter(all_banner_urls, (item) => {
        return item.img_path_id !== id
      }),
      listPic: listPic.filter((item) => {
        return item.img_path_id !== id
      }),
      uploadDisable,
    })
  }

  // 关闭modal
  galleryCancel = () => {
    const { handleCloundGallery } = this.props
    handleCloundGallery(false)
  }

  // 确定
  galleryConfirm = () => {
    const { setBannerWithUrl } = this.props
    const { currentPic, all_banner_urls } = this.state

    // 保存选择的轮播图
    const banners_with_url = _.map(currentPic, (item) => {
      return {
        id: item.img_path_id,
        name: item.image_url,
        url: '',
      }
    })
    setBannerWithUrl(banners_with_url)

    // 保存用户图库的修改
    const all_banner_ids = _.map(all_banner_urls, (item) => {
      return item.img_path_id
    })
    let url = '/station/customized/update'
    if (isCStationAndC()) url = '/station/cshop/customized_info/update'
    Request(url)
      .data({ all_banner_ids: JSON.stringify(all_banner_ids) })
      .post()
    this.galleryCancel()
  }

  selectPic = (id, url) => {
    let isFull = false
    const { currentPic } = this.state
    const { banners_with_url } = this.props
    // 能够选中的图片数量
    const rest = 4 - banners_with_url.length
    if (this.isUsedPic(id)) return

    if (_.some(currentPic, ['img_path_id', id])) {
      this.setState({
        currentPic: _.filter(currentPic, (item) => {
          return item.img_path_id !== id
        }),
        isFull: false,
      })
      return
    }

    if (currentPic.length >= rest) return

    const pictures = _.concat(currentPic, {
      img_path_id: id,
      image_url: url,
    })

    if (pictures.length === rest) isFull = true

    this.setState({
      currentPic: pictures,
      isFull,
    })
  }

  render() {
    const { uploadDisable } = this.state

    return (
      <div className='b-clound-gallery'>
        <div className='b-clound-upload gm-margin-bottom-20'>
          <Dropper
            className='gm-dropper-wrap'
            accept='image/jpeg, image/png, image/gif'
            onDrop={this.handleUpload}
            disabled
          >
            <Button
              type='primary'
              disabled={uploadDisable}
              title={uploadDisable ? `${i18next.t('最多可上传100张图片')}` : ''}
              className='b-clound-upload-btn'
              style={{ padding: '5px 20px' }}
            >
              {i18next.t('本地上传')}
            </Button>
          </Dropper>
          <span style={{ fontSize: '12px', paddingLeft: '10px' }}>
            {i18next.t(
              ' 推荐尺寸：720*320，小于300kb，最多可上传100张本地图片，上传成功的图片在“我的图片”下进行管理。'
            )}
          </span>
        </div>
        <Flex className='b-clound-content'>
          <div className='b-species'>{this.showSpecies()}</div>
          <div ref={this.bPic} className='b-picture' id='b-picture-scroll'>
            {this.showPic()}
          </div>
        </Flex>
        <div className='b-clound-btn gm-margin-top-20'>
          <Button onClick={this.galleryCancel} className='gm-margin-right-20'>
            {i18next.t('取消')}
          </Button>
          <Button type='primary' onClick={this.galleryConfirm}>
            {i18next.t('确定')}
          </Button>
        </div>
      </div>
    )
  }
}

CloundGallery.propType = {
  // 图库显示或隐藏
  handleCloundGallery: PropTypes.func,
  // 设置父组件轮播图选择
  setBannerWithUrl: PropTypes.func,
  // 传入已选择的轮播图
  banners_with_url: PropTypes.array,
}

export default CloundGallery
