import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'

const doFilter = (list, query) =>
  pinYinFilter(list, query, (value) => value.name)

class Component extends React.Component {
  static toIds(arr) {
    return _.map(arr, (v) => v.id)
  }
  static filterToArr(ids, list) {
    return _.filter(list, (v) => _.findIndex(ids, (id) => id === v.id) >= 0)
  }
  static namesJoin(selected) {
    const LIMIT = 6
    let ret = _.map(selected, (v) => {
      return v.name
    })
    return ret.join(',').length > LIMIT
      ? ret.join(',').substr(0, LIMIT) + '...'
      : ret.join(',')
  }
  constructor(props) {
    super(props)
    this.handleClick = ::this.handleClick
    this.documentClickHandler = ::this.documentClickHandler
    this.handleSearchInput = ::this.handleSearchInput

    this.state = {
      isShow: false,
      selected: this.props.selected || [],
      prompt: this.props.prompt || i18next.t('全部分类'),
      searchInput: '',

      ids: [],
      names: [this.props.prompt || i18next.t('全部分类')],
      list: this.props.list || [],
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.list.length === this.state.list.length) {
      this.setState({
        selected: nextProps.selected,
        list: nextProps.list,
      })
    } else {
      this.setState({
        selected: nextProps.selected,
      })
    }
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', this.documentClickHandler)
  }

  componentDidMount() {
    window.document.addEventListener('click', this.documentClickHandler)
  }
  documentClickHandler(e) {
    const thisDom = ReactDOM.findDOMNode(this.selectPanel)
    if (!thisDom.contains(e.target)) {
      this.setState({
        isShow: false,
      })
    }
  }
  handleSearchInput(e) {
    e.preventDefault()
    const value = e.target.value.trim()
    const filter = doFilter(this.props.list, value)
    this.setState({
      list: filter,
      searchInput: value,
    })
  }
  handleClick(e) {
    e.preventDefault()
    this.setState({
      isShow: !this.state.isShow,
      selected: this.props.selected,
      searchInput: '',
      list: this.props.list,
    })
  }
  handleCheckboxChange(data, e) {
    let id = e.target.id
    let checked = e.target.checked
    let list = this.props.list
    let selected = this.state.selected

    if (id === 'all') {
      selected = checked ? list : []
    } else {
      if (checked) {
        selected.push(data)
      } else {
        selected = _.without(selected, data)
      }
    }
    this.setState({
      selected,
    })
    this.props.onSelectChange(selected)
  }
  handleItemDelete() {}
  render() {
    const { name, prompt } = this.props
    const isShow = this.state.isShow
    const selected = this.state.selected
    const list = this.state.list

    let isCheckedAll = false
    let ellipsis = Component.namesJoin(selected)

    if (selected.length === 0) {
      isCheckedAll = false
      ellipsis = this.props.prompt || i18next.t('全部分类')
    } else if (selected.length === this.props.list.length) {
      isCheckedAll = true
      ellipsis = this.props.prompt || i18next.t('全部分类')
    }
    return (
      <div
        className='multi-select'
        ref={(ref) => {
          this.selectPanel = ref
        }}
      >
        <div
          className={classNames('drop', {
            'merchandise-input-tips-wrap':
              selected.length >= 1 && selected.length < this.props.list.length,
          })}
          onClick={this.handleClick}
        >
          {ellipsis || prompt || i18next.t('全部分类')}
          <div className='merchandise-select-tips'>
            {_.map(this.state.selected, (v) => (
              <span onClick={this.handleItemDelete.bind(this, v.id)}>
                {v.name}
              </span>
            ))}
          </div>
        </div>

        {isShow ? (
          <div className='down'>
            <div className='search-li-input'>
              <input
                type='text'
                value={this.state.searchInput}
                onChange={this.handleSearchInput}
                autoFocus='true'
              />
              <i className='glyphicon glyphicon-search' />
            </div>
            <ul className='down-scroll'>
              {list.length === 0 ? (
                <li className='empty'>
                  <input name={name} style={{ display: 'none' }} />
                  <label>{i18next.t('空')}</label>
                </li>
              ) : this.state.searchInput ? (
                ''
              ) : (
                <li>
                  <label htmlFor='all'>
                    <input
                      name={name}
                      checked={isCheckedAll}
                      type='checkbox'
                      id='all'
                      onChange={this.handleCheckboxChange.bind(this, prompt)}
                    />
                    {prompt || i18next.t('全部分类')}
                  </label>
                </li>
              )}
              {_.map(list, (v, i) => {
                let isChecked =
                  _.findIndex(selected, (has) => has.id === v.id) >= 0
                return (
                  <li key={i} className={v.id}>
                    <label htmlFor={v.id}>
                      <input
                        checked={isChecked}
                        name={name}
                        type='checkbox'
                        id={v.id}
                        onChange={this.handleCheckboxChange.bind(this, v)}
                      />
                      {v.name}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
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
  selected: PropTypes.array.isRequired,
}

export default Component
