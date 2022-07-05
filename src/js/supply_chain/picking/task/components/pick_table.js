import { BoxTable, Flex, Pagination } from '@gmfe/react'
import { Table, selectTableV2HOC, diyTableHOC, TableUtil } from '@gmfe/table'
import TableTotalText from 'common/components/table_total_text'
import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import globalStore from 'stores/global'

const SelectTable = selectTableV2HOC(diyTableHOC(Table))

@observer
class PickTable extends React.Component {
  handleSelectAll = (isSelectAll) => {
    const {
      tableKey,
      store: { pickTasks, changeSelected, setSelectAllPage },
    } = this.props
    let selectValues = []
    if (isSelectAll) {
      selectValues = pickTasks.map(({ [tableKey]: id }) => id)
    } else {
      setSelectAllPage(false)
    }
    changeSelected(selectValues)
  }

  handleSelect = (v) => {
    const { store } = this.props
    store.changeSelected(v)
    store.setSelectAllPage(false)
  }

  render() {
    const { tableKey, orderTableConfig, store, share, printer } = this.props
    const {
      pickTasks,
      pagination,
      selected,
      isLoading,
      isSelectedAllPage,
      toggleSelectAllPage,
      count,
    } = store

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('拣货条目总数'),
                  content: pagination.count,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <SelectTable
          id={'pick_table' + tableKey}
          data={pickTasks.slice()}
          keyField={tableKey}
          diyGroupSorting={[i18next.t('基础字段')]}
          loading={isLoading}
          onSelectAll={this.handleSelectAll}
          selected={selected.slice()}
          onSelect={this.handleSelect}
          columns={orderTableConfig}
          batchActionBar={
            selected.length ? (
              <TableUtil.BatchActionBar
                onClose={() => this.handleSelect([])}
                isSelectAll={isSelectedAllPage}
                count={count}
                toggleSelectAll={() => {
                  this.handleSelectAll(true)
                  toggleSelectAllPage()
                }}
                batchActions={[
                  {
                    name: i18next.t('分享拣货任务'),
                    type: 'business',
                    onClick: () => share(isSelectedAllPage, selected.slice()),
                    show: globalStore.hasPermission('get_picking_qrcode'),
                  },
                  {
                    name: i18next.t('打印拣货单'),
                    onClick: () => printer(isSelectedAllPage, selected.slice()),
                    show: globalStore.hasPermission('print_picking_task'),
                    type: 'business',
                  },
                ]}
              />
            ) : null
          }
        />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination
            data={pagination}
            nextDisabled={
              pagination.offset + pagination.count <= pagination.count
            }
            toPage={this.props.onPageChange} /*eslint-disable-line*/
          />
        </Flex>
      </BoxTable>
    )
  }
}

PickTable.propTypes = {
  store: PropTypes.object.isRequired,
  printer: PropTypes.func.isRequired,
  share: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  orderTableConfig: PropTypes.array.isRequired,
  tableKey: PropTypes.string.isRequired,
}

export default PickTable
