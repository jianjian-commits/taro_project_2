import { i18next } from 'gm-i18n'
import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import cx from 'classnames'

class Option extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = ::this.handleClick
  }

  handleClick() {
    const { id, name } = this.props

    this.props.onOptionClick && this.props.onOptionClick(id, name)
  }

  render() {
    const { name, className } = this.props
    return (
      <div className={'drop-item ' + className} onClick={this.handleClick}>
        {name}
      </div>
    )
  }
}

class Select extends React.Component {
  static idToName(list, id) {
    const ret = _.filter(list, (v) => v.id === id)
    return ret[0] && ret[0].name
  }
  static listFilterId(list, id) {
    return _.filter(list, (v) => v.id !== id)
  }
  constructor(props) {
    super(props)
    this.handleClick = ::this.handleClick
    this.documentClickHandler = ::this.documentClickHandler
    this.handleOptionClick = ::this.handleOptionClick

    this.state = {
      showSelect: this.props.showSelect || false,
    }
  }
  componentDidMount() {
    window.document.addEventListener('click', this.documentClickHandler)
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', this.documentClickHandler)
  }
  documentClickHandler(e) {
    const thisDom = ReactDOM.findDOMNode(this.selectPanel)
    if (!thisDom.contains(e.target)) {
      this.setState({
        showSelect: false,
      })
    }
  }

  handleClick(e) {
    e.stopPropagation()
    this.setState({
      showSelect: true,
    })
  }
  handleOptionClick(id) {
    const name = this.props.name
    this.setState({
      showSelect: false,
    })
    this.props.onSelectChange && this.props.onSelectChange(id, name)
  }
  render() {
    const {
      prompt,
      list,
      children,
      selectedId,
      disabled,
      className,
      short,
    } = this.props
    return (
      <div
        className={cx('default-select', {
          short: short,
        })}
        ref={(ref) => {
          this.selectPanel = ref
        }}
      >
        <div
          className={cx(className, 'select-name', {
            disabled: disabled,
          })}
          onClick={disabled ? () => {} : this.handleClick}
        >
          {Select.idToName(list, selectedId) ||
            prompt ||
            i18next.t('请选择...')}
        </div>
        {this.state.showSelect ? (
          <div className='select-drop'>
            {_.map(Select.listFilterId(list, selectedId), (v, i) => (
              <Option
                className='default'
                key={i + v.id}
                id={v.id}
                name={v.name}
                onOptionClick={this.handleOptionClick}
              />
            ))}
            {children}
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

export { Select, Option }
