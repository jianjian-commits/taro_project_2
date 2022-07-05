import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { history, withBreadcrumbs } from 'common/service'
import Details from './components/details'
import detailsStore from './store/details.store'
import { Tip } from '@gmfe/react'

const Edit = ({ location }) => {
  useEffect(() => {
    const { fetchParams, formRef } = detailsStore
    fetchParams(location.query.id).then(() => {
      formRef.current.apiDoValidate()
    })
  }, [location.query.id])

  const handleOK = async () => {
    const { handleModify, checkErrorData } = detailsStore
    try {
      const result = await handleModify()
      Tip.success(t('更新成功'))
      history.push('/sales_invoicing/base/split_scheme')
      return result
    } catch ({ data: { deleted_spu_ids }, msg }) {
      Tip.warning(msg)
      checkErrorData(deleted_spu_ids)
    }
  }
  return <Details onOK={handleOK} title={t('分割方案详情')} />
}

Edit.propTypes = {
  location: PropTypes.object.isRequired,
}

export default withBreadcrumbs([t('分割方案详情')])(Edit)
