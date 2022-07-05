import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Popover, Flex, List } from '@gmfe/react'
import _ from 'lodash'
import SVGMore from 'svg/more.svg'
import Label from './sale_card_label'

@observer
class SaleCard extends React.Component {
  popover = React.createRef(null)

  handleClick = () => {
    const id = this.props.id
    const title = this.props.title || ''
    this.props.onClick && this.props.onClick(id, title)
  }

  renderPopup = () => {
    const {
      menuPermission,
      onDelete,
      onShare,
      onSettingClick,
      onPrint,
      onImage,
    } = this.props
    const menu = [
      {
        key: 'share',
        name: i18next.t('分享'),
        handle: onShare,
        display: menuPermission.share,
      },
      {
        key: 'print',
        name: i18next.t('打印'),
        handle: onPrint,
        display: menuPermission.print,
      },
      {
        key: 'image',
        name: i18next.t('图片'),
        handle: onImage,
        display: menuPermission.image,
      },
      {
        key: 'setting',
        name: i18next.t('设置'),
        handle: onSettingClick,
        display: menuPermission.edit,
      },
      {
        key: 'delete',
        name: i18next.t('删除'),
        handle: onDelete,
        display: menuPermission.delete,
      },
    ]

    const listData = _.map(menu, (v, i) => {
      if (!v.display) return null
      return { value: i, text: v.name }
    })

    const handleSelect = (value) => {
      const id = this.props.id
      this.popover.current.setActive(false)
      menu[value].handle(id)
    }

    return (
      <List
        data={listData.filter((_) => _)}
        onSelect={handleSelect}
        className='gm-border-0 b-salemenu-more'
      />
    )
  }

  render() {
    const { title, disabled, labels } = this.props

    return (
      <div
        className={classNames('b-salemenu-card', {
          'b-salemenu-disabled': disabled,
        })}
        onClick={this.handleClick}
      >
        <div
          className={classNames('b-card-header', {
            'merchandise-input-tips-wrap': title.length > 14,
            'b-disabled': disabled,
          })}
        >
          <Flex flex column>
            <Flex>
              <Flex>
                {_.map(labels, (label) => (
                  <Label text={label} />
                ))}
              </Flex>
              <Flex flex justifyEnd>
                <Popover
                  ref={this.popover}
                  right
                  showArrow
                  type='hover'
                  popup={this.renderPopup()}
                >
                  <div className='gm-padding-top-5 b-card-info'>
                    <SVGMore className='gm-text-16' />
                  </div>
                </Popover>
              </Flex>
            </Flex>
            <Flex className='gm-text-14 b-card-title'>
              {title || i18next.t('报价单')}
            </Flex>
          </Flex>
          <div
            className='merchandise-input-tips'
            style={{
              marginBottom: '1rem',
            }}
          >
            {title}
          </div>
        </div>
        <ul className='b-card-ul'>{this.props.children}</ul>
      </div>
    )
  }
}
class CardRow extends React.Component {
  render() {
    let { name, content } = this.props
    content =
      String(content).length > 36
        ? String(content).slice(0, 36) + '...'
        : content
    return (
      <li className='b-card-li'>
        <span>{name}：</span>
        <span>{content}</span>
      </li>
    )
  }
}

CardRow.propTypes = {
  content: PropTypes.string,
  name: PropTypes.string,
}

SaleCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  menuPermission: PropTypes.object,
  onDelete: PropTypes.func,
  onShare: PropTypes.func,
  onSettingClick: PropTypes.func,
  onPrint: PropTypes.func,
  onImage: PropTypes.func,
  disabled: PropTypes.bool,
  labels: PropTypes.array,
}

export { SaleCard, CardRow }
