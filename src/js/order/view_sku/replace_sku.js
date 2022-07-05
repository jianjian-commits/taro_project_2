import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { BoxTable, RightSideModal, Button } from '@gmfe/react'
import { observer } from 'mobx-react'

import TaskList from '../../task/task_list'
import TableTotalText from 'common/components/table_total_text'
import TableListTips from '../../common/components/table_list_tips'
import ReplaceSkuTable from '../components/replace_sku_table'
import { history } from '../../common/service'

import store from './store'

@observer
class ReplaceSku extends React.Component {
  componentDidMount() {
    this.handleSelectedList()
  }

  handleSelectedList() {
    // 默认给选中的列表数据每一项的change_type设为0
    const { skuBatch } = store
    const list = [...skuBatch.list.slice()]
    _.forEach(list, (sku) => {
      sku.change_type = 0
    })
    skuBatch.list = list
  }

  handleReplaceSku() {
    return store
      .replaceBatchSku()
      .then(() => {
        // 唤起异步任务窗口
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
        return history.push(`/order_manage/order/list`)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // 处理计算总下单数
  getAllQuantityInSkuBatch(list) {
    _.forEach(list, (sku) => {
      let sum = 0
      _.forEach(sku.orders, (item) => {
        sum += item.quantity
      })
      sku.all_quantity = sum
    })
    return list
  }

  render() {
    const { skuBatch } = store
    const list = skuBatch.list.slice()
    this.getAllQuantityInSkuBatch(list)
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('批量替换商品'),
                  content: list.length,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={
          <Button
            type='primary'
            plain
            className='gm-margin-right-5'
            onClick={this.handleReplaceSku.bind()}
          >
            {i18next.t('确定')}
          </Button>
        }
      >
        <TableListTips
          tips={[
            i18next.t(
              '替换成功，则将原商品从订单中删除，同时新增替换商品至订单（流转单商品不可替换）',
            ),
          ]}
        />
        <ReplaceSkuTable data={list} loading={skuBatch.loading} />
      </BoxTable>
    )
  }
}

export default ReplaceSku
