import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import store from '../store'
import global from 'stores/global'
import { TAX_RATE_STATUS } from 'common/enum'
import { Button, Flex, Input, Select } from '@gmfe/react'
import { t } from 'gm-i18n'
import moment from 'moment'

const Header = ({ onOk, onCancel }) => {
  const { edit, details } = store

  const {
    tax_rule_name,
    status,
    create_time,
    create_user,
    finally_operator,
    modify_time,
  } = details

  const handleChange = useCallback((value, key) => {
    const { mergeDetails } = store
    mergeDetails({ [key]: value })
  }, [])

  const handleEdit = useCallback(() => {
    const { setEdit } = store
    setEdit(true)
  }, [])

  return (
    <ReceiptHeaderDetail
      customeContentColWidth={[300, 300, 300, 300]}
      contentCol={4}
      HeaderAction={
        edit ? (
          <Flex>
            <Button onClick={onCancel}>{t('取消')}</Button>
            <Button type='primary' className='gm-margin-left-10' onClick={onOk}>
              {t('确定')}
            </Button>
          </Flex>
        ) : (
          global.hasPermission('edit_tax') && (
            <Button type='primary' onClick={handleEdit}>
              {t('修改')}
            </Button>
          )
        )
      }
      ContentInfo={[
        { label: t('创建人'), item: create_user || '-' },
        {
          label: t('创建时间'),
          item: create_time
            ? moment(create_time).format('YYYY-MM-DD HH:mm')
            : '-',
        },
        { label: t('最后修改人'), item: finally_operator || '-' },
        {
          label: t('最后修改时间'),
          item: modify_time
            ? moment(modify_time).format('YYYY-MM-DD HH:mm')
            : '-',
        },
      ]}
      HeaderInfo={[
        {
          label: t('税率规则名'),
          item: edit ? (
            <Input
              className='form-control'
              placeholder={t('请输入规则名称')}
              value={tax_rule_name}
              onChange={(e) => handleChange(e.target.value, 'tax_rule_name')}
            />
          ) : (
            tax_rule_name
          ),
        },
        {
          label: t('状态'),
          item: edit ? (
            <Select
              onChange={(value) => handleChange(value, 'status')}
              data={Object.entries(TAX_RATE_STATUS).map(([key, value]) => ({
                value: Number(key),
                text: value,
              }))}
              value={status}
            />
          ) : (
            TAX_RATE_STATUS[status]
          ),
        },
      ]}
    />
  )
}

Header.propTypes = {
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default observer(Header)
