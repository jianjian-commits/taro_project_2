import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import React from 'react'

const Introduction = ({ name, desc }) => {
  return (
    <div>
      <div className='gm-border gm-margin-tb-15' />
      <Flex alignCenter>
        <div className='gm-text-bold' style={{ width: '180px' }}>
          {t('工艺名称') + '： ' + name}
        </div>
        {desc && (
          <div className='gm-text-bold'>
            <div className='gm-inline-block'>{t('描述')}</div>
            ：
            <span className='gm-gap-5' />
            {desc}
          </div>
        )}
      </Flex>
    </div>
  )
}

Introduction.propTypes = {
  name: PropTypes.string,
  desc: PropTypes.string,
}

export default Introduction
