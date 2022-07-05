import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import TableTotalText from 'common/components/table_total_text'
import store from '../store'
import _ from 'lodash'

const Info = () => {
  const { totalMsg } = store
  if (_.isNil(totalMsg)) {
    return null
  }

  return (
    <TableTotalText
      data={[
        { label: t('待分割品数量'), content: totalMsg.source_spu_count },
        { label: t('分割单据数'), content: totalMsg.split_sheet_count },
      ]}
    />
  )
}

export default observer(Info)
