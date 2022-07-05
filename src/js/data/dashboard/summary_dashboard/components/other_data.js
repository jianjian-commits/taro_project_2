import React from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import classNames from 'classnames'

import Panel from 'common/components/dashboard/panel'
import Box from 'common/components/dashboard/box'

const GridContainer = styled.div`
  display: grid;
  background-color: #ffff;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 15px;
`

const OtherData = ({ className }) => {
  return (
    <Panel title={t('其他数据')} className={classNames('gm-bg', className)}>
      <GridContainer>
        <Box style={{ height: '134px', width: 'auto' }} />
        <Box style={{ height: '134px', width: 'auto' }} />
        <Box style={{ height: '134px', width: 'auto' }} />
        <Box style={{ height: '134px', width: 'auto' }} />
      </GridContainer>
    </Panel>
  )
}

OtherData.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default OtherData
