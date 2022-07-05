import { i18next } from 'gm-i18n'
import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { moduleType } from '../enum'
import { Flex, Button } from '@gmfe/react'
import SvgAddIcon from 'svg/add_shop_module.svg'
import SvgDelIcon from 'svg/delete_shop_module.svg'

class SelectModule extends React.Component {
  constructor() {
    super()
    this.state = {
      addNext: false,
      addPre: false,
    }
  }

  stopPro = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  handleSelect = (e) => {
    this.stopPro(e)
    this.props.selectFunc(this.props.index)
    this.setState({ addNext: false, addPre: false })
  }

  handleAddModulePre = (e) => {
    this.stopPro(e)
    this.setState({ addNext: false, addPre: true })
    this.props.selectFunc(this.props.index)
  }

  handleAddModuleNext = (e) => {
    this.stopPro(e)
    this.setState({ addNext: true, addPre: false })
    this.props.selectFunc(this.props.index)
  }

  handleUp = (e) => {
    this.stopPro(e)
    this.props.onUp(this.props.sortIndex, e)
  }

  handleDown = (e) => {
    this.stopPro(e)
    this.props.onDown(this.props.sortIndex, e)
  }

  handleRemoveModule = (e) => {
    this.stopPro(e)
    this.props.onRemove(this.props.sortIndex, e)
  }

  addModule(type, e) {
    const { sortIndex, onAddModule } = this.props
    onAddModule(sortIndex, this.state.addPre, type, e)
    this.setState({ addNext: false, addPre: false })
  }

  render() {
    const { addNext, addPre } = this.state
    const {
      left,
      right,
      active,
      sortIndex,
      size,
      immovable,
      name,
      disabled,
      isNeedAdd,
      isNeedDelete,
    } = this.props
    const isAdd = addNext || addPre

    return (
      <div
        onClick={this.handleSelect}
        className={classNames('b-shop', { active })}
      >
        {
          // 操作按钮
          !immovable && !disabled && (
            <>
              {isNeedAdd && (
                <>
                  <div className='b-shop-add' onClick={this.handleAddModulePre}>
                    <SvgAddIcon />
                  </div>
                  <div
                    className='b-shop-add'
                    onClick={this.handleAddModuleNext}
                  >
                    <SvgAddIcon />
                  </div>
                </>
              )}
              {size > 1 && (
                <>
                  {isNeedDelete && (
                    <SvgDelIcon
                      className='b-diy-btn-remove-select'
                      onClick={this.handleRemoveModule}
                    />
                  )}
                  <div className='b-shop-operation'>
                    <Button disabled={sortIndex === 0} onClick={this.handleUp}>
                      ↑
                    </Button>
                    <Button
                      disabled={sortIndex === size - 1}
                      onClick={this.handleDown}
                    >
                      ↓
                    </Button>
                  </div>
                </>
              )}
            </>
          )
        }
        <div className='b-shop-mask' />
        {left}
        {active && (
          <div
            ref={(rel) => {
              this.right = rel
            }}
            className='b-shop-setting-wrap'
            style={{
              top: addPre ? -32 : addNext ? 'auto' : 0,
              bottom: addNext ? -89 : 'auto',
              width: 600,
              background: '#fafafa',
              paddingLeft: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='b-shop-name'>
              {isAdd ? i18next.t('添加模块') : name}
            </div>
            {addNext || addPre ? (
              <Flex>
                <div
                  style={{ margin: '10px 16px 10px 0' }}
                  className='b-shop-btn'
                  onClick={this.addModule.bind(this, moduleType.ad)}
                >
                  {i18next.t('广告位')}
                </div>
                <div
                  style={{ margin: '10px 16px' }}
                  className='b-shop-btn'
                  onClick={this.addModule.bind(this, moduleType.sku)}
                >
                  {i18next.t('商品组')}
                </div>
              </Flex>
            ) : (
              right
            )}
          </div>
        )}
      </div>
    )
  }
}

SelectModule.propTypes = {
  // 模块名称
  name: PropTypes.string,
  // 选择索引
  index: PropTypes.number,
  // 数据长度
  size: PropTypes.array,
  // 排序索引
  sortIndex: PropTypes.number,
  // 选中
  active: PropTypes.bool,
  // 向上
  onUp: PropTypes.func,
  // 向下
  onDown: PropTypes.func,
  // 移除
  onRemove: PropTypes.func,
  // 选择
  selectFunc: PropTypes.func,
  // 在所选模块前添加模块
  onAddModulesPre: PropTypes.func,
  // 在所选模块后添加模块
  onAddModulesNext: PropTypes.func,
  // 是否需要新增功能
  isNeedAdd: PropTypes.bool,
  // 是否需要删除功能
  isNeedDelete: PropTypes.bool,
}

SelectModule.defaultProps = {
  isNeedAdd: true,
  isNeedDelete: true,
}

export default SelectModule
