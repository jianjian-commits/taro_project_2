import React from 'react'
import { i18next } from 'gm-i18n'
import { Flex, Uploader } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { SvgMinusCircle } from 'gm-svg'
class Icon extends React.Component {
  handleDeleteIcon = (e) => {
    this.props.onDeleteIcon(e)
  }

  render() {
    const {
      data,
      selected,
      showDefaultText,
      showHoverSettingText,
      showHoverDelete,
      ...rest
    } = this.props
    const justifyClassNameBool =
      showHoverSettingText || showDefaultText || showHoverDelete
    return (
      <Flex
        alignEnd
        width={'60px'}
        {...rest}
        style={{ position: showHoverDelete ? 'relative' : 'inherit' }}
        className={classNames({
          'b-merchandise-cate-manage-icon-hover-event':
            showHoverSettingText || showHoverDelete,
        })}
      >
        <img
          src={data.url}
          className={classNames(
            { 'b-merchandise-cate-manage-icon': !justifyClassNameBool },
            {
              'b-merchandise-cate-manage-icon-add-hover': justifyClassNameBool,
            },
            {
              'b-merchandise-cate-manage-icon-selected':
                selected && !justifyClassNameBool,
            }
          )}
        />
        {showDefaultText && (
          <span className='b-merchandise-cate-manage-icon-text'>
            {i18next.t('默认图标')}
          </span>
        )}
        {showHoverSettingText && (
          <span className='b-merchandise-cate-manage-icon-text b-merchandise-cate-manage-icon-setting-text'>
            {i18next.t('设为默认')}
          </span>
        )}
        {showHoverDelete && (
          <span
            className='b-merchandie-cate-manage-icon-del-svg b-merchandise-cate-manage-icon-setting-text'
            onClick={this.handleDeleteIcon}
          >
            <SvgMinusCircle className='b-merchandie-cate-manage-icon-del-svg-path' />
          </span>
        )}
      </Flex>
    )
  }
}

class IconsList extends React.Component {
  constructor(props) {
    super(props)
    this.renderIcons = ::this.renderIcons
  }

  handleChooseIcon(icon) {
    this.props.onChooseIcon(icon)
  }

  handleIconDelete = (icon) => {
    this.props.onIconHoverDelete(icon)
  }

  handleIconUpload = (e) => {
    this.props.onIconUpload(e)
  }

  renderIcons() {
    const {
      iconList,
      iconSelected,
      noSelected,
      showIconDefaultText,
      showIconHoverSettingText,
      showIconHoverDelete,
    } = this.props
    return _.map(iconList, (icon, index) => {
      return (
        <>
          <Icon
            data={icon}
            key={index}
            onClick={noSelected ? null : this.handleChooseIcon.bind(this, icon)}
            selected={noSelected ? null : icon.id === iconSelected}
            showDefaultText={
              noSelected
                ? null
                : icon.id === iconSelected && showIconDefaultText
            }
            showHoverSettingText={showIconHoverSettingText}
            showHoverDelete={showIconHoverDelete}
            onDeleteIcon={this.handleIconDelete}
            onMouseOver={this.handleTempIconValue}
          />
        </>
      )
    })
  }

  renderIconsUploader() {
    return (
      <Flex>
        <Uploader multiple accept='image/*' onUpload={this.handleIconUpload}>
          <Flex
            justifyCenter
            alignCenter
            class
            className='b-merchandise-icon-uploader-add-style'
          >
            <div className='sku-detail-logo b-merchandise-sku-detail-logo-add-style'>
              <span className='sku-detail-logo-img sku-detail-default-plus b-merchandise-sku-detail-default-plus-add-style'>
                +
              </span>
            </div>
          </Flex>
        </Uploader>
      </Flex>
    )
  }

  render() {
    return (
      <Flex alignCenter wrap justifyCenter>
        {this.renderIcons()}
        {this.props.showIconUploader && this.renderIconsUploader()}
      </Flex>
    )
  }
}

IconsList.propTypes = {
  iconList: PropTypes.array,
  iconSelected: PropTypes.num,
  onChooseIcon: PropTypes.func,
  noSelected: PropTypes.bool,
  /* 是否展示 '默认图标' 字样 */
  showIconDefaultText: PropTypes.bool,
  /* 是否展示 '设为默认' 字样 */
  showIconHoverSettingText: PropTypes.bool,
  /* 是否展示 '删除图标'  */
  showIconHoverDelete: PropTypes.bool,
  /* 是否展示 '上传图标' */
  showIconUploader: PropTypes.bool,
  /* 上传图标触发的事件 */
  onIconUpload: PropTypes.func,
  /* 图标删除触发的事件 */
  onIconHoverDelete: PropTypes.func,
}

IconsList.defaultProps = {
  iconList: [],
  iconSelected: null,
  noSelected: true,
  onChooseIcon: null,
  showIconDefaultText: false,
  showIconHoverSettingText: false,
  showIconHoverDelete: false,
  showIconUploader: false,
}

export default IconsList
