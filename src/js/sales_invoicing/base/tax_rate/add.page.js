import React, { Component } from 'react'
import { withBreadcrumbs } from 'common/service'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import Header from './components/header'
import { Flex, Tip } from '@gmfe/react'
import Supplier from './components/supplier'
import Product from 'common/components/tax_rate/product'
import store from './store'
import { checkData, getSearchOption } from './utils'
import { toJS } from 'mobx'

@withBreadcrumbs([t('添加')])
@observer
class Add extends Component {
  handleCancel = () => {
    window.closeWindow()
  }

  handleOk = async () => {
    const { details, category, handleAdd } = store
    const { tax_rule_name, status, supplier } = details
    if (!checkData({ tax_rule_name, supplier, category })) {
      return
    }
    const option = getSearchOption(tax_rule_name, supplier, status, category)
    const { data } = await handleAdd(option)
    Tip.success(t('创建成功'))
    window.location.href = `#/sales_invoicing/base/tax_rate/edit?tax_id=${data}`
  }

  handleChange = (list) => {
    const { setCategory } = store
    setCategory(list)
  }

  render() {
    const { edit, category, details } = store
    const { spu } = details

    return (
      <>
        <Header onCancel={this.handleCancel} onOk={this.handleOk} />
        <Flex className='gm-margin-top-10'>
          <Supplier />
          <Product
            edit={edit}
            spu={spu.slice()}
            category={toJS(category)}
            onChange={this.handleChange}
          />
        </Flex>
      </>
    )
  }
}

export default Add
