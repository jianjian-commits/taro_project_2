import { observable, action } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { i18next } from 'gm-i18n'
import { processStatus } from 'common/filter'
import { DEMAND_TYPES } from 'common/enum'
import { findByValue } from './util'

class Store {
  @observable list = []

  @observable ids = []

  @observable loading = false

  @observable params = {
    begin: moment().toDate(),
    end: moment().toDate(),
    searchText: '',
    status: '',
    from: 0,
  }

  @observable selectAllType = false // true所有页 false当前页

  @observable count = 0 // 总数据量

  @action
  fetchData(pagination) {
    this.loading = true
    const { begin, end, searchText, status, from } = this.params
    return Request('/product/new_merchandise/list')
      .data({
        start_time: moment(begin).format('YYYY-MM-DD'),
        end_time: moment(end).format('YYYY-MM-DD'),
        status,
        search_text_new: searchText,
        from: from || null,
        ...pagination,
        count: 1,
      })
      .post()
      .then((json) => {
        this.ids = []
        this.count = json.pagination.count
        this.loading = false
        // _status，_edit前端使用，用来记录选择的状态，编辑状态
        this.list = _.map(json.data, (v, i) => ({
          ...v,
          _status: v.status,
          _edit: false,
        }))
        return json
      })
  }

  @action
  handleChangeSingleStatus(id, index) {
    const target = this.list[index]

    const { begin, end } = this.params
    const params = {
      ids: JSON.stringify([id]),
      new_status: target._status,
      start_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
    }
    return Request('/product/new_merchandise/update')
      .data(params)
      .post()
      .then(
        action(() => {
          const list = [...this.list]
          list[index].status = target._status
          list[index]._edit = !target._edit
          this.list = list
          this.ids = _.pull(this.ids, id) // 取消勾选状态
        })
      )
  }

  @action
  handleChangeMultiStatus(NewStatus, ids) {
    const { begin, end, searchText, status } = this.params
    NewStatus = Number(NewStatus)
    let params = {
      start_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
    }
    // 修改所有页时传搜索条件
    if (this.selectAllType) {
      params = {
        ...params,
        status,
        search_text_new: searchText,
        new_status: NewStatus,
      }
    } else {
      params = {
        ...params,
        ids: JSON.stringify(ids),
        new_status: NewStatus,
      }
    }
    return Request('/product/new_merchandise/update')
      .data(params)
      .post()
      .then(
        action(() => {
          // 后端修改成功后，前端修改界面展示
          const list = [...this.list]

          if (!this.selectAllType) {
            console.log(ids)
            _.forEach(ids, (id) => {
              // const index = list.findIndex(i => i._id === id)
              // list[index].status = NewStatus
            })
          } else {
            // 修改所有页
            _.forEach(list, (i) => {
              if (i.status === 1) {
                i.status = NewStatus
              }
            })
          }
          this.list = list
          this.ids = []
        })
      )
  }

  @action
  handleChangeSelectAllType(bool) {
    this.selectAllType = bool
  }

  @action
  handleExport() {
    const { begin, end, searchText, status } = this.params
    Request('/product/new_merchandise/export')
      .data({
        start_time: moment(begin).format('YYYY-MM-DD'),
        end_time: moment(end).format('YYYY-MM-DD'),
        status,
        search_text_new: searchText,
      })
      .post()
      .then(({ data }) => {
        if (!data.length) data.push('') // 防止空数组时不生成表头
        const exportData = _.map(data, (v) => ({
          [i18next.t('提交时间')]: v.create_time,
          [i18next.t('商品名称')]: v.name,
          [i18next.t('提交人ID')]: v.commit_id,
          [i18next.t('公司名称')]: v.company_name,
          [i18next.t('提交人名称')]: v.commit_name,
          [i18next.t('需求来源')]: findByValue(DEMAND_TYPES, v.from),
          [i18next.t('处理状态')]: processStatus(v.status),
          [i18next.t('其他描述')]: v.desc,
        }))
        requireGmXlsx((res) => {
          const { jsonToSheet } = res
          jsonToSheet([exportData], { fileName: i18next.t('新品需求.xlsx') })
        })
      })
  }

  @action
  handleSelect(ids) {
    this.ids = ids
  }

  @action
  handleSelectAll(isSelectedAll) {
    const ids = []
    if (isSelectedAll) {
      _.each(this.list, (item) => {
        if (item.status === 1) {
          ids.push(item._id)
        }
      })
    }
    this.ids = ids
  }

  @action
  handleChangeParems(params) {
    this.params = Object.assign(this.params, params)
  }

  @action
  toggleEdit(index) {
    const target = this.list[index]
    // 取消编辑，状态还原
    if (target._edit) {
      this.list[index]._status = target.status
    }
    this.list = _.map(this.list, (v, i) => {
      if (index === i) return { ...v, _edit: !target._edit }
      return v
    })
  }

  @action
  changeStatus(status, index) {
    this.list = _.map(this.list, (v, i) => {
      // _status 临时记录选择的状态
      if (index === i) return { ...v, _status: status }
      return v
    })
  }
}

export default new Store()
