import React from 'react'
import { Price } from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { i18next } from 'gm-i18n'
import Big from 'big.js'
import { Table } from '@gmfe/table'
import { renderPurchaseSpec } from '../../../common/filter'
import { Request } from '@gm-common/request'

class QuotationErrorList extends React.Component {
  constructor() {
    super()
    this.state = {
      list: [],
    }
  }

  async componentDidMount() {
    const { task_id } = this.props.location.query

    const json = await Request('/task/list').get()
    if (json.code === 0) {
      const tasks = json.data.tasks
      const result = tasks.find((v) => +v.task_id === +task_id).result
        .error_record
      const rmb = Price.getUnit()

      const list = result.map((item) => ({
        ...item,
        purchase_spec: renderPurchaseSpec(item),
        category: `${item.category_1_name || '-'}/${
          item.category_2_name || '-'
        }/${item.pinlei_name || '-'}`,
        std_unit_price: `${Big(item.std_unit_price || 0)
          .div(100)
          .toFixed(2)} ${rmb}/${item.std_unit || '-'}`,
        purchase_unit_price: `${Big(item.std_unit_price || 0)
          .div(100)
          .times(item.ratio || 1)
          .toFixed(2)} ${rmb}/${item.purchase_unit || '-'}`,
      }))

      this.setState({ list })
    }
  }

  render() {
    const { list } = this.state

    return (
      <QuickPanel title={i18next.t('导入错误')} icon='bill'>
        <Table
          data={list}
          columns={[
            {
              Header: i18next.t('商品ID'),
              accessor: 'spu_id',
            },
            {
              Header: i18next.t('商品名称'),
              accessor: 'spu_name',
            },
            {
              Header: i18next.t('采购规格ID'),
              accessor: 'spec_id',
            },
            {
              Header: i18next.t('规格名称'),
              accessor: 'spec_name',
            },
            {
              Header: i18next.t('所属分类'),
              accessor: 'category',
            },
            {
              Header: i18next.t('采购规格'),
              accessor: 'purchase_spec',
            },
            {
              Header: i18next.t('供应商编号'),
              accessor: 'customer_id',
            },
            {
              Header: i18next.t('供应商名称'),
              accessor: 'settle_supplier_name',
            },
            {
              Header: i18next.t('询价(采购单位)'),
              accessor: 'purchase_unit_price',
            },
            {
              Header: i18next.t('询价(基本单位)'),
              accessor: 'std_unit_price',
            },
            {
              Header: i18next.t('产地'),
              accessor: 'origin_place',
            },
            {
              Header: i18next.t('描述'),
              accessor: 'remark',
            },
            {
              Header: i18next.t('失败原因'),
              accessor: 'error',
            },
          ]}
        />
      </QuickPanel>
    )
  }
}

export default QuotationErrorList
