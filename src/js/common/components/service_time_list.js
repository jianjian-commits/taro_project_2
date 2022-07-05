import React from 'react'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import ServiceTimeItem from './service_time_item'

// cache 吧
let list = null

class ServiceTimeList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list,
    }
  }

  componentWillMount() {
    if (this.props.cache || !this.state.list || this.state.list.length === 0) {
      Request('/service_time/list')
        .get()
        .then((json) => {
          list = json.data || []
          this.setState({
            list,
          })
        })
    }
  }

  handleClick(v) {
    this.props.onSelect(v._id, v)
  }

  render() {
    const { list } = this.state

    if (!list) {
      return null
    }

    return (
      <div>
        {_.map(list, (v, i) => {
          return (
            <div key={v._id}>
              <ServiceTimeItem
                data={v}
                onClick={this.handleClick.bind(this, v)}
              />
              {i !== list.length - 1 ? (
                <div className='gm-padding-bottom-15' />
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }
}

ServiceTimeList.propTypes = {
  onSelect: PropTypes.func.isRequired,
  // 服务时间缓存，如果要更新，请传true
  cache: PropTypes.bool,
}

export default ServiceTimeList
