import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, ToolTip } from '@gmfe/react'

const Video = ({ src }) => {
  const ref = useRef(null)
  return (
    <div className='gm-inline-block gm-position-relative'>
      <video
        ref={ref}
        src={src + '?v=0401'}
        controls
        style={{
          display: 'block',
          width: '980px',
          height: '516px',
        }}
      />
      {document.pictureInPictureEnabled && (
        <ToolTip
          right
          popup={
            <div className='gm-padding-10'>
              开启视频画中画，可以将子画面在浏览器中任意拖动、缩放，一边看教程一边跟着操作
            </div>
          }
        >
          <Button
            className='gm-position-absolute'
            style={{ top: 0, right: 0 }}
            onClick={() => {
              ref.current.requestPictureInPicture()
            }}
          >
            进入画中画
          </Button>
        </ToolTip>
      )}
    </div>
  )
}

Video.propTypes = {
  src: PropTypes.string.isRequired,
}

export default Video
