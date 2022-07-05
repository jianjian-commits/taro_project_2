import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { Button, Flex, Input, Tip } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'

class Position extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    tableRef: PropTypes.object,
    list: PropTypes.array,
    onHighlight: PropTypes.func,
    btnText: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    filterText: PropTypes.array,
  }

  static defaultProps = {
    placeholder: t('请输入'),
    list: [],
    filterText: [],
  }

  _inputRef = createRef()

  state = {
    word: '',
    index: null,
    indexes: [],
    isFind: false,
  }

  handleSearch = () => {
    const { word } = this.state
    if (!word) {
      Tip.warning(t('请输入'))
      return
    }
    const { list, onHighlight, filterText } = this.props
    const indexes = []
    const lists = []
    filterText.forEach((item) => {
      lists.push(pinYinFilter(list, word, (v) => v[item]))
    })
    let union = []
    lists.forEach((item) => {
      union = union.concat(item.filter((v) => !union.includes(v))) // 取并集
    })
    union.forEach((item) => {
      indexes.push(list.findIndex((v) => v === item))
    })

    if (!indexes.length) {
      Tip.warning(t('没有找到'))
      onHighlight()
      return
    }
    this.setState({ indexes }, () => {
      this.handleNext()
      this._inputRef.current.blur()
      this._inputRef.current.focus()
    })
  }

  handleNext = () => {
    const { index, indexes } = this.state
    const { tableRef, onHighlight } = this.props
    if (!indexes.length) {
      Tip.warning(t('没有找到'))
      return
    }

    if (index + 1 > indexes.length) {
      this.setState({ index: 1 }, () => {
        tableRef.current.scrollToItem(indexes[0], 'start')
        onHighlight(indexes[0])
      })
    } else {
      this.setState({ index: index + 1 }, () => {
        tableRef.current.scrollToItem(indexes[index], 'start')
        onHighlight(indexes[index])
      })
    }
  }

  handlePrev = () => {
    const { indexes, index } = this.state
    const { tableRef, onHighlight } = this.props
    if (index - 1 === 0) {
      this.setState({ index: indexes.length }, () => {
        tableRef.current.scrollToItem(indexes[indexes.length - 1], 'start')
        onHighlight(indexes[indexes.length - 1])
      })
    } else {
      this.setState({ index: index - 1 }, () => {
        const { index } = this.state
        tableRef.current.scrollToItem(indexes[index - 1], 'start')
        onHighlight(indexes[index - 1])
      })
    }
  }

  handleClickEnter = (event) => {
    const { code } = event
    if (code === 'Enter') {
      this.handleSearch()
    }
  }

  handleSet = (event) => {
    const { code } = event
    if (code === 'ArrowDown') {
      this.handleNext()
    }
    if (code === 'ArrowUp') {
      this.handlePrev()
    }
  }

  handleFocus = () => {
    window.addEventListener('keydown', this.handleClickEnter)
    window.addEventListener('keydown', this.handleSet)
  }

  handleBlur = () => {
    window.removeEventListener('keydown', this.handleClickEnter)
    window.removeEventListener('keydown', this.handleSet)
  }

  handleChange = (event) => {
    this.setState({
      word: event.target.value,
      index: 0,
      indexes: [],
    })
    window.removeEventListener('keydown', this.handleSet)
    const { onHighlight } = this.props
    onHighlight()
  }

  render() {
    const { btnText, placeholder, className, style } = this.props
    const { word, index, indexes } = this.state
    return (
      <Flex className={classNames(className)}>
        <Flex>
          <Input
            ref={this._inputRef}
            placeholder={placeholder}
            onChange={this.handleChange}
            value={word}
            style={style}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            className='form-control'
          />
          <Button type='primary' onClick={this.handleSearch}>
            {btnText || t('定位')}
          </Button>
        </Flex>
        {indexes.length > 0 && (
          <Flex style={{ height: '30px', lineHeight: '30px' }}>
            <span className='gm-padding-lr-10 gm-text-desc'>|</span>
            <span>{t('当前：')}</span>
            <span className='gm-text-primary gm-text-bold'>{index}</span>
            <span className='gm-padding-lr-10 gm-text-desc'>|</span>
            <span>{t('共有：')}</span>
            <span className='gm-text-primary gm-text-bold'>
              {indexes.length}
            </span>
          </Flex>
        )}
      </Flex>
    )
  }
}

export default Position
