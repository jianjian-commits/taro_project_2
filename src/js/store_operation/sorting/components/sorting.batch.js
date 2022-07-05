import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Button } from '@gmfe/react'

class SortingBatch extends React.Component {
  constructor(props) {
    super(props)
    this.BATCH_NUM = 21
  }

  _handleClick(batch) {
    this.props.handleClickTheBatch(batch)
  }

  render() {
    const batches = []
    for (let i = 0; i < this.BATCH_NUM; i++) {
      batches.push(
        <Button
          type='primary'
          className='gm-margin-5'
          key={i}
          onClick={this._handleClick.bind(this, i + 1)}
        >
          {i18next.t('KEY246', { VAR1: i + 1 })}
        </Button>
      )
    }
    return (
      <Flex justifyStart wrap className='gm-padding-10'>
        {batches}
      </Flex>
    )
  }
}

SortingBatch.propTypes = {
  handleClickTheBatch: PropTypes.func,
}

SortingBatch.defaultProps = {
  handleClickTheBatch: () => {
    console.info("It's better to pass the handleClickTheBatch props as a func")
  },
}

export default SortingBatch
