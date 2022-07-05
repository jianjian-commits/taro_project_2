import React from 'react'
import { Checkbox, CheckboxGroup } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

const MarkerShowControl = ({ list, onChange, selected }) => {
  return (
    <div className='b-control-center-marker-control'>
      <div className='text-center bg-primary'>{t('地图元素')}</div>
      <CheckboxGroup
        name='MarkerShowControl'
        value={selected}
        onChange={onChange}
      >
        {list.map((item) => (
          <Checkbox value={item.value} key={item.value.toString()}>
            {item.name}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  )
}

MarkerShowControl.propTypes = {
  list: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.array.isRequired,
}

export default MarkerShowControl
