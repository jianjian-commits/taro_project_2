import React from 'react'
import { observer, Observer } from 'mobx-react'
import {
  Flex,
  Button,
  RightSideModal,
  Modal,
  Tip,
  Dialog,
  Popover,
  FunctionSet,
  BoxPanel,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import {
  TableUtil,
  diyTableHOC,
  EditTable,
  fixedColumnsTableHOC,
} from '@gmfe/table'
import store from './store'
import BatchSelectModal from '../../../component/batch_select_modal'
import { toJS } from 'mobx'
import commonStore from '../../../store'
import _ from 'lodash'
import { receiptType, receiptTypeTag } from '../../../util'
import moment from 'moment'
import { history, withBreadcrumbs } from '../../../../../common/service'
import { SvgWarningCircle } from 'gm-svg'
import globalStore from '../../../../../stores/global'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { Select } from '@gmfe/react'

import {
  keyboardTableHoc,
  KCMoreSelect,
  KCInputNumberV2,
  KCLevelSelect,
  KCInput,
} from '@gmfe/keyboard'
import KeyBoardTips from 'common/components/key_board_tips'

const { OperationHeader, referOfWidth, EditTableOperation } = TableUtil
const KeyboardDiyEditTable = diyTableHOC(
  fixedColumnsTableHOC(keyboardTableHoc(EditTable)),
)
@withBreadcrumbs([i18next.t('新建移库单')])
@observer
class EditDetail extends React.Component {
  componentDidMount() {
    Promise.all([commonStore.fetchShelfList()]).then(() => {
      store.setEditTransferDataFromList()
    })
  }

  isSameSelectedBatchNum = (batchNum) => {
    let isSame = false
    const { selectedIndex } = store

    _.forEach(store.editTransferList, (v, i) => {
      if (v.out_batch_num === batchNum && selectedIndex !== i) {
        isSame = true
      }
    })

    return isSame
  }

  handleSelect = (index, selected) => {
    store.changeSpuSelected(index, selected)
  }

  handleRemarkInputChange = (index, e) => {
    store.changeTransferListCell(index, 'remark', e.target.value)
  }

  handleNumberInputChange = (index, value) => {
    store.changeTransferListCell(index, 'out_amount', value)
  }

  handleReceiptRemarkInputChange = (e) => {
    store.changeReceiptRemark(e.target.value)
  }

  handleSearch = (value) => {
    return store.searchSkuList(value)
  }

  handleSelectShelf = (index, value) => {
    if (!store.isSelectedMerchandise[index]) {
      Tip.info(i18next.t('请选择移库商品'))

      return
    }

    if (!store.isSelectedOutBatchNum[index]) {
      Tip.info(i18next.t('请选择移出批次号'))

      return
    }

    if (
      store.editTransferList[index].out_shelf_id === value[value.length - 1]
    ) {
      Tip.info(i18next.t('移入货位不能与移出货位相同'))

      return
    }

    store.changeShelfSelected(index, value)
  }

  handleSelectBatch = (selected, hideModalFunc) => {
    const { selectedIndex } = store

    if (this.isSameSelectedBatchNum(selected.batch_number)) {
      Tip.info(i18next.t('同一张移库单中不支持出现同一批次号的相同商品'))

      return
    }

    // 清空关联数据
    store.clearDataDueToBatchNum(selectedIndex)

    store.changeTransferListCell(
      selectedIndex,
      'out_batch_num',
      selected.batch_number,
    )
    store.changeTransferListCell(
      selectedIndex,
      'out_shelf_name',
      selected.shelf_name || i18next.t('未分配'),
    )
    store.changeTransferListCell(selectedIndex, 'remain', selected.remain)
    store.changeTransferListCell(
      selectedIndex,
      'out_shelf_id',
      selected.shelf_id,
    )

    hideModalFunc()
  }

  handleAddTransferListItem = () => {
    store.addTransferListItem()
  }

  handleDeleteTransferListItem = (index) => {
    store.deleteTransferListItemByIndex(index)
  }

  handleRenderBatchModal = (selectedBatchNum, index) => {
    const { spu_id } = store.editTransferList[index]

    if (!store.isSelectedMerchandise[index]) {
      Tip.info(i18next.t('请选择移库商品'))

      return
    }

    store.changeSelectedIndex(index)

    RightSideModal.render({
      title: i18next.t('选择关联入库单'),
      children: (
        <BatchSelectModal
          spuId={spu_id}
          saveSelectedBatchFunc={this.handleSelectBatch}
          currentBatchSelected={selectedBatchNum}
        />
      ),
      onHide: Modal.hide,
    })
  }

  handleCancel = () => {
    Dialog.confirm({
      children: i18next.t('确认放弃本次操作？'),
      title: i18next.t('提示'),
    }).then(() => {
      history.go(-1)
    })
  }

  handleSave = () => {
    store.postEditTransferListData().then((json) => {
      if (json.data && json.data.batch_errors) {
        Tip.warning(
          i18next.t('存在移库异常，请根据提示指引进行修改，再进行移库操作'),
        )
        store.setDataByErrorList(json.data.batch_errors)
      } else {
        window.location.reload()
      }
    })
  }

  handleSubmitReview = () => {
    store.postEditTransferListData(2).then((json) => {
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

  handleDelete = () => {
    store.postEditTransferListData(5).then(() => {
      history.push(
        '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list',
      )
    })
  }

  renderHeaderAction = () => {
    const { canSubmit } = store
    return (
      <Flex alignCenter>
        <Button
          type='primary'
          plain
          className='gm-margin-right-5'
          onClick={this.handleSave}
          disabled={!canSubmit}
          style={{
            display: globalStore.hasPermission('add_inner_transfer_sheet')
              ? 'block'
              : 'none',
          }}
        >
          {i18next.t('保存')}
        </Button>
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={this.handleSubmit}
          disabled={!canSubmit}
          style={{
            display: globalStore.hasPermission('edit_pass_inner_transfer_sheet')
              ? 'block'
              : 'none',
          }}
        >
          {i18next.t('确认移库')}
        </Button>
        <FunctionSet
          data={[
            {
              text: i18next.t('送审'),
              onClick: this.handleSubmitReview,
              disabled: !canSubmit,
              show: globalStore.hasPermission('add_inner_transfer_sheet'),
            },
            {
              text: i18next.t('冲销'),
              onClick: this.handleDelete,
              show: globalStore.hasPermission('delete_inner_transfer_sheet'),
            },
          ]}
        />
      </Flex>
    )
  }

  renderReceiptDetail = () => {
    const {
      transferReceiptDetail: { submit_time, creator, status },
      receiptRemark,
    } = store

    return (
      <ReceiptHeaderDetail
        HeaderInfo={[
          {
            label: i18next.t('移库单号'),
            item: (
              <div style={{ width: '280px' }}>
                {store.transferReceiptDetail.sheet_no}
              </div>
            ),
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
            item: (
              <input
                maxLength={15}
                type='text'
                value={receiptRemark || ''}
                className='form-control input-sm'
                onChange={this.handleReceiptRemarkInputChange}
                style={{ width: '150px' }}
              />
            ),
          },
        ]}
      />
    )
  }

  render() {
    const { editTransferList, spuList, errorBatchList } = store
    const { shelfList } = commonStore

    return (
      <div>
        {this.renderReceiptDetail()}
        <BoxPanel
          summary={[
            { text: i18next.t('合计'), value: editTransferList.length },
          ]}
          collapse
          title={i18next.t('移库商品明细')}
          right={<KeyBoardTips />}
        >
          <KeyboardDiyEditTable
            id='edit_transfer_table'
            data={editTransferList.slice()}
            diyGroupSorting={['基础字段']}
            onAddRow={this.handleAddTransferListItem}
            style={{ maxWidth: '100%', maxHeight: '800px' }}
            columns={[
              {
                Header: OperationHeader,
                fixed: 'left',
                diyEnable: false,
                accessor: 'action',
                width: referOfWidth.operationCell,
                Cell: (cellProps) => (
                  <EditTableOperation
                    onAddRow={this.handleAddTransferListItem}
                    onDeleteRow={
                      editTransferList.length === 1
                        ? undefined
                        : this.handleDeleteTransferListItem.bind(
                            this,
                            cellProps.index,
                          )
                    }
                  />
                ),
              },
              {
                id: 'spu_id',
                Header: i18next.t('商品ID'),
                minWidth: 100,
                diyGroupName: '基础字段',
                accessor: (d) => {
                  return (
                    <Observer>{() => <span>{d.spu_id || '-'}</span>}</Observer>
                  )
                },
              },
              {
                Header: i18next.t('商品名称'),
                accessor: 'name',
                diyEnable: false,
                isKeyboard: true,
                diyGroupName: '基础字段',
                width: 160,
                Cell: ({ original, index }) => {
                  return (
                    <Observer>
                      {() => (
                        <KCMoreSelect
                          id={'__filter_selector' + index}
                          data={spuList.slice()}
                          selected={original.spuSelected}
                          onSelect={this.handleSelect.bind(this, index)}
                          onSearch={this.handleSearch}
                          placeholder={i18next.t('请输入商品名搜索')}
                          renderListItem={this.renderProductItem}
                          renderListFilter={(data) => data}
                        />
                      )}
                    </Observer>
                  )
                },
              },
              {
                id: 'category',
                Header: i18next.t('商品分类'),
                minWidth: 100,
                diyGroupName: '基础字段',
                accessor: (d) => {
                  return (
                    <Observer>
                      {() => (
                        <span>{`${d.category_1_name}/${d.category_2_name}`}</span>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('移出批次号'),
                diyEnable: false,
                accessor: 'out_batch_num',
                minWidth: 200,
                diyGroupName: '基础字段',
                Cell: ({ index, original }) => {
                  const isBatchError =
                    errorBatchList.has(original.out_batch_num) &&
                    errorBatchList.get(original.out_batch_num).includes(1)

                  return (
                    <Observer>
                      {() => (
                        <Flex>
                          <a
                            onClick={this.handleRenderBatchModal.bind(
                              this,
                              original.out_batch_num,
                              index,
                            )}
                          >
                            {original.out_batch_num ||
                              i18next.t('选择移出批次')}
                          </a>
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
                id: 'out_shelf_name',
                Header: i18next.t('移出货位'),
                diyEnable: false,
                minWidth: 150,
                diyGroupName: '基础字段',
                accessor: (d) => {
                  return (
                    <Observer>
                      {() => <span>{d.out_shelf_name || '-'}</span>}
                    </Observer>
                  )
                },
              },
              {
                id: 'remain',
                Header: i18next.t('剩余库存（基本单位）'),
                minWidth: 150,
                diyGroupName: '基础字段',
                accessor: (d) => {
                  return (
                    <Observer>
                      {() =>
                        d.remain || d.remain === 0
                          ? `${d.remain}/${d.std_unit_name}`
                          : `-/${d.std_unit_name || '-'}`
                      }
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('移库数'),
                diyEnable: false,
                accessor: 'out_amount',
                isKeyboard: true,
                diyGroupName: '基础字段',
                minWidth: 130,
                Cell: ({ index, original }) => {
                  const isRemainError =
                    errorBatchList.has(original.out_batch_num) &&
                    errorBatchList.get(original.out_batch_num).includes(3) &&
                    original.remain < original.out_amount

                  return (
                    <Observer>
                      {() => (
                        <Flex alignCenter>
                          <KCInputNumberV2
                            value={original.out_amount}
                            onChange={this.handleNumberInputChange.bind(
                              this,
                              index,
                            )}
                            min={0}
                            className='form-control'
                            style={{ width: '70px' }}
                          />
                          <span className='gm-padding-5'>
                            {original.std_unit_name || '-'}
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
                isKeyboard: true,
                diyGroupName: '基础字段',
                accessor: 'in_shelf_name',
                minWidth: 150,
                Cell: ({ index, original }) => {
                  const isShelfError =
                    errorBatchList.has(original.out_batch_num) &&
                    errorBatchList.get(original.out_batch_num).includes(2)

                  return (
                    <Observer>
                      {() => (
                        <Flex alignCenter>
                          <KCLevelSelect
                            onSelect={this.handleSelectShelf.bind(this, index)}
                            selected={original.shelfSelected.slice()}
                            data={toJS(shelfList)}
                          />
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
                                    '当前货位已被删除，请重新选择货位',
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
                id: 'in_batch_num',
                Header: i18next.t('移入批次号'),
                diyEnable: false,
                minWidth: 100,
                diyGroupName: '基础字段',
                accessor: (d) => {
                  return <span>-</span>
                },
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

                        const array = Object.entries(map).map(
                          ([key, value]) => ({
                            value: key,
                            text: value,
                          }),
                        )

                        const onChange = (v) => {
                          store.changeTransferListCell(
                            index,
                            'in_batch_status',
                            +v,
                          )
                        }

                        return (
                          <Select
                            value={in_batch_status.toString()}
                            data={array}
                            onChange={onChange}
                          />
                        )
                      }}
                    </Observer>
                  )
                },
              },
              {
                id: 'remark',
                Header: i18next.t('备注'),
                minWidth: 150,
                accessor: 'remark',
                isKeyboard: true,
                diyGroupName: '基础字段',
                Cell: ({ index, original }) => {
                  return (
                    <Observer>
                      {() => (
                        <KCInput
                          maxLength={15}
                          type='text'
                          value={original.remark || ''}
                          className='form-control input-sm'
                          onChange={this.handleRemarkInputChange.bind(
                            this,
                            index,
                          )}
                        />
                      )}
                    </Observer>
                  )
                },
              },
            ]}
          />
        </BoxPanel>
      </div>
    )
  }
}

export default EditDetail
