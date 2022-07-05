import { i18next } from 'gm-i18n'
import { observable, action, runInAction, toJS } from 'mobx'
import { Request } from '@gm-common/request'
import {
  initialLabelList,
  changeNameByLabel2,
  initialSkuList,
  splitId,
  dealwithSkus,
} from '../utils'
import { skuListAdapter } from 'common/util'
import { System } from '../../../../common/service'
import _ from 'lodash'
import Big from 'big.js'

class TagDetailStore {
  // cms_key
  @observable cms_key = ''
  // 活动名称
  @observable name = ''
  // 活动状态
  @observable active = 1
  // 展示类型
  @observable show_method = 1
  // 活动类型
  @observable type = 1
  // 位置排序
  @observable sort = ''
  // 一级标签名称
  @observable label_1_name = ''

  // 批量修改选择的二级标签
  @observable label_2_selected = {
    id: 0,
    sort: '',
    name: '',
  }

  // 二级标签是否开启
  @observable enable_label_2 = 0

  // 二级标签设置列表
  @observable label_2_backup = initialLabelList
  @observable label_2 = initialLabelList

  // 活动图片
  @observable pic = {}
  @observable iconsList = []

  // 分类信息
  @observable skuTree = []
  @observable skuTreeIndeterminate = []
  @observable skuTreeSelected = []
  @observable skuTreeActive = []
  // 已缓存的分类
  @observable preSkuTreeData = {}
  // 所有勾选的分类列表数据
  @observable skuTreeList = []
  @observable skuTreeListLoading = false
  @observable skuTreeListSelect = []
  // skuList 获取列表
  @observable skuListLoading = true
  @observable skuList = []
  // sku  sku 列表
  @observable skus = []
  @observable skusListSelected = []

  @observable restPurSkus = [] // 限购skus 列表
  @observable searchData = [] // 搜索出来的skus
  @observable errorSkus = [] // 限购保存失败的sku列表

  currentSearchText = '' // 营销活动下，限购类型。记录当前最新的商品搜索text

  // action
  @action
  setInputDetail(name, value) {
    this[name] = value
    if (this.show_method === 0) {
      this.enable_label_2 = 0
    }
  }

  // 二级标签设置
  @action
  setSecondTagInputChange(index, name, value) {
    const list = toJS(this.label_2_backup)
    list[index][name] = value
    this.label_2_backup = list
  }

  @action
  addItemToSecondTagList(item) {
    this.label_2_backup = [...this.label_2_backup, item]
  }

  @action
  deleteItemInSecondTagList(index) {
    const list = toJS(this.label_2_backup)
    list.splice(index, 1)
    this.label_2_backup = list
  }

  @action
  clearItemInSecondTagList() {
    this.label_2_backup = [
      {
        id: Math.random().toString().substring(3),
        name: '',
        sort: '',
      },
    ]
  }

  @action
  syncForSecondTag(isSave = true) {
    const labelList = _.map(toJS(this.label_2), (item) => {
      if (item.sort === '') {
        delete item.sort
      }
      item.name = item.name && item.name.trim()
      return item
    })
    const labelListBackup = _.map(toJS(this.label_2_backup), (item) => {
      if (item.sort === '') {
        delete item.sort
      }
      item.name = item.name && item.name.trim()
      return item
    })
    let filterFlag = false

    // 校验二级标签
    if (
      labelListBackup.length > 1 &&
      !labelListBackup[labelListBackup.length - 1].name
    ) {
      labelListBackup.pop()
    }

    const labelNameList = _.map(labelListBackup, (item) => item.name)
    filterFlag =
      !labelNameList[0].name ||
      _.union(_.compact(labelNameList)).length === labelNameList.length

    return new Promise((resolve, reject) => {
      runInAction(() => {
        if (isSave) {
          if (filterFlag) {
            this.label_2 = labelListBackup
            this.label_2_backup = labelListBackup

            if (this.type === 2)
              this.restPurSkus = changeNameByLabel2(
                toJS(this.restPurSkus),
                labelListBackup,
              )
            else
              this.skus = changeNameByLabel2(toJS(this.skus), labelListBackup)

            resolve(labelListBackup)
          } else {
            reject(i18next.t('二级标签名字不能有重名'))
          }
        } else {
          this.label_2_backup = labelList
        }
      })
    })
  }

  // 删除某个二级标签关联的所有skus
  @action
  deleteSkuByLabel2(label_2_list = []) {
    if (!Array.isArray(label_2_list)) {
      label_2_list = [label_2_list]
    }
    const list = _.filter(
      this.type === 2 ? this.restPurSkus : this.skus,
      (v) => {
        if (v.label_2_id) {
          return _.find(label_2_list, (item) => item.id === v.label_2_id)
        } else {
          return true
        }
      },
    )

    if (this.type === 2) this.restPurSkus = list
    else this.skus = list
  }

  // 判断二级标签是否为空
  isEmptyLabel2() {
    const list = toJS(this.label_2)
    return _.filter(list, (item) => item.name).length === 0
  }

  // 若开启二级标签，skulist是否选择了二级标签
  isEmptySkuLabel2() {
    const skuList = this.type === 2 ? toJS(this.restPurSkus) : toJS(this.skus)
    let isEmpty = false
    _.forEach(skuList, (item) => {
      if (!item.label_2_name) {
        isEmpty = true
        return true
      }
    })
    return isEmpty
  }

  // 活动图片
  @action
  setPic(file) {
    return Request('/image/upload')
      .data({
        image_file: file,
        is_retail_interface: System.isC() ? 1 : null,
      })
      .post()
      .then((json) => {
        return json.data && json.data.image_url
      })
  }

  @action
  changePic(url) {
    this.pic = Object.assign({}, this.pic, { url })
  }

  // 选择商品
  @action
  setSkuListLoading(bool) {
    this.skuListLoading = bool
  }

  @action
  getSkuList() {
    this.skuListLoading = true

    Request('/station/promotion/sku/list')
      .get()
      .then((json) => {
        const list = json.data
        runInAction(() => {
          this.skuListLoading = false
          this.skuList = skuListAdapter(list)
        })
      })
  }

  @action
  getIconsList() {
    Request('/merchandise/category1/icon')
      .get()
      .then((json) => {
        runInAction(() => {
          this.iconsList = json.data
        })
      })
  }

  @action
  setSkuList(list) {
    const data = skuListAdapter(
      _.map(list, (item) => ({
        ...item,
        id: item.sku_id || item.id,
        name: item.sku_name || item.name,
      })),
    )
    this.skus = data
  }

  @action
  clearDetail() {
    // 活动名称
    this.name = ''
    // 活动状态
    this.active = 1
    // 展示类型
    this.show_method = 1
    this.type = 1
    // 位置排序
    this.sort = ''
    // 一级标签名称
    this.label_1_name = ''
    // 二级标签是否开启
    this.enable_label_2 = 0

    // 二级标签设置列表
    this.label_2_backup = initialLabelList
    this.label_2 = initialLabelList

    // 活动图片
    this.pic = {}

    // skuList 获取列表
    this.skuListLoading = true
    this.skuList = []
    // sku  列表
    this.skus = []
    this.restPurSkus = []
    this.cms_key = ''
    // 商品缓存
    this.preSkuTreeData = {}
  }

  getDetail() {
    let detail = {}
    const pic = toJS(this.pic)
    const label_2_list = _.map(toJS(this.label_2), (item) => {
      item.name = item.name && item.name.trim()
      return item
    })

    const label2Json = JSON.stringify(label_2_list)

    if (this.show_method) {
      detail = {
        name: this.name.trim(),
        active: ~~this.active,
        show_method: ~~this.show_method,
        sort: this.sort,
        enable_label_2: ~~this.enable_label_2,
        label_1_name: this.label_1_name.trim(),
        label_2: label2Json,
        pic_url: pic.url,
        type: this.type,
        skus: this.type === 1 ? toJS(this.skus) : toJS(this.restPurSkus),
      }
    } else {
      detail = {
        name: this.name.trim(),
        show_method: 0,
        active: ~~this.active,
        enable_label_2: 0,
        type: this.type,
        skus: this.type === 1 ? toJS(this.skus) : toJS(this.restPurSkus),
      }
    }

    if (!this.enable_label_2) {
      delete detail.label_2
    }
    return detail
  }

  @action
  getDetailById(id) {
    return Request('/station/promotion/get')
      .data({ id, is_retail_interface: System.isC() ? 1 : null })
      .get()
      .then((json) => {
        const data = json.data
        let labelList = data.label_2
        if (labelList && labelList.length === 0) {
          labelList = initialLabelList
        }
        runInAction(() => {
          this.name = data.name
          this.show_method = data.show_method
          this.active = data.active
          this.label_1_name = data.label_1_name
          this.pic_url = data.pic_url
          this.pic = {
            url: data.pic_url,
          }
          this.label_2 = labelList
          this.label_2_backup = labelList
          this.skus = data.skus
          this.restPurSkus =
            data.type === 2
              ? _.map(initialSkuList(data.skus), (sku) => {
                  return {
                    ...sku,
                    price: Big(sku.price).div(100).toFixed(2),
                  }
                })
              : []
          this.type = data.type

          this.sort = data.sort
          this.enable_label_2 = data.enable_label_2
          this.cms_key = data.cms_key
        })
      })
  }

  // 新建保存
  @action
  detailCreatePost(data) {
    const skusFilter = dealwithSkus(data, this.type)
    data = Object.assign({}, data, {
      skus: JSON.stringify(skusFilter),
      is_retail_interface: System.isC() ? 1 : null,
    })

    return Request('/station/promotion/async_create')
      .data(data)
      .code([0, 1])
      .post()
      .then((json) => {
        if (this.type === 2 && json.code === 1) {
          this.errorSkus = json.data
        }
        return json
      })
  }

  // update
  @action
  detailUpdatePost(data) {
    const skusFilter = dealwithSkus(data, this.type)

    data = Object.assign({}, data, {
      skus: JSON.stringify(skusFilter),
      is_retail_interface: System.isC() ? 1 : null,
    })
    return Request('/station/promotion/update')
      .data(data)
      .code([0, 1])
      .post()
      .then((json) => {
        if (this.type === 2 && json.code === 1) {
          this.errorSkus = json.data
        }
        return json
      })
  }

  @action
  deleteItem(id) {
    return Request('/station/promotion/delete')
      .data({ id, is_retail_interface: System.isC() ? 1 : null })
      .post()
  }

  @action
  changeDetailSkusValue(index, name, val) {
    const list = [...this.restPurSkus.slice()]
    list[index][name] = val

    this.restPurSkus = list
  }

  @action
  deleteRestPurSkus(id) {
    this.restPurSkus = _.filter(this.restPurSkus, (v) => v.id !== id)
  }

  setCurrentSearch(val) {
    this.currentSearchText = val
  }

  @action
  searchRestPurSkus(val) {
    if (!val) return

    const req = {
      search_text: val,
      limit: 100, // 最大返回数
    }

    Request('/station/skus')
      .data(req)
      .get()
      .then((json) => {
        if (req.search_text === this.currentSearchText) {
          this.searchData = initialSkuList(json.data)
        }
      })
  }

  @action
  addRestPurSkus(data) {
    let skus = []
    const sku = _.find(this.restPurSkus, (s) => s.id === data.id)
    if (sku) {
      return
    } else {
      data.price = ''
      data.limit_number = ''
      skus = [data, ...this.restPurSkus]
    }
    this.restPurSkus = skus
  }

  @action
  removeErrorSkus() {
    this.restPurSkus = _.filter(this.restPurSkus, (v) => {
      return !_.find(this.errorSkus, (d) => {
        return v.id === d.sku_id
      })
    })
  }

  @action
  changeRestPurSkusLabel2(item, value, result) {
    let list = this.restPurSkus

    list = _.map(list, (val) => {
      if (val.id === item.id) {
        val.label_2_id = value
        val.label_2_name = result.name
      }
      return val
    })
    this.restPurSkus = list
  }

  @action
  addSkusListItem(index) {
    this.skus = _.concat(
      _.slice(this.skus.slice(), 0, index + 1),
      {},
      _.slice(this.skus.slice(), index + 1, this.skus.length),
    )
  }

  @action
  setSkusListItem(index, data) {
    const skus = this.skus.slice()
    skus[index] = data || {}
    this.skus = skuListAdapter(skus)
  }

  @action
  deleteSkusListItem(index) {
    this.skus.remove(this.skus[index])
  }

  @action
  changeSkusListSelected(data) {
    this.skusListSelected = data
  }

  @action
  changeSkusListSelectedAll(flag) {
    this.skusListSelected = flag
      ? _.map(this.skus.slice(), (item) => item.id)
      : []
  }

  // 获取分类树数据
  @action
  getTreeData() {
    return Request('/station/promotion/category/tree')
      .data()
      .get()
      .then((json) => {
        return _.map(json.data, ({ id, name, children }) => ({
          value: id,
          text: name,
          children: _.map(children, ({ id, name }) => ({
            value: id,
            text: name,
          })),
        }))
      })
  }

  @action
  setTreeData(data) {
    this.skuTree = data
  }

  // 清除选择树数据
  @action
  clearSkuTreeData() {
    this.skuTreeSelected = []
    this.skuTreeListSelect = []
    _.forEach(this.preSkuTreeData, (item) => {
      this.preSkuTreeData[item.key].selected = []
    })
    this.skuTreeList = []
  }

  // 设置添加商品的商品列表
  @action
  setSkuTreeList(data = []) {
    this.skuTreeList = data
  }

  // 获取勾选的分类数据, 并存储下来
  @action
  getSkuTreeList(req) {
    return Request('/station/promotion/category/sku/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          // 初始化 Tree 数据
          this.preSkuTreeData[req.category_2_id] = {
            list: json.data,
            selected: [],
          }
        })
        return json.data
      })
  }

  // 获取 Active 的数据进行处理
  @action
  getActiveTreeData(data) {
    this.skuTreeActive = data
    this.loadSkuTreeData(data).then((json) => {
      const list = _.flatten(_.map(json, (i) => i.list))
      const select_id = _.flatten(_.map(json, (i) => i.selected))

      // 设置显示数据
      this.setSkuTreeList(list)
      // 设置右侧已勾选的数据
      this.setSkuTreeListSelect(select_id)
    })
  }

  @action
  setTreeSelected(data) {
    // 获取添加，删除的分类 ID
    const add_select = _.difference(data, this.skuTreeSelected.slice())
    const remove_select = _.difference(this.skuTreeSelected.slice(), data)

    // 更新勾选
    this.skuTreeSelected = data
    // 加载勾选的分类数据
    this.loadSkuTreeData(data).then((json) => {
      // 获取勾选的数据
      const list = _.flatten(_.map(json, (i) => i.list))
      // 获取勾选的数据 ID,默认勾选全选该分类
      let select_id = _.map(list, (i) => i.sku_id)
      // 过滤已添加的商品
      const skus_id_list = _.map(this.skus.slice(), (i) => i.id)
      select_id = _.difference(select_id, skus_id_list)
      if (!this.skuTreeActive || !this.skuTreeActive.length) {
        // 没有 active，默认显示勾选的数据
        this.setSkuTreeList(list)
        this.setSkuTreeListSelect(select_id)
        // 无可选数据的时候，更新分类选择的状态
        const check_tree_id = _.concat(
          this.skuTreeSelected.slice(),
          remove_select,
        )
        this.changePreSkuTreeDataSelected(check_tree_id, select_id)
      } else {
        // 删除，直接覆盖
        _.forEach(remove_select, (key) => {
          this.preSkuTreeData[key].selected = []
        })
        // 添加，剔除已添加商品
        _.forEach(add_select, (key) => {
          let id_list = _.map(this.preSkuTreeData[key].list, (i) => i.sku_id)
          const skus_id_list = _.map(this.skus.slice(), (i) => i.id)
          id_list = _.difference(id_list, skus_id_list)
          this.preSkuTreeData[key].selected = id_list
          this.checkSkuTreeSelectStatus(this.preSkuTreeData[key], id_list)
        })
        // 获取对应点击分类的数据
        this.getActiveTreeData(this.skuTreeActive.slice())
      }
    })
  }

  @action
  changePreSkuTreeDataSelected(data, select) {
    this.loadSkuTreeData(data).then((json) => {
      _.forEach(json, (item) => {
        const select_id = _.reduce(
          item.list,
          (res, i) => {
            if (_.includes(select, i.sku_id)) {
              return _.concat(res, i.sku_id)
            } else {
              return res
            }
          },
          [],
        )

        // 更新缓存中的selected
        this.preSkuTreeData[item.key].selected = select_id
        this.checkSkuTreeSelectStatus(item, select_id)
      })
    })
  }

  @action
  checkSkuTreeSelectStatus(tree_data, select_id) {
    // 判断勾选状态
    if (select_id.length !== 0 && tree_data.list.length !== select_id.length) {
      this.skuTreeIndeterminate = _.concat(this.skuTreeIndeterminate.slice(), [
        tree_data.key,
      ])
      this.skuTreeSelected = _.difference(this.skuTreeSelected.slice(), [
        tree_data.key,
      ])
    } else if (
      tree_data.list.length !== 0 &&
      tree_data.list.length === select_id.length
    ) {
      // 删除半勾选
      this.skuTreeIndeterminate = _.difference(
        this.skuTreeIndeterminate.slice(),
        [tree_data.key],
      )
      // 添加勾选
      this.skuTreeSelected = _.concat(this.skuTreeSelected.slice(), [
        tree_data.key,
      ])
    } else {
      // 删除半勾和勾选
      this.skuTreeIndeterminate = _.difference(
        this.skuTreeIndeterminate.slice(),
        [tree_data.key],
      )
      this.skuTreeSelected = _.difference(this.skuTreeSelected.slice(), [
        tree_data.key,
      ])
    }
  }

  @action
  loadSkuTreeData(data) {
    return new Promise((resolve) => {
      // 获取已有数据
      const pre_id = splitId(data, this.preSkuTreeData)
      // 获取需要请求的数据id集
      const req_id = _.difference(data, pre_id)
      const promise_list = _.map(req_id, async (key) => {
        return this.getSkuTreeList({
          category_2_id: key,
          is_retail_interface: System.isC() ? 1 : null,
        })
      })
      if (promise_list.length > 0) {
        this.skuTreeListLoading = true
        Promise.all(promise_list).then(() => {
          this.skuTreeListLoading = false
          resolve(this.getUseData(data))
        })
      } else {
        resolve(this.getUseData(data))
      }
    })
  }

  // 获取可用数据
  @action
  getUseData(data) {
    // 根据分类 id,获取对应的数据
    return _.reduce(
      this.preSkuTreeData,
      (res, item, key) => {
        if (_.includes(data, key)) {
          this.preSkuTreeData[key].key = key
          return _.concat(res, item)
        } else {
          return res
        }
      },
      [],
    )
  }

  @action
  setPreSkuTreeData(key, name, value) {
    const new_obj = this.preSkuTreeData
    new_obj[key][name] = value
    this.preSkuTreeData = new_obj
  }

  // 设置添加商品的选择商品
  @action
  setSkuTreeListSelect(data) {
    this.skuTreeListSelect = data
  }

  // 获取搜索商品
  @action
  getSearchSku(search) {
    return Request('/station/promotion/category/sku/list')
      .data({ search: search, is_retail_interface: System.isC() ? 1 : null })
      .get()
  }

  // 二级标签选择
  @action
  setLabel2Select(data) {
    this.label_2_selected = data
  }
}

export default new TagDetailStore()
