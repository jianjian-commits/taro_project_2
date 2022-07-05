import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import globalStore from '../../../../stores/global'
import { Popover, RightSideModal } from '@gmfe/react'
import { SvgLinechart } from 'gm-svg'
import { t } from 'gm-i18n'
import { PRODUCT_STATUS } from '../../../../common/enum'
import { is } from '@gm-common/tool'
import GoodDetail from './good_detail'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'

const AddTypeContent = () => {
  return (
    <Popover
      showArrow
      component={<div />}
      type='hover'
      popup={
        <div
          className='gm-border gm-padding-5 gm-bg gm-text-12'
          style={{ width: '100px' }}
        >
          {t('点击可查看价格趋势')}
        </div>
      }
    >
      <span>
        <SvgLinechart
          style={{
            color: '#56a3f2',
            marginLeft: '5px',
          }}
        />
      </span>
    </Popover>
  )
}

const PriceTrend = observer((props) => {
  const { data } = props

  const { name, ratio, purchase_unit, std_unit, spu_id } = data

  const handlePopupGoodDetail = () => {
    // 取当前选择的供应商的数据即可
    const {
      stockInReceiptDetail: { supplier_name, status, settle_supplier_id },
    } = store
    const { id, std_unit } = data

    const goodProps = {
      header: {
        origin: { ...data, status },
        settle_supplier_name: supplier_name,
        statusMap: PRODUCT_STATUS,
      },
      detail: {
        id: id,
        supplier_id: settle_supplier_id,
        std_unit_name: std_unit,
        purchase_type: 3,
      },
    }

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: <GoodDetail {...goodProps} />,
    })
  }

  const spuName = spu_id ? `${name}(${ratio}${std_unit}/${purchase_unit})` : '-'
  const isAddType = props.type === 'add'

  return (
    <>
      <div className='gm-cursor gm-inline-block'>
        {globalStore.hasPermission('get_stock_spec_price_info') ? (
          <a onClick={handlePopupGoodDetail}>
            {isAddType ? <AddTypeContent /> : spuName}
          </a>
        ) : isAddType ? null : (
          spuName
        )}
      </div>
      <div className='gm-gap-5' />
    </>
  )
})

PriceTrend.propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
}

export default memoComponentWithDataHoc(PriceTrend)
