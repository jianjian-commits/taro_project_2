import { i18next } from 'gm-i18n'
import React from 'react'
import { Table, TableUtil } from '@gmfe/table'
import { BoxTable, Select, Option, Dialog, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'

import globalStore from 'stores/global'
import store from './store'
import { STATUS } from './util'
import { history } from 'common/service'

@observer
class ChargeGiftList extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    store.setDoFirstRequest(this.pagination.doFirstRequest)
    this.pagination.apiDoFirstRequest()
  }

  handleCreate() {
    history.push('/marketing/manage/charge_gift/detail')
  }

  handleDetail(id, e) {
    e.preventDefault()
    window.open(`#/marketing/manage/charge_gift/detail?id=${id}`)
  }

  handleSave(id, name, status) {
    if (status === 1) {
      Dialog.confirm({
        title: i18next.t('提示'),
        children: (
          <div>
            <p>
              {i18next.t('是否确认将「') +
                name +
                i18next.t('」活动状态设为有效？')}
            </p>
            <p>
              {i18next.t('确认后此活动的活动状态为有效,其余活动变为无效。')}
            </p>
          </div>
        ),
        onOK: () => {
          store.updateChargeGiftDetail({ status, id }).then(() => {
            store.getChargeGiftList()
          })
        },
      })
    } else {
      store.updateChargeGiftDetail({ status, id }).then(() => {
        store.getChargeGiftList()
      })
    }
  }

  render() {
    const { list } = store
    const hasAddPermission = globalStore.hasPermission('add_charge_gift')
    const hasEditPermission = globalStore.hasPermission('edit_charge_gift')
    return (
      <BoxTable
        action={
          hasAddPermission && (
            <div>
              <Button type='primary' onClick={this.handleCreate}>
                {i18next.t('新建活动')}
              </Button>
            </div>
          )
        }
      >
        <ManagePaginationV2
          id='pagination_in_charge_gift_list'
          onRequest={store.getChargeGiftList} // eslint-disable-line
          ref={(ref) => {
            this.pagination = ref
          }}
        >
          <Table
            ref={(ref) => (this.table = ref)}
            data={list.slice()}
            columns={[
              {
                Header: i18next.t('序号'),
                Cell: ({ index }) => <span>{index + 1}</span>,
              },
              {
                Header: i18next.t('活动名称'),
                accessor: 'name',
                Cell: ({ value, original: { id } }) => (
                  <a onClick={this.handleDetail.bind(this, id)}>{value}</a>
                ),
              },
              {
                Header: i18next.t('最后编辑人'),
                accessor: 'editor',
              },
              {
                Header: i18next.t('最后编辑时间'),
                id: 'modify_time',
                accessor: (item) =>
                  moment(item.modify_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                Header: i18next.t('活动状态'),
                accessor: 'status',
                Cell: ({ value, index, original: { isEdit, edit_status } }) => {
                  return isEdit ? (
                    <Select
                      value={edit_status === undefined ? value : edit_status}
                      name='edit_status'
                      onChange={(val) =>
                        // 编辑的状态存储在list里，保存时取出。
                        store.changeChargeGiftList('edit_status', index, val)
                      }
                    >
                      {_.map(STATUS, (status, key) => (
                        <Option value={_.toNumber(key)} key={key}>
                          {status}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <span>{STATUS[value]}</span>
                  )
                },
              },
              {
                Header: i18next.t('创建人'),
                accessor: 'creator',
              },
              {
                Header: i18next.t('创建时间'),
                id: 'create_time',
                accessor: (item) =>
                  moment(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                width: 100,
                Header: TableUtil.OperationHeader,
                show: hasEditPermission,
                Cell: ({
                  index,
                  original: { isEdit, edit_status, status, id, name },
                }) => (
                  <TableUtil.OperationRowEdit
                    isEditing={!!isEdit}
                    onSave={() => {
                      // 是否有改变状态
                      if (edit_status !== undefined && edit_status !== status) {
                        this.handleSave(id, name, edit_status)
                      }
                      store.changeChargeGiftList('isEdit', index, false)
                    }}
                    onCancel={() =>
                      store.changeChargeGiftList('isEdit', index, false)
                    }
                    onClick={() =>
                      store.changeChargeGiftList('isEdit', index, true)
                    }
                  />
                ),
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default ChargeGiftList
