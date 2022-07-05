import React from 'react'
import { productDefaultImg } from '../../common/service'

function ListProductImg(props) {
  const { src } = props
  const imgSrc = src || productDefaultImg
  return (
    <img
      className='gm-border'
      src={imgSrc}
      style={{
        width: '40px',
        height: '40px',
      }}
    />
  )
}

export default ListProductImg
