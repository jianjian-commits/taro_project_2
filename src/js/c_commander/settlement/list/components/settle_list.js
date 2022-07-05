import React, { useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import { Flex, Tip, Dialog } from '@gmfe/react'
import { t } from 'gm-i18n'
import { history } from 'common/service'
import store from '../store'
import globalStore from 'stores/global'
import SVGCommanderSettlement from 'svg/commander_settlement.svg'
import SVGCommissionDetail from 'svg/commission_detail.svg'
import SVGBalanceFlow from 'svg/balance_flow.svg'

const SelectTableX = selectTableXHOC(TableX)

const List = () => {
  const { commanderSettleList, selected, loading, isSelectAllPage } = store
  const pagination = useRef(null)

  useEffect(() => {
    store.setDoFirstRequest(pagination.current.apiDoFirstRequest)
    pagination.current.apiDoFirstRequest()
    store.setSelected([])
  }, [])

  const handleSearch = pagination => {
    return store.fetchList(pagination)
  }

  const handleSelected = selected => {
    store.setSelected(selected)
  }

  const handleLinkToFlow = itemData => {
    history.push({
      pathname: '/c_commander/settlement/balance_flow',
      query: {
        distributor_id: itemData.distributor_id,
        community_name: itemData.community_name
      }
    })
  }

  const handleLinkToDetail = itemData => {
    history.push(
      `/c_commander/settlement/list/detail?distributor_id=${itemData.distributor_id}`
    )
  }

  const handleSettlement = itemData => {
    Dialog.confirm({
      title: t('结算'),
      children: (
        <div>{t('结算后，待结算金额将划入团长余额，确认结算吗？')}</div>
      ),
      onOK: () => {
        store
          .doSettlement(itemData)
          .then(() => {
            store.apiDoFirstRequest()
          })
          .then(() => {
            Tip.success('结算成功')
          })
      }
    })
  }

  const handleSettleBatch = () => {
    Dialog.confirm({
      title: t('批量结算'),
      children: (
        <div>{t('批量结算后，待结算金额将划入团长余额，确认结算吗？')}</div>
      ),
      onOK: () => {
        store
          .doSettlementBatch()
          .then(() => {
            store.apiDoFirstRequest()
          })
          .then(() => {
            store.setSelected([])
            Tip.success('批量结算成功')
          })
      }
    })
  }

  const handleSelectAll = bool => {
    store.setSelectAll(bool)
  }

  const handleClose = () => {
    store.setSelected([])
  }

  const canEditDistributorSettle = globalStore.hasPermission(
    'edit_distributor_settle'
  )
  const canEditDistributorBalanceFlow = globalStore.hasPermission(
    'get_distributor_balance_flow'
  )

  return (
    <ManagePaginationV2
      id='commander_settlement_list'
      ref={pagination}
      onRequest={handleSearch}
    >
      <SelectTableX
        data={commanderSettleList.slice()}
        keyField='username'
        loading={loading}
        selected={selected.slice()}
        onSelect={handleSelected}
        columns={[
          {
            Header: t('团长账号'),
            accessor: 'username'
          },
          {
            Header: t('社区店名称'),
            accessor: 'community_name'
          },
          {
            Header: t('团长姓名'),
            accessor: 'name'
          },
          {
            Header: t('佣金总额'),
            accessor: 'history_commission'
          },
          {
            Header: t('已结算佣金'),
            accessor: 'history_settled_commission'
          },
          {
            Header: t('待结算佣金'),
            accessor: 'unsettled_commission'
          },
          {
            Header: t('账户余额'),
            accessor: 'balance'
          },
          {
            Header: t('最近结算时间'),
            width: '150',
            accessor: 'latest_settle_time'
          },
          {
            Header: TableXUtil.OperationHeader,
            accessor: 'operate',
            width: '200',
            Cell: d => (
              <TableXUtil.OperationCell>
                <Flex justifyCenter className='gm-cursor gm-text-14'>
                  {canEditDistributorSettle && (
                    <TableXUtil.OperationIconTip tip={t('结算')}>
                      <div
                        onClick={() => handleSettlement(d.row.original)}
                        className='gm-text-hover-primary'
                      >
                        <SVGCommanderSettlement />
                      </div>
                    </TableXUtil.OperationIconTip>
                  )}

                  {canEditDistributorSettle && (
                    <TableXUtil.OperationIconTip tip={t('佣金明细')}>
                      <div
                        className='gm-margin-lr-10 gm-text-hover-primary'
                        onClick={() => handleLinkToDetail(d.row.original)}
                      >
                        <SVGCommissionDetail />
                      </div>
                    </TableXUtil.OperationIconTip>
                  )}

                  {canEditDistributorBalanceFlow && (
                    <TableXUtil.OperationIconTip tip={t('余额流水')}>
                      <div
                        onClick={() => handleLinkToFlow(d.row.original)}
                        className='gm-text-hover-primary'
                      >
                        <SVGBalanceFlow />
                      </div>
                    </TableXUtil.OperationIconTip>
                  )}
                </Flex>
              </TableXUtil.OperationCell>
            )
          }
        ]}
        batchActionBar={
          selected.length ? (
            <TableXUtil.BatchActionBar
              batchActions={[
                {
                  name: t('批量结算'),
                  onClick: handleSettleBatch,
                  type: 'business',
                  show: canEditDistributorSettle
                }
              ]}
              isSelectAll={isSelectAllPage}
              count={isSelectAllPage ? null : selected.length}
              toggleSelectAll={handleSelectAll}
              onClose={handleClose}
            />
          ) : null
        }
      />
    </ManagePaginationV2>
  )
}
export default observer(List)
