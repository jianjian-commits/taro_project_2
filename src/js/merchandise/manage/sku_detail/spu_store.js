import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { initSpuDetail } from './init_data'
import { getImgId, boolToNum } from './util'
import globalStore from '../../../stores/global'
import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import { System } from '../../../common/service'

const initNutrientItem = {
  // 初始化
  key: '',
  value: null,
}

class SpuDetailStore {
  @observable spuDetail = initSpuDetail

  // 如果一级分类为本站，则 p_type 只能为本站，不可修改
  @observable canEditPType = true

  @observable is_open_nutrition = 0 // 是否开启营养素 0关闭，1开启 默认关闭
  // 所属分类 选中的id list
  @observable spuList = []
  // 营养素字典
  @observable nutrition_info = {
    energy: null,
    carbohydrate: null,
    protein: null,
  }

  // 用来给营养素table展示的数据
  @observable tableData = []

  // 后台要字典 在这里把数组转对象
  @action ListToObj = (arr) => {
    const obj = {}
    _.map(arr, (item) => (obj[item.key] = item.value))
    return obj
  }

  @action
  changeSpu(name, value) {
    this.spuDetail[name] = value
  }

  @action
  changeCanEditPType(v) {
    this.canEditPType = v
  }

  @action
  changePinleiSelect(selected) {
    this.spuDetail.category_id_1 = selected[0]
    this.spuDetail.category_id_2 = selected[1]
    this.spuDetail.pinlei_id = selected[2]
  }

  @action
  getPinleiSpu(pinlei_id) {
    Request('/merchandise/spu/list')
      .data({ pinlei_id, is_retail_interface: System.isC() ? 1 : null })
      .get()
      .then((json) => {
        runInAction(() => {
          this.spuList = _.map(json.data, (v) => {
            return {
              ...v,
              text: v.name,
              value: v.id,
            }
          })
        })
      })
  }

  @action
  selectSpu(selected) {
    this.spuDetail.id = selected.value
  }

  @action
  getSpuDetail(spu_id) {
    Request('/merchandise/spu/details')
      .data({ spu_id, is_new_ui: 1, is_retail_interface: System.isC() ? 1 : null })
      .get()
      .then((json) => {
        runInAction(() => {
          this.spuDetail = {
            ...this.spuDetail,
            ...json.data,
            new_customize_code: json.data.customize_code,
          }
          // 有营养素直接展示，没有初始化一下展示三大营养素
          this.handleNutritionInfo(json.data.nutrition_info)
        })
      })
  }



  @action
  handleNutritionInfo(data) {
    if (data) {
      this.tableData = data
      this.nutrition_info = this.ListToObj(this.tableData)
    } else {
      this.initNutritionInfo()
    }
  }

  @action
  init() {
    this.spuDetail = initSpuDetail
    this.spuList = []
  }

  @action
  updateSpu() {
    const {
      name,
      p_type,
      pinlei_id,
      image_list,
      desc,
      alias,
      dispatch_method,
      std_unit_name,
      need_pesticide_detect,
      is_open_nutrition,
      detail_image_list,
      id,
      new_customize_code,
      picking_type,
      tax_id_for_bill,
      tax_rate_for_bill,
      perf_method,
    } = this.spuDetail
    if (new_customize_code?.length > 50) {
      Tip.warning(t('自定义编码的最长长度为50'))
      return
    }
    const query = {
      id,
      name,
      p_type,
      desc,
      pinlei_id,
      std_unit_name,
      dispatch_method,
      picking_type,
      tax_id_for_bill,
      tax_rate_for_bill,
      need_pesticide_detect: boolToNum(need_pesticide_detect),
      is_open_nutrition: is_open_nutrition,
      images: JSON.stringify(getImgId(image_list)),
      detail_images: JSON.stringify(getImgId(detail_image_list)),
      alias: JSON.stringify(alias),
      customize_code: new_customize_code,
      nutrition_info:
        is_open_nutrition === 1 ? JSON.stringify(this.nutrition_info) : null,
      perf_method,
    }
    if (System.isC()) query.is_retail_interface = 1

    return Request('/merchandise/spu/update').data(query).post()
  }

  @action
  createSpu() {
    const {
      name,
      p_type,
      pinlei_id,
      image_list,
      desc,
      alias,
      dispatch_method,
      std_unit_name,
      need_pesticide_detect,
      customize_code,
      picking_type,
      tax_id_for_bill,
      tax_rate_for_bill,
      is_open_nutrition,
      perf_method,
    } = this.spuDetail
    if (customize_code?.length > 50) {
      Tip.warning(t('自定义编码的最长长度为50'))
      return
    }
    const allowAll =
      globalStore.hasPermission('add_spu') &&
      globalStore.hasPermission('add_spu_private')
    const query = {
      name,
      desc,
      pinlei_id,
      std_unit_name,
      customize_code,
      dispatch_method,
      picking_type,
      tax_id_for_bill,
      tax_rate_for_bill,
      need_pesticide_detect: boolToNum(need_pesticide_detect),
      is_open_nutrition: is_open_nutrition,
      images: JSON.stringify(getImgId(image_list)),
      alias: JSON.stringify(alias),
      nutrition_info:
        is_open_nutrition === 1 ? JSON.stringify(this.nutrition_info) : null,
      perf_method,
    }
    if (!allowAll) {
      query.p_type = globalStore.hasPermission('add_spu') ? '0' : '1'
    } else {
      query.p_type = p_type
    }
    if (System.isC()) query.is_retail_interface = 1

    return Request('/merchandise/spu/create').data(query).post()
  }

  // 初始化营养素字典
  @action
  initNutritionInfo() {
    this.tableData = [
      { key: 'carbohydrate', value: null },
      { key: 'protein', value: null },
      { key: 'fat', value: null },
    ]
    this.nutrition_info = this.ListToObj(this.tableData)
  }

  @action
  syncImgToSku(spu_id, salemenu_id) {
    return Request('/product/sku_image/change')
      .data({ spu_id, salemenu_id, is_retail_interface: System.isC() ? 1 : null })
      .post()
  }

  @action.bound
  handleChangeInputValue(index, val, key) {
    if (!key) {
      Tip.warning(t('请选择营养素名称后再输入含量'))
      return
    }
    this.nutrition_info[key] = val
    this.tableData[index].value = val
  }

  @action.bound
  addNutrientItem() {
    this.tableData.push({ ...initNutrientItem })
  }

  @action.bound
  deleteNutrientItem(index, key) {
    if (this.tableData.length < 2) {
      Tip.warning(t('开启营养素后至少保留一条营养素信息'))
      return
    }
    delete this.nutrition_info[key]
    this.tableData.remove(this.tableData[index])
  }

  @action.bound
  handleSelect(selected, index, type) {
    // 即使属性的值是 null 或 undefined，只要属性存在，hasOwnProperty 依旧会返回 true
    Object.prototype.hasOwnProperty.call(this)
    if (this.nutrition_info.hasOwnProperty([selected.value])) {
      Tip.warning(t('被选营养素已存在，请选择列表其他营养素'))
      return
    }
    // 修改已存在营养素时需要在字典中删除之前的key再存入之后的key
    delete this.nutrition_info[this.tableData[index][type]]
    this.nutrition_info[selected.value] = this.tableData[index].value
    this.tableData[index][type] = selected.value
  }
}

export default new SpuDetailStore()
