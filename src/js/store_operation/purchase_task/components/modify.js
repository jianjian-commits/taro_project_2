import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Flex, MoreSelect } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { pinYinFilter } from '@gm-common/tool'
import _ from 'lodash'

class Modify extends React.Component {
  handleSupplierFilter(list, query) {
    return pinYinFilter(list, query, (supplier) => supplier.name)
  }

  render() {
    const { list, displayText, isEditing, selected, onSelect } = this.props
    const data = _.map(list, (item) => ({ value: item.id, text: item.name }))
    return (
      <Flex
        alignCenter
        className={classNames('gm-order-modify gm-inline-block')}
      >
        {isEditing ? (
          <MoreSelect
            className='b-purchase-modify'
            data={data}
            selected={_.filter(
              data,
              (supplier) =>
                !!_.find(selected, (item) => item.value === supplier.value)
            )}
            onSelect={onSelect}
            multiple
            renderListFilterType='pinyin'
            placeholder={i18next.t('选择供应商')}
          />
        ) : (
          displayText
        )}
      </Flex>
    )
  }
}

Modify.propTypes = {
  list: PropTypes.array,
  displayText: PropTypes.element,
  isEditing: PropTypes.bool,
  selected: PropTypes.array,
  onSelect: PropTypes.func,
}

export default Modify
