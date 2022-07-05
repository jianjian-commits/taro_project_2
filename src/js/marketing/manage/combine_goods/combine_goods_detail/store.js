import { action, observable, computed } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { autoWarning, imgUrlToId } from '../util'
import { System } from '../../../../common/service'

class Spu {
  @observable spu_name
  @observable std_unit_name
  @observable category_title_2
  @observable quantity
  @observable spu_id
  @observable origin // 来源：普通商品 or 组合商品名
  @observable origin_id // 来源id：''-普通商品 id-所属组合商品id
  @observable combineQuantity // 所属组合商品的数量
  @observable combineSpus // 组合商品下的spus

  constructor(obj) {
    this.init(obj)
  }

  @action.bound
  set(key, value) {
    this[key] = value
  }

  @action.bound
  init({
    spu_id,
    spu_name,
    std_unit_name,
    category_title_2,
    quantity = '',
    origin = '普通商品',
    origin_id = '',
    combineQuantity = '',
    combineSpus,
  }) {
    this.spu_id = spu_id
    this.spu_name = spu_name
    this.std_unit_name = std_unit_name
    this.category_title_2 = category_title_2
    this.quantity = quantity
    this.origin = origin
    this.origin_id = origin_id
    this.combineQuantity = combineQuantity
    this.combineSpus = combineSpus
  }
}

export default class Store {
  constructor(option) {
    this.type = option.type
  }

  @observable detailFields = {
    // id, 如果是详情,会有id
    name: '',
    combine_level: 2, // 2-二级组合商品 3-三级组合商品
    state: 1,
    desc: '',
    sale_unit_name: '',
  }

  @observable salemenus = [] // [{value: salemenu_id, text: salemenu_name}, ...]
  @observable images = [] // [string, string, ...]
  @observable spus = [new Spu({})]
  @observable skus = [] // [{}]
  @observable expanded = []

  @action.bound
  init() {
    this.detailFields = {
      name: '',
      state: 1,
      combine_level: 2,
      desc: '',
      sale_unit_name: '',
    }
    this.salemenus = []
    this.images = []
    this.spus = [new Spu({})]
    this.skus = []
  }

  @action.bound
  async initStore(id) {
    const data = await Request('/combine_goods/detail')
      .data({ id })
      .get()
      .then((res) => res.data)
    const { salemenus, images, spus, skus, ...detailFields } = data

    this.images = images
    this.detailFields = detailFields

    this.salemenus = _.map(salemenus, (salemenu_name, salemenu_id) => ({
      value: salemenu_id,
      text: salemenu_name,
    }))

    // 后台返回的spus为空时 给个初始值
    this.spus = _.isEmpty(spus)
      ? [new Spu({})]
      : _.map(spus, (spu, spu_id) => {
          return new Spu({
            spu_id,
            spu_name: spu.name,
            std_unit_name: spu.std_unit_name,
            category_title_2: spu.category_title_2,
            quantity: spu.quantity,
            combineQuantity: '',
            origin: '普通商品',
            origin_id: spu.combine_spus ? spu_id : '', // spu为组合商品时 用origin_id来过滤spu
            combineSpus: spu.combine_spus
              ? _.map(spu.combine_spus, (o) => {
                  o.origin = spu.name
                  o.origin_id = spu_id
                  o.combineQuantity = spu.quantity
                  o.spu_id = o.id
                  o.spu_name = o.name
                  return o
                })
              : '',
          })
        })

    this.skus = skus.map((sku) => {
      return {
        ...sku,
        ..._.find(
          this.allSpus,
          (spu) => spu.spu_id === sku.spu_id && spu.origin_id === sku.origin_id,
        ),
        sku_id: sku.id,
        salemenu_name: salemenus[sku.salemenu_id],
      }
    })
    // 初始化
    this.expanded = _.map(this.salemenus, (o) => o.value)
  }

  // 获取嵌套组合商品里spu的信息
  @computed get combineSpusList() {
    const initCombineSpus = []
    _.forEach(this.spus, (spu) => {
      if (spu.combineSpus) {
        initCombineSpus.push(spu.combineSpus)
      }
    })
    // 扁平化处理
    return _.flatMap(initCombineSpus, (combine) => {
      return _.map(
        combine,
        (spu) =>
          new Spu({
            spu_id: spu.spu_id,
            spu_name: spu.spu_name,
            std_unit_name: spu.std_unit_name,
            category_title_2: spu.category_title_2,
            quantity: spu.quantity,
            origin: spu.origin,
            origin_id: spu.origin_id,
            combineQuantity: spu.combineQuantity,
            combineSpus: '',
          }),
      )
    })
  }

  // 规格信息中的spus
  @computed get allSpus() {
    // 去掉是组合商品的spu
    return _.filter(this.spus, (spu) => !spu.origin_id).concat(
      this.combineSpusList.slice(),
    )
  }

  @computed get salemenusSkuTable() {
    // 去掉没有填写spu的空白行
    const validSpus = this.allSpus.filter((o) => o.spu_id)
    let fee_type = ''
    return this.salemenus.map((menu) => {
      const salemenu_id = menu.value
      const skuList = []
      let reference_price = 0

      validSpus.forEach((spu) => {
        const sku = _.find(
          this.skus,
          (o) =>
            o.salemenu_id === salemenu_id &&
            o.spu_id === spu.spu_id &&
            o.origin_id === spu.origin_id, // spu的来源
        )
        fee_type = sku?.fee_type
        skuList.push(
          sku || {
            spu_name: spu.spu_name,
            spu_id: spu.spu_id,
            salemenu_id,
            origin: spu.origin || '普通商品',
            origin_id: spu.origin_id || '',
          },
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
            .times(sku.combineQuantity || 1) // 组合商品
            .div(sku.sale_ratio)
            .times(sku.sale_price)
            .plus(reference_price)
        }
      })

      return {
        salemenu_name: menu.text,
        salemenu_id: menu.value,
        fee_type,
        reference_price:
          reference_price === '-'
            ? reference_price
            : reference_price.toFixed(2),
        skuList,
      }
    })
  }

  @computed get selectedSpus() {
    // 去掉没有填写spu的空白行
    const validSpus = this.spus.filter((o) => o.spu_id)
    return _.map(validSpus, (spu) => ({
      value: spu.spu_id,
      text: spu.spu_name,
    }))
  }

  // 获取二级组合商品信息
  @action
  async handleNestCombineGood(id) {
    await Request('/combine_goods/detail')
      .data({ id })
      .get()
      .then((res) => {
        // 二级组合商品下的spu
        const spus = _.map(res.data.spus, (spu, spu_id) => {
          return new Spu({
            spu_id,
            spu_name: spu.name,
            std_unit_name: spu.std_unit_name,
            category_title_2: spu.category_title_2,
            quantity: spu.quantity,
            origin_id: id,
            origin: res.data.name,
            combineQuantity: '', // 所属组合商品数量设为''
            combineSpus: '',
          })
        })

        // 找到所属的组合商品 修改spu的combineSpus属性
        this.spus = _.map(this.spus.slice(), (o) => {
          if (o.spu_id === id) {
            o.combineSpus = spus
          }
          return o
        })

        _.forEach(res.data.skus, (sku) => {
          const index = _.findIndex(
            this.skus,
            (o) => o.sku_id === sku.id && o.origin_id === id,
          )

          const _sku = {
            ...sku,
            ...res.data.spus[sku.spu_id],
            sku_id: sku.id,
            salemenu_name: res.data.salemenus[sku.salemenu_id],
            origin_id: id,
            origin: res.data.name,
            combineQuantity: '', // 新增spu 所属组合商品数量设为''
          }

          if (index !== -1) {
            this.skus.splice(index, 1, _sku)
          } else {
            this.skus.push(_sku)
          }
        })
      })
  }

  @action.bound
  updateExpanded() {
    this.expanded = _.map(this.salemenusSkuTable, (o) => o.salemenu_id)
  }

  @action.bound
  setDetailFields(key, value) {
    this.detailFields[key] = value
  }

  @action.bound
  setImages(urls) {
    this.images = urls
  }

  uploadImg(files) {
    return Promise.all(
      files.map((image_file) =>
        Request('/image/upload')
          .data({
            image_file,
            is_retail_interface: System.isC() ? 1 : null,
          })
          .post()
          .then((res) => res.data.image_url),
      ),
    )
  }

  @action.bound
  addEmptySpu() {
    this.spus.push(new Spu({}))
  }

  @action.bound
  delSpuByIndex(index) {
    if (this.spus.length > 1) {
      this.spus.splice(index, 1)
    }
  }

  @action.bound
  changeSpuQuantity(num, spu) {
    const _spus = this.spus.slice()
    const index = _.findIndex(_spus, (o) => o.spu_id === spu.spu_id)
    if (index !== -1) {
      _spus[index].quantity = num
    } else {
      _spus.push(spu)
    }
    this.spus = _spus

    const _skus = _.map(this.skus.slice(), (sku) => {
      if (sku.origin_id === spu.spu_id) {
        // spu为组合商品
        sku.combineQuantity = num
      }
      if (sku.spu_id === spu.spu_id && sku.origin_id === spu.origin_id) {
        // spu为普通商品
        sku.quantity = num
      }
      return sku
    })
    this.skus = _skus
  }

  @action.bound
  setSalemenus(list) {
    this.salemenus = list
    this.updateExpanded()
  }

  @action.bound
  setExpanded(expanded) {
    this.expanded = expanded
  }

  @action.bound
  setSkus(salemenu_id, spu_id, origin_id, new_sku) {
    const index = _.findIndex(
      this.skus,
      (o) =>
        o.salemenu_id === salemenu_id &&
        o.spu_id === spu_id &&
        o.origin_id === origin_id,
    )
    const spu = _.find(
      this.allSpus,
      (o) => o.spu_id === spu_id && o.origin_id === origin_id,
    )

    const _sku = {
      salemenu_id,
      ...spu,
      ...new_sku,
      combineQuantity: spu.origin_id
        ? _.find(this.spus, (o) => o.origin_id === origin_id).quantity // 所属组合商品的数量
        : '',
    }
    if (index !== -1) {
      this.skus.splice(index, 1, _sku)
    } else {
      this.skus.push(_sku)
    }
  }

  @action.bound
  submit() {
    let {
      id,
      name,
      combine_level,
      state,
      desc,
      sale_unit_name,
    } = this.detailFields
    name = name.trim()

    // 添加一个空的spu时 不进行校验
    const isSpuValid = this.spus.every((o) =>
      o.spu_id ? o.spu_id && o.quantity > 0 : true,
    )
    const isSkuValid = this.salemenusSkuTable.every((o) =>
      o.skuList.every((s) => s.sku_id),
    )
    const isSalemenusValid = this.salemenus.length > 0

    if (isSalemenusValid && isSkuValid && isSpuValid) {
      // 过滤空的spu
      const filterSpus = _.filter(this.spus, (spu) => spu.spu_id)

      const req = {
        id: this.type === 'edit' ? id : undefined, // 新建没有id的
        name,
        combine_level,
        state,
        desc,
        sale_unit_name,
        salemenu_ids: JSON.stringify(this.salemenus.map((o) => o.value)),
        images: JSON.stringify(imgUrlToId(this.images)),
        spus: JSON.stringify(
          _.map(filterSpus, (o) => ({
            spu_id: o.spu_id,
            quantity: o.quantity,
          })),
        ),
        skus: JSON.stringify(
          this.salemenusSkuTable.reduce((acc, cur) => {
            return [
              ...acc,
              ...cur.skuList.map((v) => ({
                sku_id: v.sku_id,
                spu_id: v.spu_id,
                salemenu_id: v.salemenu_id,
                origin_id: v.origin_id,
              })),
            ]
          }, []),
        ),
      }
      return Request(`/combine_goods/${this.type}`).data(req).post()
    } else {
      autoWarning([
        { warning: t('商品基本信息填写不完整'), isValid: isSpuValid },
        { warning: t('规格信息填写不完整'), isValid: isSkuValid },
        { warning: t('至少填写一个可见报价单'), isValid: isSalemenusValid },
      ])
      return Promise.reject(new Error())
    }
  }
}
