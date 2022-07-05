import React from 'react'
import { Flex, Tree, Button } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

class GroupTransfer extends React.Component {
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
    const { onToRightClick } = this.props
    const { leftSelectedValues } = this.state
    onToRightClick(leftSelectedValues)
    this.setState({
      leftSelectedValues: [],
      rightSelectedValues: [],
    })
  }

  handleToLeftClick = () => {
    const { onToLeftClick } = this.props
    const { rightSelectedValues } = this.state
    onToLeftClick(rightSelectedValues)
    this.setState({
      leftSelectedValues: [],
      rightSelectedValues: [],
    })
  }

  render() {
    const {
      className,
      style,
      onLeafItemRender,
      leftTree,
      rightTree,
      onSearch,
    } = this.props

    const { leftPlaceholder, leftTitle, leftList } = leftTree
    const { rightPlaceholder, rightTitle, rightList } = rightTree
    const { leftSelectedValues, rightSelectedValues } = this.state

    return (
      <div
        style={style}
        className={classNames(
          'gm-transfer gm-transfer-group gm-margin-left-10',
          className
        )}
      >
        <Flex>
          <Tree
            placeholder={leftPlaceholder}
            title={leftTitle}
            list={leftList}
            selectedValues={leftSelectedValues.slice()}
            onSelectValues={this.handleLeftChange}
            withFilter={onSearch}
            style={{
              width: '380px',
              height: '350px',
              overflowY: 'auto',
            }}
            renderLeafItem={onLeafItemRender}
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
          <Tree
            placeholder={rightPlaceholder}
            title={rightTitle}
            list={rightList}
            selectedValues={rightSelectedValues.slice()}
            onSelectValues={this.handleRightChange}
            withFilter={onSearch}
            style={{
              width: '380px',
              height: '350px',
              overflowY: 'auto',
            }}
            renderLeafItem={onLeafItemRender}
          />
        </Flex>
      </div>
    )
  }
}

GroupTransfer.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  onToRightClick: PropTypes.func,
  onToLeftClick: PropTypes.func,
  leftTree: PropTypes.object,
  rightTree: PropTypes.object,
  onLeafItemRender: PropTypes.func,
  onSearch: PropTypes.func,
}

export default GroupTransfer
