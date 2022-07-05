import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxPanel } from '@gmfe/react'
import store from './store'
import DetailHeader from './detail_header'
import { DetailTable, DetailEditTable } from './detail_table'
import { observer } from 'mobx-react'

import TableListTips from '../../common/components/table_list_tips'
import { WithBreadCrumbs } from 'common/service'

@observer
class AdjustSheetDetail extends React.Component {
  constructor(props) {
    super(props)
    store.initDetail()
  }

  componentDidMount() {
    // 如果sheet_no存在则是详情，如果不存在则是新建
    const sheetNo = this.props.location.query.sheet_no
    sheetNo && store.getDetail(sheetNo)
  }

  render() {
    const { status, details } = store.detail
    const tableTitle =
      status === 2 || status === 3
        ? i18next.t('调整商品列表')
        : i18next.t('待调整商品列表')
    const sheetNo = this.props.location.query.sheet_no

    return (
      <>
        <WithBreadCrumbs
          breadcrumbs={[
            sheetNo ? i18next.t('入库调整单详情') : i18next.t('新建入库调整单'),
          ]}
        />
        <DetailHeader sheetNo={sheetNo} />
        {sheetNo && (
          <TableListTips
            tips={[
              i18next.t(
                '未生效的调整单仅能保留7天，如7天内不提交该调整单将自动变更为已删除状态'
              ),
            ]}
          />
        )}
        <BoxPanel
          icon='bill'
          summary={[{ text: i18next.t('商品数'), value: details.length }]}
          collapse
          title={tableTitle}
        >
          {status === 2 || status === 3 ? <DetailTable /> : <DetailEditTable />}
        </BoxPanel>
      </>
    )
  }
}

export default AdjustSheetDetail
