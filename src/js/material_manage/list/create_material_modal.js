import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  FormButton,
  FormItem,
  Form,
  Modal,
  Validator,
  Flex,
  InputNumber,
  Price,
  Tip,
  Switch,
} from '@gmfe/react'
import store from './store'
import UnitSelect from '../components/unit_select'
@observer
class CreateMaterialModal extends React.Component {
  handleCancel = () => {
    Modal.hide()
    store.initNewMaterial()
  }

  handleOK = async () => {
    await store.createNewMaterial()
    Tip.success(i18next.t('创建成功'))
    Modal.hide()
  }

  handleInputChange = (field, e) => {
    store.handleNewMaterialChange(field, e.target.value)
  }

  handleChange = (field, value) => {
    store.handleNewMaterialChange(field, value)
  }

  render() {
    const {
      newMaterial: { name, price, unit_name, weight, is_weight },
    } = store
    return (
      <div>
        <Form labelWidth='110px' horizontal onSubmitValidated={this.handleOK}>
          <FormItem
            label={i18next.t('周转物名称')}
            required
            validate={Validator.create([Validator.TYPE.required], name)}
          >
            <input
              className='form-control b-material-manage-form-input'
              onChange={this.handleInputChange.bind(this, 'name')}
              maxLength='30'
              value={name}
            />
          </FormItem>
          <FormItem
            label={i18next.t('单位')}
            required
            validate={Validator.create([Validator.TYPE.required], unit_name)}
          >
            <UnitSelect
              selected={unit_name}
              onSelect={this.handleChange.bind(this, 'unit_name')}
            />
          </FormItem>
          <FormItem
            label={i18next.t('单个货值')}
            required
            validate={Validator.create([Validator.TYPE.required], price)}
          >
            <Flex alignCenter>
              <InputNumber
                min={0}
                max={999999999.99}
                precision={2}
                style={{ width: '160px' }}
                value={price}
                className='form-control b-material-manage-form-input'
                onChange={this.handleChange.bind(this, 'price')}
              />
              <span className='gm-margin-left-5'>
                {Price.getUnit() + '/' + unit_name}
              </span>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('同时作为称重框')}>
            <Switch
              checked={is_weight}
              onChange={this.handleChange.bind(this, 'is_weight')}
            />
            <p className='gm-text-desc gm-margin-top-5'>
              {i18next.t(
                '(开启后可在称重时自动将该周转物作为称重框，分拣员带框称重出库后系统会自动将该周转物记入借出记录里，实现边称重边借出周转物)',
              )}
            </p>
          </FormItem>
          {is_weight && (
            <FormItem
              label={i18next.t('重量')}
              required
              validate={Validator.create([Validator.TYPE.required], weight)}
            >
              <Flex alignCenter>
                <InputNumber
                  min={0}
                  max={999999999.99}
                  precision={2}
                  value={weight}
                  className='form-control b-material-manage-form-input'
                  onChange={this.handleChange.bind(this, 'weight')}
                />
                <span className='gm-margin-left-5'>{i18next.t('斤')}</span>
              </Flex>
            </FormItem>
          )}
          <FormButton>
            <div className='text-right'>
              <Button
                className='gm-margin-right-15'
                onClick={this.handleCancel}
              >
                {i18next.t('取消')}
              </Button>
              <Button type='primary' htmlType='submit'>
                {i18next.t('确认新建')}
              </Button>
            </div>
          </FormButton>
        </Form>
      </div>
    )
  }
}
export default CreateMaterialModal
