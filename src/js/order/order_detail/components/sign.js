import React from 'react'
import { Popover } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

const Sign = ({ signature_image_url }) => {
  return signature_image_url ? (
    <Popover
      popup={
        <div>
          <img src={signature_image_url} alt='sign' width={200} />
        </div>
      }
      showArrow
      type='hover'
    >
      <a href='javascript:;'>{t('电子签名')}</a>
    </Popover>
  ) : null
}

Sign.propTypes = {
  signature_image_url: PropTypes.string,
}

export default Sign
