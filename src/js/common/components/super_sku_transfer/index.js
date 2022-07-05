import React from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Flex, Tree, Button } from '@gmfe/react'
import classNames from 'classnames'
import TransferRight from './right'
import { getFlat, filterGroupList } from './util'
import Box from './box'

class superSkuTransfer extends React.Component {
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

  handleToClick = (isLeft) => {
    const { onSelect, selectedValues } = this.props
    const { leftSelectedValues, rightSelectedValues } = this.state

    onSelect(
      _.xor(selectedValues, isLeft ? rightSelectedValues : leftSelectedValues)
    )

    this.setState({
      leftSelectedValues: [],
      rightSelectedValues: [],
    })
  }

  handleToRightClick = () => {
    this.handleToClick(false)
  }

  handleToLeftClick = () => {
    this.handleToClick(true)
  }

  render() {
    const {
      skuList,
      combineSkuList,
      selectedValues,
      listStyle,

      leftTitle,
      leftWithFilter,
      leftPlaceHolder,

      onSelect, // eslint-disable-line
      className,
      skuType,
      ...rest
    } = this.props

    const { leftSelectedValues, rightSelectedValues } = this.state

    let leftList = []
    if (skuType === 1) {
      leftList = filterGroupList(skuList, (v) => {
        return !_.includes(selectedValues, v.value)
      })
    } else {
      leftList = _.filter(
        combineSkuList,
        (v) => !_.includes(selectedValues, v.value)
      )
    }

    // 组合商品和普通商品 都展示在右边
    const rightList = _.filter([...getFlat(skuList), ...combineSkuList], (v) =>
      _.includes(selectedValues, v.value)
    )

    return (
      <div
        {...rest}
        className={classNames('gm-transfer gm-transfer-group', className)}
      >
        <Flex>
          {skuType === 1 ? (
            <Tree
              title={leftTitle}
              list={leftList}
              selectedValues={leftSelectedValues}
              onSelectValues={this.handleLeftChange}
              withFilter={leftWithFilter}
              placeholder={leftPlaceHolder}
              style={listStyle}
            />
          ) : (
            <Box
              list={leftList}
              selectedValues={leftSelectedValues}
              onSelect={this.handleLeftChange}
              title={leftTitle}
              style={listStyle}
              withFilter={leftWithFilter}
              placeholder={leftPlaceHolder}
            />
          )}
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
            list={rightList}
            selected={rightSelectedValues}
            onRightChange={this.handleRightChange}
          />
        </Flex>
      </div>
    )
  }
}

superSkuTransfer.propTypes = {
  skuType: PropTypes.oneOf([1, 2]),
  skuList: PropTypes.array.isRequired,
  combineSkuList: PropTypes.array.isRequired,
  selectedValues: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,

  listStyle: PropTypes.object,

  leftTitle: PropTypes.string,
  leftWithFilter: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  leftPlaceHolder: PropTypes.string,

  className: PropTypes.string,
  style: PropTypes.object,
}

superSkuTransfer.defaultProps = {
  listStyle: {
    width: '380px',
    height: '350px',
  },

  leftTitle: t('待选择'),
  leftWithFilter: true,
  leftPlaceHolder: t('搜索'),
}

export default superSkuTransfer
