import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  SheetColumn,
  Sheet,
  SheetSelect,
  Select,
  Option,
} from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'
import PropTypes from 'prop-types'
import { filterGroupList } from '../../util'
import _ from 'lodash'
import classNames from 'classnames'

class Right extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      query: '',
    }
  }

  handleQuery = (e) => {
    this.setState({
      query: e.target.value.trim(),
    })
  }

  handleSelect = (list, checked, index) => {
    const { onSelectValues } = this.props
    let checkedList = _.cloneDeep(this.props.selectedValues)

    if (checked) {
      checkedList.push(list[index])
    } else {
      checkedList = _.filter(checkedList, (item) => item.id !== list[index].id)
    }

    onSelectValues && onSelectValues(checkedList)
  }

  handleSelectAll = (checked) => {
    const { list, withFilter, onSelectValues } = this.props
    const { query } = this.state

    const checkedFilterList = _.map(list, (item) => {
      if (_.find(onSelectValues, (val) => val.id === item.id)) {
        item._gm_select = true
      } else {
        item._gm_select = false
      }
      return item
    })
    let processList
    if (withFilter === true) {
      processList = filterGroupList(
        checkedFilterList,
        (v) =>
          pinYinFilter([v], query, (v) => v.name + v.salemenu_name).length > 0
      )
    } else if (withFilter) {
      processList = withFilter(checkedFilterList, query)
    }

    onSelectValues && onSelectValues(checked ? processList : [])
  }

  handleSecondTagSelect(item, value) {
    let list = this.props.list
    const { onValuesChange } = this.props
    const { label_2_list } = this.props
    const result = _.find(label_2_list, (item) => item.id === value) || {}

    list = _.map(list, (val) => {
      if (val.id === item.id) {
        val.label_2_id = value
        val.label_2_name = result.name
      }
      return val
    })

    this.setState({
      list,
    })
    onValuesChange && onValuesChange(list)
  }

  renderSheet(list) {
    const { label_2_list, isCheckedLabel2, type, showSaleMenuName } = this.props

    return (
      <Sheet list={list}>
        <SheetColumn
          field='id'
          name={i18next.t('商品')}
          className='text-center'
        >
          {(v, i) => (
            <div>
              <div>{list[i].name}</div>
              <div>{v}</div>
            </div>
          )}
        </SheetColumn>
        {isCheckedLabel2 ? (
          <SheetColumn
            field='label_2_id'
            name={i18next.t('二级标签')}
            className='text-center'
            style={{ minWidth: '60px', width: '80px' }}
          >
            {(v, i) =>
              isCheckedLabel2 ? (
                <Select
                  size='sm'
                  className='text-left'
                  value={v || ''}
                  style={{ minWidth: '60px', width: '80px' }}
                  onChange={this.handleSecondTagSelect.bind(this, list[i])}
                >
                  <Option value=''>-</Option>
                  {_.map(label_2_list, (item, i) => {
                    return (
                      <Option key={i} value={item.id}>
                        {item.name}
                      </Option>
                    )
                  })}
                </Select>
              ) : (
                '-'
              )
            }
          </SheetColumn>
        ) : null}
        {type ? (
          <SheetColumn
            field='sale_ratio'
            name={i18next.t('销售规格')}
            className='text-center'
            style={{ minWidth: '30px' }}
          >
            {(v, index, record) => {
              return (
                <span>{`${v}${record.std_unit_name_forsale}/${record.sale_unit_name}`}</span>
              )
            }}
          </SheetColumn>
        ) : null}
        {!type ? (
          <SheetColumn
            field='state'
            name={i18next.t('销售状态')}
            className='text-center'
            style={{ minWidth: '30px' }}
          >
            {(v) => {
              if (v) {
                return (
                  <span className='gm-padding-lr-5 label-primary gm-text-white'>
                    {i18next.t('上架')}
                  </span>
                )
              } else {
                return (
                  <span className='gm-padding-lr-5 label-default gm-text-white'>
                    {i18next.t('下架')}
                  </span>
                )
              }
            }}
          </SheetColumn>
        ) : null}
        {!type && showSaleMenuName ? (
          <SheetColumn
            field='salemenu_name'
            name={i18next.t('报价单')}
            className='text-center'
            style={{ minWidth: '30px' }}
          />
        ) : null}
        <SheetSelect
          onSelect={this.handleSelect.bind(this, list)}
          onSelectAll={this.handleSelectAll}
        />
      </Sheet>
    )
  }

  render() {
    const {
      withFilter,
      title,
      className,
      selectedValues: checkedList,
      list,
      placeholder,
      style,
    } = this.props

    const { query } = this.state

    // checkbox
    const checkedFilterList = _.map(list, (item) => {
      if (_.find(checkedList, (val) => val.id === item.id)) {
        item._gm_select = true
      } else {
        item._gm_select = false
      }
      return item
    })

    let processList
    if (withFilter === true) {
      processList = filterGroupList(
        checkedFilterList,
        (v) =>
          pinYinFilter([v], query, (v) => v.name + v.salemenu_name).length > 0
      )
    } else if (withFilter) {
      processList = withFilter(checkedFilterList, query)
    }

    return (
      <Flex
        style={style}
        column
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
              placeholder={placeholder}
              value={query}
              onChange={this.handleQuery}
            />
            <i className='glyphicon glyphicon-search gm-text-desc' />
          </div>
        ) : null}

        <Flex flex column className='gm-bg gm-overflow-y'>
          {this.renderSheet(processList)}
        </Flex>
      </Flex>
    )
  }
}

Right.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.oneOf([0, 1]),
  placeholder: PropTypes.string,
  title: PropTypes.string,
  list: PropTypes.array,
  label_2_list: PropTypes.array,
  withFilter: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  isCheckedLabel2: PropTypes.oneOf([0, 1]),
  selectedValues: PropTypes.array,
  onSelectValues: PropTypes.func,
  onValuesChange: PropTypes.func,
  showSaleMenuName: PropTypes.bool,
}

export default Right
