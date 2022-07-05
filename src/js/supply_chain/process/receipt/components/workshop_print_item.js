import React from 'react'
import PropTypes from 'prop-types'
import Title from './print_title'
import Header from './print_header'
import { t } from 'gm-i18n'
import moment from 'moment'
import Technic from './print_technics'
import { technologyNames } from '../utils'

const WorkshopPrintItem = ({ item, title }) => {
  return (
    <div className='gm-margin-bottom-10 b-print-page-break'>
      <Title title={title} id={item.workshop_id} code={item.code} />
      <Header
        col={3}
        content={[
          { label: t('车间名称'), text: item.workshop_name },
          {
            label: t('最早开工日期'),
            text: item.earliest_proc_start_time
              ? moment(item.earliest_proc_start_time).format('YYYY-MM-DD')
              : '-',
          },
          { label: t('加工任务'), text: item.total_task },
          { label: t('加工工艺'), text: technologyNames(item.technics) },
          {
            label: t('最晚完工日期'),
            text: item.last_proc_finish_time
              ? moment(item.last_proc_finish_time).format('YYYY-MM-DD')
              : '-',
          },
        ]}
      />
      {item.technics.map((item, index) => (
        <Technic value={item} key={index} />
      ))}
    </div>
  )
}

WorkshopPrintItem.propTypes = {
  item: PropTypes.object,
  title: PropTypes.string,
}

export default WorkshopPrintItem
