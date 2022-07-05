import { i18next, t } from 'gm-i18n'
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
  Tip,
  FormPanel,
} from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import store from '../store'
import commonStore from '../../../store'
import PinYinFilterSelect from '../../../components/pinyin_filter_select'
import DriverSelect from '../../../components/driver_select'
import CustomerSelect from '../../../components/customer_select'
import SecondPrompt from '../../../components/second_prompt'
import { emptyRender } from '../../../util'
import { history } from 'common/service'

@observer
class CreateMaterialModal extends React.Component {
  constructor(props) {
    super(props)
    this.noEdit = props.noEdit
  }

  handleCancel = () => {
    history.push('/supply_chain/material_manage/record?type=in')
    store.initNewRecord()
  }

  handleSave = () => {
    Modal.render({
      title: i18next.t('提示'),
      size: 'sm',
      children: <SecondPrompt test='归还' onSubmit={this.handleSubmit} />,
      onHide: Modal.hide,
    })
  }

  handleSubmit = async () => {
    await store.createNewRecord()
    Tip.success(i18next.t('添加成功！'))
    Modal.hide()
    history.push('/supply_chain/material_manage/record?type=in')
  }

  handleInputChange = (field, e) => {
    store.handleNewMaterialChange(field, e.target.value)
  }

  handleChange = (field, value) => {
    store.handleNewMaterialChange(field, value)
  }

  render() {
    const {
      newInRecord: {
        selectedAddress,
        selectedMaterial,
        amount,
        selectedDriver,
        max,
      },
      handleNewChange,
    } = store
    const { materialList } = commonStore
    return (
      <FormPanel title={t('新建归还记录')}>
        <Form
          labelWidth='120px'
          colWidth='400px'
          onSubmitValidated={this.handleSave}
        >
          <FormItem
            label={i18next.t('商户')}
            required
            validate={Validator.create(
              [Validator.TYPE.required],
              selectedAddress,
            )}
          >
            {this.noEdit ? (
              <p style={{ marginTop: '6px' }}>{selectedAddress?.name}</p>
            ) : (
              <div className='b-material-manage-form-input'>
                <CustomerSelect
                  className='b-material-manage-form-input'
                  selected={selectedAddress}
                  onSelect={handleNewChange.bind(this, 'selectedAddress')}
                />
              </div>
            )}
          </FormItem>
          <FormItem
            label={i18next.t('周转物名称')}
            required
            validate={Validator.create(
              [Validator.TYPE.required],
              selectedMaterial,
            )}
          >
            {this.noEdit ? (
              <p style={{ marginTop: '6px' }}>{selectedMaterial?.name}</p>
            ) : (
              <PinYinFilterSelect
                id='material-manage-in-record_name'
                className='b-material-manage-form-input'
                list={materialList.slice()}
                selected={selectedMaterial}
                onSelect={handleNewChange.bind(this, 'selectedMaterial')}
                placeholder={i18next.t('输入周转物名称搜索')}
              />
            )}
          </FormItem>
          <FormItem
            label={i18next.t('数量')}
            required
            validate={Validator.create([Validator.TYPE.required], amount)}
          >
            <Flex alignCenter>
              <InputNumber
                min={0}
                placeholder={max ? i18next.t(`填入不超过${max}`) : null}
                max={max || 9999999999}
                precision={0}
                value={amount}
                className='form-control b-material-manage-form-input'
                onChange={handleNewChange.bind(this, 'amount')}
              />
              <span className='gm-margin-left-5'>
                {emptyRender(
                  _.get(store.newInRecord, 'selectedMaterial.unit_name'),
                )}
              </span>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('司机')}>
            <div className='b-material-manage-form-input'>
              <DriverSelect
                selected={selectedDriver}
                onSelect={handleNewChange.bind(this, 'selectedDriver')}
              />
            </div>
          </FormItem>
          <FormButton>
            <Button className='gm-margin-right-15' onClick={this.handleCancel}>
              {i18next.t('取消')}
            </Button>
            <Button type='primary' htmlType='submit'>
              {i18next.t('确认')}
            </Button>
          </FormButton>
        </Form>
      </FormPanel>
    )
  }
}

CreateMaterialModal.propTypes = {
  noEdit: PropTypes.bool,
}
export default CreateMaterialModal
