import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import { observer } from 'mobx-react'
import { history, System } from 'common/service'
import moment from 'moment'
import { openNewTab } from 'common/util'
import globalStore from 'stores/global'

import smartMenusStore from './store'
import SmartMenuFilter from './smart_menu_filter'
import SVGPrint from 'svg/print.svg'

@observer
class SmartMenuList extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    globalStore.setBreadcrumbs(['智能菜单'])
    this.pagination.current.doFirstRequest()
    // 获取商品库所有商品
    smartMenusStore.getSkuList()
  }

  componentWillUnmount() {
    globalStore.setBreadcrumbs([])
  }

  handleSearch = () => {
    this.pagination.current.doFirstRequest()
  }

  handleAddMenu = () => {
    const type = 'create'
    smartMenusStore.changeViewType(type)
    smartMenusStore.clearMenuDetails()
    history.push(
      System.getUrl(`/merchandise/manage/list/smart_menu/menu?type=${type}`)
    )
  }

  handleToDetail = (cellProps) => {
    const type = 'edit'
    smartMenusStore.getSmartMenuDetail(cellProps.original.id)
    history.push(
      System.getUrl(
        `/merchandise/manage/list/smart_menu/menu?type=${type},id=${cellProps.original.id}`
      )
    )
  }

  handlePrint = (id, e) => {
    e.preventDefault()
    openNewTab(`#/printer/smart_menu_printer/print?id=${id}`)
  }

  render() {
    const { smartMenusList } = smartMenusStore

    const canAddMenu = globalStore.hasPermission('add_smart_menu')
    const canPrintMenu = globalStore.hasPermission('print_smart_menu')
    const canEditMenu = globalStore.hasPermission('edit_smart_menu')
    const canDelMenu = globalStore.hasPermission('delete_smart_menu')

    return (
      <div>
        <SmartMenuFilter onSearch={this.handleSearch} />

        <BoxTable
          action={
            canAddMenu ? (
              <Button onClick={this.handleAddMenu} type='primary'>
                {i18next.t('新建智能菜单')}
              </Button>
            ) : (
              <div />
            )
          }
        >
          <ManagePaginationV2
            id='pagination_in_merchandise_smart_menu_list'
            onRequest={smartMenusStore.getSmartMenus}
            ref={this.pagination}
          >
            <Table
              data={smartMenusList.slice()}
              columns={[
                {
                  id: 'sequence',
                  Header: i18next.t('序号'),
                  Cell: (cellProps) => cellProps.index + 1,
                },
                {
                  Header: i18next.t('智能菜单名称'),
                  accessor: 'name',
                },
                {
                  Header: i18next.t('商品数'),
                  accessor: 'sku_num',
                },
                {
                  Header: i18next.t('创建人'),
                  accessor: 'creator',
                },
                {
                  id: 'create_time',
                  Header: i18next.t('创建时间'),
                  Cell: (cellProps) => {
                    const create_time = cellProps.original.create_time
                    const date = moment(create_time).format('YYYY-MM-DD')
                    return <span>{date}</span>
                  },
                },
                {
                  id: 'operation',
                  Header: TableUtil.OperationHeader,
                  Cell: (cellProps) => (
                    <TableUtil.OperationCell>
                      {canPrintMenu && (
                        <div
                          onClick={this.handlePrint.bind(
                            this,
                            cellProps.original.id
                          )}
                          className='gm-inline-block gm-cursor gm-padding-5 gm-text-16 gm-text gm-text-hover-primary'
                        >
                          <SVGPrint />
                        </div>
                      )}
                      {canEditMenu && (
                        <TableUtil.OperationDetail
                          onClick={this.handleToDetail.bind(this, cellProps)}
                        />
                      )}
                      {canDelMenu && (
                        <TableUtil.OperationDelete
                          title='确认删除'
                          onClick={() =>
                            smartMenusStore.delSmartMenu(cellProps.original.id)
                          }
                        >
                          {i18next.t('是否删除该菜单')}
                        </TableUtil.OperationDelete>
                      )}
                    </TableUtil.OperationCell>
                  ),
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default SmartMenuList
