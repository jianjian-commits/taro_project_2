import React from 'react'
import { Uploader } from '@gmfe/react'
import PropTypes from 'prop-types'
import { SvgMinusCircle } from 'gm-svg'

export class UploadImgs extends React.Component {
  render() {
    const { image, uploadType, handleUpload, handleDeleteImg } = this.props

    return (
      <div className='sku-detail-uploader gm-margin-right-10'>
        <Uploader
          onUpload={handleUpload}
          accept='image/jpg, image/png'
          multiple
        >
          <div className='sku-detail-wrap'>
            <div className='sku-detail-logo'>
              {uploadType === 'add' && (
                <span className='sku-detail-logo-img sku-detail-default-plus'>
                  +
                </span>
              )}
              {uploadType === 'del' && (
                <img src={image} className='sku-detail-logo-img' />
              )}
            </div>
          </div>
          {uploadType === 'del' && (
            <div className='sku-detail-shade'>
              <a className='sku-detail-minus' onClick={handleDeleteImg}>
                <SvgMinusCircle
                  style={{ color: 'red', fontSize: '1.2em', overflow: 'auto' }}
                />
              </a>
            </div>
          )}
        </Uploader>
      </div>
    )
  }
}

UploadImgs.propTypes = {
  image: PropTypes.string,
  uploadType: PropTypes.string.isRequired,
  handleUpload: PropTypes.func,
  handleDeleteImg: PropTypes.func,
}

export class DelUploader extends React.Component {
  render() {
    const { image } = this.props

    return (
      <div className='sku-detail-uploader gm-margin-right-10'>
        <div className='sku-detail-wrap'>
          <div className='sku-detail-logo'>
            <img src={image} className='sku-detail-logo-img' />
          </div>
        </div>
      </div>
    )
  }
}

DelUploader.propTypes = {
  image: PropTypes.string,
}
