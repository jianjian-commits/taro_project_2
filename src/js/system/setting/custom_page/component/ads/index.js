import classNames from 'classnames'
import _ from 'lodash'
import React from 'react'
import { toJS } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { Flex, Dropper, Tip, FormItem } from '@gmfe/react'
import store from '../../store/diy_store'
import AdsLayer from './ads_layer'
import SelectBox from '../select_module/select_box'
import { adLayoutType } from '../enum'

const adsLayerArr = ['one', 'two', 'three']
const adsType = [i18next.t('1行1个'), i18next.t('1行2个'), i18next.t('1左2右')]
const adsSize1 = [i18next.t('推荐尺寸：702x162')]
const adsSize2 = [
  i18next.t('推荐尺寸：346x200'),
  i18next.t('推荐尺寸：346x200'),
]
const adsSize3 = [
  i18next.t('推荐尺寸：346x333'),
  i18next.t('推荐尺寸：346x162'),
  i18next.t('推荐尺寸：346x162'),
]
class DiyAds extends React.Component {
  handleClick(type) {
    const { sortIndex } = this.props
    // 清除错误信息
    if (store.modules[sortIndex].type !== type) {
      store.setModulesError(sortIndex, { msg: '' })
    }
    store.setModules(sortIndex, 'type', type)
    return store.sortSkip + sortIndex
  }

  handleUpload(i, file, event) {
    event.preventDefault()
    const { sortIndex } = this.props
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
        const imgs = toJS(store.modules[sortIndex].ad_imgs_with_url)
        imgs[i].img_url = json.data.image_url
        imgs[i].img_id = json.data.img_path_id
        store.setModules(sortIndex, 'ad_imgs_with_url', imgs)
      })
  }

  getSize = (index, type) => {
    if (type === adLayoutType.one) {
      return adsSize1[index]
    } else if (type === adLayoutType.two) {
      return adsSize2[index]
    } else if (type === adLayoutType.three) {
      return adsSize3[index]
    }
  }

  renderAddImg = (i, type) => {
    const { disabled } = this.props
    return (
      <Dropper
        className='gm-dropper-wrap'
        accept='image/jpeg, image/png, image/gif'
        onDrop={this.handleUpload.bind(this, i)}
      >
        <div
          className={classNames('b-upload-pic', {
            'b-upload-pic-disable': disabled,
          })}
          style={{ width: '100%', height: '100%', flexDirection: 'column' }}
        >
          <div
            className='gm-margin-bottom-15'
            style={{ fontSize: '1.5em', textAlign: 'center' }}
          >
            <span style={{ position: 'relative', left: '0', bottom: '2px' }}>
              {'+'}
            </span>
            {i18next.t(' 添加图片')}
          </div>
          <div>{this.getSize(i, type)}</div>
        </div>
      </Dropper>
    )
  }

  handleChangeUrl(i, e) {
    const { sortIndex } = this.props
    const imgs = toJS(store.modules[sortIndex].ad_imgs_with_url)
    imgs[i].url = e.target.value
    store.setModules(sortIndex, 'ad_imgs_with_url', imgs)
  }

  handleImgsRemove(i, e) {
    e.preventDefault()
    e.stopPropagation()
    const { sortIndex } = this.props
    const imgs = toJS(store.modules[sortIndex].ad_imgs_with_url)
    imgs[i].img_url = ''
    imgs[i].img_id = ''
    store.setModules(sortIndex, 'ad_imgs_with_url', imgs)
  }

  render() {
    const { sortIndex, disabled } = this.props
    const { type, ad_imgs_with_url, error } = store.modules[sortIndex]
    return (
      <>
        <div className='gm-text-desc gm-margin-bottom-20 gm-padding-top-5'>
          1.{' '}
          {i18next.t(
            '商城首页仅展示已添加的广告位，未添加图片的广告位不展示在商城首页'
          )}
          <div>
            2.{' '}
            {i18next.t(
              '上传图片大小请不要超过300kb，请保证每张图的尺寸一致，支持jpg/png/gif格式'
            )}
          </div>
          <p>
            3.{' '}
            {i18next.t(
              '根据运营需求，可设置跳转链接，设置后点击轮播图可跳转至该链接。如不需跳转则不用填写'
            )}
          </p>
        </div>
        <Flex row style={{ marginTop: 10 }}>
          <Flex none className='b-diy-setting-title'>
            {i18next.t('选择模板')}：
          </Flex>
          <Flex style={{ width: '100%', marginTop: 20 }}>
            {_.map(adsLayerArr, (v, i) => {
              return (
                <SelectBox
                  disabled={disabled}
                  column
                  key={i}
                  selected={type === adLayoutType[v]}
                  onClick={this.handleClick.bind(this, adLayoutType[v])}
                  style={{ width: 118, height: 106, marginRight: 32 }}
                >
                  <Flex style={{ width: 108, height: i !== 2 ? 28 : 56 }}>
                    <AdsLayer type={adLayoutType[v]} />
                  </Flex>
                  <Flex className='b-select-box-desc'>{adsType[i]}</Flex>
                </SelectBox>
              )
            })}
          </Flex>
        </Flex>
        <Flex
          style={{
            marginTop: 10,
            height: 'auto',
          }}
        >
          <Flex none className='b-diy-setting-title'>
            {i18next.t('添加图片')}：
          </Flex>
          <div style={{ marginTop: 20 }}>
            <AdsLayer
              type={type}
              renderItem={(i) => {
                const img = ad_imgs_with_url[i]
                return img && img.img_url ? (
                  <div className='b-diy-ad-set-img-wrap'>
                    <button
                      disabled={disabled}
                      type='button'
                      className='b-diy-btn-remove'
                      onClick={this.handleImgsRemove.bind(this, i)}
                    >
                      <i className='xfont xfont-remove' />
                    </button>
                    <div className='b-diy-ad-set-img-wrap-2'>
                      <img src={img.img_url} />
                    </div>
                    <p style={{ marginTop: 10 }}>{i18next.t('设置链接')}</p>
                    <input
                      disabled={disabled}
                      type='text'
                      name='url'
                      className='form-control'
                      placeholder={i18next.t('设置跳转链接')}
                      value={img.url}
                      onChange={this.handleChangeUrl.bind(this, i)}
                      style={{ marginBottom: 18 }}
                    />
                  </div>
                ) : (
                  this.renderAddImg(i, type)
                )
              }}
            />
          </div>
        </Flex>
        {error && error.msg && (
          <div style={{ color: 'red', marginLeft: 74 }}>{error.msg}</div>
        )}
      </>
    )
  }
}

export default DiyAds
