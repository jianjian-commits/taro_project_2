import { Request } from '@gm-common/request'
import React from 'react'
import { forEach } from 'lodash'
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
        id: id,
        name: name,
        value: id,
        level,
        icon: icon,
        station_id: station_id,
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
   * 展开到id项
   * @param id {number}
   * @param list {object[]}
   */
  expandToId = (id, list) => {
    if (list.some((item) => item.id === id)) {
      return true
    } else {
      forEach(list, (item) => {
        if (item.children) {
          item.expand = this.expandToId(id, item.children)
          if (item.expand) {
            return false
          }
        }
      })
    }
    return list.some((item) => item.expand)
  }

  /**
   * 通过当前id查找当前ID的父元素
   * @param id {string}
   * @param list {object[]}
   * @returns {object}
   */
  findParent(id, list) {
    let value
    if (list.map((item) => item.id).includes(id)) {
      return list.find((item) => item.id === id)
    } else {
      list.forEach((item) => {
        if (this.findParent(id, item.children)) {
          value = this.findParent(id, item.children)
        }
      })
    }
    return value
  }

  /**
   * 点击搜索筛选商品
   * @param selected
   * @param list
   */
  filterSpu = (selected, list) => {
    list.forEach((item) => {
      if (item.allChildren) {
        if (selected === 2) {
          item.children = item.allChildren
          item.showSort = true
        } else {
          item.children = item.allChildren.filter(
            (value) => value.type === selected
          )
          item.showSort = false
        }
      } else {
        this.filterSpu(selected, item.children)
      }
    })
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
