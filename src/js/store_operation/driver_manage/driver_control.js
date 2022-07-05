import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable, Pagination, Flex, Button } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { history } from '../../common/service'
import { connect } from 'react-redux'
import './actions.js'
import './reducer.js'
import actions from '../../actions'
import styles from './style.module.less'
import PropTypes from 'prop-types'

import SearchHeaderFilter from './search_header_filter'
import TableTotalText from 'common/components/table_total_text'
import InitUserDriver from '../../guides/init/guide/init_user_driver'
class DriverControl extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      newDriverModal: false,
      editModalShow: false,
      editDriverData: {},
      searchText: null,
    }
  }

  componentDidMount() {
    this.getDriverList()
  }

  handlePage = async (page) => {
    const limit = page.limit
    const offset = page.offset
    this.setState({
      loading: true,
    })
    const { location } = this.props
    const timeConfigId = location.query.time_config_id
    await actions.car_manage_get_driver_list({ timeConfigId, offset, limit })
    this.setState({
      loading: false,
    })
  }

  getDriverList = async () => {
    const { location } = this.props
    const timeConfigId = location.query.time_config_id
    await actions.car_manage_get_driver_list({ timeConfigId })
    this.setState({
      loading: false,
    })
  }

  handleDelete = (item) => {
    actions.car_manage_delete_driver(item.id).then(() => {
      this.getDriverList()
    })
  }

  handleSearch = () => {
    actions.car_manage_set_driver_search_text(this.state.searchText)
    this.getDriverList()
  }

  handleSearchText = (e) => {
    const value = e.target.value
    this.setState({ searchText: value === '' ? null : value })
  }

  render() {
    const { carManage } = this.props
    const { searchText } = this.state
    const { OperationCell } = TableUtil

    const tableInfo = [
      {
        label: i18next.t('司机列表'),
        content: carManage.driverList.length,
      },
    ]

    return (
      <>
        <SearchHeaderFilter
          onChange={this.handleSearchText}
          onSearch={this.handleSearch}
          searchText={searchText}
          placeholder={i18next.t('输入司机名、手机号搜索')}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={
            <Button
              data-id='initUserDriver'
              type='primary'
              onClick={() => {
                history.push(
                  '/supply_chain/distribute/driver_manage/create_driver'
                )
              }}
            >
              {i18next.t('新建司机')}
            </Button>
          }
        >
          <Table
            data={carManage.driverList}
            loading={this.state.loading}
            columns={[
              {
                Header: i18next.t('编号'),
                accessor: (v) => (
                  <span
                    ref={(ref) => {
                      this['driver' + v.index] = ref
                    }}
                    data-driverId={v.id}
                  >
                    {v.id}
                  </span>
                ),
                id: 'id',
              },
              {
                Header: i18next.t('司机账号'),
                accessor: 'account',
              },
              {
                Header: i18next.t('承运商'),
                accessor: 'carrier_name',
                maxWidth: 100,
              },
              {
                Header: i18next.t('司机名'),
                accessor: 'name',
                maxWidth: 80,
              },
              {
                Header: i18next.t('手机号'),
                accessor: (v) => v.phone || '-',
                id: 'phone',
              },
              {
                Header: i18next.t('车牌号码'),
                accessor: (v) => v.plate_number || '-',
                id: 'plate_number',
              },
              {
                Header: i18next.t('车型'),
                accessor: 'car_model',
                maxWidth: 100,
              },
              {
                Header: i18next.t('满载框数'),
                accessor: 'max_load',
                maxWidth: 80,
              },
              {
                Header: i18next.t('来源站点'),
                accessor: 'station_name',
                maxWidth: 100,
              },
              {
                Header: i18next.t('是否共享'),
                accessor: (v) =>
                  v.share ? i18next.t('共享') : i18next.t('不共享'),
                id: 'share',
              },
              {
                Header: i18next.t('账号状态'),
                accessor: (v) =>
                  v.state ? (
                    i18next.t('有效')
                  ) : (
                    <span style={{ color: '#ccc' }}>{i18next.t('无效')}</span>
                  ),
                id: 'state',
              },
              {
                Header: i18next.t('登录司机APP'),
                accessor: (v) =>
                  v.is_allow_login ? (
                    i18next.t('开启')
                  ) : (
                    <span style={{ color: '#ccc' }}>{i18next.t('关闭')}</span>
                  ),
                id: 'is_allow_login',
              },
              {
                Header: i18next.t('登录状态'),
                accessor: (v) =>
                  v.is_online ? (
                    <Flex alignCenter>
                      <span className={`gm-bg-primary ${styles.driverTag}`} />
                      {i18next.t('在线')}
                    </Flex>
                  ) : (
                    <Flex alignCenter>
                      <span className={styles.driverTag} />
                      {i18next.t('离线')}
                    </Flex>
                  ),
                id: 'is_online',
              },
              {
                Header: TableUtil.OperationHeader,
                width: 80,
                Cell: ({ original }) => {
                  return original.can_edit ? (
                    <OperationCell>
                      <TableUtil.OperationDetail
                        href={`#/supply_chain/distribute/driver_manage/edit_driver?id=${original.id}`}
                        open
                      />
                      <TableUtil.OperationDelete
                        title={i18next.t('警告')}
                        onClick={this.handleDelete.bind(null, original)}
                      >
                        {i18next.t('确认删除司机') + `${original.name}？`}
                      </TableUtil.OperationDelete>
                    </OperationCell>
                  ) : null
                },
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination data={carManage.pagination} toPage={this.handlePage} />
          </Flex>
        </BoxTable>
        <InitUserDriver ready />
      </>
    )
  }
}

DriverControl.propTypes = {
  carManage: PropTypes.object,
}

export default connect((state) => ({
  carManage: state.carManage,
}))(DriverControl)
