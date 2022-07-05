import React from 'react'
import { BoxTable, Button, Select, Tip, Modal, Flex } from '@gmfe/react'
import { Table, diyTableHOC, selectTableV2HOC, TableUtil } from '@gmfe/table'
import { t } from 'gm-i18n'
import { ManagePaginationV2 } from '@gmfe/business'
import _ from 'lodash'
import moment from 'moment'
import { observer } from 'mobx-react'
import { history } from 'common/service'

import TableTotalText from 'common/components/table_total_text'
import LabelSelectModal from './label_select_modal'
import { checkMemberType } from '../util'
import store from '../store'
import globalStore from '../../../../stores/global'

const SelectDiyTable = selectTableV2HOC(diyTableHOC(Table))

@observer
class List extends React.Component {
  constructor(props) {
    super(props)
    this.refPagination = React.createRef(null)
  }

  componentDidMount() {
    store.setDoMemberFirstRequest(this.refPagination.current.apiDoFirstRequest)
    this.refPagination.current.apiDoFirstRequest()
  }

  handleLabel = () => {
    history.push('/c_retail/basic_info/member/label')
  }

  handlePageChange = (page) => {
    return store.getUserInfoList(page)
  }

  handleSelected = (data) => {
    store.changeUserInfoListSelected(data)
  }

  handleSelectAll = (flag) => {
    const ids = flag ? _.map(store.user_list.slice(), (i) => i.id) : []
    store.changeUserInfoListSelected(ids)
  }

  handleSelectAllPage = (flag) => {
    store.setSelectAllPage(flag)
    if (!flag) {
      this.handleSelectAll(true)
    }
  }

  handleBatchChangeLabel = () => {
    Modal.render({
      title: t('批量修改客户标签'),
      onHide: Modal.hide,
      children: (
        <LabelSelectModal
          onOk={(id) => {
            const req = {
              c_uids: store.isSelectAllPage
                ? null
                : JSON.stringify(store.user_list_select.slice()),
              update_label_id: id === -1 ? null : id,
            }
            store
              .changeBatchUserLabel(req)
              .then(() => {
                Tip.success(t('修改成功'))
                // 刷新数据
                store.getUserInfoList()
              })
              .catch(() => {
                Tip.warning(t('修改失败'))
              })
          }}
        />
      ),
    })
  }

  handleChangeItem = (name, index, value) => {
    store.changeUserInforListItem(index, {
      ...store.user_list[index],
      [name]: value,
    })
  }

  handleSaveLabel = (data, index) => {
    const { edit_label_id, label_id, id } = data
    // 更改的标签id和原来的id一致,不更改
    if (label_id === edit_label_id) {
      return
    }
    const req = {
      update_label_id: edit_label_id === -1 ? null : edit_label_id,
      c_uids: JSON.stringify([id]),
    }
    store
      .changeBatchUserLabel(req)
      .then(() => {
        Tip.success(t('修改成功'))
        store.changeUserInforListItem(index, {
          ...data,
          isEditing: false,
          label_id: edit_label_id,
        })
      })
      .catch(() => {
        Tip.warning(t('修改失败'))
      })
  }

  handleConfirm = (id, value) => {
    store.changeUserNickName(id, value).then(() => {
      Tip.success(t('修改成功'))
      store.getUserInfoList()
    })
  }

  render() {
    const {
      count,
      list_label,
      user_list,
      user_list_select,
      isSelectAllPage,
    } = store

    return (
      <BoxTable
        info={
          <TableTotalText data={[{ label: t('客户总数'), content: count }]} />
        }
        action={
          globalStore.hasPermission('view_tag_manage') && (
            <Button type='primary' onClick={this.handleLabel}>
              {t('标签管理')}
            </Button>
          )
        }
      >
        <ManagePaginationV2
          id='pagination_member_card_use_info_list'
          onRequest={this.handlePageChange}
          ref={this.refPagination}
        >
          <SelectDiyTable
            ref={(ref) => (this.table = ref)}
            data={user_list.slice()}
            diyGroupSorting={[t('基础字段')]}
            id='member_card_user_table'
            keyField='id'
            selected={user_list_select.slice()}
            onSelectAll={this.handleSelectAll}
            onSelect={this.handleSelected}
            batchActionBar={
              user_list_select.length > 0 ? (
                <TableUtil.BatchActionBar
                  onClose={() => {
                    this.handleSelectAll(false)
                    store.setSelectAllPage(false)
                  }}
                  count={isSelectAllPage ? null : user_list_select.length}
                  isSelectAll={isSelectAllPage}
                  /* eslint-disable-next-line */
                  toggleSelectAll={this.handleSelectAllPage}
                  batchActions={[
                    {
                      name: t('批量更换客户标签'),
                      onClick: this.handleBatchChangeLabel,
                      type: 'business',
                    },
                  ]}
                />
              ) : null
            }
            columns={[
              {
                Header: t('客户'),
                diyGroupName: '基础字段',
                id: 'nickname',
                Cell: ({ original }) => {
                  const { nickname, phone, id } = original
                  return (
                    <Flex>
                      <div>
                        <p className='text-primary gm-cursor'>{nickname}</p>
                        <p>{phone}</p>
                      </div>
                      <TableUtil.EditButton
                        left
                        popupRender={(closePopup) => (
                          <TableUtil.EditContentInput
                            initialVal={nickname}
                            maxLength={20}
                            onSave={(value) => this.handleConfirm(id, value)}
                            closePopup={closePopup}
                          />
                        )}
                      />
                    </Flex>
                  )
                },
              },
              {
                Header: t('注册时间'),
                diyGroupName: '基础字段',
                id: 'create_time',
                accessor: (item) =>
                  moment(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                Header: t('会员状态'),
                diyGroupName: '基础字段',
                id: 'member_type',
                accessor: (item) => checkMemberType(item.member_type),
              },
              {
                Header: t('成为会员时间'),
                diyGroupName: '基础字段',
                id: '4',
                accessor: (item) =>
                  item.member_time &&
                  moment(item.member_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                Header: t('会员过期时间'),
                diyGroupName: '基础字段',
                id: 'expired_time',
                accessor: (item) =>
                  item.expired_time &&
                  moment(item.expired_time).format('YYYY-MM-DD'),
              },
              {
                Header: t('客户标签'),
                diyGroupName: '基础字段',
                id: 'label_id',
                Cell: ({ original, index }) => {
                  const { label_id, isEditing, edit_label_id } = original
                  const data = _.find(
                    list_label.slice(),
                    (i) => i.value === label_id,
                  )
                  // 如果有设置客户标签，提示设置空标签
                  const new_list_label = _.concat(
                    [{ value: -1, text: '设置空标签' }],
                    list_label.slice(),
                  )

                  const text = data ? data.text : ''

                  return isEditing ? (
                    <Select
                      value={edit_label_id || label_id}
                      data={label_id ? new_list_label : list_label.slice()}
                      onChange={(value) =>
                        this.handleChangeItem('edit_label_id', index, value)
                      }
                    />
                  ) : (
                    <span>{text}</span>
                  )
                },
              },
              {
                Header: t('地理标签'),
                diyGroupName: '基础字段',
                id: 'area',
                accessor: 'area',
              },
              {
                Header: t('默认收货地址'),
                diyGroupName: '基础字段',
                id: 'address',
                accessor: 'address',
              },
              {
                Header: t('收货人'),
                diyGroupName: '基础字段',
                id: 'receive_name',
                accessor: 'receive_name',
              },
              {
                Header: t('收货人电话'),
                diyGroupName: '基础字段',
                id: 'receive_phone',
                accessor: 'receive_phone',
              },
              globalStore.hasPermission('edit_customer_tag') && {
                Header: TableUtil.OperationHeader,
                diyItemText: '操作',
                diyGroupName: 'edit',
                diyEnable: false,
                id: 'isEditing',
                accessor: 'isEditing',
                Cell: ({ original, index }) => (
                  <TableUtil.OperationRowEdit
                    isEditing={original.isEditing || false}
                    onSave={() => this.handleSaveLabel(original, index)}
                    onCancel={() => {
                      store.changeUserInforListItem(index, {
                        ...original,
                        isEditing: false,
                        edit_label_id: null,
                      })
                    }}
                    onClick={() =>
                      this.handleChangeItem('isEditing', index, true)
                    }
                  />
                ),
              },
            ].filter((_) => _)}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default List
