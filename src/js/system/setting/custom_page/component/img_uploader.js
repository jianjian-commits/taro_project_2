import React from 'react'
import { i18next } from 'gm-i18n'
import { Uploader, Tip } from '@gmfe/react'
import PropTypes from 'prop-types'
import { SvgMinusCircle } from 'gm-svg'
import { Request } from '@gm-common/request'

const UploaderWithMinus = (props) => {
  // eslint-disable-next-line
  const { image, onUpload, onDelete } = props
  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete()
  }
  return (
    <div className='sku-detail-uploader gm-margin-right-10'>
      <Uploader
        onUpload={onUpload}
        accept='image/jpg, image/jpeg, image/png, image/svg'
      >
        <div>
          <div className='sku-detail-wrap'>
            <div className='sku-detail-logo'>
              <img src={image} className='sku-detail-logo-img' />
            </div>
          </div>
          <div className='sku-detail-shade'>
            <a className='sku-detail-minus' onClick={handleDelete}>
              <SvgMinusCircle style={{ color: 'red', fontSize: '1.2em' }} />
            </a>
          </div>
        </div>
      </Uploader>
    </div>
  )
}

const Plus = (props) => {
  // eslint-disable-next-line
  const { onUpload } = props
  return (
    <div className='sku-detail-uploader gm-margin-right-10'>
      <Uploader
        onUpload={onUpload}
        accept='image/jpg, image/jpeg, image/png, image/svg'
      >
        <div className='sku-detail-wrap'>
          <div className='sku-detail-logo'>
            <span className='sku-detail-logo-img sku-detail-default-plus'>
              +
            </span>
          </div>
        </div>
      </Uploader>
    </div>
  )
}

const ImgUploader = (props) => {
  const { imgArray, onImageChange, maxLength, imgSize } = props

  const handleUpload = (index, file) => {
    if (file[0].size > 1024 * 1024) {
      Tip.warning(i18next.t('图片大小不能超过1MB'))
      return
    }

    Request('/station/image/upload')
      .data({
        image_file: file[0],
      })
      .post()
      .then((json) => {
        const { image_url, img_path_id } = json.data
        onImageChange(index, image_url, img_path_id)
      })
  }
  const handleDelete = (index) => {
    onImageChange(index)
  }

  return (
    <div>
      {imgArray.map((image, index) => {
        return (
          <div key={index} className='sku-detail-img-box'>
            <UploaderWithMinus
              image={image}
              onUpload={handleUpload.bind(this, index)}
              onDelete={handleDelete.bind(this, index)}
            />
          </div>
        )
      })}
      {imgArray.length < maxLength && (
        <Plus onUpload={handleUpload.bind(this, imgArray.length)} />
      )}
      <div className='gm-text-desc gm-margin-top-5'>
        {`图片大小请不要超过1MB，推荐尺寸宽度为${imgSize}，支持jpg/png格式`}
      </div>
    </div>
  )
}

ImgUploader.propTypes = {
  maxLength: PropTypes.number.isRequired,
  imgSize: PropTypes.string.isRequired,
  imgArray: PropTypes.array.isRequired,
  onImageChange: PropTypes.func.isRequired,
}

export default ImgUploader
