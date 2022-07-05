import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable, Popover, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import TableTotalText from 'common/components/table_total_text'
import ChosenDimension from './chosen_dimension'
import { combineLevel } from '../../util'

@observer
class DataStatistics extends React.Component {
  componentDidMount() {
    this.props.listStore.setDoFirstRequest(this.pagination.apiDoFirstRequest)
    this.pagination.apiDoFirstRequest()
  }

  render() {
    const { resultList, fetchList, count } = this.props.listStore
    const tableInfo = [
      {
        label: i18next.t('明细'),
        content: count,
      },
    ]

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText data={tableInfo} />
          </BoxTable.Info>
        }
        action={
          <Popover
            showArrow
            type='click'
            right
            popup={
              <div className='gm-bg gm-border gm-padding-10'>
                <ChosenDimension store={this.props.listStore} />
              </div>
            }
          >
            <Button type='primary' plain>
              {i18next.t('展开查看')}&nbsp;
              <span className='glyphicon glyphicon-th-large' />
            </Button>
          </Popover>
        }
      >
        <ManagePaginationV2
          onRequest={fetchList}
          ref={(ref) => {
            this.pagination = ref
          }}
          disablePage
        >
          <Table
            data={resultList.slice()}
            columns={[
              {
                Header: i18next.t('下单日期'),
                accessor: 'order_date',
              },
              {
                Header: i18next.t('组合商品名/ID'),
                id: 'id',
                accessor: (d) => `${d.name}/${d.id}`,
              },
              {
                Header: i18next.t('类型'),
                id: 'combine_level',
                accessor: (d) => combineLevel[d.combine_level],
              },
              {
                Header: '下单数',
                accessor: 'count',
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}
DataStatistics.propTypes = {
  listStore: PropTypes.object.isRequired,
}

export default DataStatistics
