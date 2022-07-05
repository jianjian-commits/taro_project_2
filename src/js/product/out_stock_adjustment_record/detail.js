import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxPanel } from '@gmfe/react'
import DetailHeader from './detail_header'
import DetailTable from './detail_table'
import store from './store'

class AdjustRecordDetail extends React.Component {
  constructor(props) {
    super(props)
    store.initDetailData()
  }

  componentDidMount() {
    store.getDetail(this.props.location.query.sheet_no)
  }

  render() {
    return (
      <>
        <DetailHeader />
        <BoxPanel title={i18next.t('调整商品列表')} collapse>
          <DetailTable />
        </BoxPanel>
      </>
    )
  }
}

export default AdjustRecordDetail
