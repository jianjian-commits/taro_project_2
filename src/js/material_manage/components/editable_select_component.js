import React from 'react'
import TextToEdit from '../../common/components/text_to_edit'
class EditableSelectComponent extends React.Component {
  state = {
    selected: this.props.initialSelected,
  }
  handleSelect = (selected) => {
    this.setState({
      selected,
    })
  }
  resetState() {
    this.setState({
      selected: this.props.initialSelected,
    })
  }
  handleCancel = () => {
    this.resetState()
  }
  handleOK = () => {
    let { selected } = this.state
    this.props.onOK(selected)
    this.resetState()
  }
  render() {
    let { canEdit, text, SelectComponent } = this.props
    let { selected } = this.state

    return (
      <TextToEdit
        {...{
          editingView: (
            <div>
              <SelectComponent
                selected={selected}
                onSelect={this.handleSelect}
              />
            </div>
          ),
          textView: text,
          canEdit,
          onOk: this.handleOK,
          onCancel: this.handleCancel,
        }}
      />
    )
  }
}
EditableSelectComponent.defaultProps = {
  canEdit: true,
}

export default EditableSelectComponent
