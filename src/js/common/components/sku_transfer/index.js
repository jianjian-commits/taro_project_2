import React from 'react'
import _ from 'lodash'
import { Flex, Button } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { filterGroupList } from '../../util'
import Left from './left'
import Right from './right'

class TransferGroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      leftSelectedValues: [],
      rightSelectedValues: [],
    }
  }

  handleLeftChange = (leftSelectedValues) => {
    this.setState({
      leftSelectedValues,
    })
  }

  handleRightChange = (rightSelectedValues) => {
    this.setState({
      rightSelectedValues,
    })
  }

  handleToRightClick = () => {
    const { onRightListChange, leftList, rightList } = this.props
    const { leftSelectedValues } = this.state
    const toRightList = []

    filterGroupList(leftList, (v) => {
      if (_.includes(leftSelectedValues, v.value)) {
        toRightList.push(v)
      }
    })

    const rightFilterList = _.map(toRightList.concat(rightList), (item) => {
      item._gm_select = false
      return item
    })

    onRightListChange && onRightListChange(rightFilterList)

    this.setState({
      leftSelectedValues: [],
      rightSelectedValues: [],
    })
  }

  handleToLeftClick = () => {
    const { onRightListChange, rightList } = this.props
    const rightSelectedValues = Array.isArray(this.state.rightSelectedValues)
      ? this.state.rightSelectedValues
      : [this.state.rightSelectedValues]

    const rightFilterList = _.filter(rightList, (item) => {
      return !_.find(rightSelectedValues, (val) => val.id === item.id)
    })

    onRightListChange && onRightListChange(rightFilterList)
    this.setState({
      leftSelectedValues: [],
      rightSelectedValues: [],
    })
  }

  render() {
    const {
      leftTitle,
      rightTitle,
      leftList,
      rightList,
      labelList,
      onRightListChange,
      leftDisableSelectAll,
      className,
      style,
      isCheckedLabel2,
      listStyle,
      placeholder,
      type,
      showSaleMenuName,
    } = this.props

    const { leftSelectedValues, rightSelectedValues } = this.state
    return (
      <div
        style={style}
        className={classNames('gm-transfer gm-transfer-group', className)}
      >
        <Flex>
          <Left
            placeholder={placeholder}
            style={listStyle}
            title={leftTitle}
            list={leftList}
            selectedValues={leftSelectedValues}
            onSelectValues={this.handleLeftChange}
            withFilter
            disableSelectAll={leftDisableSelectAll}
            showSaleMenuName={showSaleMenuName}
            type={type}
          />
          <div className='gm-gap-5' />
          <Flex
            column
            justifyCenter
            alignCenter
            className='gm-transfer-operation'
          >
            <Button
              disabled={leftSelectedValues.length === 0}
              className='gm-margin-bottom-5'
              onClick={this.handleToRightClick}
            >
              &gt;
            </Button>
            <Button
              disabled={rightSelectedValues.length === 0}
              onClick={this.handleToLeftClick}
            >
              &lt;
            </Button>
          </Flex>
          <div className='gm-gap-5' />
          <Right
            placeholder={placeholder}
            style={listStyle}
            title={rightTitle}
            list={rightList}
            label_2_list={labelList}
            withFilter
            onSelectValues={this.handleRightChange}
            onValuesChange={onRightListChange}
            selectedValues={rightSelectedValues}
            isCheckedLabel2={isCheckedLabel2}
            showSaleMenuName={showSaleMenuName}
            type={type}
          />
        </Flex>
      </div>
    )
  }
}

TransferGroup.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.oneOf([0, 1]),
  listStyle: PropTypes.object,
  placeholder: PropTypes.string,
  leftTitle: PropTypes.string,
  rightTitle: PropTypes.string,
  leftList: PropTypes.array,
  rightList: PropTypes.array,
  labelList: PropTypes.array,
  onRightListChange: PropTypes.func,
  leftDisableSelectAll: PropTypes.bool,
  isCheckedLabel2: PropTypes.oneOf([0, 1]),
  showSaleMenuName: PropTypes.bool,
}

TransferGroup.defaultProps = {
  type: 0, // 1 仅展示规格信息 0: 不需要规格信息
  showSaleMenuName: true,
}

export default TransferGroup
