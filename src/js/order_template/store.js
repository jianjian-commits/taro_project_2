import { action, runInAction, extendObservable, computed } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import _ from 'lodash'

import { keyMap, getRelationColumns, hasSameItem } from './util'

const initialState = {
  list: [],
  detail: {
    id: null,
    name: '',
    type: 1,
    row_title: null,
    row_address: null,
    cycle_start: null,
    cycle_col: null,
    relation_columns: {},
    relationship: [],
  },
  loading: true,
}

class Store {
  constructor() {
    extendObservable(this, initialState)
  }

  initItem() {
    return {
      is_new: true,
      system_key: null,
      relation_name: null,
      col_index: null,
    }
  }

  initRelationship() {
    const { type } = this.detail
    let list = ['resname', 'sku_name', 'quantity']
    if (type !== 1) {
      list = ['sku_name', 'quantity']
    }
    this.detail.relationship = list.map((value) => {
      const item = this.initItem()
      item.system_key = value
      return item
    })
  }

  initDetail() {
    this.detail.row_title = null
    this.detail.row_address = null
    this.detail.cycle_start = null
    this.detail.cycle_col = null
    this.detail.relation_columns = {}
    this.initRelationship()
  }

  operateNewRelationship(type, index, details) {
    const item = this.initItem()
    if (type === 'add') {
      details.splice(index + 1, 0, item)
    } else {
      if (details.length > 1) {
        details.splice(index, 1)
      } else {
        details[0] = item
      }
    }
  }

  @action
  async operateNewRelationColumns(columns) {
    const { type, row_title, row_address, cycle_start } = this.detail
    let relationColumns = {}
    if (!row_title) {
      return Promise.reject(new Error('请正确输入标题所在行'))
    }
    if (type === 2 && !row_address) {
      return Promise.reject(new Error('请正确输入商户所在行'))
    }

    const data = columns[row_title - 1]
    if (!data || !data.length) {
      return Promise.reject(new Error('数据解析失败'))
    }

    if (type === 1) {
      _.forEach(data, (item, i) => {
        relationColumns[i + 1] = item
      })
    } else {
      relationColumns = await getRelationColumns(cycle_start, data).catch(
        (err) => {
          return Promise.reject(err)
        },
      )
    }
    this.detail.relation_columns = relationColumns
    this.initRelationship()
    return Promise.resolve('')
  }

  @computed
  get relationshipList() {
    const { relationship } = this.detail
    return _.map(relationship, (value) => {
      const { system_key } = value
      return {
        ...value,
        name: keyMap[system_key],
      }
    })
  }

  @action
  changeRelationship(type, index) {
    const relationship = [...this.detail.relationship]
    this.operateNewRelationship(type, index, relationship)
    this.detail.relationship = relationship
  }

  @action
  addRelationship(index) {
    const type = 'add'
    this.changeRelationship(type, index)
  }

  @action
  deleteRelationship(index) {
    const type = 'del'
    this.changeRelationship(type, index)
  }

  @action
  changeRelationshipItem(index, key, value) {
    if (key === 'col_index') {
      this.detail.relationship[
        index
      ].relation_name = this.detail.relation_columns[value]
    }
    this.detail.relationship[index][key] = value
  }

  @action
  reset() {
    this.detail = { ...initialState.detail, relationship: {} }
  }

  @action
  getDetail(id) {
    return Request('/station/order/batch/template/detail')
      .data({ id })
      .get()
      .then((json) => {
        runInAction(() => {
          const {
            id,
            name,
            type,
            row_title,
            row_address,
            cycle_start,
            cycle_col,
            relation_columns,
            relationship,
          } = json.data
          const temp =
            type === 1 ? null : { row_address, cycle_start, cycle_col }

          this.detail = {
            ...this.detail,
            ...temp,
            id,
            type,
            name,
            row_title,
            relation_columns,
            relationship,
          }
        })
        return json
      })
  }

  @action
  detailChange(key, value) {
    const { type } = this.detail
    this.detail[key] = value
    if (key === 'type' && value !== type) {
      this.initDetail()
    }
  }

  @action
  getList() {
    this.loading = true
    return Request('/station/order/batch/template/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data
          this.loading = false
        })
        return json.data
      })
  }

  @action
  save(id) {
    const { relation_columns, relationship, ...rest } = this.detail
    const params = {
      ...rest,
      relation_columns: JSON.stringify(relation_columns),
      relationship: JSON.stringify(
        _.map(
          _.filter(relationship, ({ system_key }) => system_key),
          ({ system_key, relation_name, col_index }) => {
            return {
              system_key,
              relation_name,
              col_index,
            }
          },
        ),
      ),
    }
    return Request(
      id
        ? '/station/order/batch/template/edit'
        : '/station/order/batch/template/create',
    )
      .data(params)
      .post()
  }

  @action
  setRelationColumn(columns) {
    this.relation_columns = columns
  }

  @action
  del(id) {
    return Request('/station/order/batch/template/delete').data({ id }).post()
  }

  @computed
  get validateExcel() {
    const commons = ['row_title']
    const { detail } = this
    let disabled = false
    commons.forEach((item) => {
      if (!detail[item]) {
        disabled = true
      }
    })
    if (!disabled && detail.type === 2) {
      const others = ['row_address', 'cycle_start', 'cycle_col']
      others.forEach((item) => {
        if (!detail[item]) {
          disabled = true
        }
      })
    }
    return disabled
  }

  validate() {
    const {
      detail: { name, relationship, type },
      validateExcel,
    } = this
    const isNullRelation = _.find(
      relationship,
      (item) => !item.relation_name || !item.system_key,
    )

    if (!name) return Promise.reject(new Error(i18next.t('输入模板名称')))
    if (validateExcel)
      return Promise.reject(new Error(i18next.t('输入Excel模板信息')))
    if (isNullRelation)
      return Promise.reject(new Error(i18next.t('对应关系不能为空')))
    if (!_.find(relationship, (item) => item.system_key === 'quantity'))
      return Promise.reject(new Error(i18next.t('下单数必选')))
    if (
      !_.find(relationship, (item) =>
        ['sku_id', 'outer_id', 'sku_name'].includes(item.system_key),
      )
    )
      return Promise.reject(
        new Error(i18next.t('商品ID、自定义编码、商品名至少必选任意一项')),
      )
    if (
      type === 1 &&
      !_.find(relationship, (item) =>
        ['resname', 'sid'].includes(item.system_key),
      )
    )
      return Promise.reject(
        new Error(i18next.t('商户SID和商户名至少必选任意一项')),
      )
    if (hasSameItem(_.map(relationship, (item) => item.relation_name)))
      return Promise.reject(new Error(i18next.t('对应关系不能重复')))
    return Promise.resolve()
  }
}

export default new Store()
