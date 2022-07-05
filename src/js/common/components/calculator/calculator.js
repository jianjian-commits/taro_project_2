import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { Button, Input, Popover } from '@gmfe/react'
import SVGLeft from 'svg/left.svg'
import SVGRight from 'svg/right.svg'
import SVGDelete from 'svg/delete.svg'
import './style.less'

class Calculator extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
  }

  state = {
    textList: [],
    index: -1,
    focus: false,
  }

  popoverRef = createRef()
  inputRef = createRef()

  componentDidMount() {
    this.init()
  }

  /**
   * 初始化后台返回的定价公式
   */
  init = () => {
    const { defaultValue = '' } = this.props
    let textList = [] // 选中的数组
    // 展开为一位数组
    const list = calculatorList.flat(Infinity).filter((item) => {
      // 用到了的 calculatorItem
      const { formula } = item
      return defaultValue.includes(formula)
    })
    list.forEach((item) => {
      const indexes = []
      let index = defaultValue.indexOf(item.formula) // 查找当前字符串实际出现位置
      while (index !== -1) {
        indexes.push(index)
        index = defaultValue.indexOf(item.formula, index + 1) // 找到则继续下一位开始找
      }
      indexes.forEach((index) => {
        textList[index] = item // 将item放回对应字符串所在的实际位置
      })
    })
    textList = textList.filter((v) => v) // 过滤掉空，因为一个字符串到下一个可能中间会有间隔
    this.setState({ textList })
  }

  /**
   * 选择计算器的词
   * @param value
   */
  handleClick = (value) => {
    const { textList, index } = this.state
    textList.splice(index + 1, 0, value)
    this.setState({ textList, index: index + 1 }, () => {
      const lengthList = this.getLengthList()
      const { index } = this.state
      this.handleChange()
      this.inputRef.current.focus()
      this.inputRef.current.setSelectionRange(
        lengthList[index],
        lengthList[index],
      )
    })
  }

  handleClose = () => {
    this.popoverRef.current.setActive(false)
  }

  /**
   * 鼠标点击输入框，获取当前光标位置
   */
  handleGetPosition = () => {
    const { selectionStart } = this.inputRef.current
    const list = this.getLengthList()
    if (selectionStart === 0) {
      this.setState({ index: -1 })
      return
    }
    if (list.length === 1) {
      this.inputRef.current.setSelectionRange(list[0], list[0])
      this.setState({ index: 0 })
    } else if (list.length > 1) {
      for (let i = 0; i < list.length - 1; i++) {
        if (selectionStart <= list[0]) {
          this.inputRef.current.setSelectionRange(list[0], list[0])
          this.setState({ index: 0 })
        } else if (selectionStart > list[i] && selectionStart <= list[i + 1]) {
          this.inputRef.current.setSelectionRange(list[i + 1], list[i + 1])
          this.setState({ index: i + 1 })
        }
      }
    }
  }

  /**
   * 获取当前已选择词的长度
   * @param textList {*[]}
   * @return {[]}
   */
  getLengthList = (textList = this.state.textList) => {
    const lengthList = []
    textList.forEach((item, index) => {
      const { text, isPriceType } = item
      let length
      const textLength = text?.length || text.toString().length
      // 当isPriceType === true的时候，为text添加{}，`{${text}}`，加上{}的长度2
      if (isPriceType) {
        length = textLength + 2
      } else {
        length = textLength
      }
      lengthList.push(index ? length + lengthList[index - 1] : length) // length+lengthList[index - 1]：表示字符串长度+数组的长度 = 总长度
    })
    return lengthList
  }

  /**
   * 订阅监听键盘左右和删除事件
   * @param event
   */
  handleSet = (event) => {
    this.handleAction(event.code, 1)
  }

  handleFocus = () => {
    this.setState({ focus: true }, () => {
      window.addEventListener('keydown', this.handleSet)
    })
  }

  handleBlur = () => {
    this.setState({ focus: false }, () => {
      window.removeEventListener('keydown', this.handleSet)
    })
  }

  handleChange = () => {
    const { textList } = this.state
    const text = textList.map((v) => this.renderText(v, true)).join('')
    const { onChange } = this.props
    onChange(text)
  }

  /**
   * @param code {'ArrowLeft'|'ArrowRight'|'Backspace'}
   * @param num {number}
   */
  handleAction = (code, num = 0) => {
    this.inputRef.current.focus()
    const { index, textList } = this.state
    const lengthList = this.getLengthList()
    if (code === 'Backspace') {
      if (index === -1) {
        return
      }
      textList.splice(index, 1)
      this.setState({ textList, index: index - 1 }, () => {
        const lengthList = this.getLengthList()
        this.handleChange()
        setTimeout(() => {
          this.inputRef.current.setSelectionRange(
            lengthList[index - 1],
            lengthList[index - 1],
          )
        })
      })
    }
    if (code === 'ArrowLeft') {
      if (index === -1) {
        return
      }
      this.inputRef.current.setSelectionRange(
        lengthList[index - 1] + num,
        lengthList[index - 1] + num,
      )
      this.setState({ index: index - 1 })
    }
    if (code === 'ArrowRight') {
      if (index === lengthList.length - 1) {
        return
      }
      this.inputRef.current.setSelectionRange(
        lengthList[index + 1] - num,
        lengthList[index + 1] - num,
      )
      this.setState({ index: index + 1 })
    }
  }

  /**
   * @param v {{text:string,formula:string}}
   * @param render {boolean?}
   * @returns {string}
   */
  renderText = (v, render) => {
    const { text, formula, isPriceType } = v
    let showText = ''
    if (isPriceType) {
      showText = `{${text}}`
    } else {
      showText = text
    }
    return render ? formula : showText
  }

  render() {
    const { textList } = this.state
    return (
      <Popover
        ref={this.popoverRef}
        popup={
          <CalculatorPanel
            onClick={this.handleClick}
            onClose={this.handleClose}
            onAction={this.handleAction}
          />
        }
        isInPopup
      >
        <Input
          ref={this.inputRef}
          className='form-control'
          onClick={this.handleGetPosition}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          value={textList.map((v) => this.renderText(v)).join('')}
        />
      </Popover>
    )
  }
}

export default Calculator

const calculatorList = [
  [
    { text: t('现单价'), formula: '{sale_price}', isPriceType: true },
    {
      text: t('供应商最近询价'),
      formula: '{last_quote_price}',
      isPriceType: true,
    },
    {
      text: t('供应商最近采购价'),
      formula: '{last_purchase_price}',
      isPriceType: true,
    },
    {
      text: t('供应商最近入库价'),
      formula: '{last_in_stock_price}',
      isPriceType: true,
    },
  ],

  [
    { text: t('库存均价'), formula: '{stock_avg_price}', isPriceType: true },
    { text: t('最近询价'), formula: '{latest_quote_price}', isPriceType: true },
    {
      text: t('最近入库价'),
      formula: '{latest_in_stock_price}',
      isPriceType: true,
    },
    {
      text: t('最近采购价'),
      formula: '{latest_purchase_price}',
      isPriceType: true,
    },
  ],
  [
    {
      text: t('供应商周期报价'),
      formula: '{supplier_cycle_quote}',
      isPriceType: true,
    },
  ],

  [
    { text: 7, formula: '7', large: true },
    { text: 8, formula: '8', large: true },
    { text: 9, formula: '9', large: true },
    { text: '+', formula: '+', large: true },
  ],

  [
    { text: 4, formula: '4', large: true },
    { text: 5, formula: '5', large: true },
    { text: 6, formula: '6', large: true },
    { text: '-', formula: '-', large: true },
  ],

  [
    { text: 1, formula: '1', large: true },
    { text: 2, formula: '2', large: true },
    { text: 3, formula: '3', large: true },
    { text: '×', formula: '*', large: true },
  ],

  [
    { text: 0, formula: '0', large: true },
    { text: '(', formula: '(', large: true },
    { text: ')', formula: ')', large: true },
    { text: '÷', formula: '/', large: true },
  ],

  [
    { text: '.', formula: '.', large: true },
    { text: <SVGLeft />, large: true, actionType: 'ArrowLeft' },
    { text: <SVGRight />, large: true, actionType: 'ArrowRight' },
    { text: <SVGDelete />, large: true, actionType: 'Backspace' },
  ],
]

const CalculatorPanel = ({ onClick, onClose, onAction }) => {
  return (
    <table className='b-calculator'>
      <tbody>
        {calculatorList.map((row, index) => (
          <tr key={index}>
            {row.map((td, subIndex) => {
              const { actionType } = td
              return (
                <td
                  colSpan={4 / row.length}
                  key={subIndex}
                  onClick={() =>
                    actionType ? onAction(actionType) : onClick(td)
                  }
                  className={classNames({ large: td.large })}
                >
                  {td.text}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
      <tfoot aria-colspan={0}>
        <tr>
          <td colSpan={4}>
            <Button block type='primary' onClick={onClose}>
              {t('完成')}
            </Button>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

CalculatorPanel.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
}
