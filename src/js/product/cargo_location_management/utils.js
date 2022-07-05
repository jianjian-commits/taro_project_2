import _ from 'lodash'
import { store } from './store'
import { RightSideModal, Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'

/**
 * 重构菜单
 * @param current
 * @param next
 */
export function recursiveProgram(current, next) {
  _.isArray(current.shelf) &&
    _.forEach(current.shelf, (item) => {
      _.isArray(next.shelf) &&
        _.forEach(next.shelf, (value) => {
          if (item.parent_id === value.shelf_id) {
            if (value.children) {
              value.children.push(item)
            } else {
              value.children = [item]
            }
          }
        })
    })
}

/**
 * 添加children属性
 * @param list
 */
export function addChildren(list) {
  _.forEach(list, (item) => {
    if (item.children) {
      addChildren(item.children)
    } else {
      item.children = []
    }
  })
}

/**
 * 显示菜单右侧按钮
 * @param value
 * @param flag
 */
export function handleToggleIcon(value, flag) {
  value.showIcon = flag
  store.setCargoLocationMenu(store.cargoLocationMenu)
}

/**
 * 打开菜单项的子菜单
 * @param value
 * @param event
 */
export function openChildren(value, event) {
  event.stopPropagation()
  recursiveCloseItem(value.children)
  value.expand = !value.expand
  store.setCargoLocationMenu(store.cargoLocationMenu)
}

/**
 * 关闭当前菜单项的所有子菜单
 * @param list
 */
export function recursiveCloseItem(list) {
  _.forEach(list, (item) => {
    item.expand = false
    if (item.children && item.children.length) {
      recursiveCloseItem(item.children)
    }
  })
}

/**
 * 点击货位查询
 * @param value
 */
export function searchByCargoLocation(value) {
  if (value.edit) {
    return
  }
  const { shelf_id } = value
  store.setSearchItem(value)
  store.resetCargoLocationSearchOption()
  store.setCargoLocationSearchOption('shelf_id', shelf_id)
  recursiveClearSelected(store.cargoLocationMenu)
  value.selected = true
  store.setCargoLocationMenu(store.cargoLocationMenu) // 必须加上这句话来改变货位层级视图
  store.setIsMoving(false)
  store.setSpuList([]) // 清空当前商品列表
  store.setNegativeList([]) // 清空当前负库存商品列表
  store.getSummary({ shelf_id })
  store.getSpuList(true)
  store.getNegativeList(true)
}

/**
 * 清空选择
 * @param list
 */
export function recursiveClearSelected(list) {
  _.forEach(list, (item) => {
    if (_.isArrayLike(item.children) && item.children.length) {
      recursiveClearSelected(item.children)
    }
    item.selected = false
  })
}

/**
 * 生成rightModal
 * @param title
 * @param component
 * @param width
 */
export function createRightModal(title, component, width = '900px') {
  RightSideModal.render({
    title,
    onHide: RightSideModal.hide,
    children: component,
    size: 'lg',
    style: { width },
  })
}

/**
 * 重新构建数组格式
 * @param list
 * @returns {Array}
 */
export function rebuildArray(list) {
  return _.map(list, (item) => ({
    ...item,
    value: item.shelf_id,
    text: item.name,
    children:
      _.isArrayLike(item.children) && item.children.length
        ? rebuildArray(item.children)
        : null,
  }))
}

/**
 * 按商品搜索
 * @param value
 */
export function searchByProduct({ value }) {
  const { productMenu } = store
  _.forEach(productMenu, (item) => {
    item.selected = item.value === value
  })
  store.setProductMenu(store.productMenu)
  store.resetProductSearchOption()
  store.setProductSearchOption('spu_id', value)
  store.getSummary({ spu_id: value })
  store.setCargoLocationList([]) // 清空当前货位列表
  store.getCargoLocationList(true)
}

let lastScrollTop = 0 // 上一次滚动条距离顶部距离，用于判断往上滚还是往下滚
let loading = false
/**
 * 滚动加载公用方法
 * @param container
 * @param event
 * @param more
 */
export async function scrollToLoad(container, event, more) {
  if (loading) {
    return
  }
  if (!more) {
    // 没有数据就不再执行滚动加载
    return
  }
  const { scrollTop, scrollHeight, offsetHeight } = container
  if (scrollTop > lastScrollTop) {
    if (scrollTop + offsetHeight >= scrollHeight - 500) {
      loading = true
      // 距离底部500px的时候执行事件
      await event()
      loading = false
    }
  }
  lastScrollTop = scrollTop
}

/**
 * 添加货位后，根据返回的id找到货位
 * @param id
 * @param list
 */
export function findCargoLocationById(id, list) {
  let flag = false
  if (_.some(list, (item) => item.shelf_id === id)) {
    _.find(list, (item) => item.shelf_id === id).showIcon = true
    return true
  } else {
    _.forEach(list, (item) => {
      if (item.children && item.children.length) {
        item.expand = findCargoLocationById(id, item.children)
        flag = flag || item.expand
        // eslint-disable-next-line gmfe/no-implict-lodash-each-return
        return !item.expand
      }
    })
  }
  return flag
}

/**
 * 获取商品信息表格数据
 * @param data
 * @returns {*}
 */
export function getProductDetailsData(data) {
  return Request('/stock/check/batch_number/list').data(data).get()
}

/**
 * 将树状menu平铺
 * @param menu
 * @param result
 */
export function rollOutMenu(menu, result) {
  _.forEach(menu, (item) => {
    result.push(item)
    if (item.children) {
      rollOutMenu(item.children, result)
    }
  })
}

/**
 * 拼装级联货位
 * @param menu
 * @param value
 * @param result
 * @returns {*|number|[]|null[]}
 */
export function findParent(menu, value, result = [value]) {
  _.forEach(menu, (item) => {
    if (item.shelf_id === value.parent_id) {
      result.unshift(item)
      findParent(menu, item, result)
    }
  })
  return _.map(result, (item) => item.shelf_id)
}

/**
 * 根据id返回货位
 * @param id {number}
 * @param cargo {object[]}
 */
export function returnCargoByID(id, cargo) {
  let result
  if (_.some(cargo, (item) => item.shelf_id === id)) {
    return _.find(cargo, (item) => item.shelf_id === id)
  }
  _.forEach(cargo, (item) => {
    if (item.children && item.children.length) {
      result = returnCargoByID(id, item.children)
    }
  })
  return result
}

/**
 * 查找已添加待移库列表的商品
 * @param spuList
 */
export function setSpuListToMoveNum(spuList) {
  const {
    toMoveList,
    searchItem: { shelf_id },
  } = store
  _.forEach(spuList, (spu) => {
    _.forEach(toMoveList, (item) => {
      if (item.spu_id === spu.spu_id && shelf_id === item.shelf_id) {
        if (!spu.toMoveNum) {
          spu.toMoveNum = 0
        }
        spu.toMoveNum++
      }
    })
  })
}

/**
 * 放弃移库清空待移库数组
 * @param value
 */
export function resetSpuListToMoveNum(value) {
  const { spuList } = store
  _.forEach(spuList, (spu) => {
    if (value.spu_id === spu.spu_id) {
      spu.toMoveNum--
    }
  })
}

/**
 * 公用模态框盘点确认功能
 * @param value
 * @param that
 */
export function commonModalHandleOk(value, that) {
  const { batch_number, new_remain, remark } = value
  if (new_remain === null || new_remain === undefined) {
    Tip.warning(t('请输入实盘数'))
    return
  }
  that.setState(({ data }) => data)
  Request('/stock/check/batch_edit')
    .data({ batch_number, new_remain, remark })
    .post()
    .then(() => {
      Tip.success(t('保存成功'))
      value.edit = false
      that.pagination.doFirstRequest()
    })
}

/**
 * 查找相同货位，并合并
 * @param current
 * @param target
 */
export function mergeSameItem(current, target) {
  _.forEach(target, (item) => {
    if (_.some(current, (value) => value.root === item.root)) {
      const value = _.find(current, (value) => value.root === item.root)
      value.shelf_list = [...value.shelf_list.slice(), ...item.shelf_list]
    } else {
      current.push(item)
    }
  })
}

/**
 * 移库确认级联选择
 * @param list object[]
 * @returns {boolean}
 */
export function handleOkCheckCascade(list) {
  return _.some(list, (item) => {
    if (item.shelf_id === item.in_shelf_id[item.in_shelf_id.length - 1]) {
      return true
    }
    return item.in_shelf_id[item.in_shelf_id.length - 1] < 0 && !item.shelf_id
  })
}

/**
 * 删除当前货位后，遍历移库列表清空in_shelf_id
 * @param id
 * @param list
 */
export function findCargoLocationAfterDelete(id, list) {
  let flag = false
  if (_.some(list, (item) => item.shelf_id === id)) {
    return true
  } else {
    _.forEach(list, (item) => {
      if (item.children && item.children.length) {
        flag = findCargoLocationAfterDelete(id, item.children)
      }
    })
  }
  return flag
}
