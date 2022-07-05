import React from 'react'
import PropTypes from 'prop-types'
import Title from './print_title'
import Header from './print_header'
import { t } from 'gm-i18n'
import moment from 'moment'
import Technic from './print_technics'

const ProcessPrintItem = ({ item, title }) => {
  return (
    <div className='gm-margin-bottom-10 b-print-page-break'>
      <Title title={title} id={item.technic_id} code={item.code} />
      <Header
        col={2}
        content={[
          {
            label: t('最早开工日期'),
            text: item.earliest_proc_start_time
              ? moment(item.earliest_proc_start_time).format('YYYY-MM-DD')
              : '-',
          },
          {
            label: t('最晚完工日期'),
            text: item.last_proc_finish_time
              ? moment(item.last_proc_finish_time).format('YYYY-MM-DD')
              : '-',
          },
          { label: t('加工工艺'), text: item.technic_name },
          { label: t('物料加工任务'), text: item.total_task },
        ]}
      />
      <Technic value={item} num={item.total_task} />
    </div>
  )
}

ProcessPrintItem.propTypes = {
  item: PropTypes.object,
  title: PropTypes.string,
}

export default ProcessPrintItem
