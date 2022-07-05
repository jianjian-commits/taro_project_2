import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Dialog, Flex, Tip } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import moment from 'moment'
import TextTip from 'common/components/text_tip'
import SVGCheckDetail from 'svg/check_detail.svg'
import SVGCommanderWithdraw from 'svg/commander_withdraw.svg'
import globalStore from 'stores/global'
import { store } from '../store'

const SelectTableX = selectTableXHOC(TableX)

@observer
class List extends Component {
  pagination = React.createRef()

  handleApproval = id => {
    Dialog.confirm({
      title: !id ? t('批量提现审核') : t('提现审核'),
      children: t('确定同意所选提现申请吗？'),
      onOK: () =>
        this.handleSubmit(id).then(() => {
          Tip.success(t('提现成功！'))
        })
    })
  }

  handleSubmit = id => {
    store.approveWithdraw(id)
  }

  componentDidMount() {
    store.setDoFirstRequest(this.pagination.current.apiDoFirstRequest)
    this.pagination.current.apiDoFirstRequest()
  }

  handleRequest = pagination => {
    return store.fetchList(pagination)
  }

  isWithdrawSuccess = item => {
    return item.status === 2
  }

  render() {
    const { list, selectedList, loading, isSelectAllPage } = store
    const canEditDistributorWithdraw = globalStore.hasPermission(
      'edit_distributor_withdraw'
    )

    return (
      <>
        <ManagePaginationV2
          id='pagination_in_balance_flow_list'
          onRequest={this.handleRequest}
          ref={this.pagination}
        >
          <SelectTableX
            data={list.slice()}
            keyField='id'
            selected={selectedList.slice()}
            onSelect={selected => {
              store.selected(selected)
            }}
            loading={loading}
            isSelectorDisable={this.isWithdrawSuccess}
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
                      name: t('批量审核'),
                      type: 'business',
                      onClick: () => {
                        return this.handleApproval(null)
                      },
                      show: canEditDistributorWithdraw
                    }
                  ]}
                />
              ) : null
            }
            columns={[
              {
                Header: t('提现单号'),
                accessor: 'withdraw_number'
              },
              {
                Header: t('提现时间'),
                accessor: 'agree_time',
                Cell: ({ row: { original } }) => {
                  return moment(original.agree_time).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                }
              },
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
                Header: t('账户余额'),
                accessor: 'remain_money'
              },
              {
                Header: t('提现金额'),
                accessor: 'change_money'
              },
              {
                Header: t('状态'),
                id: 'status',
                accessor: item => {
                  return item.status === 1 ? '申请中' : '提现成功'
                }
              },
              {
                Header: t('操作'),
                accessor: 'operator',
                Cell: ({ row: { original } }) => {
                  return canEditDistributorWithdraw ? (
                    <Flex className='gm-cursor gm-text-14'>
                      <TextTip
                        right
                        content={
                          <div>
                            <p className='gm-margin-bottom-20'>更多收款信息</p>
                            <p>收款人:{original.bank_account_name}</p>
                            <p>开户银行:{original.bank_name}</p>
                            <p>开户银行支行:{original.bank_branch_name}</p>
                            <p>银行账号:{original.bank_account}</p>
                          </div>
                        }
                      >
                        <div className='gm-text-hover-primary '>
                          <SVGCheckDetail />
                        </div>
                      </TextTip>
                      {original.status === 1 && (
                        <TableXUtil.OperationIconTip tip={t('提现审核')}>
                          <div
                            className='gm-margin-left-10 gm-text-hover-primary'
                            onClick={() => {
                              return this.handleApproval(original.id)
                            }}
                          >
                            <SVGCommanderWithdraw />
                          </div>
                        </TableXUtil.OperationIconTip>
                      )}
                    </Flex>
                  ) : null
                }
              }
            ]}
          />
        </ManagePaginationV2>
      </>
    )
  }
}

export default List
