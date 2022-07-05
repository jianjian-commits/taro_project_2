import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import { moduleType, createModule } from '../enum'

class SelectModuleList extends React.Component {
  constructor() {
    super()
    this.state = {
      currentIndex: 0,
    }
  }

  componentDidMount() {
    SelectModuleList.externalSetActive = (index) => {
      this.setActive(index, true)
    }
    SelectModuleList.externalSetGap = (index) => {
      this.setGap(index)
    }
  }

  handleUp = (index, e) => {
    e.preventDefault()
    const { list, onChange, sortSkip } = this.props
    list.splice(index - 1, 0, list.splice(index, 1)[0])
    onChange(list)
    setTimeout(() => this.setActive(index + sortSkip - 1), 0)
  }

  handleRemove = (index) => {
    const { list, onChange, sortSkip } = this.props
    if (list.length > 1) {
      if (list[index].category === moduleType.ad) {
        Dialog.confirm({
          children: i18next.t(
            '删除后，广告位内添加的图片将一并删除，确定删除吗？'
          ),
        }).then(() => {
          list.splice(index, 1)
          onChange(list)
          setTimeout(() => this.setActive(index + sortSkip), 0)
        })
      } else {
        list.splice(index, 1)
        onChange(list)
        setTimeout(() => this.setActive(index + sortSkip), 0)
      }
    }
  }

  handleDown = (index, e) => {
    e.preventDefault()
    const { list, onChange, sortSkip } = this.props
    list.splice(index + 1, 0, list.splice(index, 1)[0])
    onChange(list)
    setTimeout(() => this.setActive(index + sortSkip + 1), 0)
  }

  addModule = (index, pre, type, e) => {
    e.preventDefault()
    const { list, onChange, sortSkip } = this.props
    const i = pre ? index : index + 1
    list.splice(i, 0, createModule(type))
    onChange(list)
    setTimeout(() => this.setActive(i + sortSkip), 0)
  }

  setActive = (index, scroll = false) => {
    this.setState({ currentIndex: index }, () => {
      this.setGap(index)
      if (scroll) {
        const dom = ReactDOM.findDOMNode(this[`item_${index}`])
        dom && dom.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    })
  }

  // 由于 right 定位可能遮盖保存按钮，检测如果超过 给父元素设置 paddingBottom
  // 多处用到异步操作显隐切换，利用setTimeout保证DOM更新完成
  setGap = (index) => {
    setTimeout(() => {
      const { setGap } = this.props
      const right = this[`item_${index}`].right
      const rightData = (right && right.getBoundingClientRect()) || {}
      const listData = (this.list && this.list.getBoundingClientRect()) || {}
      const gap = rightData.bottom - listData.bottom - 40
      gap > 0 ? setGap(gap) : setGap(0)
    }, 0)
  }

  render() {
    const { children, sortSkip, list, disabled } = this.props
    const { currentIndex } = this.state

    return (
      <div
        className='b-shop-list'
        style={{ background: '#fafafa' }}
        ref={(rel) => {
          this.list = rel
        }}
      >
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            index,
            disabled,
            size: list.length,
            ref: (rel) => {
              this[`item_${index}`] = rel
            },
            sortIndex: index - sortSkip,
            active: currentIndex === index,
            onUp: this.handleUp,
            onDown: this.handleDown,
            selectFunc: this.setActive,
            onRemove: this.handleRemove,
            onAddModule: this.addModule,
          })
        })}
      </div>
    )
  }
}

SelectModuleList.externalSetActive = null

SelectModuleList.externalSetGap = null

SelectModuleList.propTypes = {
  // 从第几个开始排序
  sortSkip: PropTypes.number,
  // 数据源
  list: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  // 数据修改后
  onChange: PropTypes.func,
  setGap: PropTypes.func,
  disabled: PropTypes.bool,
}

SelectModuleList.defaultProps = {
  list: [],
  onChange: () => {},
}

export default SelectModuleList
