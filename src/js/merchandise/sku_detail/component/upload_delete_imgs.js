import React from 'react'
import { i18next } from 'gm-i18n'
import { Uploader, Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import { SvgMinusCircle } from 'gm-svg'

class UploadImg extends React.Component {
  render() {
    const { image, index, handleUpload, handleDeleteImg } = this.props
    return (
      <div className='sku-detail-uploader gm-margin-right-10'>
        <Uploader
          onUpload={handleUpload}
          accept='image/jpg, image/jpeg, image/png, image/svg'
          multiple
        >
          <div>
            <div className='sku-detail-wrap'>
              <div className='sku-detail-logo'>
                <img src={image} className='sku-detail-logo-img' />
              </div>
              {index === 0 ? (
                <Flex justifyCenter className='sku-detail-fix'>
                  {i18next.t('商品主图')}
                </Flex>
              ) : null}
            </div>
            <div className='sku-detail-shade'>
              <a className='sku-detail-minus' onClick={handleDeleteImg}>
                <SvgMinusCircle style={{ color: 'red', fontSize: '1.2em' }} />
              </a>
            </div>
          </div>
        </Uploader>
      </div>
    )
  }
}

class UploadDefaultPlus extends React.Component {
  render() {
    const { index, handleUpload } = this.props
    return (
      <div className='sku-detail-uploader gm-margin-right-10'>
        <Uploader
          multiple
          onUpload={handleUpload}
          accept='image/jpg, image/jpeg, image/png, image/svg'
        >
          <div className='sku-detail-wrap'>
            <div className='sku-detail-logo'>
              <span className='sku-detail-logo-img sku-detail-default-plus'>
                +
              </span>
            </div>
            {index === 0 ? (
              <Flex justifyCenter className='sku-detail-fix'>
                {i18next.t('商品主图')}
              </Flex>
            ) : null}
          </div>
        </Uploader>
      </div>
    )
  }
}

class UploadDeleteImgs extends React.Component {
  render() {
    const { imgArray = [], handleUpload, handleDeleteImg } = this.props
    return (
      <div>
        {imgArray.length !== 0
          ? imgArray.map((image, index) => {
              return (
                <div key={index} className='sku-detail-img-box'>
                  <UploadImg
                    index={index}
                    image={image}
                    handleUpload={handleUpload.bind(this, 'logo', index)}
                    handleDeleteImg={handleDeleteImg.bind(this, index)}
                  />
                </div>
              )
            })
          : null}
        {imgArray.length < 5 ? (
          <UploadDefaultPlus
            index={imgArray.length}
            handleUpload={handleUpload.bind(this, 'logo', imgArray.length)}
          />
        ) : null}
      </div>
    )
  }
}

UploadImg.propTypes = {
  image: PropTypes.string,
  index: PropTypes.number,
  handleUpload: PropTypes.func.isRequired,
  handleDeleteImg: PropTypes.func.isRequired,
}
UploadDefaultPlus.propTypes = {
  index: PropTypes.number,
  handleUpload: PropTypes.func.isRequired,
}

UploadDeleteImgs.propTypes = {
  handleUpload: PropTypes.func.isRequired,
  imgArray: PropTypes.array.isRequired,
  handleDeleteImg: PropTypes.func.isRequired,
}

export default UploadDeleteImgs
