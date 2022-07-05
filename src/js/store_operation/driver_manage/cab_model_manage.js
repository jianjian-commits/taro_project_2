import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip, BoxTable } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import NewCarModel from './components/new_car_model'

import { connect } from 'react-redux'
import './actions.js'
import './reducer.js'
import actions from '../../actions'
import { getStrByte } from '../../common/util'
import _ from 'lodash'
import PropTypes from 'prop-types'

import SearchHeaderFilter from './search_header_filter'
import TableTotalText from 'common/components/table_total_text'

class CabModelManage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      newCarModelModal: false,
      searchText: null,
    }
  }

  componentDidMount() {
    actions.car_manage_get_cab_model_list()
  }

  handleNewCar = () => {
    this.setState({
      newCarModelModal: true,
    })
  }

  handleHideNewCarModelModal = () => {
    this.setState({
      newCarModelModal: false,
    })
  }

  handleAddCarModel = async (cabModelMessage) => {
    await actions.car_manage_add_cab_model(cabModelMessage)
    this.handleHideNewCarModelModal()
    actions.car_manage_get_cab_model_list()
  }

  handleDelete = (item) => {
    actions.car_manage_delete_car_model(item.id).then(() => {
      actions.car_manage_get_cab_model_list()
    })
  }

  hanldeConfirm = (index, type, value) => {
    return new Promise((resolve) => {
      const { id } = this.props.cabModelList[index]
      const params = {
        car_model_id: id,
      }

      if (type === 'car_model_name') {
        if (!value || getStrByte(value) > 20) {
          Tip.warning(i18next.t('车型格式为10个汉字或20个英文'))
          return
        }
      } else {
        if (_.isNaN(+value) || +value >= 100 || +value <= 0) {
          Tip.warning(i18next.t('满载框数格式为1-99数字'))
          return
        }
      }

      params[type] = value
      actions.car_manage_update_car_model(params).then(() => {
        actions.car_manage_get_cab_model_list()
        Tip.success(i18next.t('修改成功'))
        resolve()
      })
    })
  }

  handleSetvalue = (_type, index, value) => {
    let key = 'name'
    if (_type !== 'car_model_name') {
      key = _type
    }
    const op = 'update'
    const type = 'car_modal'
    actions.update_data_list({ op, type, value, key, index })
  }

  renderItem = (type, item) => {
    let text = ''
    if (type === 'car_model_name') {
      text = item.original.name
    } else {
      text = item.original[type]
    }
    return (
      <>
        <span>{text}&nbsp;</span>
        <TableUtil.EditButton
          popupRender={(closePopup) => {
            return (
              <TableUtil.EditContentInput
                initialVal={text}
                onSave={(value) => this.hanldeConfirm(item.index, type, value)}
                closePopup={closePopup}
              />
            )
          }}
        />
      </>
    )
  }

  handleSearch = () => {
    actions.car_manage_set_car_model_search_text(this.state.searchText)
    actions.car_manage_get_cab_model_list()
  }

  handleSearchText = (e) => {
    const value = e.target.value
    this.setState({ searchText: value === '' ? null : value })
  }

  render() {
    const { searchText } = this.state
    const { cabModelList } = this.props
    const { OperationCell, OperationDelete } = TableUtil

    const tableInfo = [
      {
        label: i18next.t('车型列表'),
        content: cabModelList.length,
      },
    ]

    return (
      <>
        <SearchHeaderFilter
          onChange={this.handleSearchText}
          onSearch={this.handleSearch}
          searchText={searchText}
          placeholder={i18next.t('输入车型名称、编号搜索')}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={
            <NewCarModel
              show={this.state.newCarModelModal}
              onNewCar={this.handleNewCar}
              onHideNewCarModelModal={this.handleHideNewCarModelModal}
              onAddCarModel={this.handleAddCarModel}
            />
          }
        >
          <Table
            data={cabModelList.slice()}
            columns={[
              {
                Header: i18next.t('车型编号'),
                accessor: 'id',
              },
              {
                Header: i18next.t('车型'),
                id: 'name',
                Cell: (cellProps) =>
                  this.renderItem('car_model_name', cellProps),
              },
              {
                Header: i18next.t('满载框数'),
                id: 'max_load',
                Cell: (cellProps) => this.renderItem('max_load', cellProps),
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
                        {i18next.t('确认删除车型 ') + `${original.name}？`}
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

CabModelManage.propTypes = {
  cabModelList: PropTypes.object,
}

export default connect((state) => ({
  cabModelList: state.carManage.cabModelList,
}))(CabModelManage)
