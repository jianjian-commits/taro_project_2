import { action, runInAction, extendObservable, computed } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { TYPE_1_LIST, TYPE_2_LIST, keyMap, hasSameItem } from './util'

const initialState = {
  list: [],
  detail: {
    id: null,
    name: '',
    row_title: null,
    relation_columns: {},
    relationship: [],
    type: 2,
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
    const initList = ['sku_name'] // 初始化的数组
    this.detail.relationship = initList.map((value) => {
      const item = this.initItem()
      item.system_key = value
      return item
    })
  }

  initDetail() {
    this.detail.row_title = null
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

  // 上传表格解析
  @action
  async operateNewRelationColumns(columns) {
    const { row_title } = this.detail
    const relationColumns = {}
    if (!row_title) {
      return Promise.reject(new Error('请正确输入标题所在行'))
    }
    const data = columns[row_title - 1]
    if (!data || !data.length) {
      return Promise.reject(new Error('数据解析失败'))
    }
    _.forEach(data, (item, i) => {
      relationColumns[i + 1] = item
    })
    this.initRelationship()
    this.detail.relation_columns = relationColumns
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

  // 字段相关操作
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

  // 修改Relationship的数据
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

  /**
   *
   * @param {*} id
   * @returns 模板详情
   */
  @action
  getDetail(id) {
    return Request('/station/salemenu/batch/template/detail')
      .data({ id })
      .get()
      .then((json) => {
        runInAction(() => {
          const {
            id,
            name,
            type,
            row_title,
            relation_columns,
            relationship,
          } = json.data
          this.detail = {
            ...this.detail,
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

  /**
   *  设置表单的值
   * @param {*} key
   * @param {*} value
   */
  @action
  detailChange(key, value) {
    this.detail[key] = value
  }

  /**
   *
   * @returns 模板列表
   */
  @action
  getList() {
    this.loading = true
    return Request('/station/salemenu/batch/template/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data
          this.loading = false
        })
        return json.data
      })
  }

  /**
   *
   * @param {*} id
   * @returns 新建或编辑
   */
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
        ? '/station/salemenu/batch/template/edit'
        : '/station/salemenu/batch/template/create',
    )
      .data(params)
      .post()
  }

  /**
   *
   * @param {*}} id
   * @returns 删除模板
   */
  @action
  del(id) {
    return Request('/station/salemenu/batch/template/delete')
      .data({ id })
      .post()
  }

  /**
   *
   * @returns 校验
   */
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
    return disabled
  }

  @action
  isIncludes(originArr, targetArr) {
    return _.every(targetArr, (val) => originArr.includes(val))
  }

  @action
  validateKey(originArr, targetArr) {
    let index
    _.each(targetArr, (item, index_) => {
      if (!originArr.includes(item)) {
        index = index_
      }
    })
    return keyMap[targetArr[index]] || '-'
  }

  // 校验
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

    // 校验一下系统名称的必须项
    const TYPE_1_RELATIONSHIP_KEY = _.map(
      relationship,
      (item) => item.system_key,
    )
    const TYPE_2_RELATIONSHIP_KEY = _.map(
      relationship,
      (item) => item.system_key,
    )

    if (!this.isIncludes(TYPE_1_RELATIONSHIP_KEY, TYPE_1_LIST) && type === 1)
      return Promise.reject(
        new Error(
          i18next.t(
            `${this.validateKey(TYPE_1_RELATIONSHIP_KEY, TYPE_1_LIST)}为必选项`,
          ),
        ),
      )

    if (!this.isIncludes(TYPE_2_RELATIONSHIP_KEY, TYPE_2_LIST) && type === 2)
      return Promise.reject(new Error(i18next.t(`规格名为必选项`)))

    if (hasSameItem(_.map(relationship, (item) => item.relation_name)))
      return Promise.reject(new Error(i18next.t('对应关系不能重复')))
    return Promise.resolve()
  }
}

export default new Store()
