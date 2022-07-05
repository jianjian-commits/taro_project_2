import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import { mergeRemoveRepeatArray, autoWarning } from '../util'
import { Tip } from '@gmfe/react'

export default class Store {
  @observable salemenus = [] // 添加的报价单
  @observable newCombineGoodsInfo = [] // 处理后的组合商品信息
  @observable expandedList = [] // [[], [], ...] 默认展开的数据

  @action.bound
  clear() {
    this.salemenus = []
    this.expandedList = []
    this.newCombineGoodsInfo = []
  }

  @action.bound
  async initStore(query) {
    const data = await Request('/combine_goods/batch_search')
      .data(query)
      .get()
      .then((json) => json.data)

    this.newCombineGoodsInfo = _.map(data, (item) => {
      const { salemenus, spus, skus } = item

      this.existSalemenus = _.map(salemenus, (salemenu_name, salemenu_id) => {
        return {
          value: salemenu_id,
          text: salemenu_name,
          isExit: true, // 是否为已存在报价单
        }
      })
      const combineSpus = []
      const normalSpus = _.map(spus, (spu, spu_id) => {
        if (spu.combine_spus) {
          // 嵌套的二级组合商品
          const combine_spus = _.map(spu.combine_spus, (o) => {
            o.origin_id = spu_id
            o.origin = spu.name
            o.combineQuantity = spu.quantity
            return o
          })
          combineSpus.push(combine_spus)
        }

        return {
          spu_id,
          spu_name: spu.name,
          std_unit_name: spu.std_unit_name,
          category_title_2: spu.category_title_2,
          quantity: spu.quantity,
          origin_id: spu.combine_spus ? spu_id : '', // spu为组合商品时 用origin_id来过滤spu
          origin: '普通商品',
        }
      })

      // 嵌套组合商品里的spu 扁平化处理
      const newSpus = _.flatMap(combineSpus, (combine) => {
        return _.map(combine, (spu) => ({
          spu_id: spu.id,
          spu_name: spu.name,
          std_unit_name: spu.std_unit_name,
          category_title_2: spu.category_title_2,
          quantity: spu.quantity,
          origin_id: spu.origin_id,
          origin: spu.origin,
          combineQuantity: spu.combineQuantity, // 所属组合商品的数量
        }))
      }).concat(_.filter(normalSpus, (o) => !o.origin_id)) // 过滤掉组合商品的spu

      const newSkus = _.map(skus, (sku) => {
        const _spu = _.find(
          newSpus,
          (spu) => spu.spu_id === sku.spu_id && spu.origin_id === sku.origin_id
        )
        return {
          ...sku,
          ..._spu,
          // sku来源于组合商品 数量=组合商品数量 * sku在组合商品中的配比数量
          quantity: sku.origin_id
            ? Big(_spu.combineQuantity).times(_spu.quantity)
            : _spu.quantity,
          salemenu_name: salemenus[sku.salemenu_id],
          sku_id: sku.id,
          noModify: true, // 已存在报价单不允许修改sku
        }
      })

      return {
        ...item,
        salemenus: this.existSalemenus,
        skus: newSkus,
        spus: newSpus,
      }
    })
    // 设置默认展开的默认值
    this.expandedList = this.newCombineGoodsInfo.map((o) => {
      return o.salemenus.map((salemenu) => salemenu.value)
    })
  }

  @computed get combineSaleMenusSkuTable() {
    return this.newCombineGoodsInfo.map((data) => {
      // 遍历所有报价单(包含已存在的)
      const allSalemenus = mergeRemoveRepeatArray(
        this.salemenus,
        data.salemenus
      )

      return allSalemenus.map((menu) => {
        const salemenu_id = menu.value
        const skuList = []
        let reference_price = 0

        data.spus.forEach((spu) => {
          const sku = _.find(data.skus, (o) => {
            return (
              o.salemenu_id === salemenu_id &&
              spu.spu_id === o.spu_id &&
              o.origin_id === spu.origin_id
            )
          })

          skuList.push(
            sku || {
              spu_name: spu.spu_name,
              origin: spu.origin || '普通商品',
              origin_id: spu.origin_id,
              spu_id: spu.spu_id,
              salemenu_id,
            }
          )

          // 计算参考价, 只要有一个sku为空,那么就不需计算参考价,显示为'-'
          if (
            !sku ||
            !sku.quantity ||
            !sku.sale_ratio ||
            reference_price === '-'
          ) {
            reference_price = '-'
          } else {
            reference_price = Big(sku.quantity) // quantity为spu设置的数量
              .div(sku.sale_ratio)
              .times(sku.sale_price)
              .plus(reference_price)
          }
        })

        return {
          id: data.id,
          name: data.name,
          salemenu_id,
          salemenu_name: menu.text,
          isExit: menu.isExit, // 是否为之前存在的报价单
          reference_price:
            reference_price === '-'
              ? reference_price
              : reference_price.toFixed(2),
          skuList,
        }
      })
    })
  }

  @action.bound
  updateExpanded() {
    // 报价单改变 expanded跟着变
    this.expandedList = this.newCombineGoodsInfo.map((item) => {
      // 获取所有报价单
      return mergeRemoveRepeatArray(this.salemenus, item.salemenus).map(
        (menu) => menu.value
      )
    })
  }

  @action.bound
  setSalemenus(list) {
    this.salemenus = list
    this.updateExpanded()
  }

  @action.bound
  setExpanded(expanded, index) {
    this.expandedList[index] = expanded
  }

  @action.bound
  setSkus(combine_good_id, salemenu_id, spu_id, origin_id, new_sku) {
    this.newCombineGoodsInfo.forEach((item) => {
      if (item.id === combine_good_id) {
        const index = _.findIndex(
          item.skus,
          (o) =>
            o.salemenu_id === salemenu_id &&
            o.spu_id === spu_id &&
            o.origin_id === origin_id
        )
        const spu = _.find(
          item.spus,
          (o) => o.spu_id === spu_id && o.origin_id === origin_id
        )

        const _sku = {
          salemenu_id,
          ...spu,
          ...new_sku,
        }

        if (index !== -1) {
          item.skus.splice(index, 1, _sku) // 修改sku
        } else {
          item.skus.push(_sku)
        }
      }
    })
  }

  @action.bound
  submit() {
    const isSkuValid = this.combineSaleMenusSkuTable.every((item) => {
      return item.every((o) => o.skuList.every((s) => s.sku_id))
    })

    if (isSkuValid) {
      const data = JSON.stringify(
        _.map(this.newCombineGoodsInfo, (item) => {
          return {
            id: item.id,
            salemenu_ids: mergeRemoveRepeatArray(
              this.salemenus,
              item.salemenus
            ).map((o) => o.value),
            spus: _.map(item.spus, (spu) => ({
              spu_id: spu.spu_id,
              quantity: spu.quantity,
            })),
            skus: _.map(item.skus, (sku) => ({
              sku_id: sku.sku_id,
              spu_id: sku.spu_id,
              salemenu_id: sku.salemenu_id,
              origin_id: sku.origin_id,
            })),
          }
        })
      )

      Request('/combine_goods/batch_edit')
        .data({ data })
        .post()
        .then(() => {
          Tip.success(t('添加成功！'))
        })
    } else {
      autoWarning([{ warning: t('规格信息填写不完整'), isValid: isSkuValid }])
    }
  }
}
