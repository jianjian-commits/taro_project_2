import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, RightSideModal, Select, Input } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { observer, Observer } from 'mobx-react'

import ReceiveTime from '../components/receive_time'
import TipBox from './components/tip_box'
import SkusList from './skus_list'
import { getOrderExpanded, validTip, serviceTimeValidFun } from './util'
import store from './store'
import { getSkusLength } from '../util'
import UnReceiveTimes from '../components/un_receive_times'

export default observer(() => {
  const { details, serviceTime, orderTypeOptions } = store

  const renderModal = (index) => {
    RightSideModal.render({
      children: <Observer>{() => <SkusList index={index} />}</Observer>,
      onHide: RightSideModal.hide,
      noCloseBtn: true,
      style: { width: '900px' },
    })
  }

  return (
    <Table
      data={details.slice()}
      columns={[
        {
          Header: i18next.t('序号'),
          minWidth: 50,
          accessor: 'index',
        },
        {
          Header: i18next.t('商户'),
          minWidth: 150,
          accessor: 'resname',
          Cell: (row) => {
            const {
              original: { code, skus, sid, resname, time_config_info },
              index,
            } = row

            if (
              (code > 0 && (!skus || skus.length === 0)) ||
              (!code && serviceTimeValidFun(time_config_info))
            )
              return resname || sid || '-'
            return (
              <>
                <a
                  onClick={() => {
                    renderModal(index)
                  }}
                >
                  {resname}
                </a>
                {skus.length === 0 && (
                  <div className='b-import-order-count-zero' />
                )}
              </>
            )
          },
        },
        {
          Header: i18next.t('商品数'),
          minWidth: 60,
          accessor: 'skus',
          Cell: ({ original: { code, skus } }) => {
            if (code > 0 && (!skus || skus.length === 0)) return '-'
            return getSkusLength(skus) + i18next.t('种')
          },
        },
        {
          Header: i18next.t('订单金额'), // 汇总数据
          minWidth: 60,
          accessor: 'total_price',
        },
        {
          Header: (
            <div>
              {i18next.t('收货时间')}
              <UnReceiveTimes
                unReceiveTimes={(serviceTime.undelivery_times || []).slice()}
              />
            </div>
          ),
          width: 370,
          accessor: 'receive_time',
          Cell: (row) => {
            const { original, index } = row

            if (
              original.code > 0 &&
              (!original.skus || original.skus.length === 0)
            )
              return '-'
            return (
              <div className='b-order-add-servicetime-box'>
                <ReceiveTime
                  order={original}
                  onReceiveTimeChange={(changed) => {
                    store.orderEdit(index, changed)
                  }}
                />
              </div>
            )
          },
        },
        {
          Header: i18next.t('收货人'),
          minWidth: 100,
          accessor: 'receiver_name',
        },
        {
          Header: i18next.t('收货地址'),
          minWidth: 200,
          accessor: 'address',
        },
        {
          Header: i18next.t('订单备注'),
          minWidth: 200,
          accessor: 'remark',
          Cell: (row) => {
            const {
              original: { remark },
              index,
            } = row

            return (
              <Input
                value={remark}
                onChange={(e) =>
                  store.orderEdit(index, { remark: e.target.value })
                }
                className='form-control'
                maxlength={128}
              />
            )
          },
        },
        {
          Header: i18next.t('订单类型'),
          minWidth: 200,
          accessor: 'order_process_type_id',
          Cell: (row) => {
            const {
              original: { order_process_type_id, msg },
              index,
            } = row
            return (
              <div className='b-order-add-servicetime-box'>
                <Select
                  data={orderTypeOptions.filter(({ value }) => value !== '0')}
                  value={order_process_type_id}
                  onChange={(order_process_type_id) => {
                    const changeParams = {
                      order_process_type_id,
                    }
                    if (msg === '订单类型异常') {
                      changeParams.msg = ''
                    }
                    store.orderEdit(index, changeParams)
                  }}
                  style={{ width: 80 }}
                />
              </div>
            )
          },
        },
        {
          minWidth: 80,
          Header: TableUtil.OperationHeader,
          Cell: (row) => {
            const {
              original: { code, time_config_info },
            } = row

            return (
              <TableUtil.OperationCell>
                {(!code && serviceTimeValidFun(time_config_info)) ||
                  code > 0 ? null : (
                  <a
                    onClick={() => {
                      store.singleSave(row.index)
                    }}
                  >
                    {i18next.t('保存')}
                  </a>
                )}
                <a
                  onClick={() => {
                    store.orderDelete(row.index)
                  }}
                  className='gm-margin-5'
                >
                  {i18next.t('删除')}
                </a>
              </TableUtil.OperationCell>
            )
          },
        },
        {
          expander: true,
          show: false,
          Expander: null,
        },
      ]}
      expanded={getOrderExpanded(details)}
      defaultPageSize={9999}
      SubComponent={(row) => {
        const {
          original: {
            skus,
            msg,
            code,
            time_config_info,
            freight,
            total_price,
            remark,
          },
          index,
        } = row

        const style = index % 2 ? { backgroundColor: '#f5f5f7' } : {}
        const isValidTip = !code && validTip(skus, total_price, freight)
        const serviceError = !code && serviceTimeValidFun(time_config_info)
        const remarkConflictTip =
          remark === undefined
            ? i18next.t('存在多个订单备注，请重新填写！')
            : undefined
        const message = serviceError || isValidTip || msg || remarkConflictTip

        return (
          message && (
            <TipBox
              style={style}
              tip={message}
              others={
                serviceError || code > 0
                  ? null
                  : message &&
                  isValidTip && (
                    <Flex className='gm-padding-lr-10'>
                      <a
                        onClick={() => {
                          renderModal(index)
                        }}
                        className='gm-cursor'
                      >
                        {i18next.t('点击修改')}
                      </a>
                    </Flex>
                  )
              }
            />
          )
        )
      }}
    />
  )
})
