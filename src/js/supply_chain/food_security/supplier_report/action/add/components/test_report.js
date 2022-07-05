import React, { forwardRef } from 'react'
import { observer } from 'mobx-react'
import { DatePicker, Form, FormItem, Input, Validator } from '@gmfe/react'
import { t } from 'gm-i18n'
import { store } from '../../store'

const TestReport = forwardRef((_, ref) => {
  const { filter } = store

  const handleChangeFilter = (key, value) => {
    store.setFilter(key, value)
  }

  const validateLength = (value, name) => {
    if (value.trim().length > 50) {
      return `${name}长度不得大于50`
    }
    return null
  }

  const {
    id,
    report_name,
    detect_date,
    detect_sender,
    detect_institution,
    detector,
    status,
  } = filter
  return (
    <Form labelWidth='90px' ref={ref}>
      {id && (
        <FormItem label={t('报告编号')}>
          <Input className='form-control' defaultValue={id} disabled />
        </FormItem>
      )}
      <FormItem
        label={t('报告名称')}
        validate={Validator.create([], report_name, (value) =>
          validateLength(value, t('报告名称'))
        )}
      >
        <Input
          value={report_name}
          className='form-control'
          onChange={(event) =>
            handleChangeFilter('report_name', event.target.value)
          }
        />
      </FormItem>
      <FormItem
        label={t('检测日期')}
        required
        validate={Validator.create(Validator.TYPE.required, detect_date)}
      >
        <DatePicker
          date={detect_date}
          max={new Date()}
          placeholder={t('请选择日期')}
          onChange={(value) => handleChangeFilter('detect_date', value)}
        />
      </FormItem>
      <FormItem
        label={t('送检机构')}
        required
        validate={Validator.create(
          Validator.TYPE.required,
          detect_sender,
          (value) => validateLength(value, t('送检机构'))
        )}
      >
        <Input
          className='form-control'
          value={detect_sender}
          onChange={(event) =>
            handleChangeFilter('detect_sender', event.target.value)
          }
        />
      </FormItem>
      <FormItem
        label={t('检测机构')}
        validate={Validator.create([], detect_institution, (value) =>
          validateLength(value, t('检测机构'))
        )}
      >
        <Input
          className='form-control'
          value={detect_institution}
          onChange={(event) =>
            handleChangeFilter('detect_institution', event.target.value)
          }
        />
      </FormItem>
      <FormItem
        label={t('检测人')}
        validate={Validator.create([], detector, (value) =>
          validateLength(value, t('检测人'))
        )}
      >
        <Input
          className='form-control'
          value={detector}
          onChange={(event) =>
            handleChangeFilter('detector', event.target.value)
          }
        />
      </FormItem>
      <FormItem label={t('检测状态')}>
        <Input
          className='form-control'
          defaultValue={status ? (status === 1 ? t('有效') : t('失效')) : '-'}
          disabled
        />
      </FormItem>
    </Form>
  )
})

export default observer(TestReport)
