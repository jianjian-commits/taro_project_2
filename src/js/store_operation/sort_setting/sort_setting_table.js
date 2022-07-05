import { i18next } from 'gm-i18n'
import React from 'react'
import { Select, Option } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import PropTypes from 'prop-types'

class SortSettingTable extends React.Component {
  async handleEdit(original) {
    await this.props.onEditing(original.spu_id, 'editing', true)
  }

  async handleCancel(original) {
    await this.props.onEditing(original.spu_id, 'editing', false)
  }

  async handleSave(original) {
    await this.props.onSave(original.spu_id, original.selected)
    await this.props.onEditing(original.spu_id, 'editing', false)
  }

  handleSelect = (original, value) => {
    this.props.onEditing(original.spu_id, 'selected', value)
  }

  render() {
    return (
      <div>
        <Table
          data={this.props.list}
          loading={this.props.loading}
          columns={[
            {
              Header: i18next.t('一级分类'),
              accessor: 'category_name_1',
              minWidth: 120,
              Cell: ({ original }) => (
                <span>
                  <div>{original.category_name_1}</div>
                  <div>{original.category_id_1}</div>
                </span>
              ),
            },
            {
              Header: i18next.t('二级分类'),
              accessor: 'category_name_2',
              minWidth: 120,
              Cell: ({ original }) => (
                <span>
                  <div>{original.category_name_2}</div>
                  <div>{original.category_id_2}</div>
                </span>
              ),
            },
            {
              Header: i18next.t('品类'),
              accessor: 'pinlei_name',
              minWidth: 120,
              Cell: ({ original }) => (
                <span>
                  <div>{original.pinlei_name}</div>
                  <div>{original.pinlei_id}</div>
                </span>
              ),
            },
            {
              Header: i18next.t('商品'),
              accessor: 'spu_name',
              minWidth: 120,
              Cell: ({ original }) => (
                <span>
                  <div>{original.spu_name}</div>
                  <div>{original.spu_id}</div>
                </span>
              ),
            },
            {
              Header: i18next.t('投框方式'),
              accessor: 'dispatch_method',
              minWidth: 100,
              Cell: ({ original }) => {
                return original.editing ? (
                  <Select
                    value={original.selected}
                    onChange={this.handleSelect.bind(this, original)}
                  >
                    <Option value={1}>{i18next.t('按订单投框')}</Option>
                    <Option value={2}>{i18next.t('按司机投框')}</Option>
                  </Select>
                ) : (
                  <div>
                    {original.dispatch_method === 1
                      ? i18next.t('按订单投框')
                      : i18next.t('按司机投框')}
                  </div>
                )
              },
            },
            {
              Header: TableUtil.OperationHeader,
              id: 'action',
              minWidth: 60,
              Cell: ({ original, index }) => {
                return (
                  <TableUtil.OperationRowEdit
                    isEditing={original.editing}
                    onClick={() => {
                      this.handleEdit(original)
                    }}
                    onCancel={() => {
                      this.handleCancel(original)
                    }}
                    onSave={() => {
                      this.handleSave(original)
                    }}
                  />
                )
              },
            },
          ]}
        />
        {this.props.children}
      </div>
    )
  }
}

SortSettingTable.propTypes = {
  list: PropTypes.array,
  loading: PropTypes.bool,
  onSave: PropTypes.func,
  onEditing: PropTypes.func,
}

SortSettingTable.defaultProps = {
  list: [],
  loading: false,
  onSave: () => {},
  onEditing: () => {},
}

export default SortSettingTable
