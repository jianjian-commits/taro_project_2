import React from 'react'
import PropTypes from 'prop-types'
import globalStore from '../../stores/global'

class Permission extends React.Component {
  render() {
    let { field, children, and } = this.props
    if (globalStore.hasPermission(field) && and) {
      return children
    }
    return null
  }
}

Permission.has = (field) => {
  return globalStore.hasPermission(field)
}

Permission.propTypes = {
  field: PropTypes.string.isRequired,
  and: PropTypes.bool,
}

Permission.defaultProps = {
  and: true,
}

export default Permission
