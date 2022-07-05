import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import html2canvas from 'html2canvas'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import { Flex, Button } from '@gmfe/react'

import globalStore from 'stores/global'

const SingleImg = observer(props => {
  const imgRef = useRef(null)
  const { qrCode } = props
  const { bg, className } = props.imgInfo

  const handleSaveImg = ref => {
    const $img = ref.current
    $img.scrollTop = 0 // 先滚动到最顶部
    // 解决有滚动条时截图出现空白
    document.documentElement.style.position = 'fixed'
    html2canvas($img, {
      useCORS: true,
      scale: 3
    }).then(canvas => {
      const url = canvas.toDataURL()
      const a = document.createElement('a')
      a.download = '团长招募'
      a.href = url
      a.click()
    })
    document.documentElement.style.position = ''
  }

  return (
    <Flex column style={{ marginRight: '210px' }}>
      <div ref={imgRef} className='b-commander-box'>
        {globalStore.bShop.logo && (
          <img
            src={globalStore.bShop.logo}
            className='gm-position-absolute b-commander-recruit-logo'
            width={30}
            height={30}
          />
        )}
        {qrCode && (
          <img
            src={qrCode}
            className={classNames('gm-position-absolute', className)}
            width={60}
            height={60}
          />
        )}
        <img
          src={bg}
          width={300}
          height={500}
          style={{ borderRadius: '4px' }}
        />
      </div>
      <div className='b-download-button'>
        <Button
          type='primary'
          className='gm-cursor'
          onClick={() => {
            handleSaveImg(imgRef)
          }}
        >
          {t('点击下载推广图')}
        </Button>
      </div>
    </Flex>
  )
})

SingleImg.propTypes = {
  imgInfo: PropTypes.object,
  qrCode: PropTypes.string
}

export default SingleImg
