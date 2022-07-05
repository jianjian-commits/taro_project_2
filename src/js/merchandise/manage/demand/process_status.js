import React from 'react'
import { Flex, Select } from '@gmfe/react'
import PropTypes from 'prop-types'
import { SvgWaiting, SvgArrivalCancel, SvgArrivalSubmit } from 'gm-svg'
import { PROCESS_STATUS } from 'common/enum'
import { processStatus } from 'common/filter'

const renderIcon = (status) => {
  const svgStyle = {
    style: {
      width: '1.2em',
      height: '1.2em',
    },
    className: 'gm-margin-right-5',
  }
  switch (status) {
    case 1:
      return <SvgWaiting {...svgStyle} />
    case 2:
      return <SvgArrivalSubmit {...svgStyle} />
    case 3:
      return <SvgArrivalCancel {...svgStyle} />
    default:
      return ''
  }
}

const ProcessStatus = ({ status, edit, onChange }) => {
  const handleChange = (value) => {
    onChange(value)
  }

  return edit ? (
    <div>
      <Select value={status} onChange={handleChange} data={PROCESS_STATUS} />
    </div>
  ) : (
    <Flex alignCenter>
      {renderIcon(status)}
      <span>{processStatus(status)}</span>
    </Flex>
  )
}
ProcessStatus.propTypes = {
  status: PropTypes.number,
  edit: PropTypes.bool,
  onChange: PropTypes.func,
}

export default ProcessStatus
