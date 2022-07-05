import React from 'react'
import { observer } from 'mobx-react'
import { Form, FormItem, Validator } from '@gmfe/react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { handleValidateName, handleValidatorNumber } from '../../../util'

const SettlementInfos = React.forwardRef((props, ref) => {
  const {
    detail: { bank_account_name, bank_branch_name, bank_name, bank_account },
    setDetailFields
  } = props.store

  return (
    <Form ref={ref} colWidth='400px'>
      <FormItem
        label={t('收款人')}
        labelWidth='120px'
        validate={Validator.create([], bank_account_name, bank_account_name =>
          handleValidateName(bank_account_name)
        )}
      >
        <input
          value={bank_account_name || ''}
          onChange={e => setDetailFields(e.target.value, 'bank_account_name')}
          placeholder={t('输入收款人')}
        />
      </FormItem>
      <FormItem
        label={t('开户银行')}
        labelWidth='120px'
        validate={Validator.create([], bank_branch_name, bank_branch_name =>
          handleValidateName(bank_branch_name)
        )}
      >
        <input
          value={bank_branch_name || ''}
          onChange={e => setDetailFields(e.target.value, 'bank_branch_name')}
          placeholder={t('输入开户银行')}
        />
      </FormItem>
      <FormItem
        label={t('开户银行支行')}
        labelWidth='120px'
        validate={Validator.create([], bank_name, bank_name =>
          handleValidateName(bank_name)
        )}
      >
        <input
          value={bank_name || ''}
          onChange={e => setDetailFields(e.target.value, 'bank_name')}
          placeholder={t('输入开户银行支行')}
        />
      </FormItem>
      <FormItem
        label={t('银行账号')}
        labelWidth='120px'
        validate={Validator.create(
          [Validator.TYPE.number_positive],
          bank_account,
          bank_account => handleValidatorNumber(bank_account)
        )}
      >
        <input
          value={bank_account || ''}
          onChange={e => setDetailFields(e.target.value, 'bank_account')}
          placeholder={t('输入银行账号')}
        />
      </FormItem>
    </Form>
  )
})

SettlementInfos.propTypes = {
  store: PropTypes.object
}

export default observer(SettlementInfos)
