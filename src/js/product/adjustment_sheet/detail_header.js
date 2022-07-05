import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Tip, Dialog, FunctionSet, Button } from '@gmfe/react'
import store from './store'
import { getInStockAdjustExportData } from '../service'
import { adjustSheetStatus, adjustSheetTagStatus } from '../../common/filter'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { history } from '../../common/service'
import PropTypes from 'prop-types'
import globalStore from '../../stores/global'

import ReceiptHeaderDetail from 'common/components/receipt_header_detail'

@observer
class DetailHeader extends React.Component {
  handleSubmit = () => {
    if (this.checkData()) {
      Dialog.confirm({
        children: i18next.t(
          '提交入库调整单后将会更新在此入库单之后出库商品的出库单价，是否确认修改？',
        ),
      }).then(() => {
        this.fetchData(1)
      })
    }
  }

  handleSaveDraft = () => {
    if (this.checkData()) {
      this.fetchData(0)
    }
  }

  fetchData = (is_submit) => {
    const sheetNo = this.props.sheetNo
    store.submitOrSave(is_submit).then((json) => {
      Tip.success('保存成功')
      // 如果是编辑只需要重新拉取详情信息
      if (sheetNo) {
        store.getDetail(sheetNo)
        return false
      }
      history.replace(
        `/sales_invoicing/stock_in/adjust_sheet/detail?sheet_no=${json.data.sheet_no}`,
      )
    })
  }

  checkData = () => {
    const { detail } = store
    if (detail.details.length === 0) {
      Tip.warning(i18next.t('请先添加调整明细'))
      return false
    }
    let isDataValid = true
    _.forEach(
      _.filter(detail.details, (sku) => !_.isEmpty(sku)),
      (sku) => {
        if (!sku.spec_id || !sku.batch_number || !sku.new_price) {
          isDataValid = false
          return false
        }
      },
    )

    if (!isDataValid) {
      Tip.warning(i18next.t('调整明细先填不完善'))
      return false
    }

    if (_.find(detail.details, (s) => +s.new_price === +s.old_price)) {
      Tip.warning(i18next.t('调整后单价不可与调整前单价相同'))
      return false
    }

    return true
  }

  handleExport = () => {
    requireGmXlsx((res) => {
      const { jsonToSheet } = res
      jsonToSheet([getInStockAdjustExportData(store.detail)], {
        fileName: i18next.t('入库调整单') + '.xlsx',
      })
    })
  }

  render() {
    const { detail } = store
    const canEditAdjust = globalStore.hasPermission('edit_in_stock_adjust')
    const canDeleteAdjust = globalStore.hasPermission('delete_in_stock_adjust')

    return (
      <ReceiptHeaderDetail
        contentLabelWidth={100}
        contentBlockWidth={300}
        HeaderInfo={[
          {
            label: i18next.t('调整单号'),
            item: (
              <div style={{ width: '280px' }}>{detail.sheet_no || '-'}</div>
            ),
          },
        ]}
        ContentInfo={[
          {
            label: '入库调整单状态',
            item: <div>{adjustSheetStatus(detail.status) || '-'}</div>,
            tag: adjustSheetTagStatus(detail.status),
          },
          { label: '提交时间', item: <div>{detail.submit_time || '-'}</div> },
          { label: '建单人', item: <div>{detail.creator || '-'}</div> },
        ]}
        HeaderAction={
          <Flex justifyEnd>
            {(!detail.sheet_no || detail.status === 1) && (
              <Button
                type='primary'
                className='gm-margin-right-5'
                onClick={this.handleSaveDraft}
              >
                {i18next.t('保存')}
              </Button>
            )}
            {(detail.status === 1 || !detail.status) && canEditAdjust && (
              <Button
                type='primary'
                plain
                className='gm-margin-right-5'
                onClick={this.handleSubmit}
              >
                {i18next.t('保存并提交')}
              </Button>
            )}
            {detail.sheet_no && (
              <FunctionSet
                right
                data={[
                  {
                    text: i18next.t('导出调整单'),
                    onClick: this.handleExport,
                  },
                  {
                    text: i18next.t('冲销'),
                    onClick: () => store.cancelAdjustSheet(detail.sheet_no),
                    // show: detail.status === 1 && canDeleteAdjust
                    show: canDeleteAdjust,
                  },
                ]}
              />
            )}
          </Flex>
        }
      />
    )
  }
}

DetailHeader.propTypes = {
  sheetNo: PropTypes.string,
}

export default DetailHeader
