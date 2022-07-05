import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Tree, Button } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'
import classNames from 'classnames'
import _ from 'lodash'
import TransferRight from '../component/transfer_right'
import { filterGroupList } from '../../../../common/util'
import PropTypes from 'prop-types'

class Transfer extends React.Component {
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
    const { onRightListChange, leftList, selectedSkuValue } = this.props
    const { leftSelectedValues } = this.state

    const toRightList = []
    filterGroupList(leftList, (v) => {
      if (_.includes(leftSelectedValues, v.value)) {
        toRightList.push(v)
      }
    })
    const rightFilterList = _.map(
      toRightList.concat(selectedSkuValue),
      (item) => {
        item._gm_select = false
        return item
      }
    )
    onRightListChange && onRightListChange(rightFilterList)

    this.setState({
      leftSelectedValues: [],
      rightSelectedValues: [],
    })
  }

  handleToLeftClick = () => {
    const { onRightListChange, selectedSkuValue, skuList } = this.props
    const rightSelectedValues = Array.isArray(this.state.rightSelectedValues)
      ? this.state.rightSelectedValues
      : [this.state.rightSelectedValues]

    const rightFilterList = _.filter(selectedSkuValue, (item) => {
      return !_.find(rightSelectedValues, (val) => val === item.id)
    })

    // 获取已选择商品列表
    const skus = _.map(rightFilterList, (v) => v.id || v.value)
    const toRightTree = filterGroupList(skuList, (v) => {
      return _.includes(skus, v.id || v.value)
    })

    onRightListChange && onRightListChange(rightFilterList, toRightTree)
    this.setState({
      leftSelectedValues: [],
      rightSelectedValues: [],
    })
  }

  renderLeafItem = (leaf) => {
    return (
      <span style={{ wordBreak: 'break-all' }}>
        {leaf.name}
        <span className='gm-text-desc'>({leaf.salemenu_name})</span>
      </span>
    )
  }

  handleSearch = (list, query) => {
    const processList = filterGroupList(
      list,
      (v) =>
        pinYinFilter([v], query, (v) => v.name + v.salemenu_name).length > 0
    )

    return processList
  }

  render() {
    const { style, className, leftList, selectedSkuValue } = this.props

    const { leftSelectedValues, rightSelectedValues } = this.state

    return (
      <div
        style={style}
        className={classNames('gm-transfer gm-transfer-group', className)}
      >
        <Flex>
          <Tree
            placeholder={i18next.t('输入商品名或报价单名称')}
            title={i18next.t('选择商品')}
            list={leftList}
            selectedValues={leftSelectedValues}
            onSelectValues={this.handleLeftChange}
            withFilter={this.handleSearch} // eslint-disable-line
            style={{
              width: '380px',
              height: '350px',
              overflowY: 'auto',
            }}
            renderLeafItem={this.renderLeafItem}
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
          <TransferRight
            list={selectedSkuValue}
            selected={rightSelectedValues}
            onRightChange={this.handleRightChange}
          />
        </Flex>
      </div>
    )
  }
}

Transfer.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  leftList: PropTypes.array,
  onRightListChange: PropTypes.func,
  selectedSkuValue: PropTypes.array,
  skuList: PropTypes.array,
}

export default Transfer
