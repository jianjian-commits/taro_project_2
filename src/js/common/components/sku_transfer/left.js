import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Checkbox } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'
import PropTypes from 'prop-types'
import { getLeaf, filterGroupList } from '../../util'
import _ from 'lodash'
import classNames from 'classnames'

class Tree extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      query: '',
      groupSelected: [],
    }
  }

  handleChange = (leaf, checked) => {
    const { onSelectValues, selectedValues, onClickCheckbox } = this.props
    onSelectValues(_.xor([leaf.value], selectedValues))

    if (onClickCheckbox) {
      onClickCheckbox(leaf, checked)
    }
  }

  handleSelectAll = (checked) => {
    const { list, onSelectValues } = this.props
    onSelectValues(checked ? _.map(getLeaf(list), (v) => v.value) : [])
  }

  handleQuery = (e) => {
    this.setState({
      query: e.target.value.trim(),
    })
  }

  handleGroup = (value) => {
    const { groupSelected } = this.state

    this.setState({
      groupSelected: _.xor(groupSelected, [value]),
    })
  }

  handleSelectGroup = (group, isSelectGroup) => {
    const { onClickCheckbox, selectedValues, onSelectValues } = this.props

    const leafValues = _.map(getLeaf(group.children), (item) => item.value)
    onSelectValues(
      isSelectGroup
        ? _.union(selectedValues, leafValues)
        : _.difference(selectedValues, leafValues)
    )

    if (onClickCheckbox) {
      onClickCheckbox(group, isSelectGroup)
    }
  }

  renderList(list) {
    const {
      selectedValues,
      onClickLeafName,
      type,
      showSaleMenuName,
    } = this.props
    const { groupSelected } = this.state

    if (list.length === 0) {
      return null
    }

    const isGroupData = !!list[0].children

    if (isGroupData) {
      return (
        <div className='gm-tree-group'>
          {_.map(list, (group) => {
            const isOpen = _.includes(groupSelected, group.value)

            const leafValues = _.map(
              getLeaf(group.children),
              (item) => item.value
            )
            const isSelectGroup =
              _.filter(leafValues, (value) => _.includes(selectedValues, value))
                .length === leafValues.length

            return (
              <div key={group.value}>
                <Flex className='gm-tree-group-name gm-cursor gm-hover-bg'>
                  <Checkbox
                    value
                    checked={isSelectGroup}
                    onChange={() => {
                      this.handleSelectGroup(group, !isSelectGroup)
                    }}
                  />
                  <Flex
                    flex
                    alignCenter
                    onClick={() => this.handleGroup(group.value)}
                  >
                    {isOpen ? '-' : '+'}&nbsp;{group.name}
                  </Flex>
                </Flex>
                {isOpen && (
                  <div className='gm-tree-group-list'>
                    {this.renderList(group.children)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div>
        {_.map(list, (v) => {
          const checked = _.includes(selectedValues, v.value)

          return (
            <Flex
              alignCenter
              key={v.value}
              className='gm-hover-bg gm-tree-group-list-item gm-cursor'
            >
              <Checkbox
                value={v.value}
                checked={checked}
                onChange={() => {
                  this.handleChange(v, !checked)
                }}
              />
              <Flex
                flex
                onClick={() => {
                  if (onClickLeafName) {
                    onClickLeafName(v, checked)
                  } else {
                    this.handleChange(v, !checked)
                  }
                }}
              >
                {v.state ? (
                  <span className='gm-margin-lr-5 label-primary gm-text-white gm-text-12'>
                    {i18next.t('??????')}
                  </span>
                ) : (
                  <span className='gm-margin-lr-5 label-default gm-text-white gm-text-12'>
                    {i18next.t('??????')}
                  </span>
                )}
                {v.name}
                {!type && showSaleMenuName ? (
                  <span className='gm-text-desc'>({v.salemenu_name})</span>
                ) : null}
              </Flex>
            </Flex>
          )
        })}
      </div>
    )
  }

  render() {
    const {
      title,
      list,
      selectedValues,
      withFilter,
      disableSelectAll,
      placeholder,
      onSelectValues,
      onClickLeafName,
      onClickCheckbox, // eslint-disable-line

      className,
      ...rest
    } = this.props

    const { query } = this.state

    let processList

    if (withFilter === true) {
      processList = filterGroupList(
        list,
        (v) =>
          pinYinFilter([v], query, (v) => v.name + v.salemenu_name).length > 0
      )
    } else if (withFilter) {
      processList = withFilter(list, query)
    }

    const leafList = getLeaf(list)

    const checkedAll =
      leafList.length !== 0 && leafList.length === selectedValues.length

    return (
      <Flex
        column
        {...rest}
        className={classNames('gm-tree gm-border gm-bg', className)}
      >
        {title && (
          <div className='gm-padding-5 gm-back-bg text-center gm-border-bottom'>
            {title}
          </div>
        )}
        {withFilter ? (
          <div className='gm-tree-filter'>
            <input
              type='text'
              className='form-control'
              value={query}
              onChange={this.handleQuery}
              placeholder={placeholder}
            />
            <i className='glyphicon glyphicon-search gm-text-desc' />
          </div>
        ) : null}

        <Flex flex column className='gm-bg gm-overflow-y'>
          {this.renderList(processList)}
        </Flex>

        {!disableSelectAll && (
          <Flex
            justifyBetween
            alignCenter
            className='gm-border-top gm-padding-5'
          >
            <Checkbox
              value
              checked={checkedAll}
              onChange={() => this.handleSelectAll(!checkedAll)}
            >
              {i18next.t('??????')}
            </Checkbox>
            <div className='gm-padding-lr-5 gm-text-desc'>
              {selectedValues.length}/{leafList.length}
            </div>
          </Flex>
        )}
      </Flex>
    )
  }
}

Tree.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.oneOf([0, 1]),
  placeholder: PropTypes.string,
  title: PropTypes.string,
  list: PropTypes.array,
  withFilter: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  selectedValues: PropTypes.array,
  onSelectValues: PropTypes.func,
  onClickLeafName: PropTypes.func,
  onClickCheckbox: PropTypes.func,
  disableSelectAll: PropTypes.bool,
  showSaleMenuName: PropTypes.bool,
}

export default Tree
