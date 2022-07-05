import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  FormButton,
  FormItem,
  Form,
  Validator,
  Flex,
  InputNumber,
  Tip,
  FormPanel,
  Modal,
} from '@gmfe/react'
import { history } from 'common/service'
import _ from 'lodash'
import store from '../store'
import commonStore from '../../../store'
import PinYinFilterSelect from '../../../components/pinyin_filter_select'
import DriverSelect from '../../../components/driver_select'
import CustomerSelect from '../../../components/customer_select'
import { emptyRender } from '../../../util'
import SecondPrompt from '../../../components/second_prompt'

@observer
class CreateMaterialModal extends React.Component {
  handleCancel = () => {
    history.push('/supply_chain/material_manage/record?type=out')
    store.initNewRecord()
  }

  handleSave = () => {
    Modal.render({
      title: i18next.t('提示'),
      size: 'sm',
      children: <SecondPrompt test='借出' onSubmit={this.handleSubmit} />,
      onHide: Modal.hide,
    })
  }

  handleSubmit = async () => {
    await store.createNewRecord()
    Tip.success(i18next.t('添加成功！'))
    Modal.hide()
    history.push('/supply_chain/material_manage/record?type=out')
  }

  handleInputChange = (field, e) => {
    store.handleNewMaterialChange(field, e.target.value)
  }

  handleChange = (field, value) => {
    store.handleNewMaterialChange(field, value)
  }

  render() {
    const { newOutRecord, handleNewChange } = store
    const { materialList } = commonStore
    return (
      <FormPanel title={t('新建借出记录')}>
        <Form
          labelWidth='120px'
          colWidth='400px'
          horizontal='true'
          onSubmitValidated={this.handleSave}
        >
          <FormItem
            label={i18next.t('商户')}
            required
            validate={Validator.create(
              [Validator.TYPE.required],
              newOutRecord.selectedAddress,
            )}
          >
            <div className='b-material-manage-form-input'>
              <CustomerSelect
                selected={newOutRecord.selectedAddress}
                onSelect={handleNewChange.bind(this, 'selectedAddress')}
              />
            </div>
          </FormItem>
          <FormItem label={i18next.t('关联出库单')}>
            <div className='b-material-manage-form-input'>
              <input
                className='form-control'
                type='text'
                onChange={(e) => {
                  handleNewChange('out_stock_sheet_id', e.target.value)
                }}
              />
            </div>
          </FormItem>
          <FormItem
            label={i18next.t('周转物名称')}
            required
            validate={Validator.create(
              [Validator.TYPE.required],
              newOutRecord.selectedMaterial,
            )}
          >
            <PinYinFilterSelect
              id='material-manage-in-record_name'
              className='b-material-manage-form-input'
              list={materialList.slice()}
              selected={newOutRecord.selectedMaterial}
              onSelect={handleNewChange.bind(this, 'selectedMaterial')}
              placeholder={i18next.t('输入周转物名称搜索')}
            />
          </FormItem>
          <FormItem
            label={i18next.t('数量')}
            required
            validate={Validator.create(
              [Validator.TYPE.required],
              newOutRecord.amount,
            )}
          >
            <Flex alignCenter>
              <InputNumber
                min={0}
                max={999999999.99}
                precision={0}
                value={newOutRecord.amount}
                className='form-control b-material-manage-form-input'
                onChange={handleNewChange.bind(this, 'amount')}
              />
              <span className='gm-margin-left-5'>
                {emptyRender(_.get(newOutRecord, 'selectedMaterial.unit_name'))}
              </span>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('司机')}>
            <div className='b-material-manage-form-input'>
              <DriverSelect
                selected={newOutRecord.selectedDriver}
                onSelect={handleNewChange.bind(this, 'selectedDriver')}
              />
            </div>
          </FormItem>
          <FormButton>
            <div className='gm-inline-block'>
              <Button
                className='gm-margin-right-15'
                onClick={this.handleCancel}
              >
                {i18next.t('取消')}
              </Button>
              <Button type='primary' htmlType='submit'>
                {i18next.t('确认')}
              </Button>
            </div>
          </FormButton>
        </Form>
      </FormPanel>
    )
  }
}
export default CreateMaterialModal
