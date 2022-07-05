import { t } from 'gm-i18n'
import React from 'react'
import { PropTypes } from 'prop-types'
import { BoxPanel, Flex, Price, Popover, Tip, ToolTip } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { Big } from 'big.js'
// import CompletedTaskList from '../components/completed_task_list'
import EditAmountModal from './edit_amount_modal'
import stockList from './store'
import moment from 'moment'

const { EditButton } = TableUtil

const Finished = ({ data, edit, id, retention_warning_day }) => {
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
    let realAmount = null

    // 成品批次数量是销售单位需要转成基本单位
    realAmount = Big(data.currentAmount || 0)
      .times(data.ratio)
      .toFixed(2)

    const remark = data.currentRemark

    return stockList
      .editBatchStock({
        batch_number: data.batch_num,
        new_remain: realAmount,
        remark,
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
    <BoxPanel title={t('成品批次')} collapse>
      <Table
        data={data}
        columns={[
          {
            Header: t('批次号'),
            width: 350,
            accessor: 'batch_num',
            Cell: (row) => {
              const { batch_num } = row.original

              return <span>{batch_num}</span>
            },
          },
          {
            Header: t('销售规格ID'),
            accessor: 'sale_sku_id',
          },
          {
            Header: t('销售规格名'),
            accessor: 'sale_name',
          },

          {
            Header: t('销售规格'),
            accessor: 'sale_ratio',
            Cell: (cellProps) => {
              const { ratio, unit_name, sale_unit_name } = cellProps.original
              return ratio + unit_name + '/' + sale_unit_name
            },
          },
          {
            Header: (
              <Flex column alignCenter>
                <span>{t('库存数')}</span>
                <span>{t('(基本单位)')}</span>
              </Flex>
            ),
            accessor: 'amount',
            Cell: (row) => {
              const { amount, unit_name } = row.original
              return <Flex justifyCenter>{parseFloat(amount) + unit_name}</Flex>
            },
          },

          {
            Header: (
              <Flex column alignCenter>
                <span>{t('库存数')}</span>
                <span>{t('(销售单位)')}</span>
              </Flex>
            ),
            accessor: 'sale_amount',
            Cell: (cellProps) => {
              const { amount, ratio, sale_unit_name } = cellProps.original
              return (
                <Flex justifyCenter>
                  <span>
                    {Big(amount || 0)
                      .div(ratio)
                      .toFixed(2) + sale_unit_name}
                  </span>
                  {edit && (
                    <EditButton
                      popupRender={(closePopup) => (
                        <EditAmountModal
                          data={cellProps.original}
                          type='product'
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
            Header: t('入库单价'),
            id: 'unit_price',
            accessor: (v) =>
              parseFloat(v.unit_price) + Price.getUnit() + '/' + v.unit_name,
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
              return shelf_name || '-'
            },
          },
          {
            Header: t('生产日期'),
            accessor: 'production_time',
            Cell: (row) =>
              row.original.production_time
                ? moment(row.original.production_time).format('YYYY-MM-DD')
                : '-',
          },
          {
            Header: t('到期日'),
            accessor: 'life_time',
            Cell: (row) =>
              row.original.life_time
                ? moment(row.original.life_time).format('YYYY-MM-DD')
                : '-',
          },
          {
            Header: TableUtil.OperationHeader,
            Cell: (row) => {
              const { batch_num } = row.original
              return (
                <TableUtil.OperationCell>
                  <TableUtil.OperationDetail
                    href={`#/sales_invoicing/inventory/stock_overview/change_record?id=${batch_num}`}
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

Finished.propTypes = {
  data: PropTypes.array,
  edit: PropTypes.bool,
  id: PropTypes.string,
  retention_warning_day: PropTypes.number,
}

export default Finished
