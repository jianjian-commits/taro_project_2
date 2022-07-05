import React from 'react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'
import { Button } from '@gmfe/react'

class FixedButton extends React.Component {
  render() {
    const { disabled, onCancel, onSubmit } = this.props
    return (
      <div
        className='text-center gm-padding-tb-5 gm-form-group-sticky-bottom'
        style={{
          position: 'absolute',
          bottom: '0px',
          width: '100%',
          zIndex: 950,
        }}
      >
        <Button onClick={onCancel}>{i18next.t('取消')}</Button>
        <div className='gm-gap-20' />
        <Button type='primary' disabled={disabled} onClick={onSubmit}>
          {i18next.t('保存')}
        </Button>
      </div>
    )
  }
}

FixedButton.propTypes = {
  disabled: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
}

export default FixedButton
