import { i18next } from 'gm-i18n'
import React from 'react'
import { Checkbox, CheckboxGroup, Popover, IconDownUp } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'

class DiySheetSelector extends React.Component {
  handleChange(index, type, selectValues) {
    const { data, onChange } = this.props
    let radioSelectValue = null
    // 已经选择了的值
    let selectedValues = null
    if (type === 'checkbox') {
      _.each(data[index].list, (v) => {
        if (selectValues.includes(v.value)) {
          v.checked = true
        } else {
          v.checked = false
        }
      })
    } else if (type === 'radio') {
      // 筛选出目前已选项
      selectedValues = _.map(
        // 筛选出 checked 为 true 的项, 但是返回的是一个对象数组, 所以需要使用 map 筛出 value;
        _.filter(data[index].list, (v) => v.checked),
        (v) => v.value
      )
      // 筛选出差异项, 也就是当前的选择项
      // 当前选择项 如果不包括在 已选择项 中代表它是将要的选择项
      radioSelectValue = _.find(selectValues, (v) => {
        return !selectedValues.includes(v)
      })
      // 遍历数据, 如果某一项就是这个差异项, 就将其置为选择态
      _.each(data[index].list, (v) => {
        if (v.value === radioSelectValue) {
          v.checked = true
        } else {
          v.checked = false
        }
      })
    }
    onChange(data)
  }

  render() {
    const { data, col, width, name } = this.props
    const selectedItems = []
    _.each(data, (list, index) => {
      _.each(list.list, (item) => {
        if (item.checked) {
          if (!selectedItems[index]) {
            selectedItems[index] = []
          }
          selectedItems[index].push(item.value)
        }
      })
    })

    return (
      <Popover
        type='click'
        right
        showArrow
        popup={
          <div>
            {_.map(data, (list, index) => (
              <CheckboxGroup
                key={index}
                name={list.title}
                className='gm-padding-10 gm-bg'
                style={{ width }}
                inline
                value={selectedItems[index]}
                onChange={this.handleChange.bind(this, index, list.type)}
                col={col}
              >
                {_.map(list.list, (item, i) => (
                  <Checkbox key={i} value={item.value}>
                    {item.name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            ))}
          </div>
        }
      >
        <div className='gm-cursor'>
          {name}&nbsp;
          <IconDownUp />
        </div>
      </Popover>
    )
  }
}

DiySheetSelector.propTypes = {
  // 展开的 popup 列数
  col: PropTypes.number,
  // 展开的 popup 宽度
  width: PropTypes.number,
  // 按钮名
  name: PropTypes.string,

  data: PropTypes.array.isRequired,
  // 选择某一个 checkbox 之后的回调函数, 返回 data(改变 change 的项的 checked)
  onChange: PropTypes.func.isRequired,
}

DiySheetSelector.defaultProps = {
  width: 200,
  col: 2,
  name: i18next.t('数据指标选择'),
}

export default DiySheetSelector
