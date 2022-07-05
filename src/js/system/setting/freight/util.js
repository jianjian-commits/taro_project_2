import { i18next } from 'gm-i18n'
import React from 'react'
import { Dialog } from '@gmfe/react'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'
import { history } from '../../../common/service'
import store from './store'

function createLeaf(leaf) {
  return {
    value: leaf.address_id,
    name: leaf.address_name,
    freight_id: leaf.freight_id,
    freight_name: leaf.freight_name,
    _gm_select: false,
  }
}

// 处理商户数据
function addressConvertTree(list, tree = []) {
  if (list.length === 0) {
    return []
  }

  _.each(list, (item) => {
    const region_index = _.findIndex(tree, (v) => v.value === item.region_code)

    if (region_index !== -1) {
      const region = tree[region_index]
      const area_index = _.findIndex(
        region.children,
        (child) => child.value === item.area_id,
      )

      if (area_index !== -1) {
        const area = region.children[area_index]
        area.children.push(createLeaf(item))
      } else {
        region.children.push({
          value: item.area_id,
          name: item.area_name,
          children: [createLeaf(item)],
        })
      }
    } else {
      // 不存在region
      tree.push({
        value: item.region_code,
        name: item.region_name,
        children: [
          {
            value: item.area_id,
            name: item.area_name,
            children: [createLeaf(item)],
          },
        ],
      })
    }
  })
  return tree
}

function merchantLabelConvertTree(list) {
  const tree = []

  list.forEach((item) => {
    const treeIndex = tree.findIndex(
      (v) => v.value === (item.address_label_id || i18next.t('（无标签）')),
    )
    const treeItem = createLeaf(item)

    if (treeIndex !== -1) {
      tree[treeIndex].children.push(treeItem)
    } else {
      tree.push({
        value: item.address_label_id || i18next.t('（无标签）'),
        name: item.address_label_name || i18next.t('（无标签）'),
        children: [treeItem],
      })
    }
  })
  return tree
}

function saleMenuConvertTree(list) {
  const tree = []

  list.forEach((item) => {
    const treeItem = createLeaf(item)
    item.salemenu_list.forEach(({ id, name }) => {
      const treeIndex = tree.findIndex((v) => v.value === id)
      if (treeIndex !== -1) {
        tree[treeIndex].children.push(treeItem)
      } else {
        tree.push({
          value: id,
          name: name,
          children: [treeItem],
        })
      }
    })
  })
  return tree
}

function cAddressConvertTree(list, tree = []) {
  const children = _.map(list, (item) => createLeaf(item))
  tree.push({ value: 0, name: i18next.t('零售客户'), children })
  return tree
}

function renderAddressItem(leaf) {
  return (
    <span style={{ wordBreak: 'break-all' }}>
      {leaf.name}
      {leaf.freight_id && (
        <span className='gm-text-desc'>({leaf.freight_name})</span>
      )}
    </span>
  )
}

function filterGroupListModify(list, what) {
  return _.filter(list, function (d) {
    if (d.children && !what(d)) {
      d.children = filterGroupListModify(d.children, what)
    }

    if (d.children) {
      return !!d.children.length
    } else {
      return what(d)
    }
  })
}

function filterGroupList(list, what) {
  return filterGroupListModify(_.cloneDeep(list), what)
}

function searchAddress(list, query) {
  const processList = filterGroupList(
    list,
    (v) => pinYinFilter([v], query, (v) => v.name + v.freight_name).length > 0,
  )
  return processList
}

function deleteTemplate(templateData) {
  if (templateData.default) {
    Dialog.alert({
      children: i18next.t(
        '当前模板为默认模板，无法删除。请先在其他模板里设置一个默认模板，再来删除当前模板',
      ),
    }).then(() => {
      console.log('resolve')
    })
    return
  }

  Dialog.confirm({
    children: i18next.t('删除后此模板的商户将分配到默认模板，确认删除吗？'),
    title: i18next.t('KEY24', {
      VAR1: templateData.name,
    }) /* src:'删除 ' + t.name + " 模板" => tpl:删除 ${VAR1} 模板 */,
  }).then(
    () => {
      store.delFreightTemplate({ freight_id: templateData.id })
      history.push('/system/setting/freight')
    },
    () => {
      console.log('reject')
    },
  )
}

function isInteger(num) {
  const regExp = new RegExp('^[0-9]*$')
  return regExp.test(num)
}

function numberToType(value) {
  switch (value) {
    case 1:
      return {
        foundation: '',
        dimension: '',
        way: '',
      }
    case 2:
      return {
        foundation: 'Money',
        dimension: 'Interval',
        way: 'Artificial',
      }
    case 3:
      return {
        foundation: 'Money',
        dimension: 'Interval',
        way: 'Auto',
      }
    case 4:
      return {
        foundation: 'Money',
        dimension: 'Proportion',
        way: '',
      }
    case 5:
      return {
        foundation: 'Distance',
        dimension: '',
        way: '',
      }
    default:
      return {
        foundation: 'Money',
        dimension: 'Interval',
        way: 'Artificial',
      }
  }
}

function selectPostObj(obj, type) {
  switch (type) {
    case 3:
      return {
        min_total_price: obj.min_total_price,
        amount_auto_section: obj.amount_auto_section,
      }
    case 4:
      return {
        min_total_price: obj.min_total_price,
        scale_set: obj.scale_set,
      }
    default:
      return {
        min_total_price: obj.min_total_price,
        section: obj.section,
      }
  }
}
export {
  addressConvertTree,
  renderAddressItem,
  searchAddress,
  deleteTemplate,
  isInteger,
  merchantLabelConvertTree,
  saleMenuConvertTree,
  cAddressConvertTree,
  numberToType,
  selectPostObj,
}
