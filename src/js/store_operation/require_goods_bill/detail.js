import { i18next, t } from 'gm-i18n'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  Button,
  BoxTable,
  InputNumber,
  Tip,
  Dialog,
  RightSideModal,
  Price,
  FunctionSet,
} from '@gmfe/react'
import { Table, selectTableV2HOC } from '@gmfe/table'
import PrintModal from './components/right_print_modal'
import requireStore from './store'
import BatchUpdateDialog from './components/batch_update_dialog'
import RequireGoodsShare from './components/share_qrcode'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import Big from 'big.js'
import moment from 'moment'
import globalStore from '../../stores/global'
import HeaderTip from 'common/components/header_tip'

const SelectTable = selectTableV2HOC(Table)

@observer
class RequireGoodsBillDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
    }
  }

  componentDidMount() {
    this.getRequireGoodsSheetDetail()
  }

  // 获取详情数据
  getRequireGoodsSheetDetail() {
    const { id } = this.props.params
    requireStore.setSheetNo(id)
    requireStore.getRequireGoodsSheetDetail(id)
  }

  // 确认报价
  handleSubmit = () => {
    requireStore.saveEditConfirmQuotation(true).then(() => {
      Tip.success(i18next.t('确认报价成功！'))
      this.getRequireGoodsSheetDetail()
    })
  }

  // 保存草稿
  handleSaveDraft = () => {
    requireStore.saveEditConfirmQuotation(false).then(() => {
      Tip.success(i18next.t('保存草稿成功！'))
    })
  }

  // 批量修改
  handleBatchDialogToggle = () => {
    this.setState({
      show: !this.state.show,
    })
  }

  handleOrderUploadToggle = () => {
    this.setState({
      show: !this.state.show,
    })
  }

  // 打印
  showSidePrintModal() {
    const templates = [
      { type: '1', name: i18next.t('要货单总表') },
      {
        type: '2',
        name: i18next.t('要货单明细-模板一'),
        desc: i18next.t('商户明细一行展示'),
      },
      {
        type: '3',
        name: i18next.t('要货单明细-模板二'),
        desc: i18next.t('商户明细一行2列展示,带分拣号'),
      },
      {
        type: '4',
        name: i18next.t('要货单明细-模板三'),
        desc: i18next.t('商户明细和商品信息同一行展示,带分拣号'),
      },
    ]

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PrintModal
          name='require_goods_print'
          onPrint={this.handlePrint}
          templates={templates}
        />
      ),
    })
  }

  handlePrint(type) {
    const id = requireStore.require_goods_detail.id
    window.open(
      `#/supply_chain/purchase/require_goods/print?id=${id}&printType=${type}`,
    )
  }

  // 分享单据
  handleShareQrcode = (id) => {
    requireStore.getRequireGoodsShareToken(id).then((json) => {
      const params = {
        id: id,
        token: json.data.token,
        group_id: globalStore.groupId,
      }

      Dialog.dialog({
        title: i18next.t('要货单据分享'),
        children: <RequireGoodsShare shareUrlParam={params} />,
        OKBtn: false,
        size: 'md',
      })
    })
  }

  handleChange = (index, name, value) => {
    requireStore.setRequireGoodsDetailAmountAndPrice(index, name, value)
  }

  // 同步分拣数据
  handleSynchronizedSortingData = (id) => {
    const { selected } = requireStore

    if (selected.length <= 0) {
      Dialog.alert({
        title: i18next.t('提示'),
        children: '请至少选择一个商品',
        size: 'sm',
      })
      return
    }

    Dialog.confirm({
      children: (
        <Flex column>
          <Flex justifyCenter className='gm-padding-10'>
            同步后，所选商品供货数量会更新成实际分拣数据，确定要同步吗？
          </Flex>
          <div className='gm-text-red'>说明：</div>
          <Flex column className='gm-p'>
            <div className='gm-text-red'>
              1.分拣数据来自于使用供应商分拣系统分拣的商品的汇总数据
            </div>
            <div className='gm-text-red'>
              2.若已完成分拣，则计重商品同步实际分拣数量，不计重商品若称重则同步实际称重数量，若未称重则同步计划要货数量
            </div>
            <div className='gm-text-red'>
              3.若未完成分拣，则计重商品同步完成部分的实际分拣数量，不计重商品若称重则同步已完成部分的实际称重数量，若未称重则同步计划要货数量
            </div>
            <div className='gm-text-red'>
              4.若存在缺货商品，则供货数量展示为0
            </div>
          </Flex>
        </Flex>
      ),
      title: i18next.t('同步分拣数据'),
      size: 'md',
    }).then(() => {
      requireStore.synchronizedSortingData(id, selected.slice()).then(() => {
        Tip.success(i18next.t('分拣数据同步成功'))
      })
    })
  }

  // 选择采购单据
  handleSelect = (selected) => {
    requireStore.setSelectRequireGoodsDetail(selected)
  }

  // 选择全部
  handleSelectAll = (checked) => {
    requireStore.setSelectRequireGoodsDetailAll(checked)
  }

  render() {
    const { selected, require_goods_detail: detail } = requireStore
    if (!detail) {
      return <div />
    }
    const { details: list } = detail
    return (
      <div>
        <ReceiptHeaderDetail
          contentLabelWidth={60}
          contentBlockWidth={350}
          HeaderInfo={[
            {
              label: i18next.t('要货单据'),
              item: <div>{detail.sheet_no || '-'}</div>,
            },
            {
              label: i18next.t('要货站点'),
              item: <div>{detail.apply_station_name || '-'}</div>,
            },
          ]}
          ContentInfo={[
            {
              label: i18next.t('单据状态'),
              item: (
                <div>
                  {detail.status
                    ? requireStore.findBillStatus(detail.status)
                    : '-'}
                </div>
              ),
            },
            {
              label: i18next.t('处理时间'),
              item: (
                <div>
                  {detail.submit_time
                    ? moment(detail.submit_time).format('YYYY-MM-DD HH:mm:ss')
                    : '-'}
                </div>
              ),
            },
            {
              label: i18next.t('处理人'),
              item: <div>{detail.submit_username || '-'}</div>,
            },
          ]}
          HeaderAction={
            <Flex>
              {detail.status === 3 || detail.status === 4 ? null : (
                <Button
                  type='primary'
                  className='gm-margin-right-10'
                  onClick={this.handleSubmit}
                >
                  {i18next.t('确认报价')}
                </Button>
              )}
              {detail.status !== 4 && (
                <FunctionSet
                  right
                  data={[
                    {
                      text: i18next.t('保存草稿'),
                      show: detail.status !== 3,
                      onClick: this.handleSaveDraft.bind(this, false),
                    },
                    {
                      text: i18next.t('批量修改'),
                      show: detail.status !== 3,
                      onClick: this.handleBatchDialogToggle,
                    },
                    {
                      text: i18next.t('打印'),
                      onClick: this.showSidePrintModal.bind(this, detail.id),
                    },
                    {
                      text: i18next.t('分享单据'),
                      onClick: this.handleShareQrcode.bind(this, detail.id),
                    },
                  ]}
                />
              )}
            </Flex>
          }
        />
        <BoxTable
          icon='bill'
          info={<BoxTable.Info>{i18next.t('明细列表')}</BoxTable.Info>}
          action={
            detail.status === 3 || detail.status === 4 ? null : (
              <div>
                <Button
                  type='primary'
                  onClick={this.handleSynchronizedSortingData.bind(
                    this,
                    detail.id,
                  )}
                >
                  {i18next.t('同步分拣数据')}
                </Button>
              </div>
            )
          }
        >
          <SelectTable
            data={list.slice()}
            keyField='id'
            selected={selected}
            onSelectAll={this.handleSelectAll}
            onSelect={this.handleSelect}
            columns={[
              {
                Header: t('商品名称'),
                accessor: 'purchase_spec_name',
              },
              {
                Header: t('规格'),
                accessor: 'ratio',
                Cell: ({ original: d, value }) =>
                  value + d.std_unit_name + '/' + d.purchase_unit_name,
              },
              {
                Header: t('计划要货数'),
                accessor: 'plan_amount',
                Cell: ({ original: d, value }) =>
                  Big(value || 0)
                    .div(Big(d.ratio))
                    .toFixed(2) +
                  d.purchase_unit_name +
                  '(' +
                  value +
                  d.std_unit_name +
                  ')',
              },
              {
                Header: t('供货数量'),
                accessor: 'supply_purchase_amount',
                Cell: ({ original: d, value, index: i }) => {
                  const { purchase_unit_name } = d
                  return (
                    <Flex alignCenter>
                      {detail.status === 2 ? (
                        <>
                          <InputNumber
                            min={0}
                            precision={2}
                            max={999999999}
                            value={value}
                            className='form-control'
                            style={{ width: '80px', textAlign: 'center' }}
                            onChange={this.handleChange.bind(
                              this,
                              i,
                              'supply_purchase_amount',
                            )}
                          />
                          <span className='gm-margin-left-5'>
                            {purchase_unit_name || '-'}
                          </span>
                        </>
                      ) : (
                        value + purchase_unit_name
                      )}
                    </Flex>
                  )
                },
              },
              {
                Header: (
                  <HeaderTip
                    title={t('供货单价')}
                    tip={t('提示：商品存在未过期周期报价时不允许修改供货价！')}
                  />
                ),
                accessor: 'supply_std_price',
                Cell: ({ original: d, value, index: i }) => {
                  const { std_unit_name, ban_edit_price } = d
                  return (
                    <Flex alignCenter>
                      {detail.status === 2 && ban_edit_price === 0 ? (
                        <>
                          <InputNumber
                            min={0}
                            max={999999999}
                            precision={2}
                            value={value}
                            className='form-control'
                            style={{ width: '80px', textAlign: 'center' }}
                            onChange={this.handleChange.bind(
                              this,
                              i,
                              'supply_std_price',
                            )}
                          />
                          <span className='gm-margin-left-5'>
                            {Price.getUnit() + '/' + std_unit_name}
                          </span>
                        </>
                      ) : (
                        value + Price.getUnit() + '/' + std_unit_name
                      )}
                    </Flex>
                  )
                },
              },
              {
                Header: t('供货金额'),
                accessor: 'supply_std_price',
                Cell: ({ original, value }) => {
                  const {
                    ratio,
                    supply_purchase_amount,
                    supply_std_price,
                  } = original
                  return (
                    Big(Big(supply_purchase_amount || 0).times(Big(ratio)))
                      .times(Big(supply_std_price))
                      .toFixed(2) + Price.getUnit()
                  )
                },
              },
            ]}
          />
        </BoxTable>

        <BatchUpdateDialog
          require_goods_id={detail.id}
          onHide={this.handleBatchDialogToggle}
          show={this.state.show}
        />
      </div>
    )
  }
}

export default RequireGoodsBillDetail
