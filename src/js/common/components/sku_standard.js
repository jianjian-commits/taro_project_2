import React from 'react'
import PropTypes from 'prop-types'
import { RadioGroup, Radio, InputNumber } from '@gmfe/react'
import _ from 'lodash'

class SKUStandard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: props.data.std_unit_name === props.data.sale_unit_name,
    }
    this.handleToggle = ::this.handleToggle
    this.handleClick = ::this.handleClick
  }

  handleValueChange(name, value) {
    const { onChange, data } = this.props
    onChange(
      Object.assign({}, data, {
        [name]: value,
      })
    )
  }

  handleChange(name, e) {
    this.handleValueChange(name, e.target.value)
  }

  handleClick() {
    if (this.state.checked) {
      this.setState({
        checked: false,
      })
    }
  }

  handleToggle(checked) {
    this.setState({ checked })
    if (checked) {
      const { onChange, data } = this.props
      onChange(
        Object.assign({}, data, {
          sale_ratio: 1,
          sale_unit_name: data.std_unit_name,
        })
      )
    }
  }

  render() {
    const { unitNames } = this.props
    const { std_unit_name, sale_unit_name, sale_ratio } = this.props.data

    let checked = false

    return (
      <div>
        <RadioGroup
          inline
          name='xxxxxxxxxx'
          className='gm-flex gm-flex-justify-start'
          style={{ marginTop: 0, paddingTop: 0 }}
          value={checked}
          onChange={this.handleToggle}
        >
          <Radio value={false}>
            <div className='gm-inline-block' style={{ width: '250px' }}>
              <div className='input-group'>
                <InputNumber
                  precision={0}
                  className='form-control'
                  value={checked ? '' : sale_ratio}
                  onChange={this.handleValueChange.bind(this, 'sale_ratio')}
                  onClick={this.handleClick}
                />
                <span className='input-group-addon'>{std_unit_name}/</span>
                <select
                  style={{ width: '6em' }}
                  className='form-control'
                  value={checked ? '' : sale_unit_name}
                  onChange={this.handleChange.bind(this, 'sale_unit_name')}
                  onClick={this.handleClick}
                >
                  {unitNames.indexOf(sale_unit_name) > -1 ? null : (
                    <option value={sale_unit_name} key={sale_unit_name}>
                      {sale_unit_name}
                    </option>
                  )}
                  {_.map(unitNames, (v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Radio>
        </RadioGroup>
      </div>
    )
  }
}

SKUStandard.propTypes = {
  std_unit_name: PropTypes.string,
  sale_unit_name: PropTypes.string,
  sale_ratio: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  unitNames: PropTypes.array.isRequired,
}

export default SKUStandard
