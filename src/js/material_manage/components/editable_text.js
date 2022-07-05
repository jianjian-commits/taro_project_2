import TextToEdit from '../../common/components/text_to_edit'
import React from 'react'

class EditableText extends React.Component {
  state = {
    curValue: this.props.content,
  }
  handleCancel = () => {
    this.resetState()
  }
  resetState() {
    this.setState({
      curValue: this.props.content,
    })
  }
  handleOK = () => {
    this.props.onOk(this.state.curValue)
    this.resetState()
  }
  handleChange = (e) => {
    this.setState({
      curValue: e.target.value,
    })
  }
  render() {
    const { canEdit, content, inputProps = {} } = this.props
    return (
      <TextToEdit
        {...{
          editingView: (
            <div>
              <input
                {...inputProps}
                className='form-control'
                type='text'
                value={this.state.curValue}
                onChange={this.handleChange}
              />
            </div>
          ),
          textView: <span>{content || '-'}</span>,
          canEdit,
          onOk: this.handleOK,
          onCancel: this.handleCancel,
        }}
      />
    )
  }
}
EditableText.defaultProps = {
  canEdit: true,
}
export default EditableText
