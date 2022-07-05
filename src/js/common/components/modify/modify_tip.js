import React from 'react'
import PropTypes from 'prop-types'
import TextTip from '../text_tip'
import { returnIcon, returnTip } from './util'

class ModifyTip extends React.Component {
  render() {
    const {
      realIsWeight,
      printed,
      isWeight,
      outOfStock,
      isSellout,
    } = this.props
    return (
      <TextTip
        content={returnTip(realIsWeight, printed, isWeight, outOfStock)}
        style={{
          marginLeft: '-6px',
          marginTop: '3px',
        }}
      >
        {returnIcon(realIsWeight, printed, isWeight, isSellout)}
      </TextTip>
    )
  }
}

ModifyTip.propTypes = {
  realIsWeight: PropTypes.number,
  printed: PropTypes.bool,
  isWeight: PropTypes.number,
  outOfStock: PropTypes.bool,
  isSellout: PropTypes.bool,
}

ModifyTip.defaultProps = {
  isSellout: false,
}
export default ModifyTip
