import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  Flex,
  RadioGroup,
  Radio,
  Form,
  FormItem,
  InputNumber,
  Button,
} from '@gmfe/react'
import styles from '../style.module.less'
import { connect } from 'react-redux'
import actions from '../../actions'
import '../actions'
import '../reducer'

function handleFieldChange(key, value) {
  actions.block_line_column_setting_field_change(key, value)
}

function handleFieldTextChange(e) {
  const text = e.target.value
  if (text.length <= 30) {
    actions.block_line_column_setting_field_change('text', text)
  }
}

function handleInputChange(key, e) {
  actions.block_line_column_setting_field_change(key, e.target.value)
}

function handleNumberInputChange(key, value) {
  actions.block_line_column_setting_field_change(key, value)
}

function isUpperableField(field) {
  return (
    field === 'total_pay' ||
    field === 'abnormal_money' ||
    field === 'freight' ||
    field === 'real_price' ||
    field === 'std_sale_price' ||
    field === 'real_item_price' ||
    field === 'total_price'
  )
}

class FieldGroupSetting extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      customWidth: false,
      customHeight: false,
    }

    this.handleCancel = ::this.handleCancel
    this.handleSave = ::this.handleSave
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fieldSettingTarget.width > 0) {
      this.setState({ customWidth: true })
    }
    if (nextProps.fieldSettingTarget.height > 0) {
      this.setState({ customHeight: true })
    }
  }

  handleWHTypeChange(key) {
    this.setState({ [key]: !this.state[key] })

    if (this.state[key]) {
      // 还原默认值
      actions.block_line_column_setting_field_change(
        key === 'customWidth' ? 'width' : 'height',
        ''
      )
    }
  }

  handleSave() {
    this.setState({
      customWidth: false,
      customHeight: false,
    })
    actions.fieldGroup_setting_dialog_save()
  }

  handleCancel() {
    this.setState({
      customWidth: false,
      customHeight: false,
    })
    actions.fieldGroup_setting_dialog_toggle()
  }

  render() {
    const { show, fieldSettingTarget, fieldSettingTargetPath } = this.props
    const { customWidth, customHeight } = this.state
    const isTableSetting = fieldSettingTargetPath[0] === 'productBlockHeader'

    return (
      <Dialog
        title={i18next.t('设置')}
        size='sm'
        show={show}
        onOK={this.handleSave}
        onCancel={this.handleCancel}
      >
        <Form disabledCol labelWidth='72px' horizontal>
          <FormItem label={i18next.t('显示名称')}>
            <input
              type='text'
              value={fieldSettingTarget.text}
              onChange={handleFieldTextChange}
              placeholder={i18next.t('请输入显示名称')}
            />
          </FormItem>
          {!isTableSetting ? (
            <FormItem label={i18next.t('高度(pt)')}>
              <Flex justifyBetween alignCenter>
                {customHeight ? (
                  <input
                    type='text'
                    value={fieldSettingTarget.height}
                    className='form-control'
                    onChange={handleInputChange.bind(null, 'height')}
                    placeholder={i18next.t('请输入高度')}
                  />
                ) : (
                  i18next.t('默认')
                )}
                <a
                  href='javascript:;'
                  className={styles.widthAndHeightToggle}
                  onClick={this.handleWHTypeChange.bind(this, 'customHeight')}
                >
                  {customHeight
                    ? i18next.t('使用默认值')
                    : i18next.t('使用自定义')}
                </a>
              </Flex>
            </FormItem>
          ) : null}
          {!isTableSetting ? (
            <FormItem label={i18next.t('宽度(pt)')}>
              <Flex justifyBetween alignCenter>
                {customWidth ? (
                  <input
                    type='text'
                    value={fieldSettingTarget.width}
                    className='form-control'
                    onChange={handleInputChange.bind(null, 'width')}
                    placeholder={i18next.t('请输入宽度')}
                  />
                ) : (
                  i18next.t('默认')
                )}
                <a
                  href='javascript:;'
                  className={styles.widthAndHeightToggle}
                  onClick={this.handleWHTypeChange.bind(this, 'customWidth')}
                >
                  {customWidth
                    ? i18next.t('使用默认值')
                    : i18next.t('使用自定义')}
                </a>
              </Flex>
            </FormItem>
          ) : null}
          <FormItem label={i18next.t('显示顺序')}>
            <InputNumber
              min={0}
              max={100}
              value={fieldSettingTarget.sortNo}
              onChange={handleNumberInputChange.bind(null, 'sortNo')}
              placeholder={i18next.t('请输入显示顺序')}
            />
          </FormItem>
          {isUpperableField(fieldSettingTarget.field) ? (
            <FormItem label={i18next.t('大写金额')}>
              <RadioGroup
                inline
                name='capital'
                value={fieldSettingTarget.capital}
                onChange={handleFieldChange.bind(null, 'capital')}
              >
                <Radio value>{i18next.t('是')}</Radio>
                <Radio value={false}>{i18next.t('否')}</Radio>
              </RadioGroup>
            </FormItem>
          ) : null}
          <hr />
          <FormItem label={i18next.t('字号')}>
            <InputNumber
              value={fieldSettingTarget.fontSize}
              onChange={handleNumberInputChange.bind(null, 'fontSize')}
              placeholder={i18next.t('请输入字号')}
            />
          </FormItem>
          <FormItem label={i18next.t('加粗')}>
            <RadioGroup
              inline
              name='bold'
              value={fieldSettingTarget.bold}
              onChange={handleFieldChange.bind(null, 'bold')}
            >
              <Radio value>{i18next.t('加粗')}</Radio>
              <Radio value={false}>{i18next.t('不加粗')}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={i18next.t('对齐方式')}>
            <div className='btn-group'>
              <Button
                type={
                  fieldSettingTarget.alignment === 'left'
                    ? 'primary'
                    : 'default'
                }
                onClick={handleFieldChange.bind(null, 'alignment', 'left')}
              >
                <i className='glyphicon glyphicon-align-left' />
              </Button>
              <Button
                type={
                  fieldSettingTarget.alignment === 'center'
                    ? 'primary'
                    : 'default'
                }
                onClick={handleFieldChange.bind(null, 'alignment', 'center')}
              >
                <i className='glyphicon glyphicon-align-center' />
              </Button>
              <Button
                type={
                  fieldSettingTarget.alignment === 'right'
                    ? 'primary'
                    : 'default'
                }
                onClick={handleFieldChange.bind(null, 'alignment', 'right')}
              >
                <i className='glyphicon glyphicon-align-right' />
              </Button>
            </div>
          </FormItem>
        </Form>
      </Dialog>
    )
  }
}

FieldGroupSetting.propTypes = {
  show: PropTypes.bool.isRequired,
}

export default connect((state) => ({
  show: state.distribute_template.fieldGroupSettingDialogShow,
  defaultFieldConfig: state.distribute_template.defaultFieldConfig,
  fieldSettingTarget: state.distribute_template.fieldSettingTarget,
  fieldSettingTargetPath: state.distribute_template.fieldSettingTargetPath,
}))(FieldGroupSetting)
