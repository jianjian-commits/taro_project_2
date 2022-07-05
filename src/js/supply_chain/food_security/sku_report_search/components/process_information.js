import React, { useState, useEffect } from 'react'
import { BoxPanel } from '@gmfe/react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import Process from './process'
import OrderSuccess from 'svg/order-success.svg'
import Purchase from 'svg/purchase.svg'
import SubmitInStorage from 'svg/submit-in-storage.svg'
import Sorting from 'svg/sorting.svg'
import SubmitOutStorage from 'svg/submit-out-storage.svg'
import Driver from 'svg/driver.svg'
import WarningTriangle from 'svg/warning-triangle.svg'
import moment from 'moment'

const iconEnum = {
  order: <OrderSuccess />,
  purchase: <Purchase />,
  submitIn: <SubmitInStorage />,
  sorting: <Sorting />,
  submitOut: <SubmitOutStorage />,
  driver: <Driver />,
  warning: <WarningTriangle />,
}

export function splitDate(date, num) {
  if (!date) {
    return
  }
  const result = moment(date).format('YYYY-MM-DD HH:mm:ss')
  if (num !== undefined) {
    return result.split(' ')[num]
  }
  return result
}

const ProcessInformation = ({ data }) => {
  const [list, setList] = useState([])

  useEffect(() => {
    setList(
      data
        .map(({ date, ...rest }) => ({
          ...rest,
          date: splitDate(date, 0),
          time: splitDate(date, 1),
        }))
        .filter((item) => item.show)
    )
  }, [data])

  return (
    <BoxPanel
      title={t('流程信息')}
      className='b-sku-report-search-panel'
      style={{ width: '98%' }}
    >
      <div className='b-sku-report-search-panel-content'>
        <Process
          data={list.map((item) => {
            const { icon, ...rest } = item
            return { ...rest, icon: iconEnum[icon] }
          })}
        />
      </div>
    </BoxPanel>
  )
}

ProcessInformation.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      icon: PropTypes.oneOf([
        'order',
        'purchase',
        'submitIn',
        'sorting',
        'submitOut',
        'driver',
        'warning',
      ]),
      title: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })
      ),
      show: PropTypes.bool,
    })
  ).isRequired,
}

export default ProcessInformation
