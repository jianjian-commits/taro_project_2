import React from 'react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Dialog, Tip } from '@gmfe/react'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { Id2UniverseId } from './../filter'

const conflictAlert = (json) => {
  const keys = _.keys(json.data)
  const data = json.data[keys[0]]

  const isSku = !!data.skus

  data.addresses = data.addresses.map((id) => Id2UniverseId(id))
  const ruleObject = isSku
    ? data.skus.join(',')
    : data.category_2_list.join(',')

  const children = (
    <div>
      <div className='b-word-break'>
        <strong>{t('站点/商户')}：</strong> {data.addresses.join(',')}
      </div>
      <div className='b-word-break'>
        <strong>{isSku ? t('商品ID') : t('分类ID')}：</strong>
        {ruleObject}
      </div>
      <div>
        <strong>{t('冲突日期')}：</strong>
        {moment(data.begin).format('YYYY-MM-DD')}
        {t('至')}
        {moment(data.end).format('YYYY-MM-DD')}
      </div>
    </div>
  )

  Dialog.alert({
    title: t('KEY120', {
      VAR1: keys[0],
    }) /* src:'与已有规则' + keys[0] + '冲突' => tpl:与已有规则${VAR1}冲突 */,
    children: children,
    size: 'md',
  })
}

class RuleStore {
  @observable
  list = []

  @observable
  pagination = {
    count: 0,
    offset: 0,
    limit: 10,
  }

  @observable
  filter = {
    status: 3,
    searchText: '',
    stationId: null,
  }

  @observable
  loading = false

  @action
  init() {
    this.filter = {
      status: 3,
      searchText: '',
      stationId: null,
    }
    this.list = []
    this.pagination = {
      count: 0,
      offset: 0,
      limit: 10,
    }
    this.loading = false
  }

  @action
  fetchData(pagination, status = 3, keyword = '', station_id) {
    const reg_priceRule = /^xssj\d+$/i
    const reg_salemenuID = /^s\d+$/i
    let price_rule_no = ''
    let salemenu_id = ''
    let salemenu_name = ''
    // 正则表达式判断输入数据的类型
    if (reg_salemenuID.test(keyword)) {
      salemenu_id = keyword
    } else if (reg_priceRule.test(keyword)) {
      price_rule_no = keyword
    } else {
      salemenu_name = keyword
    }

    this.loading = true
    return Request('/station/price_rule/search')
      .data({
        price_rule_id: price_rule_no,
        salemenu_id: salemenu_id,
        salemenu_name: salemenu_name,
        station_id: station_id || '',
        status: status === '-1' ? '' : status,
        cur_page: pagination.offset / pagination.limit || 0,
        cnt_per_page: pagination.limit || 10,
      })
      .get()
      .then(
        action((json) => {
          this.loading = false
          this.list = _.map(json.data.list, (item) => ({
            ...item,
            edit: false,
            edit_begin: item.begin,
            edit_end: item.end,
            edit_status: item.status,
          }))
          this.pagination = json.data.pagination
        })
      )
      .catch(
        action(() => {
          this.loading = false
        })
      )
  }

  @action
  handleFilterChange(name, value) {
    this.filter[name] = value
  }

  @action
  handleEditChange(index) {
    const target = this.list[index]

    target.edit = !target.edit
    target.edit_begin = target.begin
    target.edit_end = target.end
    target.edit_status = target.status
  }

  @action
  handleEditDataChage(index, begin, end, status) {
    const target = this.list[index]
    if (begin && end) {
      target.edit_begin = begin
      target.edit_end = end
    }
    if (status !== undefined) {
      target.edit_status = status
    }
  }

  @action
  handleEditDataSave(postData, index) {
    return Request('/station/price_rule/edit')
      .code([0, 1, 10])
      .data(postData)
      .post()
      .then((json) => {
        // 存在冲突
        if (json.code === 10) {
          conflictAlert(json)
        } else if (json.code === 0) {
          Tip.success(t('修改成功'))

          if (index !== undefined) {
            const target = this.list[index]
            target.edit = false
            target.begin = target.edit_begin
            target.end = target.edit_end
            target.status = target.edit_status
          }
        } else {
          Tip.danger(json.msg)
        }

        return json
      })
  }
}

export default new RuleStore()
