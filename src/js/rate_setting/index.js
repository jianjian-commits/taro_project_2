import { i18next } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import {
  FormGroup,
  FormPanel,
  Form,
  InputNumber,
  Tip,
  FormItem,
} from '@gmfe/react'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import store from './store'

const Component = observer(() => {
  const refform = useRef(null)

  const onSubmit = () => {
    const { rate } = store
    if (!_.toNumber(rate.HKD) && !_.toNumber(rate.MOP)) {
      return Tip.warning(i18next.t('汇率必填，且必须大于0'))
    }
    store.save()
  }

  const onChange = (value, key) => {
    store.setRate(value, key)
  }

  useEffect(() => {
    store.get()
  }, [])

  return (
    <FormGroup formRefs={[refform]} onSubmit={onSubmit}>
      <FormPanel title={i18next.t('汇率管理')}>
        <Form
          ref={refform}
          hasButtonInGroup
          labelWidth='70px'
          horizontal
          className='gm-padding-tb-15'
        >
          <FormItem label=''>
            <Observer>
              {() => {
                const { HKD } = store.rate
                return (
                  <div>
                    {i18next.t('1港元 =')}
                    <InputNumber
                      className='gm-margin-lr-5 form-control gm-inline'
                      style={{ width: '100px' }}
                      onChange={(value) => onChange(value, 'HKD')}
                      precision={4}
                      value={HKD}
                    />
                    {i18next.t('人民币')}
                  </div>
                )
              }}
            </Observer>
          </FormItem>
          <FormItem label=''>
            <Observer>
              {() => {
                const { MOP } = store.rate
                return (
                  <div>
                    {i18next.t('1澳门元 =')}
                    <InputNumber
                      className='gm-margin-lr-5 form-control gm-inline'
                      style={{ width: '100px' }}
                      onChange={(value) => onChange(value, 'MOP')}
                      precision={4}
                      value={MOP}
                    />
                    {i18next.t('人民币')}
                  </div>
                )
              }}
            </Observer>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default Component
