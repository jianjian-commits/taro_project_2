import React, { useState } from 'react'
import { t } from 'gm-i18n'
import {
  Form,
  FormItem,
  FormButton,
  DatePicker,
  Modal,
  RightSideModal,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import store from './store'
import TaskList from '../../task/task_list'
const today = moment().toDate()

const PospalAction = () => {
  const [date, setDate] = useState(today)

  const handleDateChange = (value) => {
    setDate(value)
  }

  const disabledDate = (date) => {
    return moment(date) > moment()
  }

  const handleSubmit = () => {
    store.fetchPospalOrder().then(() => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  return (
    <Form labelWidth='90px' btnPosition='right' onSubmit={handleSubmit}>
      <FormItem label='获取范围'>
        <DatePicker
          date={date}
          onChange={handleDateChange}
          disabledDate={disabledDate}
          placeholder='选择日期'
        />
      </FormItem>
      <FormButton>
        <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
        <span className='gm-gap-5' />
        <Button htmlType='submit' type='primary'>
          {t('确认')}
        </Button>
      </FormButton>
    </Form>
  )
}

export default PospalAction
