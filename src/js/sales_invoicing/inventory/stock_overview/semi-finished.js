import { t } from 'gm-i18n'
import React from 'react'
import { PropTypes } from 'prop-types'
import { BoxPanel, Flex, Price, Popover, RightSideModal } from '@gmfe/react'
import { Table } from '@gmfe/table'
import { Big } from 'big.js'
import CompletedTaskList from '../../components/completed_task_list'

const SemiFinished = ({ data }) => {
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

  const handleDetail = (batch_num) => {
    RightSideModal.render({
      children: <CompletedTaskList batch_num={batch_num} />,
      onHide: RightSideModal.hide,
      title: t('已完成工艺信息'),
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  return (
    <BoxPanel title={t('半成品批次')} collapse>
      <Table
        data={data}
        columns={[
          {
            Header: t('入库批次号'),
            width: 350,
            accessor: 'batch_num',
            Cell: (row) => {
              const { batch_num } = row.original
              return (
                <span
                  onClick={() => handleDetail(batch_num)}
                  className='text-primary gm-cursor'
                >
                  {batch_num}
                </span>
              )
            },
          },
          {
            Header: t('商品名'),
            accessor: 'name',
          },
          {
            Header: () => (
              <Flex column alignCenter>
                <span>{t('入库数')}</span>
                <span>{t('(基本单位)')}</span>
              </Flex>
            ),
            Cell: (row) => {
              const { amount, unit_name } = row.original
              return <Flex justifyCenter>{parseFloat(amount) + unit_name}</Flex>
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
            Header: t('入库时间'),
            accessor: 'in_stock_time',
          },
          {
            Header: t('操作人'),
            accessor: 'creator',
          },
        ]}
      />
    </BoxPanel>
  )
}

SemiFinished.propTypes = {
  data: PropTypes.array,
  edit: PropTypes.bool,
}

export default SemiFinished
