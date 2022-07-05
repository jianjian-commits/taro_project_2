import React from 'react'
import { Select, InputNumberV2, Option } from '@gmfe/react'
import classNames from 'classnames'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import _ from 'lodash'

class selectOrderType extends React.Component {
  render() {
    const { data, index, onChange } = this.props
    return (
      <>
        <Select
          name='change_type'
          value={data.change_type || 0}
          onChange={onChange.bind(this, index, 'change_type')}
        >
          <Option value={0}>{i18next.t('原下单数')}</Option>
          <Option value={1}>{i18next.t('固定')}</Option>
        </Select>
        {data.change_type ? (
          <div style={{ display: 'inline-block' }}>
            <InputNumberV2
              value={!_.isNil(data.change_quantity) ? data.change_quantity : ''}
              style={{ width: '50px' }}
              className={classNames(
                'form-control input-sm b-order-price-input gm-margin-left-10',
              )}
              onChange={onChange.bind(this, index, 'change_quantity')}
            />
            {data.selected_data ? (
              <span className='gm-margin-left-5'>
                {data.selected_data.original.sale_unit_name}
              </span>
            ) : (
              <span className='gm-margin-left-5'>-</span>
            )}
          </div>
        ) : null}
      </>
    )
  }
}

selectOrderType.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  onChange: PropTypes.func,
}

export default selectOrderType
