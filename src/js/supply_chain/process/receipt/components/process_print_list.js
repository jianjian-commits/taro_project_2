import React from 'react'
import PropTypes from 'prop-types'
import ProductPrintItem from './product_print_item'
import { t } from 'gm-i18n'
import ProcessPrintItem from './process_print_item'
import WorkshopPrintItem from './workshop_print_item'

const ProcessPrintList = ({ list, title }) => {
  return list.map((item, index) => {
    if (title === t('产品加工单')) {
      return <ProductPrintItem key={index} item={item} title={title} />
    }
    if (title === t('工艺加工单')) {
      return <ProcessPrintItem key={index} item={item} title={title} />
    }
    if (title === t('车间加工单')) {
      return <WorkshopPrintItem key={index} item={item} title={title} />
    }
  })
}

ProcessPrintList.propTypes = {
  list: PropTypes.array,
  title: PropTypes.string,
}

export default ProcessPrintList
