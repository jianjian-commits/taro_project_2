import { i18next, t } from 'gm-i18n'
import React, { useState } from 'react'
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
import store from '../list/store'

import DriverSelect from '../../components/driver_select'

import { emptyRender } from '../../util'
import SecondPrompt from '../../components/second_prompt'
import { history } from 'common/service'

const CreateMaterialModal = observer((props) => {
  const { sid, sname, tname, amount: max, tid } = JSON.parse(
    props.history.location.query.data,
  )
  const [data, setData] = useState({ amount: null, selectedDriver: undefined })
  const handleCancel = () => {
    history.goBack()
  }

  const handleSave = () => {
    Modal.render({
      title: i18next.t('提示'),
      size: 'sm',
      children: <SecondPrompt test='归还' onSubmit={handleSubmit} />,
      onHide: Modal.hide,
    })
  }

  const handleSubmit = async () => {
    await store.createNewReturn({
      address_id: sid,
      driver_id: data.selectedDriver?.length
        ? data.selectedDriver[data.selectedDriver.length - 1]
        : undefined,
      tid,
      amount: data.amount,
    })
    Tip.success(i18next.t('添加成功！'))
    Modal.hide()
    history.goBack()
  }

  const handleNewChange = (name, value) => {
    setData({ ...data, [name]: value })
  }

  return (
    <FormPanel title={t('新建归还记录')}>
      <Form labelWidth='120px' onSubmitValidated={handleSave}>
        <FormItem label={i18next.t('商户')}>
          <p style={{ marginTop: '6px' }}>{sname}</p>
        </FormItem>
        <FormItem label={i18next.t('周转物名称')}>
          <p style={{ marginTop: '6px' }}>{tname}</p>
        </FormItem>
        <FormItem
          label={i18next.t('数量')}
          required
          validate={Validator.create([Validator.TYPE.required], data.amount)}
        >
          <Flex alignCenter>
            <InputNumber
              min={0}
              placeholder={max ? i18next.t(`填入不超过${max}`) : null}
              max={max || 9999999999}
              precision={0}
              value={data.amount}
              className='form-control b-material-manage-form-input'
              onChange={(value) => handleNewChange('amount', value)}
            />
            <span className='gm-margin-left-5'>
              {emptyRender(
                _.get(
                  JSON.parse(props.history.location.query.data),
                  'unit_name',
                ),
              )}
            </span>
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('司机')}>
          <div className='b-material-manage-form-input'>
            <DriverSelect
              selected={data.selectedDriver}
              onSelect={(selected) =>
                handleNewChange('selectedDriver', selected)
              }
            />
          </div>
        </FormItem>
        <FormButton>
          <Button className='gm-margin-right-15' onClick={handleCancel}>
            {i18next.t('取消')}
          </Button>
          <Button type='primary' htmlType='submit'>
            {i18next.t('确认')}
          </Button>
        </FormButton>
      </Form>
    </FormPanel>
  )
})

CreateMaterialModal.propTypes = {
  data: PropTypes.object.isRequired,
}

export default CreateMaterialModal
