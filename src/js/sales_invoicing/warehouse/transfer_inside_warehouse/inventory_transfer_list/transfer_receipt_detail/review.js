import React from 'react'
import { observer, Observer } from 'mobx-react'
import { Flex, Button, Tip, Popover, BoxPanel, FunctionSet } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { Table, diyTableHOC } from '@gmfe/table'
import store from './store'
import commonStore from '../../../store'
import { receiptType, getFormatShelfName, receiptTypeTag } from '../../../util'
import moment from 'moment'
import { history, withBreadcrumbs } from '../../../../../common/service'

import { SvgWarningCircle } from 'gm-svg'
import globalStore from '../../../../../stores/global'

import ReceiptHeaderDetail from 'common/components/receipt_header_detail'

const DiyTable = diyTableHOC(Table)
@withBreadcrumbs([i18next.t('移库单详情')])
@observer
class ReviewDetail extends React.Component {
  componentDidMount() {
    Promise.all([commonStore.fetchShelfList()]).then(() => {
      store.setEditTransferDataFromList()
    })
  }

  handleFailReview = () => {
    store.postEditTransferListData(3).then(() => {
      history.push(
        '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list',
      )
    })
  }

  handleDelete = () => {
    store.postEditTransferListData(5).then(() => {
      history.push(
        '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list',
      )
    })
  }

  handleSubmit = () => {
    store.postEditTransferListData(4).then((json) => {
      if (json.data && json.data.batch_errors) {
        Tip.warning(
          i18next.t('存在移库异常，请根据提示指引进行修改，再进行移库操作'),
        )
        store.setDataByErrorList(json.data.batch_errors)
      } else {
        history.push(
          '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list',
        )
      }
    })
  }

  renderHeaderAction = () => {
    const { transferReceiptDetail } = store
    const canReview = transferReceiptDetail.status === 2 // 该状态下可被审核

    return (
      <Flex alignCenter>
        <Button
          type='primary'
          className='gm-margin-right-5 gm-margin-tb-5'
          onClick={this.handleSubmit}
          style={{
            display:
              canReview &&
              globalStore.hasPermission('edit_pass_inner_transfer_sheet')
                ? 'block'
                : 'none',
          }}
        >
          {i18next.t('确认移库')}
        </Button>
        <FunctionSet
          data={[
            {
              text: i18next.t('审核不通过'),
              onClick: this.handleFailReview,
              show:
                canReview &&
                globalStore.hasPermission('edit_pass_inner_transfer_sheet'),
            },
            {
              text: i18next.t('冲销'),
              onClick: this.handleDelete,
              show:
                canReview &&
                globalStore.hasPermission('delete_inner_transfer_sheet'),
            },
          ]}
        />
      </Flex>
    )
  }

  renderReceiptDetail = () => {
    const {
      transferReceiptDetail: { submit_time, remark, creator, status, sheet_no },
    } = store

    return (
      <ReceiptHeaderDetail
        HeaderInfo={[
          {
            label: i18next.t('移库单号'),
            item: <div style={{ width: '280px' }}>{sheet_no}</div>,
          },
        ]}
        HeaderAction={this.renderHeaderAction()}
        ContentInfo={[
          {
            label: i18next.t('移库单状态'),
            item: <span>{receiptType[status]}</span>,
            tag: receiptTypeTag(status),
          },
          {
            label: i18next.t('建单人'),
            item: <span>{creator}</span>,
          },
          {
            label: i18next.t('提交时间'),
            item: (
              <span>
                {submit_time
                  ? moment(submit_time).format('YYYY-MM-DD hh:mm:ss')
                  : '-'}
              </span>
            ),
          },
          {
            label: i18next.t('单据备注'),
            item: <span>{remark || '-'}</span>,
          },
        ]}
      />
    )
  }

  render() {
    const { transferList, transferReceiptDetail, errorBatchList } = store
    const canReview = transferReceiptDetail.status === 2

    return (
      <div>
        {this.renderReceiptDetail()}
        <BoxPanel
          collapse
          title={i18next.t('移库商品明细')}
          summary={[{ text: '合计', value: transferList.length }]}
        >
          <DiyTable
            id='review_transfer_table'
            data={transferList.slice()}
            diyGroupSorting={['基础字段']}
            style={{ maxWidth: '100%', maxHeight: '800px' }}
            columns={[
              {
                Header: i18next.t('商品ID'),
                minWidth: 100,
                diyGroupName: '基础字段',
                accessor: 'spu_id',
              },
              {
                Header: i18next.t('商品名称'),
                minWidth: 100,
                diyGroupName: '基础字段',
                accessor: 'spu_name',
              },
              {
                accessor: 'category',
                diyGroupName: '基础字段',
                Header: i18next.t('商品分类'),
                minWidth: 100,
                Cell: ({ original }) => {
                  return (
                    <span>{`${original.category_1_name}/${original.category_2_name}`}</span>
                  )
                },
              },
              {
                Header: i18next.t('移出批次号'),
                diyEnable: false,
                minWidth: 200,
                diyGroupName: '基础字段',
                accessor: 'out_batch_num',
                Cell: ({ original }) => {
                  const isBatchError =
                    errorBatchList.has(original.out_batch_num) &&
                    errorBatchList.get(original.out_batch_num).includes(1)

                  return (
                    <Observer>
                      {() => (
                        <Flex>
                          <span>{original.out_batch_num}</span>
                          {isBatchError && (
                            <Popover
                              showArrow
                              component={<div />}
                              type='hover'
                              popup={
                                <div
                                  className='gm-border gm-padding-5 gm-bg gm-text-12'
                                  style={{ width: '100px' }}
                                >
                                  {i18next.t('批次不存在或者被锁定')}
                                </div>
                              }
                            >
                              <span>
                                <SvgWarningCircle style={{ color: 'red' }} />
                              </span>
                            </Popover>
                          )}
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                accessor: 'out_shelf_name',
                Header: i18next.t('移出货位'),
                diyEnable: false,
                minWidth: 150,
                diyGroupName: '基础字段',
                Cell: ({ original }) => {
                  return (
                    <span>
                      {getFormatShelfName(original.out_shelf) ||
                        i18next.t('未分配')}
                    </span>
                  )
                },
              },
              {
                accessor: 'remain',
                Header: i18next.t('剩余库存（基本单位）'),
                minWidth: 150,
                diyGroupName: '基础字段',
                show: canReview,
                diyEnable: false,
                Cell: ({ original }) => {
                  return (
                    <Observer>
                      {() => (
                        <span>
                          {original.remain || original.remain === 0
                            ? `${original.remain}/${original.unit_name}`
                            : `-/${original.unit_name || '-'}`}
                        </span>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('移出数量'),
                diyEnable: false,
                minWidth: 130,
                diyGroupName: '基础字段',
                accessor: 'out_amount',
                Cell: ({ original }) => {
                  const isRemainError =
                    errorBatchList.has(original.out_batch_num) &&
                    errorBatchList.get(original.out_batch_num).includes(3) &&
                    original.remain < original.out_amount

                  return (
                    <Observer>
                      {() => (
                        <Flex alignCenter>
                          <span className='gm-padding-5'>
                            {`${original.out_amount}${original.unit_name}`}
                          </span>
                          {isRemainError && (
                            <Popover
                              showArrow
                              component={<div />}
                              type='hover'
                              popup={
                                <div
                                  className='gm-border gm-padding-5 gm-bg gm-text-12'
                                  style={{ width: '100px' }}
                                >
                                  {i18next.t(
                                    '该批次当前库存低于需移库数量，请确认该批次当前库存',
                                  )}
                                </div>
                              }
                            >
                              <span>
                                <SvgWarningCircle style={{ color: 'red' }} />
                              </span>
                            </Popover>
                          )}
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('移入货位'),
                diyEnable: false,
                minWidth: 150,
                diyGroupName: '基础字段',
                accessor: 'in_shelf_name',
                Cell: ({ original }) => {
                  const isShelfError =
                    errorBatchList.has(original.out_batch_num) &&
                    errorBatchList.get(original.out_batch_num).includes(2)

                  return (
                    <Observer>
                      {() => (
                        <Flex alignCenter>
                          <span className='gm-padding-5'>
                            {original.in_shelf.length > 0
                              ? getFormatShelfName(original.in_shelf)
                              : '-'}
                          </span>
                          {isShelfError && (
                            <Popover
                              showArrow
                              component={<div />}
                              type='hover'
                              popup={
                                <div
                                  className='gm-border gm-padding-5 gm-bg gm-text-12'
                                  style={{ width: '100px' }}
                                >
                                  {i18next.t(
                                    '当前货位已被删除，请审核不通过重新选择货位',
                                  )}
                                </div>
                              }
                            >
                              <span>
                                <SvgWarningCircle style={{ color: 'red' }} />
                              </span>
                            </Popover>
                          )}
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('移入批次号'),
                diyEnable: false,
                minWidth: 100,
                diyGroupName: '基础字段',
                accessor: 'in_batch_num',
              },
              {
                Header: i18next.t('批次状态'),
                diyEnable: false,
                minWidth: 100,
                accessor: 'in_batch_status',
                diyGroupName: '基础字段',
                Cell: ({ index, original: { in_batch_status } }) => {
                  return (
                    <Observer>
                      {() => {
                        // status: 1  // M, int,-1，删除；1，待提交（净菜）；2，正常；3，损坏；4，临期；5，过期
                        if ([-1, 1].includes(in_batch_status)) return '-'
                        const map = {
                          2: '正常',
                          3: '损坏',
                          4: '临期',
                          5: '过期',
                        }
                        // eslint-disable-next-line no-prototype-builtins
                        if (!map.hasOwnProperty(in_batch_status)) return '-'

                        return map[in_batch_status]
                      }}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('备注'),
                minWidth: 150,
                diyGroupName: '基础字段',
                accessor: 'remark',
              },
            ]}
          />
        </BoxPanel>
      </div>
    )
  }
}

export default ReviewDetail
