import { i18next } from 'gm-i18n'
import React from 'react'
import { Box } from '@gmfe/react'
import { observer } from 'mobx-react'
import store from './stores'
import globalStore from '../../../../stores/global'
import PageTotalData from 'common/components/page_total_data'
import SvgRecharge from 'svg/recharge.svg'
import SvgCheckDetail from 'svg/check_detail.svg'

@observer
class OverviewTop extends React.Component {
  componentDidMount() {
    store.requestBalance()
  }

  render() {
    const { sms_balance, nums } = store

    return (
      <Box className='gm-padding-lr-20 gm-padding-top-20 gm-padding-bottom-10'>
        <PageTotalData
          data={[
            {
              title: i18next.t('短信余额'),
              totalNumber: sms_balance,
              totalUnit: i18next.t('条'),
              icon: 'msg-balance',
              isMainColor: true,
              action: globalStore.hasPermission('add_sms_recharge_record') ? (
                <div>
                  <span>
                    <SvgRecharge style={{ color: '#56a3f2' }} />
                  </span>
                  <div className='gm-gap-5' />
                  <a href='#/system/setting/short_message/recharge'>
                    {i18next.t('短信充值')}
                  </a>
                </div>
              ) : null,
            },
            {
              title: i18next.t('近30天发送量'),
              totalNumber: nums.total_send_nums,
              totalUnit: i18next.t('条'),
              isMainColor: true,
              action: globalStore.hasPermission('get_sms_send_record') ? (
                <div>
                  <span>
                    <SvgCheckDetail style={{ color: '#56a3f2' }} />
                  </span>
                  <div className='gm-gap-5' />
                  <a href='#/system/setting/short_message/detail'>
                    {i18next.t('查看发送明细')}
                  </a>
                </div>
              ) : null,
            },
            {
              title: i18next.t('近30天计费量'),
              totalNumber: nums.total_bill_nums,
              isMainColor: true,
              totalUnit: i18next.t('条'),
            },
            {
              title: i18next.t('发送成功率'),
              totalNumber: `${nums.success_rate}`,
              totalUnit: '%',
            },
          ]}
        />
      </Box>
    )
  }
}
export default OverviewTop
