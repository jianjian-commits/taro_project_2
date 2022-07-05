import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import React from 'react'
import {
  Dialog,
  RightSideModal,
  Cascader,
  Flex,
  Tip,
  ToolTip
} from '@gmfe/react'
import { toJS } from 'mobx'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import PopupPrintModal from '../popup_print_modal'
import SVGPrint from 'svg/print.svg'

import store from '../store'

const SelectTableX = selectTableXHOC(TableX)

@observer
class CommanderTaskList extends React.Component {
  componentDidMount() {
    store.getDriverList()
    store.setDoFirstRequest(this.pagination.apiDoFirstRequest)
    store.clearSelect()
    this.pagination.apiDoFirstRequest()
  }

  async handlePopupPrintModal(commander) {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '350px' },
      children: (
        <PopupPrintModal
          type='commander'
          currentCommander={commander}
          closeModal={RightSideModal.hide}
        />
      )
    })
  }

  handleSaveAssign = (value, i) => {
    const { commanderTaskList } = store
    const commanderTask = commanderTaskList[i]

    if (value.length === 1) {
      return
    }

    const doSign = async () => {
      const query = {
        distributor_ids: JSON.stringify([commanderTask.distributor_id])
      }

      if (value.length === 2 && value[1] !== '0') {
        query.driver_id = value[1]
        query.operate_type = 1
        // 清除司机
      } else if (value.length === 0) {
        query.driver_id = commanderTask.driver_id
        query.operate_type = 0
      }

      await store.commanderTaskAssign(query, true)

      store.getCommanderTaskList()
      Tip.success(i18next.t('司机保存成功'))
    }

    doSign()
  }

  handleBatchModifyDriver = () => {
    const { carrierDriverList } = store
    const _carrierDriverList = toJS(carrierDriverList)
    let driver_id = null
    Dialog.confirm({
      title: '批量分配司机',
      size: 'sm',
      children: (
        <Flex alignCenter>
          <div>{i18next.t('选择司机：')}</div>
          <Cascader
            filtrable
            data={_carrierDriverList}
            valueRender={value =>
              value && value.length > 1 ? value[value.length - 1].name : ''
            }
            onChange={val => {
              driver_id = val[1]
            }}
          />
        </Flex>
      ),
      onOK: () => {
        if (driver_id) {
          store
            .commanderTaskAssign({ driver_id, operate_type: 1 }, false)
            .then(() => {
              store.getCommanderTaskList()
              store.clearSelect()
            })
        } else {
          Tip.warning(i18next.t('请选择司机'))
          return false
        }
      }
    })
  }

  render() {
    const {
      commanderTaskList,
      selectedList,
      getCommanderTaskList,
      isSelectAllPage,
      loading,
      carrierDriverList
    } = store

    return (
      <ManagePaginationV2
        id='pagination_in_distribute_commander_task_list'
        onRequest={getCommanderTaskList}
        ref={ref => {
          this.pagination = ref
        }}
      >
        <SelectTableX
          data={commanderTaskList.slice()}
          keyField='distributor_id'
          selected={selectedList.slice()}
          loading={loading}
          onSelect={selected => {
            store.commanderSelect(selected)
          }}
          batchActionBar={
            selectedList.length ? (
              <TableXUtil.BatchActionBar
                isSelectAll={isSelectAllPage}
                onClose={() => {
                  store.clearSelect()
                }}
                toggleSelectAll={bool => {
                  store.selectAllPage(bool)
                }}
                count={isSelectAllPage ? null : selectedList.length}
                batchActions={[
                  {
                    name: '批量打印',
                    type: 'business',
                    onClick: () => this.handlePopupPrintModal()
                  },
                  {
                    name: '批量分配司机',
                    type: 'edit',
                    onClick: () => this.handleBatchModifyDriver()
                  }
                ]}
              />
            ) : null
          }
          columns={[
            {
              Header: i18next.t('社区店名称'),
              accessor: 'community_name'
            },
            {
              Header: i18next.t('团长账户'),
              accessor: 'username'
            },
            {
              Header: i18next.t('团长名'),
              accessor: 'name'
            },
            {
              Header: i18next.t('配送订单数'),
              accessor: 'order_amount'
            },
            {
              Header: i18next.t('销售额（不含运费）'),
              accessor: 'total_order_money'
            },
            {
              Header: (
                <div>
                  {i18next.t('承运商/司机')}
                  <ToolTip
                    className='gm-margin-left-5'
                    center
                    popup={
                      <div className='gm-padding-5'>
                        {i18next.t(
                          '当前展示上次分配的司机，可批量操作分配司机'
                        )}
                      </div>
                    }
                  />
                </div>
              ),
              accessor: 'driver',
              Cell: ({ row: { index, original } }) => {
                const {
                  carrier_name,
                  driver_name,
                  driver_status,
                  driver_id
                } = original
                const text = driver_status === 0 ? i18next.t('(停用)') : ''
                return (
                  <Cascader
                    filtrable
                    key={`${driver_id}_${index}`}
                    data={toJS(carrierDriverList)}
                    valueRender={() =>
                      driver_id
                        ? `${carrier_name || ''},${driver_name || ''}${text}`
                        : undefined
                    }
                    onChange={value => this.handleSaveAssign(value, index)}
                  />
                )
              }
            },
            {
              Header: i18next.t('单据打印'),
              id: 'print_action',
              width: 80,
              accessor: d => {
                return (
                  <TableXUtil.OperationCell>
                    <TableXUtil.OperationIconTip tip={i18next.t('打印')}>
                      <span
                        className='gm-cursor gm-text-14 gm-text-hover-primary'
                        onClick={this.handlePopupPrintModal.bind(this, d)}
                      >
                        <SVGPrint />
                      </span>
                    </TableXUtil.OperationIconTip>
                  </TableXUtil.OperationCell>
                )
              }
            }
          ]}
        />
      </ManagePaginationV2>
    )
  }
}

export default CommanderTaskList
