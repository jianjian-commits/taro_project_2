import classNames from 'classnames'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import React from 'react'
import { Dropper, Dialog, Tip, Modal } from '@gmfe/react'
import { toJS } from 'mobx'

import { isCStationAndC } from 'common/service'
import store from '../store/diy_store'
import { observer } from 'mobx-react'
import SortList from '../../../../common/components/sort_list'
import CloundGallery from './clound_gallery'
import globalStore from '../../../../stores/global'

import banner from '../../../../../img/banner.jpg'

@observer
class DiyBanner extends React.Component {
  constructor() {
    super()
    this.state = {
      showCloundGallery: false,
    }
  }

  handleBannerClose(index) {
    Dialog.confirm({
      children: i18next.t('确认删除？'),
    }).then(() => {
      store.banners.splice(index, 1)
      store.setBanners(store.banners)
    })
  }

  handleBannerUrl(i, e) {
    const banners = toJS(store.banners)
    banners[i].url = e.target.value
    store.setBanners(banners)
  }

  handleCloundGallery = (show) => {
    if (show) {
      document.getElementsByTagName('body')[0].style.overflow = 'hidden'
    } else {
      document.getElementsByTagName('body')[0].style.overflow = 'scroll'
    }

    this.setState({
      showCloundGallery: show,
    })
  }

  handleUpload = (file, event) => {
    event.preventDefault()
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
        const banners = toJS(store.banners)
        banners.push({
          id: json.data.img_path_id,
          name: json.data.image_url,
        })
        store.setBanners(banners)
      })
  }

  setBannerWithUrl(arr) {
    const banners = toJS(store.banners)
    store.setBanners([...banners, ...arr])
  }

  renderAddImg() {
    return (
      <div>
        <div
          className='gm-text'
          style={{
            fontSize: 16,
            textAlign: 'center',
            margin: '34px 0 16px 0',
          }}
        >
          <span style={{ position: 'relative', left: '0', bottom: '2px' }}>
            +
          </span>
          {i18next.t(' 添加一个背景图')}
        </div>
        <div style={{ fontSize: 12 }}>{i18next.t('建议尺寸：720x320像素')}</div>
      </div>
    )
  }

  render() {
    const { showCloundGallery } = this.state
    const banners = store.banners
    const key = store.data.key ? store.data.key : 'gm'
    const cshop_key = store.data.cshop_cms_key ? store.data.cshop_cms_key : 'gm'
    const cms_key = isCStationAndC() ? cshop_key : key

    const isGm =
      !globalStore.hasPermission('edit_shop_setting') || cms_key === 'gm'

    return (
      <div>
        <div className='gm-text-desc gm-padding-top-5'>
          <p>
            1.{' '}
            {i18next.t(
              '最多可上传4张图片，图片大小请不要超过300kb，推荐尺寸720x320，请保证每张图的尺寸一致，支持jpg/png/gif格式'
            )}
          </p>
          <p>
            2.{' '}
            {i18next.t(
              '根据运营需求，可设置跳转链接，设置后点击轮播图可跳转至该链接。如不需跳转则不用填写'
            )}
          </p>
        </div>
        <h5>添加图片：</h5>
        <SortList
          list={banners}
          renderItem={(v, i) => (
            <div className='b-cp-banner' style={{ background: '#fff' }}>
              {!isGm && banners.length > 1 ? (
                <button
                  type='button'
                  className='b-diy-btn-remove'
                  onClick={this.handleBannerClose.bind(this, i)}
                >
                  <i className='xfont xfont-remove' />
                </button>
              ) : (
                ''
              )}
              <img className='b-cp-banner-img' src={v.name || banner} />
              <div className='b-cp-banner-link' style={{ marginLeft: 8 }}>
                <p>{i18next.t('设置链接')}</p>
                <div>
                  <input
                    disabled={isGm}
                    type='text'
                    name='url'
                    className='form-control'
                    placeholder={i18next.t('设置跳转链接')}
                    value={banners[i].url}
                    onChange={this.handleBannerUrl.bind(this, i)}
                  />
                </div>
              </div>
            </div>
          )}
        />
        <div
          style={{
            display: `${banners.length >= 4 ? 'none' : 'block'}`,
            height: 104,
          }}
        >
          {globalStore.hasPermission('edit_cloud_bannaner') &&
          cms_key !== 'gm' ? (
            <div
              className={classNames('b-upload-pic', {
                'b-upload-pic-disable': isGm,
              })}
              onClick={(e) => {
                isGm && e.stopPropagation()
                this.handleCloundGallery(true)
              }}
              style={{ width: '100%', alignItems: 'unset' }}
            >
              {this.renderAddImg()}
            </div>
          ) : (
            <Dropper
              className='gm-dropper-wrap'
              accept='image/jpeg, image/png, image/gif'
              onDrop={this.handleUpload}
            >
              {/* 如果isGm是true这个组件不可点击 */}
              <div
                onClick={(e) => {
                  e.preventDefault()
                  isGm && e.stopPropagation()
                }}
                className={classNames('b-upload-pic', {
                  'b-upload-pic-disable': isGm,
                })}
                style={{ width: '100%' }}
              >
                {this.renderAddImg()}
              </div>
            </Dropper>
          )}
          <div className='gm-gap-10' />
        </div>
        <Modal
          disableMaskClose
          onHide={this.handleCloundGallery.bind(this, false)}
          show={showCloundGallery}
          title={i18next.t('添加图片')}
          style={{ width: '920px' }}
        >
          <CloundGallery
            handleCloundGallery={this.handleCloundGallery}
            setBannerWithUrl={this.setBannerWithUrl}
            banners_with_url={banners}
          />
        </Modal>
      </div>
    )
  }
}

export default DiyBanner
