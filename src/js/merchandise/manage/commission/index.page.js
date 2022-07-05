import React from 'react'
import { observer } from 'mobx-react'
import store from './store'
import {
  BoxForm,
  BoxTable,
  Button,
  FormBlock,
  FormButton,
  FormItem,
  RightSideModal,
  Select,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { i18next } from 'gm-i18n'
import { Table, TableUtil } from '@gmfe/table'
import SalesTransfer from './components/sales_transfer'
import globalStore from 'stores/global'
import moment from 'moment'

@observer
class CommissionList extends React.Component {
  paginationRef = React.createRef()

  componentDidMount() {
    this.handleFirstSearch()
  }

  handleSetting = async (id) => {
    await store.getDetail(id)

    // SalesTransfer 依赖 getDetail 的数据
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '570px' },
      children: <SalesTransfer id={id} />,
    })
  }

  handleFirstSearch = () => {
    this.paginationRef.current.apiDoFirstRequest()
  }

  render() {
    const {
      statusList,
      filter,
      handleChangeList,
      list,
      getList,
      editIndex,
      handleEdit,
      handleSave,
      editStatus,
    } = store

    const canEdit = globalStore.hasPermission('edit_commission_rule')
    const canAdd = globalStore.hasPermission('add_commission_rule')

    return (
      <>
        <BoxForm onSubmit={this.handleFirstSearch} btnPosition='left'>
          <FormBlock col={3}>
            <FormItem label={i18next.t('状态')} col={1}>
              <Select
                data={statusList}
                value={filter.status}
                onChange={(v) => filter.set('status', v)}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                className='form-control'
                type='text'
                value={filter.search_text}
                name='search_text'
                placeholder={i18next.t('输入分佣规则名称')}
                onChange={(e) => filter.set('search_text', e.target.value)}
              />
            </FormItem>
          </FormBlock>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
          </FormButton>
        </BoxForm>
        <BoxTable
          action={
            <div>
              {canAdd && (
                <Button
                  type='primary'
                  className='gm-margin-right-5'
                  onClick={() => {
                    window.location.href = `#/merchandise/manage/commission/add`
                  }}
                >
                  {i18next.t('新建分佣规则')}
                </Button>
              )}
            </div>
          }
        >
          <ManagePaginationV2
            ref={this.paginationRef}
            onRequest={getList}
            id='commission_list'
          >
            <Table
              data={list.slice()}
              columns={[
                {
                  Header: i18next.t('序号'),
                  accessor: 'id',
                  Cell: ({ index }) => index + 1,
                },
                {
                  Header: i18next.t('分佣规则名称'),
                  accessor: 'name',
                  Cell: ({ row: { name, id } }) => {
                    return (
                      <a
                        href={`#/merchandise/manage/commission/detail?id=${id}`}
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        {name}
                      </a>
                    )
                  },
                },
                {
                  show: canEdit,
                  Header: i18next.t('销售经理'),
                  accessor: 'sales',
                  Cell: ({ row: { id } }) => (
                    <a onClick={() => this.handleSetting(id)}>
                      {i18next.t('点击设置')}
                    </a>
                  ),
                },
                {
                  Header: i18next.t('商品数'),
                  accessor: 'sku_num',
                },
                {
                  Header: i18next.t('创建人'),
                  accessor: 'creater',
                },
                {
                  Header: i18next.t('创建时间'),
                  id: 'create_time',
                  accessor: (d) => (
                    <div>
                      {moment(d.create_time).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                  ),
                },
                {
                  Header: i18next.t('状态'),
                  accessor: 'status',
                  Cell: ({ index }) =>
                    editIndex === index ? (
                      <Select
                        data={[
                          { value: 0, text: i18next.t('无效') },
                          { value: 1, text: i18next.t('有效') },
                        ]}
                        value={editStatus}
                        onChange={handleChangeList}
                      />
                    ) : store.list[index].status === 1 ? (
                      i18next.t('有效')
                    ) : (
                      i18next.t('无效')
                    ),
                },
                {
                  show: canEdit,
                  Header: TableUtil.OperationHeader,
                  Cell: ({ row: { id }, index }) => (
                    <TableUtil.OperationCell>
                      <TableUtil.OperationRowEdit
                        isEditing={editIndex === index}
                        onClick={() => handleEdit(index)}
                        onSave={() => handleSave(id)}
                        onCancel={() => handleEdit(-1)}
                      />
                    </TableUtil.OperationCell>
                  ),
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default CommissionList
