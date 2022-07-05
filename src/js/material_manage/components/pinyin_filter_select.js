import React from 'react'
import { pinYinFilter } from '@gm-common/tool'
import { FilterSelect } from '@gmfe/react'

class Select extends React.Component {
  doFilter(list, query) {
    return pinYinFilter(list, query, (value) => value.name)
  }

  render() {
    return (
      <FilterSelect withFilter={this.doFilter.bind(this)} {...this.props} />
    )
  }
}
export default Select
