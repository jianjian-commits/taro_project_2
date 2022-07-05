import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import cx from 'classnames'

class Component extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = ::this.handleClick
    this.documentClickHandler = ::this.documentClickHandler

    this.state = {
      isShow: false,
      name: this.props.prompt || '',
    }
  }

  componentDidMount() {
    window.document.addEventListener('click', this.documentClickHandler)
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', this.documentClickHandler)
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.selected,
    })
  }
  documentClickHandler(e) {
    const thisDom = ReactDOM.findDOMNode(this.selectPanel)
    if (!thisDom.contains(e.target)) {
      this.setState({
        isShow: false,
      })
    }
  }

  handleClick(e) {
    e.preventDefault()
    if (this.props.disabledClick) {
      return false
    } else {
      this.setState({
        isShow: !this.state.isShow,
      })
    }
  }

  handleSelectChange(data) {
    const name = data.name
    const value = data.value

    this.setState({
      isShow: false,
      name,
    })
    this.props.onSelectChange(data, value, this.props.name)
  }
  render() {
    const { prompt, list, disabledClick } = this.props
    const isShow = this.state.isShow
    const name = this.state.name
    return (
      <div
        className='multi-select'
        ref={(ref) => {
          this.selectPanel = ref
        }}
        style={this.props.style}
      >
        <div
          className={cx('drop', {
            disabled: disabledClick,
          })}
          onClick={this.handleClick}
        >
          {name || prompt || i18next.t('全部')}
        </div>
        {isShow ? (
          <ul className='down height'>
            <li
              onClick={this.handleSelectChange.bind(this, {
                name: prompt || i18next.t('全部'),
                value: '',
              })}
              style={{
                display: this.props.temp ? 'none' : 'block',
              }}
            >
              <span>{prompt || i18next.t('全部')}</span>
            </li>
            {_.map(list, (v, i) => {
              return (
                <li key={i} onClick={this.handleSelectChange.bind(this, v)}>
                  <span>{v.name}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          ''
        )}
      </div>
    )
  }
}

Component.propTypes = {
  list: PropTypes.array.isRequired,
  onSelectChange: PropTypes.func.isRequired,
}

export default Component
