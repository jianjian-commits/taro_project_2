import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Dialog, CheckboxGroup, Checkbox, Tip } from '@gmfe/react'
import styles from '../style.module.less'
import _ from 'lodash'
import { connect } from 'react-redux'
import actions from '../../actions'
import '../actions'
import '../reducer'

class FieldGroup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isAddText: [],
    }

    this.handleAddTextChange = ::this.handleAddTextChange
    this.handleSave = ::this.handleSave
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show && !this.props.show) {
      this.setState({ isAddText: [] })
    }
  }

  handleFieldChange(index, fields) {
    actions.dialog_field_selected_change(index, fields)
  }

  handleSave() {
    if (this.state.isAddText[0] && this.refText.value.length > 30) {
      Tip.warning(i18next.t('超过最大可输入字数：30字'))
      return false
    }

    actions.dialog_field_selected_save(
      this.state.isAddText[0] ? { text: this.refText.value } : null
    )
  }

  handleCancel() {
    actions.fieldgroup_add_dialog_toggle()
  }

  handleAddTextChange(value) {
    this.setState({
      isAddText: value,
    })
  }

  render() {
    let { show, fieldGroup, fieldListSelected, fieldAddTargetPath } = this.props
    let textAddable = fieldAddTargetPath[0] !== 'productBlockHeader'

    return (
      <Dialog
        title={i18next.t('添加字段')}
        show={show}
        onOK={this.handleSave}
        onCancel={this.handleCancel}
      >
        <div>
          {_.map(fieldGroup, (fieldList, i) => {
            if (!fieldList.length) return null

            return (
              <div key={i} className={styles.modalCheckboxGroup}>
                <CheckboxGroup
                  inline
                  name='fieldGroup'
                  value={fieldListSelected[i]}
                  onChange={this.handleFieldChange.bind(this, i)}
                >
                  {_.map(fieldList, (field, j) => (
                    <Checkbox key={j} value={field.field}>
                      {field.text}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>
            )
          })}

          {textAddable && (
            <div className={styles.modalCheckboxGroup}>
              <CheckboxGroup
                name='fieldGroupText'
                value={this.state.isAddText}
                onChange={this.handleAddTextChange}
                className={styles.fieldModalTextInputWrap}
              >
                <Checkbox value>
                  {i18next.t('添加文本')}{' '}
                  <input
                    type='text'
                    ref={(ref) => {
                      this.refText = ref
                    }}
                    placeholder={i18next.t('请输入文本内容')}
                    className={
                      'form-control input-sm ' + styles.fieldModalTextInput
                    }
                  />
                </Checkbox>
              </CheckboxGroup>
            </div>
          )}
        </div>
      </Dialog>
    )
  }
}

FieldGroup.propTypes = {
  show: PropTypes.bool.isRequired,
}

export default connect((state) => ({
  fieldGroup: state.distribute_template.fieldGroup,
  show: state.distribute_template.fieldGroupAddDialogShow,
  fieldListSelected: state.distribute_template.fieldListSelected,
  fieldAddTargetPath: state.distribute_template.fieldAddTargetPath,
  productBlockHeader:
    state.distribute_template.templateConfig.productBlockHeader,
}))(FieldGroup)
