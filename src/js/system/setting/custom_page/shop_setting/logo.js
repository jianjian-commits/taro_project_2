import React from 'react'
import PropTypes from 'prop-types'
import { Uploader, Flex, Popover } from '@gmfe/react'
import { i18next } from 'gm-i18n'

import defaultLogo from '../../../../../img/station.png'

const Logo = ({ logo, onUpload, disabled }) => {
  return (
    <Flex column>
      <Popover
        type='hover'
        showArrow={true}
        popup={<p className='gm-padding-lr-5 gm-padding-top-5'>点击更换</p>}
      >
        <Uploader
          accept='image/jpeg, image/png'
          onUpload={onUpload}
          disabled={disabled}
          style={{ height: '50px', width: '50px', border: '1px solid #D4D8D8' }}
        >
          <img
            style={{ height: '100%', width: '100%' }}
            src={logo || defaultLogo}
          />
        </Uploader>
      </Popover>
      <div className='gm-gap-5' />
      <span className='gm-text-desc'>
        {i18next.t('图片大小请不要超过50kb，默认尺寸64x64，支持jpg/png格式')}
      </span>
    </Flex>
  )
}

Logo.propTypes = {
  onUpload: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  logo: PropTypes.string,
}

export default Logo
