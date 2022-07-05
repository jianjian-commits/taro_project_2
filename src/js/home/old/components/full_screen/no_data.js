import React from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

class NoData extends React.Component {
  render() {
    const { height } = this.props
    return (
      <p
        style={{
          height,
          lineHeight: height + 'px',
          margin: 0,
          textAlign: 'center',
          fontSize: 15,
        }}
      >
        {t('没有更多数据了')}
      </p>
    )
  }
}
NoData.propTypes = {
  height: PropTypes.number,
}
NoData.defaultProps = {
  height: 280,
}

export default NoData
