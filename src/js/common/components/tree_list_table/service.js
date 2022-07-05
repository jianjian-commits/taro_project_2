import { Request } from '@gm-common/request'
import React from 'react'
import { t } from 'gm-i18n'

class Service {
  /**
   * 获取图标
   * @returns {Promise<*>}
   */
  getIcons() {
    return Request('/merchandise/category1/icon').get()
  }

  /**
   * 获取一级分类
   * @returns {Promise<*>}
   */
  getCategory1() {
    return Request('/merchandise/category1/get').get()
  }

  /**
   * 获取二级分类
   * @returns {Promise<*>}
   */
  getCategory2() {
    return Request('/merchandise/category2/get').get()
  }

  /**
   * 获取分类
   * @returns {Promise<*>}
   */
  getPinLei() {
    return Request('/merchandise/pinlei/get').get()
  }

  resetTreeList(list) {
    list.forEach((item) => {
      item.checked = false
      item.expand = false
      this.resetTreeList(item.children)
    })
  }

  /**
   * 构建成一棵树
   * @param list1
   * @param list2
   * @returns {object[]}
   */
  rebuildTree(list1, list2) {
    list1.forEach((x) => {
      list2.forEach((y) => {
        if (y.parent === x.id) {
          x.children.push(y)
        }
      })
    })
    return list1
  }

  rebuildTreeNode(list, level, icons) {
    return list.map((item) => {
      const { id, name, icon, upstream_id, station_id } = item
      const option = {
        id,
        name,
        value: id,
        level,
        icon,
        station_id,
        children: [],
      }
      option.title =
        level === 0 ? (
          <span>
            <img
              src={icons.find((icon) => icon.id === item.icon).url}
              alt={item.id}
              style={{ width: '40px', height: '40px' }}
              className='gm-margin-right-10'
            />
            {name}
          </span>
        ) : (
          name
        )
      if (upstream_id) {
        option.parent = upstream_id
      }
      return option
    })
  }

  /**
   * 查找分类名称对应的树节点
   * @param name {string}
   * @param list {object[]}
   * @returns {boolean}
   */
  findTreeNode(name, list) {
    let flag = false
    let node = null
    if (list.some((item) => item.name === name)) {
      const beFound = list.find((item) => item.name === name)
      beFound.highlight = true
      flag = true
      if (!node) {
        node = beFound
      }
    } else {
      list.forEach((item) => {
        item.expand = this.findTreeNode(name, item.children)
        flag = flag || item.expand
      })
    }
    return { flag, node }
  }

  /**
   * 通过id获取id对应的object
   * @param source {string[]}
   * @param list {object[]}
   * @param target {object[]}
   */
  getObjectById = (source, list, target) => {
    list.forEach((item) => {
      if (source.includes(item.id)) {
        target.push(item)
      } else {
        if (item.children) {
          this.getObjectById(source, item.children, target)
        }
      }
    })
  }
}

export const service = new Service()

export const selectedList = [
  { text: t('全部商品库'), value: 2 },
  { text: t('通用商品库'), value: 0 },
  { text: t('本站商品库'), value: 1 },
]
