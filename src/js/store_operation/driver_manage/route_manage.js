import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import { Drawer, Tip, BoxTable, Modal } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import _ from 'lodash'
import classNames from 'classnames'
import NewRoute from './components/new_route'
import RouteConfigModal from './components/route_config_modal'
import actions from '../../actions'
import styles from './style.module.less'
import globalStore from '../../stores/global'
import PropTypes from 'prop-types'

import SearchHeaderFilter from './search_header_filter'
import TableTotalText from 'common/components/table_total_text'
import ImportLine from './components/import_line'

class RouteManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      edittingIndex: -1,
      editRow: [],
    }
  }

  componentDidMount() {
    this.pagination.apiDoFirstRequest()
  }

  getSearchOption = (page) => {
    const { headerFilter, pagination } = this.props.routeManage
    const paginationParm = page || pagination
    actions.route_manage_change_pagination(paginationParm)
    const { searchText } = headerFilter
    const query = {
      search_text: searchText,
      ...paginationParm,
    }
    return query
  }

  /**
   * @description 搜索列表数据，需要把 Promise 返回给 ManagePaginationV2 使用
   * @param pagination ManagePaginationV2 -> onRequest 传回的分页参数
   * @returns 返回 Promise,且 resolve json
   */
  handleGetRouteList = (pagination) => {
    return actions.route_manage_get_route_list(this.getSearchOption(pagination))
  }

  handleSearch = () => {
    this.pagination.apiDoFirstRequest()
  }

  handleSubmit = (e) => {
    e.preventDefault()
  }

  // 新增线路
  handleAddRoute = (name) => {
    actions
      .route_manage_create_route({
        name,
      })
      .then((result) => {
        if (result.code === 0) {
          this.handleSearch()
        }
      })
  }

  // 删除线路
  deleteRoute = (item) => {
    actions
      .route_manage_delete_route({
        id: item.id,
      })
      .then((result) => {
        if (result.code === 0) {
          this.handleSearch()
        }
      })
  }

  changeEditState = (index) => {
    this.setState({
      routeNameEditting: true,
      edittingIndex: index,
    })
  }

  updateRouteName = (index, value) => {
    const item = this.props.routeManage.routeList[index]
    const newName = value.trim()
    if (newName.length > 8) {
      Tip.warning(i18next.t('线路名不能超过8个字符'))
      return
    }
    if (newName !== '' && newName !== item.name) {
      actions
        .route_manage_update_route({
          id: item.id,
          name: newName,
        })
        .then((result) => {
          if (result.code === 0) {
            this.handleSearch()
          }
        })
    }
  }

  handleConfig = (e, field, index) => {
    e.preventDefault()
    const { routeList } = this.props.routeManage
    const routeId = routeList[index].id
    Drawer.render({
      children: (
        <RouteConfigModal routeId={routeId} onUpdateList={this.handleSearch} />
      ),
      onHide: Drawer.hide,
      style: {
        width: '600px',
      },
    })
  }

  handleFilterChange = (key, e) => {
    const value = e && e.target ? e.target.value : e
    actions.route_manage_header_filter_change({ [key]: value })
  }

  // 导出
  handleExport = () => {
    actions
      .route_manage_get_export_data({ export: 1, ...this.getSearchOption() })
      .then(() => {
        const { exportKeys, exportData } = this.props.routeManage
        const newExportData = _.map(exportData, (item) => {
          const obj = {}
          _.forEach(exportKeys, (keyObj) => {
            const key = keyObj.id
            const name = keyObj.name
            key === 'area'
              ? (obj[name] = `${item.city}${item.area_l1}${item.area_l2}`)
              : (obj[name] = item[key])
          })
          return obj
        })
        requireGmXlsx((res) => {
          const { jsonToSheet } = res
          jsonToSheet([newExportData], { fileName: i18next.t('线路管理.xlsx') })
        })
      })
  }

  handleImport = () => {
    Modal.render({
      title: i18next.t('导入客户线路'),
      size: 'md',
      children: <ImportLine onImport={this.handleImportFile} />,
      onHide: Modal.hide,
    })
  }

  handleImportFile = (file) => {
    if (!file) {
      Tip.warning(i18next.t('请选择文件上传！'))
      // return
    }
  }

  renderRouteName = (item) => {
    const text = item.original.name
    return (
      <>
        <span>{text}&nbsp;</span>
        <TableUtil.EditButton
          popupRender={(closePopup) => {
            return (
              <TableUtil.EditContentInput
                initialVal={text}
                onSave={(value) => this.updateRouteName(item.index, value)}
                closePopup={closePopup}
              />
            )
          }}
        />
      </>
    )
  }

  handleEdit = (index) => {
    const row = this.state.editRow ? this.state.editRow.slice() : []
    row.push(index)
    this.setState({ editRow: row })
  }

  handleEditCancel = (index) => {
    const op = 'no_update'
    const type = 'route'
    const value = ''
    const key = ['name']
    actions.update_data_list({ op, type, value, key, index })

    let row = this.state.editRow ? this.state.editRow.slice() : []
    row = _.filter(row, (i) => i !== index)
    this.setState({ editRow: row })
  }

  render() {
    const { routeList, headerFilter } = this.props.routeManage
    const { searchText } = headerFilter
    const { OperationCell, OperationDelete } = TableUtil

    const tableInfo = [
      {
        label: i18next.t('线路列表'),
        content: routeList.length,
      },
    ]

    return (
      <>
        <SearchHeaderFilter
          onChange={(e) => this.handleFilterChange('searchText', e)}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
          onImport={this.handleImport}
          searchText={searchText}
          placeholder={i18next.t('请输入线路名称')}
          disabledExport={false}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={
            globalStore.hasPermission('add_address_route') && (
              <NewRoute onAddRoute={this.handleAddRoute} />
            )
          }
        >
          <ManagePaginationV2
            id='pagination_in_driver_manage_route_manage_list'
            defaultLimit={10}
            onRequest={this.handleGetRouteList}
            ref={(ref) => {
              this.pagination = ref
            }}
          >
            <Table
              data={routeList.slice()}
              columns={[
                {
                  Header: i18next.t('创建时间'),
                  accessor: 'create_time',
                },
                {
                  Header: i18next.t('线路名称'),
                  id: 'name',
                  accessor: 'name',
                  Cell: (cellProps) => this.renderRouteName(cellProps),
                },
                {
                  Header: i18next.t('商户配置'),
                  id: 'address_count',
                  accessor: 'address_count',
                  Cell: (cellProps) => {
                    return (
                      <a
                        href='#'
                        className={classNames({
                          [styles.routeConfig]: !globalStore.hasPermission(
                            'edit_address_route',
                          ),
                        })}
                        onClick={(e) => {
                          this.handleConfig(
                            e,
                            cellProps.original.address_count,
                            cellProps.index,
                          )
                        }}
                      >
                        {i18next.t('商户配置')}
                        {`(${cellProps.original.address_count})`}
                      </a>
                    )
                  },
                },
                {
                  Header: i18next.t('创建人'),
                  accessor: 'create_user',
                },
                {
                  Header: TableUtil.OperationHeader,
                  Cell: ({ original, index }) => {
                    return (
                      <OperationCell>
                        <OperationDelete
                          title={i18next.t('确认删除')}
                          onClick={this.deleteRoute.bind(null, original)}
                        >
                          {original.address_count > 0
                            ? i18next.t(
                                '该线路已绑定商户，删除后商户将没有线路！',
                              )
                            : i18next.t('确认删除该线路?')}
                        </OperationDelete>
                      </OperationCell>
                    )
                  },
                  show: globalStore.hasPermission('delete_address_route'),
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

RouteManage.propTypes = {
  routeManage: PropTypes.object,
}

export default connect((state) => ({
  routeManage: state.routeManage,
}))(RouteManage)
