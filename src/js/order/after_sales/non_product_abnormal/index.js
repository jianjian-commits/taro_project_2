import React from 'react'
import { withBreadcrumbs } from 'common/service'
import { t } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import NonProductAbnormalHeader from './header'
import NonProductAbnormalList from './list'
import store from './store'

@withBreadcrumbs([t('非商品异常')])
class NonProductAbnormal extends React.Component {
  componentDidMount() {
    const { id } = this.props.location.query
    store.getAbnormalReasonList().then(() => {
      store.getDataList(id)
    })
    store.initAutoRun()
  }

  componentWillUnmount() {
    store.init()
  }

  render() {
    return (
      <Flex flex={1} column className='b-order col-md-12'>
        <NonProductAbnormalHeader query={this.props.location.query} />
        <NonProductAbnormalList />
      </Flex>
    )
  }
}

export default NonProductAbnormal
