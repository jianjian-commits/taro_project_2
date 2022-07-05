import React from 'react'
import { Loading } from '@gmfe/react'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'
import { emptyTip } from './util'
import { t } from 'gm-i18n'
import '../../../../common/components/tree_list/tree_list.less'

class CategoriesList extends React.Component {
  constructor() {
    super()
    this.state = {
      list: [],
      inputValue: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    const list = nextProps.list || []
    const value = this.state.inputValue
    const updatedList = pinYinFilter(list, value, (v) => v.name)
    this.setState({
      list: updatedList,
    })
  }

  handleTextClick = (v) => {
    const { onTextClick } = this.props
    onTextClick && onTextClick(v)
  }

  handleItemChange = (v, e) => {
    e.stopPropagation()
    const { onItemChange } = this.props
    const isSelected = e.target.checked
    onItemChange && onItemChange(v, isSelected)
  }

  handleInputChange = (e) => {
    const value = e.target.value
    const { list } = this.props

    const updatedList = pinYinFilter(list, value, (v) => v.name)

    this.setState({
      list: updatedList,
      inputValue: value,
    })
  }

  render() {
    const {
      title,
      selectedList,
      loading,
      activeIdList,
      placeHolder,
      index,
      showType,
    } = this.props
    const { list, inputValue } = this.state

    return (
      <div className='cleafix batch-list'>
        <div className='list-head'>
          <span>{title}</span>
        </div>
        <div className='item-wrap clearfix'>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <Loading size={30} style={{ margin: '20px 0' }} />
            </div>
          ) : (
            <div>
              <div className='item-search'>
                <input
                  className='form-control input-sm'
                  type='text'
                  onChange={this.handleInputChange}
                  placeholder={placeHolder}
                  value={inputValue}
                />
              </div>
              {list.length === 0 ? (
                <div className='item-empty'>{emptyTip(index)}</div>
              ) : (
                <ul className='item-ul'>
                  {_.map(list, (v) => (
                    <li
                      className={_.includes(activeIdList, v.id) ? 'active' : ''}
                      key={v.id}
                      onClick={this.handleTextClick.bind(this, v)}
                    >
                      <span>
                        {v.name}
                        {!showType && (
                          <span
                            className='tree-station'
                            style={{
                              display: 'inline',
                              padding: '0px  1px',
                              marginLeft: '10px',
                            }}
                          >
                            {v.station_id ? t('本站') : t('通用')}
                          </span>
                        )}
                      </span>
                      <input
                        type='checkbox'
                        checked={_.includes(selectedList, v.id)}
                        onChange={this.handleItemChange.bind(this, v)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default CategoriesList
