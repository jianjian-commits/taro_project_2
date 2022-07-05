import React from 'react'
import {
  InputNumberV2,
  Flex,
  Modal,
  Popover,
  RightSideModal,
  BoxTable,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import { observer, Observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import store from './store'
import globalStore from '../../stores/global'
import { SvgInfoCircle } from 'gm-svg'
import { history } from '../../common/service'
import OverFlowAndLostBatchModal from './overflow_and_lost_batch_modal'
import Big from 'big.js'
import TaskList from '../../task/task_list'

@observer
class BatchReportOverflowLost extends React.Component {
  componentDidMount() {
    if (Object.keys(store.selectFilter).length !== 0) {
      // 已经设置了参数才拉数据，防止刷新出现报错提示
      this.pagination.apiDoFirstRequest()
    }
  }

  componentDidUpdate() {
    store.isAllZero && this.handleSetZero()
  }

  componentWillUnmount() {
    Modal.hide() // 暂时先特殊处理，后面应该是层级问题统一处理
    store.clearUnSubmitData()
    store.cleanIsAllZero()
  }

  handleSetZero() {
    const { realStockNumberList } = store
    store.reportOverflowLostList.slice().forEach((item, index) => {
      realStockNumberList.has(item.spu_id) ||
        store.changeReportOverflowLostData(index, 0, 'realStockNumber')
    })
  }

  handleChangeRealStockNumber = (index, value) => {
    store.changeReportOverflowLostData(index, value, 'realStockNumber')
  }

  handleChangeRemarkInput = (index, e) => {
    store.changeReportOverflowLostData(index, e.target.value, 'remark')
  }

  handleRenderBatchModal = (spuId, stdUnitName, spuName) => {
    const { overflowAndLostNumber } = store
    const isOverflow = overflowAndLostNumber.get(spuId) > 0

    RightSideModal.render({
      children: (
        <OverFlowAndLostBatchModal
          isOverflowType={isOverflow}
          spuId={spuId}
          stdUnitName={stdUnitName}
          spuName={spuName}
        />
      ),
      onHide: Modal.hide,
      size: 'lg',
    })
  }

  handleShowModal = (show, fn) => {
    if (show) {
      Modal.render({
        children: <p>{i18next.t('一键实盘归零，会把所有页的数据置零！')}</p>,
        onHide: Modal.hide,
        type: 'confirm',
        onOk: fn,
      })
    } else {
      fn()
    }
  }

  handleSubmit = () => {
    this.handleShowModal(store.isAllZero, () => {
      store.postReportOverflowLostData().then(() => {
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
        history.push('/sales_invoicing/inventory/product')
      })
    })
  }

  handleCancelInventory = () => {
    history.push('/sales_invoicing/inventory/product')
  }

  handleSetAllZero = () => {
    store.setIsAllZero(true)
    store.clearUnSubmitData()
    this.handleSetZero()
  }

  handleRenderLeft = () => (
    <Button type='primary' onClick={this.handleSetAllZero}>
      {i18next.t('一键实盘数归零')}
    </Button>
  )

  handleRenderRight = () => (
    <div>
      <Button
        className='gm-margin-right-5'
        onClick={this.handleCancelInventory}
      >
        {i18next.t('取消')}
      </Button>
      <Button
        type='primary'
        htmlType='submit'
        onClick={this.handleSubmit}
        disabled={
          !store.reportOverflowLostList.length > 0 ||
          !(store.isAllZero || store.realStockNumberList.size > 0)
        }
      >
        {i18next.t('提交')}
      </Button>
    </div>
  )

  render() {
    const list = store.reportOverflowLostList
    const {
      overflowAndLostNumber,
      realStockNumberList,
      remarkList,
      spuOperatedBatchMap,
    } = store
    const { stock_method } = globalStore.user

    return (
      <BoxTable
        icon='bill'
        info={stock_method === 1 ? this.handleRenderLeft() : null}
        action={this.handleRenderRight()}
      >
        <ManagePaginationV2
          id='pagination_in_product_batch_report_overflow_lost_record'
          onRequest={store.getReportOverflowLostList}
          ref={(ref) => (this.pagination = ref)}
        >
          <Table
            data={list.slice()}
            columns={[
              {
                Header: i18next.t('商品ID'),
                accessor: 'spu_id',
              },
              {
                Header: i18next.t('商品名'),
                accessor: 'name',
              },
              {
                Header: i18next.t('商品分类'),
                accessor: 'category_name',
                Cell: ({ original: { category_name_1, category_name_2 } }) => (
                  <>
                    {category_name_1}/{category_name_2}
                  </>
                ),
              },
              {
                id: 'remain',
                Header: i18next.t('抄盘数'),
                accessor: 'remain',
                Cell: ({ original: { remain, std_unit_name } }) => (
                  <>
                    {Big(remain).toFixed(2)}
                    {std_unit_name}
                  </>
                ),
              },
              {
                Header: i18next.t('实盘数'),
                Cell: (row) => {
                  return (
                    <Flex alignCenter>
                      <Observer>
                        {() => {
                          return (
                            <InputNumberV2
                              min={0}
                              style={{ width: '80%' }}
                              className='form-control'
                              value={
                                realStockNumberList.has(row.original.spu_id)
                                  ? realStockNumberList.get(row.original.spu_id)
                                  : null
                              }
                              onChange={this.handleChangeRealStockNumber.bind(
                                this,
                                row.index,
                              )}
                            />
                          )
                        }}
                      </Observer>
                      {row.original.std_unit_name}
                    </Flex>
                  )
                },
              },
              {
                id: 'overflow_and_lost',
                Header: (
                  <Popover
                    showArrow
                    type='hover'
                    component={<div />}
                    popup={
                      <div
                        className='gm-border gm-padding-5 gm-bg gm-text-12'
                        style={{ width: '100px' }}
                      >
                        {i18next.t(
                          '实盘数少于抄盘数的数据将计入报损记录，实盘数大于抄盘数的数据将计入报溢记录',
                        )}
                      </div>
                    }
                  >
                    <span style={{ lineHeight: '14px' }}>
                      {i18next.t('报溢/报损数')}&nbsp;
                      <SvgInfoCircle style={{ fontSize: '14px' }} />
                    </span>
                  </Popover>
                ),
                accessor: (d) => {
                  return (
                    <span>
                      {overflowAndLostNumber.get(d.spu_id)
                        ? Big(overflowAndLostNumber.get(d.spu_id)).toFixed(2) +
                          d.std_unit_name
                        : '-'}
                    </span>
                  )
                },
              },
              {
                id: 'overflow_and_lost_batch',
                show: stock_method === 2,
                Header: i18next.t('报溢/报损批次'),
                accessor: (d) => {
                  return (
                    <Observer>
                      {() => {
                        return (
                          <span
                            style={{
                              cursor: realStockNumberList.has(d.spu_id)
                                ? 'pointer'
                                : 'default',
                              color: realStockNumberList.has(d.spu_id)
                                ? '#1e80e5'
                                : '#000',
                            }}
                            onClick={
                              realStockNumberList.has(d.spu_id)
                                ? this.handleRenderBatchModal.bind(
                                    this,
                                    d.spu_id,
                                    d.std_unit_name,
                                    d.name,
                                  )
                                : () => {}
                            }
                          >
                            {spuOperatedBatchMap.has(d.spu_id)
                              ? i18next.t('查看批次')
                              : i18next.t('选择批次')}
                          </span>
                        )
                      }}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('备注'),
                Cell: (row) => {
                  return (
                    <Observer>
                      {() => {
                        return (
                          <input
                            type='text'
                            className='form-control'
                            value={
                              remarkList.has(row.original.spu_id)
                                ? remarkList.get(row.original.spu_id)
                                : ''
                            }
                            onChange={this.handleChangeRemarkInput.bind(
                              this,
                              row.index,
                            )}
                          />
                        )
                      }}
                    </Observer>
                  )
                },
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default BatchReportOverflowLost
