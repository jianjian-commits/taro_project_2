import { Modal, Tip } from '@gmfe/react'
import Big from 'big.js'
import { history } from 'common/service'
import {
  formatPostData,
  formatStartEndDate,
  isNumber,
  judgeFunction,
} from 'common/util'
import { t } from 'gm-i18n'
import { action, observable, runInAction } from 'mobx'
import globalStore from 'stores/global'
import { showTaskPanel } from '../../../../task/task_list'
import {
  add,
  edit,
  exportTemplate,
  getDetail,
  getSkuList,
  getSupplier,
  importSku,
} from '../service'

const { warning, success } = Tip

const init_details = {
  settle_supplier_id: undefined,
  supplier_name: '',
  quote_rule_id: undefined,
  quote_rule_name: '',
  begin_time: undefined,
  end_time: undefined,
  status: undefined,
  creator: undefined,
  create_time: undefined,
  last_operator: undefined,
  last_modify_time: undefined,
}

export const COPY_VIEW_TYPE = 'copy'

class Store {
  @observable isSupply = globalStore.isSettleSupply()

  @observable isEdit = false
  @observable isAdd = true
  @observable loading = false
  @observable viewType = undefined

  @observable supplierList = []
  @observable sku_details = [{}]

  @observable details = { ...init_details }

  @action
  getDetail(quote_rule_id) {
    const params = {
      quote_rule_id,
    }
    if (this.isSupply) {
      // 如果是供应商账号的话，需要加上供应商的id
      params.settle_supplier_id = globalStore.user.station_id
    }
    // 复制要加上is_copy
    if (this.viewType === COPY_VIEW_TYPE) {
      params.is_copy = 1
    }
    getDetail(params).then((res) => {
      let { data } = res
      if (this.viewType === COPY_VIEW_TYPE) {
        // 复制的将以下数据置为undefined
        data = {
          ...data,
          quote_rule_id: undefined,
          status: undefined,
          creator: undefined,
          create_time: undefined,
          last_operater: undefined,
          last_modify_time: undefined,
        }
      }
      // 空单清空下后端返回了sku_details = null，会导致空指针异常
      const sku_details = Array.isArray(data.sku_details)
        ? data.sku_details
        : []
      this.details = data
      if (this.isSupply) {
        // 如果是供应商账号登录，标记旧数据
        sku_details.forEach((item) => (item.isOld = true))
      }
      this.sku_details = sku_details
      console.log(data)
    })
  }

  @action
  getSupplier() {
    getSupplier().then((json) => {
      this.supplierList = json.data.map((supplierGroup) => {
        return {
          label: supplierGroup.name,
          children: supplierGroup.settle_suppliers.map((supplier) => {
            return {
              value: supplier._id,
              text: supplier.name,
            }
          }),
        }
      })
      return json
    })
  }

  @action
  searchSku(name) {
    return getSkuList({
      limit: 99999,
      search_text: name,
    }).then((json) => json.data)
  }

  @action
  onSave() {
    if (this.validate()) {
      const saveFn = this.isAdd ? add : edit
      const [begin_time, end_time] = formatStartEndDate(
        this.details.begin_time,
        this.details.end_time,
        'YYYY-MM-DD HH:mm:ss',
      )
      /**
       *  1.只提交选择了商品的
       *  2.剔除掉isOld属性
       */
      const submitSkuDetails = this.sku_details
        .slice()
        .filter(({ sku_id }) => sku_id)
        .map((sku_detail) => formatPostData(sku_detail, ['isOld']))
      if (this.isSupply) {
        // 如果是供应商账号的话，供应商的id即为登录账号的id
        this.details.settle_supplier_id = globalStore.user.station_id
      }
      const submitParams = {
        ...this.details,
        begin_time,
        end_time,
        sku_details: JSON.stringify(submitSkuDetails),
      }
      return saveFn(submitParams).then((res) => {
        if (res?.code === 0) {
          if (this.isAdd) {
            // 如果是新增，res.data为创建的规则id，加到detail，以便跳到详情页
            this.details.quote_rule_id = res.data
          }
          // 编辑或新增成功后将编辑状态设为false
          this.isEdit = false
          this.saveSuccessCallback()
        }
      })
    }
  }

  @action
  exportList(settle_supplier_id) {
    exportTemplate({ settle_supplier_id }).then(showTaskPanel)
  }

  @action
  uploadFile(file, callback) {
    importSku({ file })
      .then(({ data: sku_details }) => {
        this.sku_details = sku_details
        Modal.hide()
      })
      .finally(() => judgeFunction(callback))
    // const spec_ids = sku_details.map(({ sku_id }) => sku_id)
    // const batchRefPrices = await getBatchRefPrice({ spec_ids })
    // sku_details.forEach((item) =>
    //   Object.assign(item, batchRefPrices[item.sku_id]),
    // )
  }

  @action
  changeDetail(newDetail = {}) {
    this.details = {
      ...this.details,
      ...newDetail,
    }
  }

  @action
  changeSkuRow(index, data) {
    const target = this.sku_details[index]
    const newData = { ...target, ...data }
    // 导入有可能输入超过50个字，这时候每改变行数据，就好判断是否有错误提示信息
    this.isRemoveFailReason(newData, 'description', '描述不能超过50个汉字')
    this.isRemoveFailReason(newData, 'product_place', '产地不能超过50个汉字')
    this.sku_details[index] = newData
  }

  @action
  async changeSkuPruduct(index, selected = {}) {
    const {
      id: sku_id,
      name: sku_name,
      category_id_1: category_1,
      category_1_name: category_name_1,
      category_2: category_id_2,
      category_2_name: category_name_2,
      sale_ratio,
      std_unit_name_forsale,
      sale_unit_name,
      std_unit,
      purchase_unit,
      ratio,
    } = selected

    const newData = {
      sku_id,
      sku_name,
      std_unit_name: std_unit,
      category_1,
      category_name_1,
      category_id_2,
      category_name_2,
      sale_ratio,
      std_unit_name_forsale,
      sale_unit_name,
      std_unit,
      purchase_unit,
      ratio,
      // 切换商品，要将【fail_reason（错误信息）】，描述和产地清空
      fail_reason: undefined,
      description: undefined,
      product_place: undefined,
      std_unite_pre_quote: undefined,
      pack_unite_pre_quote: undefined,
      std_unite_protocol_price: undefined,
      pack_unite_protocol_price: undefined,
      isOld: false,
    }
    // // 获取商品参考成本
    // getBatchRefPrice({
    //   // spec_id: selected.value,
    //   // spu_id: selected.spu_id,
    //   // settle_supplier_id,
    // }).then((json = {}) => {
    //   const {
    //     last_in_stock_price,
    //     last_purchase_price,
    //     last_quote_price,
    //     latest_in_stock_price,
    //     latest_purchase_price,
    //     latest_quote_price,
    //     stock_avg_price,
    //     max_stock_unit_price,
    //     supplier_cycle_quote,
    //   } = json.data

    //   Object.assign(newData, {
    //     last_in_stock_price,
    //     last_purchase_price,
    //     last_quote_price,
    //     latest_in_stock_price,
    //     latest_purchase_price,
    //     latest_quote_price,
    //     stock_avg_price,
    //     max_stock_unit_price,
    //     supplier_cycle_quote,
    //   })
    // })
    this.changeSkuRow(index, newData)
  }

  @action
  addSkuRow() {
    this.sku_details.push({})
  }

  @action
  removeSkuRow(index) {
    this.sku_details.splice(index, 1)
    // 剩下一行再点击【-】,则将数组置为第一行为空对象
    if (!this.sku_details.slice().length) {
      this.sku_details = [{}]
    }
  }

  @action
  changeEdit(isEdit) {
    this.isEdit = isEdit
  }

  @action
  changeIsAdd(isAdd) {
    this.isAdd = isAdd
    this.changeEdit(isAdd)
  }

  @action
  resetDetail() {
    this.isEdit = false
    this.getDetail(this.details.quote_rule_id)
  }

  @action
  changeViewType(viewType) {
    this.viewType = viewType
  }

  @action
  clearStore() {
    this.isEdit = false
    this.isAdd = true
    this.loading = false
    this.viewType = undefined

    this.supplierList = []
    this.sku_details = [{}]

    this.details = { ...init_details }
  }

  // 点击保存时验证
  validate() {
    return this.validateHeader() && this.validateSku()
  }

  // 验证头部
  validateHeader() {
    const { quote_rule_name, settle_supplier_id, begin_time } = this.details
    if (!quote_rule_name) {
      warning(t('请填写规则名称'))
      return false
    }
    /**
     * 1. 供应商的id是写死的，直接通过
     * 2. 配送商必须选择供应商
     */
    const hasSettleSupplierId = this.isSupply || settle_supplier_id
    if (!hasSettleSupplierId || !begin_time) {
      warning(t(!hasSettleSupplierId ? '请选择供应商' : '请选择起止时间'))
      return false
    }
    return true
  }

  // 验证列表
  validateSku() {
    return this.sku_details.every((sku_row, index) => {
      const {
        sku_id,
        std_unite_pre_quote,
        pack_unite_pre_quote,
        std_unite_protocol_price,
        pack_unite_protocol_price,
        fail_reason,
        description,
        product_place,
      } = sku_row
      const VAR1 = ''
      const VAR2 = index + 1
      // 第几行提示
      if (sku_id) {
        // 只有选择了商品的才需要做校验，没有的忽略
        if (fail_reason) {
          warning(
            t('index_row', {
              VAR1,
              VAR2,
              VAR3: fail_reason,
            }),
          )
          return false
        }
        let VAR3
        // 供应商必须填写预报价
        if (this.isSupply && !isNumber(std_unite_pre_quote)) {
          VAR3 = t('请填写预报价')
        }
        // 配送商必须填写协议价
        if (!this.isSupply && !isNumber(std_unite_protocol_price)) {
          VAR3 = t('请填写协议价')
        }
        if ([description, product_place].some((key) => key?.length > 50)) {
          VAR3 = t(description ? '描述不能超过50个字' : '产地不能超过50个字')
        }
        if (VAR3) {
          warning(
            t('index_row', {
              VAR1,
              VAR2,
              VAR3,
            }),
          )
          return false
        }
        runInAction(() => {
          Object.assign(
            this.sku_details[index],
            this.handlePrice({
              std_unite_pre_quote,
              pack_unite_pre_quote,
              std_unite_protocol_price,
              pack_unite_protocol_price,
            }),
          )
        })
      }
      return true
    })
  }

  // 保存成功回调
  saveSuccessCallback() {
    success(t(this.isAdd ? '创建成功！' : '修改成功！'))
    const { quote_rule_id } = this.details
    if (this.isAdd) {
      history.push(
        `/sales_invoicing/base/cycle_quote_rules/edit?id=${quote_rule_id}`,
      )
    } else {
      this.getDetail(quote_rule_id)
    }
  }

  // 处理商品价格
  handlePrice(priceObject = {}) {
    const newPriceObj = {}
    Object.entries(priceObject).forEach(([key, value]) => {
      if (isNumber(value)) {
        newPriceObj[key] = Big(value).toFixed(2)
      }
    })
    return newPriceObj
  }

  isRemoveFailReason(data, key, fail_reason) {
    if ((data[key]?.length || 0) <= 50 && data.fail_reason === fail_reason) {
      delete data.fail_reason
    }
  }
}

export default new Store()
