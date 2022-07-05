import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import moment from 'moment'

const MoreBatchModal = ({ batchList }) => {
  return (
    <div className='b-batch-content'>
      {batchList.map((item) => (
        <div
          className='b-batch-block gm-padding-20 gm-margin-bottom-10'
          key={item.in_stock_sheet_id}
        >
          <h2 className='gm-margin-top-0'>
            {t('批次号')}：{item.in_stock_sheet_id}
          </h2>
          <Flex className='gm-text-14'>
            <div className='gm-margin-right-10'>
              {t('入库时间')}：{moment(item.in_stock_time).format('YYYY-MM-DD')}
            </div>
            <div>
              {t('建单员')}：{item.in_stock_creator}
            </div>
          </Flex>
        </div>
      ))}
      <style jsx>{`
        .b-batch-content {
          max-height: 500px;
          overflow: auto;
        }
        .b-batch-block {
          border: 1px dashed #cccccc;
        }
      `}</style>
    </div>
  )
}

MoreBatchModal.propTypes = {
  batchList: PropTypes.arrayOf(
    PropTypes.shape({
      inStockSheetId: PropTypes.string,
      inStockTime: PropTypes.string,
      inStockCreator: PropTypes.string,
    })
  ),
}

export default MoreBatchModal
