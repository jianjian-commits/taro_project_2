import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withBreadcrumbs, withRouter } from 'common/service'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from './store'
import Header from './components/header'
import { Flex } from '@gmfe/react'
import Supplier from './components/supplier'
import Product from 'common/components/tax_rate/product'
import { checkData, getSearchOption } from './utils'
import { toJS } from 'mobx'

@withBreadcrumbs([t('编辑')])
@withRouter
@observer
class Edit extends Component {
  static propTypes = {
    location: PropTypes.object,
  }

  componentDidMount() {
    this._handleFetchDetails().then()
  }

  _handleFetchDetails = async () => {
    const { location } = this.props
    const { fetchDetails, setEdit } = store
    setEdit(false)
    await fetchDetails(location.query.tax_id)
  }

  handleCancel = async () => {
    this._handleFetchDetails().then()
  }

  handleOk = async () => {
    const { details, category, handleEdit } = store
    const { tax_rule_name, supplier, status } = details
    const {
      location: {
        query: { tax_id },
      },
    } = this.props
    if (!checkData({ tax_rule_name, supplier, category })) {
      return
    }

    const option = getSearchOption(
      tax_rule_name,
      supplier,
      status,
      category,
      tax_id
    )
    await handleEdit(option)
    this._handleFetchDetails().then()
  }

  handleChange = (list) => {
    const { setCategory } = store
    setCategory(list)
  }

  render() {
    const {
      edit,
      category,
      details: { spu },
    } = store
    return (
      <>
        <Header onCancel={this.handleCancel} onOk={this.handleOk} />
        <Flex className='gm-margin-top-10'>
          <Supplier />
          <Product
            edit={edit}
            category={toJS(category)}
            spu={spu.slice()}
            onChange={this.handleChange}
          />
        </Flex>
      </>
    )
  }
}

export default Edit
