import React from 'react'
import { observer } from 'mobx-react'
import { MultipleFilterSelect, Tip } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { convertNumber2Date } from '../../../../../common/util'
import store from './store'
import globalStore from '../../../../../stores/global'

@observer
class EditContent extends React.Component {
  handleSelect = (selected) => {
    const {
      row: { index },
    } = this.props
    let weekdays = 0
    _.forEach(selected, (item) => {
      weekdays += item.value
    })
    store.updateRow(index, { weekdays })
  }

  handleSubmit = () => {
    const {
      row: { index },
      time_config_id,
    } = this.props
    store.createOrUpdateCustomer(index, time_config_id).then(() => {
      Tip.info('更新成功')
      store.updateRow(index, { edit: false })
    })
  }

  handleEdit = () => {
    const {
      row: { index, weekdays },
    } = this.props
    store.updateRow(index, { oldWeekdays: weekdays, edit: true })
  }

  render() {
    const {
      row: { original },
      defaultReceiveDays,
    } = this.props
    const { edit, weekdays } = original
    const modifyPermission = globalStore.hasPermission(
      'edit_customer_receivetime_weekdays'
    )
    const receiveDays = convertNumber2Date(weekdays)
    return (
      <div>
        {edit ? (
          <React.Fragment>
            <div className='gm-inline-block'>
              <MultipleFilterSelect
                disableSearch
                id='receive_time_limit'
                list={defaultReceiveDays}
                selected={receiveDays}
                onSelect={this.handleSelect}
                placeholder='设置客户可选收货自然日'
              />
            </div>
            <a className='gm-padding-lr-10' onClick={this.handleSubmit}>
              <i className='xfont xfont-ok text-primary' />
            </a>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className='gm-inline-block'>
              {_.join(_.map(receiveDays, 'name'), '，')}
            </div>
            {modifyPermission ? (
              <a className='gm-padding-lr-10' onClick={this.handleEdit}>
                <i className='xfont xfont-edit text-primary' />
              </a>
            ) : null}
          </React.Fragment>
        )}
      </div>
    )
  }
}

EditContent.propTypes = {
  row: PropTypes.object.isRequired,
  time_config_id: PropTypes.string.isRequired,
  defaultReceiveDays: PropTypes.object.isRequired,
}
export default EditContent
