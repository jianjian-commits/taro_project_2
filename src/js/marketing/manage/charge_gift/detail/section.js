import React from 'react'
import { i18next } from 'gm-i18n'
import { InputNumberV2, Price } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import PropTypes from 'prop-types'

import { money } from '../util'

const renderDisableInput = (value) => {
  return (
    <input
      type='text'
      className='form-control gm-margin-lr-5'
      value={value}
      readOnly
      style={{
        width: '80px',
        height: '30px',
        display: 'inline-block',
      }}
      disabled
    />
  )
}

class Section extends React.Component {
  handleChangeInput(index, name, val) {
    const { data, onChange } = this.props
    const new_data = _.clone(data)
    // 元转分
    const value = val && +Big(val).times(100)

    new_data[index][name] = value
    // 控制关联
    if (name === 'end') {
      new_data[index + 1].start = value
    }

    onChange(new_data)
  }

  render() {
    const { data, unit, disabled } = this.props
    return (
      <div>
        {_.map(data.slice(), ({ start, end, gift }, index) => (
          <div key={index} className='gm-margin-top-10'>
            <span>{i18next.t('充值')}</span>
            {disabled || data[index - 1] !== undefined ? (
              renderDisableInput(start && money(start))
            ) : (
              <InputNumberV2
                className='gm-margin-lr-5'
                min={0}
                value={start && money(start)}
                precision={0}
                style={{ width: 80, height: 30 }}
                onChange={this.handleChangeInput.bind(this, index, 'start')}
              />
            )}
            <span>{Price.getUnit()}</span>
            <span>
              {end !== undefined
                ? i18next.t('(包含)--')
                : i18next.t('及以上，')}
            </span>
            {end !== undefined ? (
              <>
                {disabled ? (
                  renderDisableInput(end && money(end))
                ) : (
                  <InputNumberV2
                    className='form-control gm-margin-lr-5'
                    min={0}
                    value={end && money(end)}
                    precision={0}
                    style={{ width: 80, height: 30, display: 'inline-block' }}
                    onChange={this.handleChangeInput.bind(this, index, 'end')}
                  />
                )}
                <span>{Price.getUnit()}</span>
              </>
            ) : null}
            <span>{end !== undefined ? i18next.t('(不包含)--，') : ''}</span>
            {disabled ? (
              renderDisableInput(gift && money(gift))
            ) : (
              <>
                <span>{i18next.t('送')}</span>
                <InputNumberV2
                  className='gm-margin-lr-5'
                  min={0}
                  value={gift && money(gift)}
                  precision={0}
                  style={{ width: 80, height: 30 }}
                  onChange={this.handleChangeInput.bind(this, index, 'gift')}
                />
              </>
            )}
            <span>{unit}</span>
          </div>
        ))}
      </div>
    )
  }
}

Section.propTypes = {
  onChange: PropTypes.func,
  unit: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object), // obj { start, end, gift }
  disabled: PropTypes.bool,
}

export default Section
