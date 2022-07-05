import { t } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { productDefaultImg } from '../../../common/service'

const ListImg = (props) => {
  const { imgSrc, isBBS, isSelfSale, onClick } = props
  return (
    <Flex
      alignCenter
      style={{
        width: '40px',
        height: '40px',
      }}
      className='gm-border'
    >
      <img
        data-id='initMatchImagesImage'
        onClick={onClick}
        className={onClick ? 'gm-cursor' : ''}
        src={imgSrc || productDefaultImg}
        style={{
          maxWidth: '40px',
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
        }}
      />
      {isBBS && <div className='b-img-tag'>{t('本站')}</div>}
      {isSelfSale && <div className='b-img-tag'>{t('自售')}</div>}
    </Flex>
  )
}

ListImg.propTypes = {
  imgSrc: PropTypes.string,
  isBBS: PropTypes.bool, // 本站
  isSelfSale: PropTypes.bool, // 自售
  onClick: PropTypes.func,
}

ListImg.defaultProps = {
  onClick: _.noop(),
}

export default ListImg
