import { i18next } from 'gm-i18n'
import React from 'react'
import { Price, FormPanel, Steps, Button } from '@gmfe/react'
import { Table } from '@gmfe/table'
import { history, withBreadcrumbs } from '../../../../common/service'
import { observer } from 'mobx-react'
import store from './stores'
import globalStore from '../../../../stores/global'
import Big from 'big.js'

@withBreadcrumbs([i18next.t('短信充值')])
@observer
class Overview extends React.Component {
  viewRechargeRecord() {
    history.push('/system/setting/short_message/recharge/record')
  }

  componentDidMount() {
    store.requestComboList()
  }

  render() {
    return (
      <div>
        <FormPanel title={i18next.t('充值流程')}>
          <Steps
            data={[
              {
                title: i18next.t('第一步'),
                description: i18next.t(
                  '请了解短信套餐包内容，选择合适的套餐包'
                ),
              },
              {
                title: i18next.t('第二步'),
                description: i18next.t(
                  '拨打4008600906转2，联系您的专属顾问，获取付款方式'
                ),
              },
              {
                title: i18next.t('第三步'),
                description: i18next.t(
                  '请耐心等待，我们将尽快为您充值。您的专属顾问会持续为您反馈进度'
                ),
              },
            ]}
          />
        </FormPanel>

        <FormPanel
          style={{ paddingTop: '10px' }}
          title={i18next.t('短信套餐包')}
          right={
            globalStore.hasPermission('get_sms_recharge_record') && (
              <Button type='primary' onClick={this.viewRechargeRecord}>
                {i18next.t('查看充值记录')}
              </Button>
            )
          }
        >
          <Table
            tiled
            data={store.comboList.slice()}
            columns={[
              {
                Header: i18next.t('短信套餐包'),
                accessor: 'name',
              },
              {
                Header: i18next.t('套餐价'),
                id: 'price',
                accessor: (d) => d.price + Price.getUnit(),
              },
              {
                Header: i18next.t('套餐短信条数'),
                id: 'sms_nums',
                accessor: (d) => d.sms_nums + i18next.t('条'),
              },
              {
                Header: i18next.t('每条单价'),
                id: 'unit',
                accessor: (d) => {
                  const n = Big(d.price).div(d.sms_nums).toFixed(3)
                  return n + Price.getUnit() + '/' + i18next.t('条')
                },
              },
            ]}
          />
          {/* <div className="gm-margin-top-10 gm-text-red">
                        提示： <br />
                        1.短信无使用时间限制，永不清零 <br />
                        2.若发送短信失败，则不计费 <br />
                    </div> */}
        </FormPanel>
      </div>
    )
  }
}
export default Overview
