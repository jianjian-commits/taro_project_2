import { i18next } from 'gm-i18n'
import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { exportExcel } from '../util'
import { idConvert2Show } from '../../../../common/util'

class SendDetailStore {
  exportOptions = {
    send_time: i18next.t('日期'),
    receive_name_id: ({ row }) => {
      const value =
        row.receive_name + '(' + idConvert2Show(row.restaurant_id, 'S') + ')'
      return [i18next.t('消费对象'), value]
    },
    receive_phone: i18next.t('联系电话'),
    business_type: ({ value }) => [
      i18next.t('短信模板'),
      this.smsTemplateMap[value],
    ],
    status: ({ value }) => {
      return [i18next.t('接收状态'), this.statusMap[value]]
    },
    remark: i18next.t('备注'),
  }

  smsTemplateMap = {
    '0': i18next.t('代下订单'),
    '1': i18next.t('商城下单'),
    '2': i18next.t('用户注册'),
    '3': i18next.t('团长注册/登录'),
  }

  statusOrder = ['-1', '1', '0'] // statusMap 的展示顺序
  statusMap = {
    '-1': i18next.t('全部'),
    '0': i18next.t('失败'),
    '1': i18next.t('成功'),
  }

  @observable queryFilter = {
    start_date: new Date(),
    end_date: new Date(),
    status: '-1', //    状态(0:失败, 1:成功, 不传代表全部)
    search_text: '', //     搜索文本(商户名或联系电话)
  }

  @observable sendDetailList = []

  getQueryFilter() {
    const { start_date, end_date, search_text, status } = this.queryFilter
    const params = {
      start_date: moment(start_date).format('YYYY-MM-DD'),
      end_date: moment(end_date).format('YYYY-MM-DD'),
      search_text,
    }
    if (status !== '-1') {
      params.status = status
    }
    return params
  }

  @action
  setQuerytFilter(field, value) {
    this.queryFilter[field] = value
  }

  @action.bound
  async requestSendDetailList(pagination = {}) {
    const filter = {
      ...this.getQueryFilter(),
      ...pagination,
    }
    const json = await Request('/sms/send_record/get').data(filter).get()
    runInAction(() => {
      this.sendDetailList = json.data
    })
    return json
  }

  async export() {
    const json = await Request(
      '/sms/send_record/export' /* /sms/send_record/export  */
    )
      .data(this.getQueryFilter())
      .get()
    exportExcel(this.exportOptions, json.data, i18next.t('发送明细.xlsx'))
  }
}

export default new SendDetailStore()
