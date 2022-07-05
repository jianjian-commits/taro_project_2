import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { DatePicker, Flex } from '@gmfe/react'
import moment from 'moment'
import { PRODUCT_STATUS } from '../../../../common/enum'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'

const HeaderRight = observer((props) => {
  const {
    supplier_name,
    supplier_customer_id,
    submit_time,
    status,
    creator,
  } = store.stockInReceiptDetail
  const isAdd = props.type === 'add'

  const handleChangeDate = (selected) => {
    const value = moment(selected).format('YYYY-MM-DD')
    store.changeStockInReceiptDetail('submit_time', value)
  }

  return (
    <Flex column className='gm-padding-tb-10' flex={1}>
      <Flex className='gm-padding-tb-5'>
        <Flex flex={1} alignCenter>
          <div className='b-stock-in-title'>{t('供应商名称')}:&nbsp;</div>
          <div className='b-stock-in-content'>{`${supplier_name}(${supplier_customer_id})`}</div>
        </Flex>
        <Flex flex={1} alignCenter>
          <div className='b-stock-in-title'>{t('入库时间')}:&nbsp;</div>
          {isAdd ? (
            <DatePicker
              date={moment(submit_time === '-' ? new Date() : submit_time)}
              onChange={handleChangeDate}
            />
          ) : (
            <div className='b-stock-in-content'>{submit_time}</div>
          )}
        </Flex>
      </Flex>
      <Flex>
        <Flex flex={1} alignCenter>
          <div className='b-stock-in-title'>{t('入库单状态')}:&nbsp;</div>
          <div className='b-stock-in-content'>
            {PRODUCT_STATUS[status] || '-'}
          </div>
        </Flex>
        <Flex flex={1} alignCenter>
          <div className='b-stock-in-title'>{t('建单人')}:&nbsp;</div>
          <div className='b-stock-in-content'>{creator}</div>
        </Flex>
      </Flex>
    </Flex>
  )
})

HeaderRight.propTypes = {
  type: PropTypes.string.isRequired,
}

export default HeaderRight
