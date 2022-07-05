import { observable, action, runInAction, toJS } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const initTechnologyDetail = {
  name: '',
  custom_id: '',
  default_role: '0',
  desc: '',
  custom_cols: [],
  technic_category_id: '0',
}

const initCustomCols = {
  col_name: '',
  col_type: 0,
  params: [],
}

const initFieldParams = {
  param_name: '',
}

class Store {
  // 工艺详情
  @observable technologyDetail = { ...initTechnologyDetail }

  // 自定义字段list
  @observable customColsList = [{ ...initCustomCols }]

  // 字段参数list
  @observable fieldParamsList = [{ ...initFieldParams }]

  // 角色
  @observable roleList = []

  // 工艺类型
  @observable technicCategoryList = []

  @action.bound
  clearStore() {
    this.technologyDetail = { ...initTechnologyDetail }
    this.customColsList = [{ ...initCustomCols }]
    this.fieldParamsList = [{ ...initFieldParams }]
    this.roleList = []
  }

  /**
   * 处理detail
   * @param {string} field
   * @param {string} value
   */
  @action
  changeTechnologyDetailItem(field, value) {
    this.technologyDetail[field] = value
  }

  // 处理自定义字段
  @action
  addCustomItem() {
    this.customColsList.push({ ...initCustomCols })
  }

  /**
   * @param {number} index
   */
  @action
  deleteCustomItem(index) {
    this.customColsList.remove(this.customColsList[index])
  }

  @action
  changeCustomColsListItem(index, changeData) {
    Object.assign(this.customColsList[index], { ...changeData })
  }

  /**
   * 处理字段参数
   * @param {number} index
   */
  @action
  initParamsListData(index) {
    // 由于数据结构深，所以需要toJS来深拷贝
    const currentParamsList = toJS(this.customColsList[index].params)

    if (currentParamsList.length === 0) {
      currentParamsList.push({ ...initFieldParams })
    }

    this.fieldParamsList = currentParamsList
  }

  @action
  changeParamsListItem(index, changeData) {
    Object.assign(this.fieldParamsList[index], { ...changeData })
  }

  /**
   * @param {number} index
   */
  @action
  deleteParamsItem(index) {
    this.fieldParamsList.remove(this.fieldParamsList[index])
  }

  @action
  addParamsItem() {
    this.fieldParamsList.push({ ...initFieldParams })
  }

  @action.bound
  clearParamsListData() {
    this.fieldParamsList = [{ ...initFieldParams }]
  }

  /**
   * 将参数设置保存到对应的自定义字段中
   * @param {number} index
   */
  @action
  saveParamsListData(index) {
    this.customColsList[index].params = toJS(this.getParamsVerifyData())
  }

  // 获取待提交数据
  @action
  getPostData() {
    const postData = {}

    Object.assign(
      postData,
      { ...this.technologyDetail },
      { custom_cols: JSON.stringify(this.getCustomColVerifyData()) }
    )

    return postData
  }

  /**
   * 获取角色
   */
  @action
  fetchRoleList() {
    return Request('/gm_account/station/role/search')
      .get()
      .then((json) => {
        runInAction(() => {
          this.roleList = json.data.roles
        })

        return json
      })
  }

  /**
   * 获取工艺类型
   */
  @action
  fetchTechnicCategoryList(query = { limit: 1000 }) {
    return Request('/process/technic_category/list')
      .data(query)
      .get()
      .then((json) => {
        runInAction(() => {
          this.technicCategoryList = json.data
        })

        return json
      })
  }

  /**
   * 获取工艺详情
   * 工艺id
   * @param {string} id
   */
  @action
  fetchTechnologyDetail(id) {
    return Request('/process/technic/get')
      .data({ id })
      .get()
      .then((json) => {
        runInAction(() => {
          this.technologyDetail = json.data

          if (json.data.custom_cols.length > 0) {
            this.customColsList = _.map(json.data.custom_cols, (item) => {
              return { ...initCustomCols, ...item }
            })
          }
        })

        return json
      })
  }

  /**
   * 新建工艺
   */
  @action
  postCreateTechnology() {
    const postData = this.getPostData()

    return Request('/process/technic/create').data(postData).post()
  }

  /**
   * 删除工艺
   * 是否强制删除， 1为强制删除，不传默认不强制
   * @param {number} force
   */
  @action
  deleteTechnology(force = undefined) {
    const data = { id: this.technologyDetail.id, force }
    return Request('/process/technic/delete').code([0, 4]).data(data).post()
  }

  /**
   * 更新工艺
   * 是否强制更新， 1为强制更新，不传默认不强制
   * @param {number} force
   */
  @action
  updateTechnology(force = undefined) {
    let code = [0, 4]
    const postData = this.getPostData()

    if (force) {
      code = [0] // 修改工艺，在强制修改的时候只有code为0才属于成功
      postData.force = force
    }

    return Request('/process/technic/update').code(code).data(postData).post()
  }

  // 获取字段参数已清除空数据的数据
  @action
  getParamsVerifyData() {
    const result = []
    _.each(this.fieldParamsList, (item) => {
      if (item.param_name) {
        result.push({
          ...item,
        })
      }
    })

    return result
  }

  // 获取自定义字段已清除空数据的数据
  @action
  getCustomColVerifyData() {
    const result = []

    _.each(this.customColsList, (item) => {
      // 当字段名称不为空时该数据才有效
      if (item.col_name.trim()) {
        result.push({
          ...item,
          params: item.col_type === 0 ? item.params : [], // 0为单选，1为文本，文本时params为[]
        })
      }
    })

    return result
  }
}

export default new Store()
