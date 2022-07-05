import React from 'react'
import { i18next } from 'gm-i18n'
import { Form, FormItem, Validator } from '@gmfe/react'
import SalemenuSearchSelector from '../../components/salemenu_search_selector'
import CombineSalemenusSkuTable from './combine_salemenus_sku_table'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const Form2 = React.forwardRef((props, ref) => {
  const { salemenus, setSalemenus } = props.store

  const salemenusList = salemenus.slice()

  return (
    <Form colWidth='700px' labelWidth='170px' ref={ref}>
      <FormItem
        required
        label={i18next.t('可见报价单')}
        validate={Validator.create([], salemenusList.join())}
      >
        <SalemenuSearchSelector
          selected={salemenusList}
          onSelect={setSalemenus}
        />
      </FormItem>
      <FormItem label={i18next.t('规格信息')}>
        <div className='gm-text-desc'>
          {i18next.t(
            '可展现修改组合商品在各报价单中的销售规格，如没有规格则需要创建',
          )}
        </div>
        <CombineSalemenusSkuTable store={props.store} />
      </FormItem>
    </Form>
  )
})

Form2.propTypes = {
  store: PropTypes.object,
}

export default observer(Form2)
