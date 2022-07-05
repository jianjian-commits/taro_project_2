import { observable, action, runInAction, set } from 'mobx'
import { Request } from '@gm-common/request'
import { splitId } from '../../../../marketing/manage/market_tag/utils'
import { skuListAdapter } from 'common/util'
import _ from 'lodash'

class GoodStore {
  // 批量修改选择的二级标签
  @observable label_2_selected = {
    id: 0,
    sort: '',
    name: '',
  }

  // 二级标签是否开启
  @observable enable_label_2 = 0

  // 分类信息
  @observable skuTree = []
  @observable skuTreeIndeterminate = []
  @observable skuTreeSelected = []
  @observable skuTreeActive = []
  // 已缓存的分类
  @observable preSkuTreeData = null
  // 所有勾选的分类列表数据
  @observable skuTreeList = []
  @observable skuTreeListLoading = false
  @observable skuTreeListSelect = []
  // sku  sku 列表
  @observable skus = []
  @observable skusListSelected = []

  @action
  setSkuList(list) {
    this.skus = skuListAdapter(
      _.map(list, (item) => ({
        ...item,
        id: item.sku_id || item.id,
        name: item.sku_name || item.name,
      })),
    )
  }

  @action
  addSkusListItem(index) {
    this.skus.splice(++index, 0, {}) // 增加空白行
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

  // 清除数据
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
        return this.getSkuTreeList({ category_2_id: key })
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
      .data({ search: search })
      .get()
  }

  // 二级标签选择
  @action
  setLabel2Select(data) {
    this.label_2_selected = data
  }

  @action
  initData = (data = []) => {
    // 如果没数据增加空白行
    if (data.length === 0) {
      data = [{}]
    }
    this.skus = data
    this.preSkuTreeData = {}
  }

  @action
  handleSkuItemChange = (key, value, index) => {
    set(this.skus[index], { [key]: value })
  }
}

export default new GoodStore()
