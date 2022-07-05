import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Button } from '@gmfe/react'

class Sort extends React.Component {
  handleUp = (i, e) => {
    e.preventDefault()
    const { list, onChange } = this.props
    list.splice(i - 1, 0, list.splice(i, 1)[0])
    onChange(list)
  }

  handleDown = (i, e) => {
    e.preventDefault()
    const { list, onChange } = this.props
    list.splice(i + 1, 0, list.splice(i, 1)[0])
    onChange(list)
  }

  render() {
    const { list, renderItem } = this.props

    return (
      <div className='b-sort-list'>
        {_.map(list, (v, i) => (
          <div key={i} className='b-sort-list-item'>
            {renderItem(v, i)}
            {list.length > 1 && (
              <div className='b-sort-list-item-operation'>
                <Button
                  disabled={i === 0}
                  className='b-sort-list-item-operation-up'
                  onClick={this.handleUp.bind(this, i)}
                >
                  ↑
                </Button>
                <Button
                  disabled={i === list.length - 1}
                  className='b-sort-list-item-operation-down'
                  onClick={this.handleDown.bind(this, i)}
                >
                  ↓
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
}

Sort.propTypes = {
  list: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  onChange: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
}
Sort.defaultProps = {
  onChange: () => {},
}

export default Sort
