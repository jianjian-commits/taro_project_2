import React, { PureComponent } from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import moment from 'moment'
import { BoxTable, Dialog, Flex, ToolTip, RightSideModal } from '@gmfe/react'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import store from './store'
import ListImg from '../../components/list_img'
import TaskList from '../../../../../task/task_list'
import globalStore from '../../../../../stores/global'

const {
  // OperationDelete,
  OperationRecover,
  OperationCell,
  OperationHeader,
  SortHeader,
} = TableXUtil
const SelectTableX = selectTableXHOC(TableX)
@observer
class SkuList extends PureComponent {
  refPagination = React.createRef()

  componentDidMount() {
    store.setDoFirstRequest(this.refPagination.current.apiDoFirstRequest)
    this.refPagination.current.apiDoFirstRequest()
    // 报价单
    store.getSaleList()
  }

  handleDelete = (id) => {
    const { selectedList, isSelectAllPage } = store
    if (id) {
      store.deleteSku([id]).then((data) => {
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
    } else {
      Dialog.confirm({
        title: i18next.t('批量删除'),
        children: i18next.t('确定删除所选商品吗？'),
        onOK: () => {
          store
            .deleteSku(isSelectAllPage ? null : [...selectedList])
            .then(() => {
              RightSideModal.render({
                children: <TaskList tabKey={1} />,
                onHide: RightSideModal.hide,
                style: {
                  width: '300px',
                },
              })
            })
        },
      })
    }
  }

  handleRecover = (id) => {
    const { selectedList, isSelectAllPage } = store
    if (id) {
      store.recoverSku([id]).then((data) => {
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
    } else {
      Dialog.confirm({
        title: i18next.t('批量恢复'),
        children: i18next.t('确定恢复所选商品吗？'),
        onOK: () => {
          store
            .recoverSku(isSelectAllPage ? null : [...selectedList])
            .then(() => {
              RightSideModal.render({
                children: <TaskList tabKey={1} />,
                onHide: RightSideModal.hide,
                style: {
                  width: '300px',
                },
              })
            })
        },
      })
    }
  }

  handleSort = (name) => {
    Promise.resolve(store.sort(name)).then(() => {
      this.refPagination.current.apiDoFirstRequest()
    })
  }

  render() {
    const {
      pagination,
      selectedList,
      list,
      loading,
      fetchList,
      isSelectAllPage,
      filter: { sort_by, sort_direction },
    } = store
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('商品总数'),
                  content: pagination.count || 0,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <ManagePaginationV2
          onRequest={fetchList}
          ref={this.refPagination}
          id='pagination_list_sort_log_recycle_bin_sku_list'
        >
          <SelectTableX
            data={list.slice()}
            keyField='sku_id'
            loading={loading}
            selected={selectedList.slice()}
            onSelect={(selected) => store.selected(selected)}
            columns={[
              {
                Header: (
                  <Flex>
                    {i18next.t('商品图片')}
                    <ToolTip
                      popup={
                        <div
                          className='gm-padding-5'
                          style={{ width: '150px' }}
                        >
                          {i18next.t(
                            '规格图片未设置则显示商品图片，规格和商品都无图时不显示图片',
                          )}
                        </div>
                      }
                    />
                  </Flex>
                ),
                accessor: 'sku_image',
                Cell: ({ row: { original } }) => (
                  <ListImg imgSrc={original.image || original.sku_image} />
                ),
              },
              {
                Header: (
                  <div>
                    {i18next.t('商品名')}
                    <SortHeader
                      onClick={() => this.handleSort('spu')}
                      type={sort_by === 'spu' ? sort_direction : null}
                    />
                  </div>
                ),
                accessor: 'spu_id',
                Cell: ({ row: { original } }) => (
                  <Flex column>
                    <Flex>
                      <span style={{ marginRight: '2px' }}>
                        {original.spu_name}
                      </span>
                    </Flex>
                    <span>{original.spu_id}</span>
                  </Flex>
                ),
              },
              {
                Header: (
                  <div>
                    {i18next.t('规格名')}
                    <SortHeader
                      onClick={() => this.handleSort('sku')}
                      type={sort_by === 'sku' ? sort_direction : null}
                    />
                  </div>
                ),
                accessor: 'sku_id',
                Cell: ({ row: { original } }) => (
                  <Flex column>
                    <Flex>
                      <span style={{ marginRight: '2px' }}>
                        {original.sku_name}
                      </span>
                    </Flex>
                    <span>{original.sku_id}</span>
                  </Flex>
                ),
              },
              {
                Header: (
                  <div>
                    {i18next.t('分类')}
                    <SortHeader
                      onClick={() => this.handleSort('category1')}
                      type={sort_by === 'category1' ? sort_direction : null}
                    />
                  </div>
                ),
                id: 'category_id_1',
                accessor: (d) =>
                  d.category_name_1 +
                  '/' +
                  d.category_name_2 +
                  '/' +
                  d.pinlei_name,
              },

              {
                Header: i18next.t('销售规格'),
                id: 'sale_ratio',
                accessor: (d) => (
                  <span>
                    {d.sale_ratio +
                      d.std_unit_name_forsale +
                      '/' +
                      d.sale_unit_name}
                  </span>
                ),
              },
              {
                Header: i18next.t('报价单'),
                accessor: 'salemenu_name',
              },
              {
                Header: (
                  <div>
                    {i18next.t('删除时间')}
                    <SortHeader
                      onClick={() => this.handleSort('delete_time')}
                      type={sort_by === 'delete_time' ? sort_direction : null}
                    />
                  </div>
                ),
                accessor: 'delete_time',
                Cell: ({ row: { original } }) =>
                  moment(original.delete_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                Header: OperationHeader,
                accessor: 'operator',
                Cell: ({ row: { original } }) => (
                  <OperationCell>
                    {globalStore.hasPermission('recover_recycle_bin_sku') && (
                      <OperationRecover
                        title={i18next.t('恢复商品规格')}
                        onClick={() => this.handleRecover(original.sku_id)}
                      >
                        {i18next.t('是否确定要恢复该商品规格？')}
                      </OperationRecover>
                    )}
                    {/* 
                    暂时隐藏删除按钮
                    {globalStore.hasPermission('delete_recycle_bin_sku') && (
                      <OperationDelete
                        title={i18next.t('删除商品规格')}
                        onClick={() => this.handleDelete(original.sku_id)}
                      >
                        {i18next.t('是否确定要删除该商品规格？')}
                      </OperationDelete>
                    )} */}
                  </OperationCell>
                ),
              },
            ]}
            batchActionBar={
              selectedList.length ? (
                <TableXUtil.BatchActionBar
                  isSelectAll={isSelectAllPage}
                  onClose={() => store.clearSelect()}
                  toggleSelectAll={(bool) => store.selectAllPage(bool)}
                  count={
                    isSelectAllPage ? pagination.count : selectedList.length
                  }
                  batchActions={[
                    // 暂时隐藏批量删除按钮
                    // {
                    //   name: i18next.t('批量删除'),
                    //   type: 'delete',
                    //   onClick: () => this.handleDelete(),
                    // },
                    {
                      name: i18next.t('批量恢复'),
                      type: 'business',
                      onClick: () => this.handleRecover(),
                    },
                  ]}
                />
              ) : null
            }
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default SkuList
