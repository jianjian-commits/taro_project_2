import React, { useRef } from 'react'
import { FormGroup, FormPanel, Tip } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { history } from 'common/service'
import BasicInfos from './basic_infos'
import ServiceInfos from './service_infos'
import SettlementInfos from './settlement_infos'

const Detail = ({ store, id }) => {
  const form1 = useRef(null)
  const form2 = useRef(null)
  const form3 = useRef(null)

  const handleCancel = () => history.goBack()

  const handleSubmit = async () => {
    if (store.type === 'edit') {
      await store.submit(id)
      Tip.success(t('保存成功'))
    } else if (store.type === 'create') {
      await store.submit()
      Tip.success(t('创建成功'))
      history.push('/c_commander/manage/list')
    }
  }

  return (
    <FormGroup
      formRefs={[form1, form2, form3]}
      onCancel={handleCancel}
      onSubmitValidated={handleSubmit}
    >
      <FormPanel title={t('基础信息')}>
        <BasicInfos ref={form1} store={store} id={id} />
      </FormPanel>
      <FormPanel title={t('服务信息')}>
        <ServiceInfos ref={form2} store={store} />
      </FormPanel>
      <FormPanel title={t('结款信息')}>
        <SettlementInfos ref={form3} store={store} />
      </FormPanel>
    </FormGroup>
  )
}

Detail.propTypes = {
  store: PropTypes.object,
  id: PropTypes.string
}
export default observer(Detail)
