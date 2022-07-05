import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import {
  BoxTable,
  Button,
  Dialog,
  PopupContentConfirm,
  Select,
  Tip
} from '@gmfe/react'
import moment from 'moment'
import { history } from 'common/service'
import { i18next } from 'gm-i18n'
import { COMMANDER_STATUS_SHOW } from 'common/enum'
import globalStore from 'stores/global'
import store from '../store'
const SelectTableX = selectTableXHOC(TableX)

// 产品说，待审核是初始状态，不能回滚，所以修改状态里的值只有正常和冻结
const editCommanderStatus = [
  {
    value: 2,
    text: i18next.t('正常')
  },
  {
    value: 3,
    text: i18next.t('冻结')
  }
]

const EditStatus = observer(({ className, ...rest }) => {
  return (
    <div className={classNames('', className)}>
      <span>{i18next.t('状态修改：')}</span>
      <Select
        {...rest}
        style={{ width: '200px' }}
        data={editCommanderStatus}
        value={store.editStatus}
        onChange={value => store.setEditStatus(value)}
      />
    </div>
  )
})

const List = () => {
  const { commanderList, selected, isSelectAllPage, loading } = store
  const pagination = useRef(null)

  const canEditDistributor = globalStore.hasPermission('edit_distributor')

  useEffect(() => {
    store.setDoFirstRequest(pagination.current.apiDoFirstRequest)
    pagination.current.apiDoFirstRequest()
    store.setSelected([])
  }, [])

  const handleRequest = pagination => {
    return store.fetchList(pagination)
  }

  const handleSubmit = async () => {
    await store.handleEditStatusBatch()
    await store.apiDoFirstRequest()
    store.setSelected([])
    Tip.success(i18next.t('批量修改成功！'))
  }

  const handleEditBatch = () => {
    Dialog.confirm({
      title: i18next.t('团长状态修改'),
      children: <EditStatus className='gm-margin-tb-10' />,
      onOK: () => {
        handleSubmit()
      }
    })
  }

  const handleOK = async (id, close) => {
    await store.handleEditStatus(id)
    close()
    await store.apiDoFirstRequest()
    Tip.success(i18next.t('修改状态成功！'))
  }

  return (
    <BoxTable
      action={
        canEditDistributor && (
          <Button
            type='primary'
            onClick={() => history.push('/c_commander/manage/list/create')}
          >
            {i18next.t('新建团长')}
          </Button>
        )
      }
    >
      <ManagePaginationV2
        id='commander_manage_list'
        ref={pagination}
        onRequest={handleRequest}
      >
        <SelectTableX
          data={commanderList.slice()}
          keyField='id'
          loading={loading}
          selected={selected.slice()}
          onSelect={selected => store.setSelected(selected)}
          columns={[
            {
              Header: i18next.t('社区店名称'),
              accessor: 'community_name'
            },
            {
              Header: i18next.t('团长账号'),
              accessor: 'username'
            },
            {
              Header: i18next.t('微信昵称'),
              accessor: 'wx_name'
            },
            {
              Header: i18next.t('团长姓名'),
              accessor: 'name'
            },
            {
              Header: i18next.t('地理标签'),
              id: 'area_id',
              accessor: data =>
                `${data.district_code}-${data.area_2_id}-${data.area_3_id}`
            },
            {
              Header: i18next.t('团长等级'),
              accessor: 'level_name'
            },
            {
              Header: i18next.t('创建时间'),
              width: '150',
              id: 'create_time',
              accessor: d => moment(d.create_time).format('YYYY-MM-DD HH:mm:ss')
            },
            {
              Header: i18next.t('状态'),
              accessor: 'check_status',
              Cell: data => {
                const { check_status, id } = data.row.original
                return (
                  <div>
                    <span className='gm-margin-right-5'>
                      {COMMANDER_STATUS_SHOW[check_status]}
                    </span>
                    {canEditDistributor && (
                      <TableXUtil.EditButton
                        right
                        popupRender={close => (
                          <PopupContentConfirm
                            onCancel={close}
                            title={i18next.t('修改状态')}
                            type='save'
                            onSave={() => handleOK(id, close)}
                          >
                            <EditStatus
                              isInPopup
                              className='gm-margin-bottom-20'
                            />
                          </PopupContentConfirm>
                        )}
                      />
                    )}
                  </div>
                )
              }
            },
            {
              Header: TableXUtil.OperationHeader,
              accessor: 'operate',
              Cell: cell =>
                canEditDistributor && (
                  <TableXUtil.OperationCell>
                    <TableXUtil.OperationDetail
                      onClick={() =>
                        history.push(
                          `/c_commander/manage/list/detail?id=${cell.row.original.id}`
                        )
                      }
                    />
                  </TableXUtil.OperationCell>
                )
            }
          ]}
          batchActionBar={
            selected.length ? (
              <TableXUtil.BatchActionBar
                batchActions={[
                  {
                    name: i18next.t('批量修改状态'),
                    onClick: handleEditBatch,
                    type: 'edit',
                    show: canEditDistributor
                  }
                ]}
                isSelectAll={isSelectAllPage}
                count={isSelectAllPage ? null : selected.length}
                toggleSelectAll={bool => store.setSelectAll(bool)}
                onClose={() => store.setSelected([])}
              />
            ) : null
          }
        />
      </ManagePaginationV2>
    </BoxTable>
  )
}

export default observer(List)
