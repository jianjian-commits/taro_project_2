import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, FunctionSet } from '@gmfe/react'
import store from './store'
import { getOutStockAdjustExportData } from '../service'
import { observer } from 'mobx-react'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import globalStore from '../../stores/global'

import ReceiptHeaderDetail from 'common/components/receipt_header_detail'

@observer
class DetailHeader extends React.Component {
  handleExport = () => {
    const stockMethod = globalStore.user.stock_method // 进销存计算方式： 1 加权平均    2 先进先出
    requireGmXlsx((res) => {
      const { jsonToSheet } = res
      const filename =
        +stockMethod === 1 ? '出库调整单（加权平均）' : '出库调整单（先进先出）'
      jsonToSheet([getOutStockAdjustExportData(store.detail, stockMethod)], {
        fileName: filename + '.xlsx',
      })
    })
  }

  render() {
    const { detail } = store

    return (
      <ReceiptHeaderDetail
        contentLabelWidth={100}
        contentBlockWidth={300}
        HeaderInfo={[
          {
            label: i18next.t('调整单号'),
            item: <div>{detail.sheet_no || '-'}</div>,
          },
        ]}
        ContentInfo={[
          {
            label: '关联入库调整单号',
            item: <div>{detail.adjust_sheet_no || '-'}</div>,
          },
          { label: '提交时间', item: <div>{detail.submit_time || '-'}</div> },
          { label: '建单人', item: <div>{detail.creator || '-'}</div> },
        ]}
        HeaderAction={
          <Flex justifyEnd className='gm-bg gm-margin-top-5'>
            <FunctionSet
              right
              data={[
                {
                  text: i18next.t('导出调整单'),
                  onClick: this.handleExport,
                },
              ]}
            />
          </Flex>
        }
      />
    )
  }
}

export default DetailHeader
