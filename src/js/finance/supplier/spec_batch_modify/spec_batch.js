import React from 'react'
import { i18next } from 'gm-i18n'
import { Table } from '@gmfe/table'
import { Flex, Button } from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import { history } from '../../../common/service'
import store from './store'
import { showTaskPanel } from '../../../task/task_list'
import './index.less'

const sheetHeaderMap = {
  [i18next.t('采购规格ID')]: 'pur_spec_id',
  [i18next.t('规格名称')]: 'name',
  [i18next.t('规格条码')]: 'barcode',
  [i18next.t('采购规格')]: 'purchase_spec_display',
  [i18next.t('最高入库单价')]: 'max_stock_unit_price',
  [i18next.t('采购描述')]: 'purchase_desc',
}

@observer
class SpecBatchList extends React.Component {
  handleDeleteRow = (pur_spec_id) => {
    store.setSpecBatchModifyList(
      _.filter(store.specBatchModifyList, (v) => {
        return v.pur_spec_id !== pur_spec_id
      })
    )
  }

  handleCancel = () => {
    history.push('/supply_chain/purchase/information?tab=get_pur_spec')
  }

  handleSubmit = () => {
    store.batchImport().then((json) => {
      history.push('/supply_chain/purchase/information?tab=get_pur_spec')
      showTaskPanel(null, { tabKey: 1 })
    })
  }

  render() {
    const { specBatchModifyList } = store
    const columns = _.map(sheetHeaderMap, (item, key) => {
      return {
        Header: key,
        accessor: item,
      }
    })
    columns.push({
      Header: i18next.t('操作'),
      id: 'action',
      Cell: (row) => (
        <i
          className='xfont xfont-delete gm-cursor'
          onClick={() => this.handleDeleteRow(row.original.pur_spec_id)}
        />
      ),
    })

    return (
      <div>
        <QuickPanel icon='bill' title={i18next.t('待导入采购规格列表')}>
          <Table
            className='container-full'
            data={toJS(specBatchModifyList)}
            columns={columns}
          />
          {specBatchModifyList.length > 0 ? (
            <Flex className='gm-margin-top-20'>
              <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
              <div className='gm-margin-lr-5' />
              <Button type='primary' onClick={this.handleSubmit}>
                {i18next.t('保存')}
              </Button>
            </Flex>
          ) : null}
        </QuickPanel>
      </div>
    )
  }
}

export default SpecBatchList
