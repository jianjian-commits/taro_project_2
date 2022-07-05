import { t } from 'gm-i18n'
import React from 'react'
import { PropTypes } from 'prop-types'
import { BoxPanel, Flex, Price, Popover, Tip, ToolTip } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { Big } from 'big.js'
import stockList from './store'
import { isRightNumber } from 'common/util'
import EditAmountModal from './edit_amount_modal'

const { EditButton } = TableUtil

const Raw = ({ data, edit, id, retention_warning_day }) => {
  const hoverTips = (tips) => {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ minWidth: '160px', color: '#333' }}
      >
        {tips}
      </div>
    )
  }

  const handleSubmit = (data) => {
    const newStock = data.currentAmount
    const newRemark = data.currentRemark

    if (!isRightNumber(newStock)) {
      Tip.warning(t('不能为空且只能为最大两位小数点的非负数'))
      return false
    }

    return stockList
      .editBatchStock({
        batch_number: data.batch_num,
        new_remain: newStock,
        remark: newRemark,
      })
      .then(() => {
        Tip.success(t('修改库存成功'))
        stockList.getStockDetails(id)
        return true
      })
      .catch(() => {
        stockList.getStockDetails(id)
        Tip.warning(t('修改库存失败'))
      })
  }

  return (
    <BoxPanel title={t('原料批次')} collapse>
      <Table
        data={data}
        columns={[
          {
            Header: t('批次号'),
            width: 350,
            accessor: 'batch_num',
          },
          {
            Header: t('入库规格ID'),
            accessor: 'spec_id',
          },
          {
            Header: t('入库规格名'),
            accessor: 'name',
          },
          {
            Header: () => (
              <Flex column alignCenter>
                <span>{t('库存数')}</span>
                <span>{t('(基本单位)')}</span>
              </Flex>
            ),
            Cell: (row) => {
              const { amount, unit_name } = row.original
              return (
                <Flex justifyCenter>
                  {parseFloat(amount) + unit_name}
                  {edit && (
                    <EditButton
                      popupRender={(closePopup) => (
                        <EditAmountModal
                          data={row.original}
                          type='material'
                          onSubmit={handleSubmit}
                          onCancel={closePopup}
                        />
                      )}
                    />
                  )}
                </Flex>
              )
            },
          },
          {
            Header: (
              <Flex>
                {t('在库时间')}
                <ToolTip
                  top
                  popup={
                    <div className='gm-padding-5' style={{ width: '200px' }}>
                      {t(
                        '计算批次从入库时间至今的天数；若用户设置了呆滞预警，则超过呆滞预警天数且该批次库存大于0时，在库时间标红展示',
                      )}
                    </div>
                  }
                />
              </Flex>
            ),
            accessor: 'on_stock_day',
            Cell: (row) => {
              const { on_stock_day } = row.original
              return (
                <Flex
                  style={
                    retention_warning_day &&
                    on_stock_day > retention_warning_day
                      ? {
                          color: '#fff',
                          backgroundColor: 'red',
                          padding: '2px',
                          marginBottom: 0,
                        }
                      : {}
                  }
                >
                  {on_stock_day + t('天')}
                </Flex>
              )
            },
          },
          {
            Header: t('入库规格'),
            id: 'ratio',
            accessor: (v) => v.ratio + v.unit_name + '/' + v.purchase_unit_name,
          },
          {
            Header: () => (
              <Flex column alignCenter>
                <span>{t('库存数')}</span>
                <span>{t('(采购单位)')}</span>
              </Flex>
            ),
            Cell: (row) => {
              const { amount, ratio, purchase_unit_name } = row.original
              return (
                <Flex justifyCenter>
                  {parseFloat(Big(amount).div(ratio).toFixed(2)) +
                    purchase_unit_name}
                </Flex>
              )
            },
          },
          {
            Header: t('批次库存均价'),
            id: 'qwavg_pricee',
            accessor: (v) =>
              parseFloat(v.avg_price) + Price.getUnit() + '/' + v.unit_name,
          },
          {
            Header: t('供应商信息'),
            accessor: 'supplier_name',
          },
          {
            Header: t('存放货位'),
            accessor: 'shelf_name',
            Cell: ({ original: { shelf_name } }) => {
              const len = shelf_name ? shelf_name.length : 0
              if (Big(len).gt(7)) {
                return (
                  <Popover showArrow type='hover' popup={hoverTips(shelf_name)}>
                    <p
                      style={{
                        width: '86px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {shelf_name}
                    </p>
                  </Popover>
                )
              }
              return shelf_name
            },
          },
          { Header: t('生产日期'), accessor: 'production_time' },
          { Header: t('到期日'), accessor: 'life_time' },
          {
            Header: TableUtil.OperationHeader,
            Cell: (row) => {
              const { original } = row
              return (
                <TableUtil.OperationCell>
                  <TableUtil.OperationDetail
                    href={`#/sales_invoicing/inventory/stock_overview/change_record?id=${original.batch_num}`}
                    open
                  />
                </TableUtil.OperationCell>
              )
            },
          },
        ]}
      />
    </BoxPanel>
  )
}

Raw.propTypes = {
  data: PropTypes.array,
  edit: PropTypes.bool,
  id: PropTypes.string,
  retention_warning_day: PropTypes.number,
}

export default Raw
