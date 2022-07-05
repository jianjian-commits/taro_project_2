import React from 'react'
import classNames from 'classnames'

class TechnologyCard extends React.Component {
  handleSetting() {
    this.props.onSettingClick && this.props.onSettingClick(this.props.detail)
  }

  handleDelete() {
    const id = this.props.detail.id
    this.props.onDeleteClick && this.props.onDeleteClick(id)
  }

  handleSort(direction) {
    this.props.onSort && this.props.onSort(this.props.index, direction)
  }

  render() {
    const { first, last, detail } = this.props
    const { name } = detail

    return (
      <div className='menu-card'>
        <div
          className={classNames('card-head', {
            'merchandise-input-tips-wrap': name.length > 14,
          })}
        >
          <span>{name}</span>
          <i
            className='xfont xfont-delete gm-cursor gm-margin-left-5'
            onClick={::this.handleDelete}
          />
          <i
            className='xfont xfont-setting gm-cursor gm-margin-left-5'
            onClick={::this.handleSetting}
          />
          {!last ? (
            <i
              className='xfont xfont-right gm-margin-left-5'
              onClick={this.handleSort.bind(this, 'after')}
            />
          ) : null}
          {!first ? (
            <i
              className='xfont xfont-left'
              onClick={this.handleSort.bind(this, 'before')}
            />
          ) : null}
        </div>
        <ul className='card-ul'>{this.props.children}</ul>
      </div>
    )
  }
}
class CardRow extends React.Component {
  render() {
    const { name, content } = this.props

    const desc =
      String(content).length > 36
        ? String(content).slice(0, 36) + '...'
        : content

    return (
      <li className='card-li'>
        <span className='name'>{name}</span>
        <span className='content'>{desc}</span>
      </li>
    )
  }
}

Object.assign(TechnologyCard, { CardRow })

export default TechnologyCard
