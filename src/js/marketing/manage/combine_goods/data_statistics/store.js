import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { i18next } from 'gm-i18n'
import { exportExcel } from '../../../../material_manage/util'
import { combineLevel } from '../util'

class DataStatisticsStore {
  export = {
    options: {
      order_date: i18next.t('下单日期'),
      name: i18next.t('组合商品名'),
      id: i18next.t('组合商品ID'),
      combine_level: ({ value }) => {
        return [i18next.t('类型'), combineLevel[value]]
      },
      count: i18next.t('下单数'),
    },
    fileName: i18next.t('数据统计导出表.xlsx'),
  }

  // 明细
  @observable count = 0
  // 展示列表
  @observable resultList = []
  // 展开查看 => 按每日
  @observable chosen = [{ name: i18next.t('按每日'), show: false }]
  // 请求参数
  @observable filter = {
    start_time: moment(new Date()).format('YYYY-MM-DD'),
    end_time: moment(new Date()).format('YYYY-MM-DD'),
    search_text: '',
    export: 0,
  }

  @action.bound
  fetchList(pagination) {
    const params = {
      ...pagination,
      count: 1, // 因为明细要用到count，所以传个count:1给后台请求count
      ...this.filter,
      // 和后台约定好的正常查看传个空数组 按每天查看传 [1]
      aggerate_list: JSON.stringify(this.chosen[0].show ? [1] : []),
    }
    return Request('/station/promotion/combine_goods_statistics/get')
      .data(params)
      .post()
      .then(
        action((json) => {
          this.resultList = json.data.result
          this.count = json.pagination.count
          return json // 返回给pagination组件获取数据及pagination字段
        })
      )
  }

  @action
  setFilterOpTime(start_time, end_time) {
    this.filter.start_time = moment(start_time).format('YYYY-MM-DD')
    this.filter.end_time = moment(end_time).format('YYYY-MM-DD')
  }

  @action
  setFilterSearchText(text) {
    this.filter.search_text = text
  }

  @action
  changeCheckbox(show) {
    this.chosen[0].show = !show
  }

  @action
  setDoFirstRequest(func) {
    // apiDoFirstRequest有ManagePaginationV2提供
    this.apiDoFirstRequest = func
  }

  @action
  handleExport = async () => {
    const { start_time, end_time, search_text } = this.filter
    const params = {
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      search_text,
      export: 1,
      // 和后台约定好的正常查看传个空数组 按每天查看传 [1]
      aggerate_list: JSON.stringify(this.chosen[0].show ? [1] : []),
    }
    const {
      data: { result },
    } = await Request('/station/promotion/combine_goods_statistics/get')
      .data(params)
      .post()
    exportExcel(this.export, [result])
  }
}

export default new DataStatisticsStore()
