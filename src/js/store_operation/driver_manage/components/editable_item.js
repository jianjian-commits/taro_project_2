import React from 'react'
import styles from '../style.module.less'
import PropTypes from 'prop-types'
import _ from 'lodash'

class EditableItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.field,
    }
  }

  handleSetvalue = (e) => {
    this.setState({
      value: e.target.value,
    })
  }

  render() {
    const { value } = this.state
    const { field, editRow, index } = this.props

    return _.findIndex(editRow, (row) => row === index) !== -1 ? (
      <div className={styles.driverManageNameWrap}>
        <input
          value={value}
          onChange={this.handleSetvalue}
          type='text'
          className='form-control input-sm'
        />
      </div>
    ) : (
      <div className={styles.driverManageNameWrap}>
        <span>{field}</span>
      </div>
    )
  }
}

EditableItem.propTypes = {
  field: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onConfirm: PropTypes.func,
  editRow: PropTypes.array,
  index: PropTypes.number,
}

export default EditableItem
