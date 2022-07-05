import React from 'react'
import PropTypes from 'prop-types'
import { BoxPanel, Flex, Button, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'
import ShowForm from './show_form'
import global from 'stores/global'
import MoreBatchModal from './more_batch_modal'
import moment from 'moment'

const InventoryInformation = ({
  inStockSheet,
  outStockSheetId,
  outStockTime,
  outStockCreator,
}) => {
  let inStockTime, inStockSheetId, inStockCreator
  if (inStockSheet) {
    const [first] = inStockSheet
    inStockTime = moment(first.in_stock_time).format('YYYY-MM-DD')
    inStockSheetId = first.in_stock_sheet_id
    inStockCreator = first.in_stock_creator
  }
  const columns1 = [
    { label: t('入库单'), value: inStockSheetId },
    { label: t('入库时间'), value: inStockTime },
    { label: t('建单人'), value: inStockCreator },
  ]

  const columns2 = [
    { label: t('出库单'), value: outStockSheetId },
    { label: t('出库时间'), value: outStockTime },
    { label: t('建单人'), value: outStockCreator },
  ]

  const handleShowMoreBatch = () => {
    Modal.render({
      title: t('更多批次'),
      children: <MoreBatchModal batchList={inStockSheet} />,
      onHide: Modal.hide,
    })
  }

  const { stock_method } = global.user
  return (
    <BoxPanel
      title={t('出入库信息')}
      className='b-sku-report-search-panel'
      style={{ width: '48%' }}
    >
      <Flex className='b-sku-report-search-panel-content'>
        {stock_method === 2 && (
          <div>
            <ShowForm data={columns1} />
            {inStockSheet?.length > 0 && (
              <Button type='link' onClick={handleShowMoreBatch}>
                {t('更多批次')}
              </Button>
            )}
          </div>
        )}
        <ShowForm data={columns2} />
      </Flex>
    </BoxPanel>
  )
}

InventoryInformation.propTypes = {
  inStockSheet: PropTypes.arrayOf(
    PropTypes.shape({
      inStockSheetId: PropTypes.string,
      inStockTime: PropTypes.string,
      inStockCreator: PropTypes.string,
    })
  ),
  outStockSheetId: PropTypes.string,
  outStockTime: PropTypes.string,
  outStockCreator: PropTypes.string,
}

export default InventoryInformation
