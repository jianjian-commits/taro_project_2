import React, { Component } from 'react'
import { Observer, observer } from 'mobx-react'
import { BoxTable, Button, InputNumberV2, Flex, Modal, Tip } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { t } from 'gm-i18n'
import { TableX, TableXUtil } from '@gmfe/table-x'
import store from './store'
import globalStore from 'stores/global'
import CreateLevelModal from './components/create_level_modal'

@observer
class Level extends Component {
  pagination = React.createRef(null)

  componentDidMount() {
    store.setApiDoFirstRequest(this.pagination.current.apiDoFirstRequest)
    this.pagination.current.apiDoFirstRequest()
  }

  handleSearch = (pagination) => {
    return store.fetchList(pagination)
  }

  handleCreateLevel = () => {
    Modal.render({
      style: { width: '500px' },
      title: t('新建等级'),
      onHide: Modal.hide,
      children: <CreateLevelModal />,
    })
  }

  handleDelete = async (id) => {
    await store.delLevelById(id)
    await store.apiDoFirstRequest()
    Tip.success(t('删除成功！'))
  }

  handleCancel = (index, bool) => {
    store.setCancelUpdate(index, bool)
  }

  handleSave = async (data, index) => {
    const { level_name, boundary, scale } = data

    if (!level_name || boundary === null || scale === null) {
      Tip.warning(t('请填写完整'))
      return false
    }

    await store.save(data)
    store.setIsEditByIndex(index, false)
    await store.apiDoFirstRequest()
    Tip.success(t('修改成功！'))
  }

  render() {
    const canEditDistributorLevel = globalStore.hasPermission(
      'edit_distributor_level'
    )
    const canDeleteDistributorLevel = globalStore.hasPermission(
      'delete_distributor_level'
    )

    return (
      <BoxTable
        action={
          canEditDistributorLevel && (
            <Button type='primary' onClick={this.handleCreateLevel}>
              {t('新建等级')}
            </Button>
          )
        }
      >
        <ManagePaginationV2
          id='commander_level_list'
          ref={this.pagination}
          onRequest={this.handleSearch}
        >
          <TableX
            data={store.list.slice()}
            columns={[
              {
                Header: t('序号'),
                accessor: 'index',
                Cell: ({ row }) => row.index + 1,
              },
              {
                Header: t('团长等级'),
                id: 'level_name',
                Cell: ({ row }) => (
                  <Observer>
                    {() => {
                      const { isEdit, level_name } = row.original
                      return isEdit ? (
                        <input
                          className='form-control'
                          value={level_name}
                          placeholder={t('请输入等级名称')}
                          onChange={(e) =>
                            store.setValueByIndex(
                              'level_name',
                              row.index,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        level_name
                      )
                    }}
                  </Observer>
                ),
              },
              {
                Header: t('升级条件'),
                id: 'boundary',
                Cell: ({ row }) => (
                  <Observer>
                    {() => {
                      const { isEdit, boundary } = row.original
                      return isEdit ? (
                        <InputNumberV2
                          className='form-control'
                          value={boundary}
                          min={0}
                          max={999999999}
                          precision={0}
                          onChange={(value) =>
                            store.setValueByIndex('boundary', row.index, value)
                          }
                          placeholder={t('请输入整数')}
                        />
                      ) : (
                        <span>{boundary}</span>
                      )
                    }}
                  </Observer>
                ),
              },
              {
                Header: t('佣金比例'),
                id: 'scale',
                Cell: ({ row }) => (
                  <Observer>
                    {() => {
                      const { isEdit, scale } = row.original
                      return isEdit ? (
                        <Flex alignCenter>
                          <InputNumberV2
                            className='form-control'
                            value={scale}
                            precision={2}
                            min={0}
                            max={100}
                            onChange={(value) =>
                              store.setValueByIndex('scale', row.index, value)
                            }
                          />
                          <span className='gm-margin-left-5'>%</span>
                        </Flex>
                      ) : (
                        `${scale} %`
                      )
                    }}
                  </Observer>
                ),
              },
              {
                Header: t('创建人'),
                accessor: 'creator',
              },
              {
                Header: t('创建时间'),
                accessor: 'create_time',
              },
              {
                Header: TableXUtil.OperationHeader,
                accessor: 'operator',
                Cell: ({ row: { original, index } }) => (
                  <Observer>
                    {() => {
                      return canEditDistributorLevel ? (
                        <TableXUtil.OperationRowEdit
                          isEditing={!!original.isEdit}
                          onClick={() => store.setIsEditByIndex(index, true)}
                          onSave={() => this.handleSave(original, index)}
                          onCancel={() => this.handleCancel(index, false)}
                        >
                          {canDeleteDistributorLevel && (
                            <TableXUtil.OperationDelete
                              title={t('确认删除')}
                              onClick={() => this.handleDelete(original.id)}
                            >
                              {t('是否要删除团长等级？')}
                            </TableXUtil.OperationDelete>
                          )}
                        </TableXUtil.OperationRowEdit>
                      ) : (
                        canDeleteDistributorLevel && (
                          <TableXUtil.OperationCell>
                            <TableXUtil.OperationDelete
                              title={t('确认删除')}
                              onClick={() => this.handleDelete(original.id)}
                            >
                              {t('是否要删除团长等级？')}
                            </TableXUtil.OperationDelete>
                          </TableXUtil.OperationCell>
                        )
                      )
                    }}
                  </Observer>
                ),
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}
export default Level
