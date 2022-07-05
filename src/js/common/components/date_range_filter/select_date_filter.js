import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import { Select, Flex } from '@gmfe/react'
import CycleDateRangePicker from '../cycle_date_range_picker'

class SelectDateFilter extends React.Component {
  render() {
    const {
      time_config_id,
      service_times,
      begin,
      end,
      beginProps,
      endProps,
      onChange,
      onSecondSelectChange,
      renderBeginDate,
      renderEndDate,
    } = this.props

    return (
      <Flex>
        <div className='gm-inline-block gm-margin-right-5'>
          <Select
            name='SecondSelect'
            value={time_config_id}
            onChange={onSecondSelectChange}
            data={_.map(service_times, (s) => ({ value: s._id, text: s.name }))}
          />
        </div>
        <Flex flex none row>
          <CycleDateRangePicker
            begin={begin}
            end={end}
            onChange={onChange}
            renderBeginDate={renderBeginDate}
            renderEndDate={renderEndDate}
            beginProps={beginProps}
            endProps={endProps}
          />
        </Flex>
      </Flex>
    )
  }
}

SelectDateFilter.propTypes = {
  time_config_id: PropTypes.string,
  service_times: PropTypes.array,
  begin: PropTypes.object,
  end: PropTypes.object,
  beginProps: PropTypes.object,
  endProps: PropTypes.object,
  onChange: PropTypes.func,
  onSecondSelectChange: PropTypes.func,
  renderBeginDate: PropTypes.func,
  renderEndDate: PropTypes.func,
}

export default SelectDateFilter
