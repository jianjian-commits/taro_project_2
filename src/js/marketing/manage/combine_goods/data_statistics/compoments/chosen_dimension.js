import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Button } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'

@observer
class ChosenDimension extends React.Component {
  handleChangeCheckbox(show) {
    this.props.store.changeCheckbox(show)
  }

  handleChosen() {
    this.props.store.apiDoFirstRequest()
    window.document.body.click()
  }

  renderCheckbox = () => {
    const { chosen } = this.props.store

    const checkboxes = _.map(chosen, (field, i) => {
      return (
        <label
          className='gm-flex'
          style={{ width: '50%' }}
          key={'checkbox' + i}
        >
          <input
            type='checkbox'
            checked={field.show}
            onChange={this.handleChangeCheckbox.bind(this, field.show)}
            name={field.name}
            style={{
              marginRight: '5px',
            }}
          />
          <Flex flex>{field.name}</Flex>
        </label>
      )
    })
    if (!checkboxes.length) {
      checkboxes.push(<div key='o'>{i18next.t('暂无筛选项')}</div>)
    }
    return checkboxes
  }

  render() {
    return (
      <Flex
        column
        className='gm-padding-15 gm-border gm-bg'
        style={{
          width: '180px',
        }}
      >
        <div>
          <Flex wrap style={{ fontSize: 12 }}>
            {this.renderCheckbox()}
          </Flex>
          <Flex justifyEnd>
            <Button type='primary' onClick={this.handleChosen.bind(this)}>
              {i18next.t('确定')}
            </Button>
          </Flex>
        </div>
      </Flex>
    )
  }
}

ChosenDimension.propTypes = {
  store: PropTypes.object.isRequired,
}

export default ChosenDimension
