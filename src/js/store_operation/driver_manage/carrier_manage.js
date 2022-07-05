import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip, BoxTable } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import NewCarrier from './components/new_carrier'

import { connect } from 'react-redux'
import './actions.js'
import './reducer.js'
import actions from '../../actions'
import { getStrByte } from '../../common/util'
import PropTypes from 'prop-types'

import SearchHeaderFilter from './search_header_filter'
import TableTotalText from 'common/components/table_total_text'

class CarrierManage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      newCarrierModal: false,
      searchText: null,
    }
  }

  componentDidMount() {
    actions.car_manage_get_carrier_list()
  }

  handleNewCarrier = () => {
    this.setState({
      newCarrierModal: true,
    })
  }

  handleHideNewCarrierModal = () => {
    this.setState({
      newCarrierModal: false,
    })
  }

  handleAddCarrier = async (carrierName) => {
    await actions.car_manage_add_carrier(carrierName)
    this.handleHideNewCarrierModal()
    actions.car_manage_get_carrier_list()
  }

  handleDelete = (item) => {
    actions.car_manage_delete_carrier(item.id).then(() => {
      actions.car_manage_get_carrier_list()
    })
  }

  hanldeConfirm = (index, value) => {
    return new Promise((resolve) => {
      if (!value || getStrByte(value) > 40) {
        Tip.warning(i18next.t('承运商格式为20个汉字或40个英文'))
        return
      }
      const { id } = this.props.carrierList[index]
      actions
        .car_manage_update_carrier({
          carrier_id: id,
          company_name: value,
        })
        .then(() => {
          actions.car_manage_get_carrier_list()
          Tip.success(i18next.t('修改成功'))
          resolve()
        })
    })
  }

  renderCarrierName = (item) => {
    const text = item.original.company_name

    return (
      <>
        <span>{text}&nbsp;</span>
        <TableUtil.EditButton
          popupRender={(closePopup) => {
            return (
              <TableUtil.EditContentInput
                initialVal={text}
                onSave={(value) => this.hanldeConfirm(item.index, value)}
                closePopup={closePopup}
              />
            )
          }}
        />
      </>
    )
  }

  handleSearch = () => {
    actions.car_manage_set_carrier_search_text(this.state.searchText)
    actions.car_manage_get_carrier_list()
  }

  handleSearchText = (e) => {
    const value = e.target.value
    this.setState({ searchText: value === '' ? null : value })
  }

  render() {
    const { searchText } = this.state
    const { carrierList } = this.props
    const { OperationDelete, OperationCell } = TableUtil

    const tableInfo = [
      {
        label: i18next.t('承运商列表'),
        content: carrierList.length,
      },
    ]

    return (
      <>
        <SearchHeaderFilter
          onChange={this.handleSearchText}
          onSearch={this.handleSearch}
          searchText={searchText}
          placeholder={i18next.t('输入承运商名称、编号搜索')}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={
            <NewCarrier
              show={this.state.newCarrierModal}
              onNewCarrier={this.handleNewCarrier}
              onHideNewCarrierModal={this.handleHideNewCarrierModal}
              onAddCarrier={this.handleAddCarrier}
            />
          }
        >
          <Table
            data={carrierList.slice()}
            columns={[
              {
                Header: i18next.t('承运商编号'),
                accessor: 'id',
              },
              {
                Header: i18next.t('承运商'),
                id: 'company_name',
                Cell: (cellProps) => this.renderCarrierName(cellProps),
              },
              {
                Header: i18next.t('有效司机'),
                accessor: 'count',
              },
              {
                Header: TableUtil.OperationHeader,
                Cell: ({ original, index }) => {
                  return (
                    <OperationCell>
                      <OperationDelete
                        title={i18next.t('警告')}
                        onClick={this.handleDelete.bind(null, original)}
                      >
                        {i18next.t('确认删除承运商 ') +
                          `${original.company_name}？`}
                      </OperationDelete>
                    </OperationCell>
                  )
                },
              },
            ]}
          />
        </BoxTable>
      </>
    )
  }
}

CarrierManage.propTypes = {
  carrierList: PropTypes.object,
}

export default connect((state) => ({
  carrierList: state.carManage.carrierList,
}))(CarrierManage)
