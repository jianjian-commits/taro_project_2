import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { BoxPanel, Button, Checkbox, CheckboxGroup } from '@gmfe/react'
import { t } from 'gm-i18n'
import { urlToParams } from 'common/util'

const PrintModal = ({ ids, hasProduct, printType, taskIds, workShopIds }) => {
  const [selected, setSelected] = useState(hasProduct ? [1, 2, 3] : [2, 3])

  const handlePrint = () => {
    const params = {
      product: selected.includes(1),
      technic: selected.includes(2),
      workshop: selected.includes(3),
      order_ids: JSON.stringify(ids),
    }

    if (printType === 'byTechnic') {
      params.task_ids = JSON.stringify(taskIds)
      params.workshop_ids = JSON.stringify(workShopIds)
    }

    window.open(
      `#/supply_chain/process/receipt/print/process_print?${urlToParams(
        params,
      )}`,
    )
  }

  const handleSelect = (selected) => {
    setSelected(selected)
  }

  return (
    <BoxPanel
      title={t('选择模板单据')}
      right={
        <Button type='primary' onClick={handlePrint}>
          {t('打印')}
        </Button>
      }
    >
      <div className='gm-padding-lr-15'>
        <hr />
        <CheckboxGroup
          name='process_print'
          value={selected}
          onChange={handleSelect}
        >
          {/* 需要分开判断，不然赋值会失败，尚不知原因 */}
          {hasProduct && <Checkbox value={1}>{t('产品加工单')}</Checkbox>}
          {hasProduct && (
            <div className='gm-margin-left-10 gm-text-desc gm-margin-bottom-10'>
              {t('按成品汇总成一张单，用于内部流转指导加工，一个成品一张单')}
            </div>
          )}
          <Checkbox value={2}>{t('工艺加工单')}</Checkbox>
          <div className='gm-margin-left-10 gm-text-desc gm-margin-bottom-10'>
            {t('按工艺汇总成一张单，用于工艺作业指导，一个工艺一张单')}
          </div>
          <Checkbox value={3}>{t('车间加工单')}</Checkbox>
          <div className='gm-margin-left-10 gm-text-desc gm-margin-bottom-10'>
            {t('按车间汇总成一张单，用于车间作业指导，一个车间一张单')}
          </div>
        </CheckboxGroup>
      </div>
    </BoxPanel>
  )
}

PrintModal.defaultProps = {
  hasProduct: true,
}

PrintModal.propTypes = {
  // 加工单ids
  ids: PropTypes.array.isRequired,
  hasProduct: PropTypes.bool,
  // byReceipt/byTechnic
  printType: PropTypes.string.isRequired,
  // 加工任务ids
  taskIds: PropTypes.array,
  // 筛选的车间ids
  workShopIds: PropTypes.array,
}

export default PrintModal
