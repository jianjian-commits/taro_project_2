/*
 * @Autor: xujiahao
 * @Date: 2021-05-14 10:18:40
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-12-08 15:17:44
 * @FilePath: /gm_static_stationv2/src/js/common/components/text_to_edit.js
 */
import React from 'react'
import PropType from 'prop-types'
import classNames from 'classnames'
import { Flex } from '@gmfe/react'

class TextToEdit extends React.Component {
  constructor() {
    super()
    this.state = {
      isEditing: false,
    }
  }

  handleToEdit = () => {
    const { onEdit, canEdit } = this.props

    if (!canEdit) return

    onEdit && onEdit()
    this.setState({ isEditing: true })
  }

  handleOk = () => {
    const { onOk } = this.props
    onOk && onOk()
    this.setState({ isEditing: false })
  }

  handleCancel = () => {
    const { onCancel } = this.props
    onCancel && onCancel()
    this.setState({ isEditing: false })
  }

  render() {
    const {
      editingView,
      textView,
      canEdit,
      editBtn,
      textContainer,
      editContainer,
    } = this.props
    const { isEditing } = this.state
    const textContent = (
      <div>
        {textView}
        {canEdit &&
          (editBtn || (
            <a className='xfont xfont-edit gm-margin-left-5 gm-text gm-text-hover-primary gm-text-primary' />
          ))}
      </div>
    )
    const editContent = (
      <Flex alignCenter wrap>
        {editingView}
        <div>
          <a
            className='xfont xfont-ok gm-margin-left-5 text-primary'
            onClick={this.handleOk}
          />
          <a
            className='xfont xfont-remove gm-margin-left-5 b-color-danger'
            onClick={this.handleCancel}
          />
        </div>
      </Flex>
    )
    return isEditing ? (
      <Flex wrap alignCenter>
        {editContainer ? editContainer(editContent) : editContent}
      </Flex>
    ) : (
      <Flex
        alignCenter
        onClick={this.handleToEdit}
        className={classNames('b-hover-wrap', {
          'gm-cursor': canEdit,
        })}
      >
        {textContainer ? textContainer(textContent) : textContent}
      </Flex>
    )
  }
}

TextToEdit.propTypes = {
  editingView: PropType.node.isRequired,
  textView: PropType.element.isRequired,
  onOk: PropType.func,
  onCancel: PropType.func,
  onEdit: PropType.func,
  textContainer: PropType.func,
  editContainer: PropType.func,
  editBtn: PropType.element,
}

export default TextToEdit
