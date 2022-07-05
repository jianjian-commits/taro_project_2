import { observable, action, set } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import { showTaskPanel } from '../../../task/task_list'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { history } from '../../../common/service'
import { calculateCycleTime } from '../../../common/util'

const exportOptions = {
  spec_id: t('采购规格ID'),
  spec_name: t('规格名称'),
  purchase_spec: t('采购规格'),
  supplier_id: t('供应商编号'),
  supplier_name: t('供应商名称'),
  purchase_amount: t('采购量(基本单位)'),
  fail_reason: t('失败原因'),
}

class Store {
  @observable list = []

  @observable failList = []

  @observable serviceTimes = []

  @observable supplierSpecMap = {}

  @observable supplierSpecOther = []

  @observable supplierSpecTarget = []

  @observable allSupplier = []

  @observable
  fetchServiceTime() {
    Request('/service_time/list')
      .get()
      .then((json) => {
        this.serviceTimes = json.data
      })
  }

  validSupplier = (id) => {
    return this.allSupplier.some((sup) => {
      return sup.value === id
    })
  }

  fetchSupplier() {
    const spec_ids = this.list.map((row) => row.spec_id)
    if (_.size(spec_ids) === 0) {
      return
    }
    // 拉取全部供应商
    const allSupplierP = Request('/purchase/task/settle_suppliers').get()

    const specSupplierP = Request('/purchase/task/get_settle_suppliers')
      .data({ spec_ids: JSON.stringify(spec_ids) })
      .get()

    Promise.all([allSupplierP, specSupplierP]).then(
      action(([allSupplierJson, specSupplierJson]) => {
        this.allSupplier = allSupplierJson.data.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
        const {
          other_supplier,
          target_supplier,
        } = specSupplierJson.data[0].settle_suppliers
        this.supplierSpecOther = other_supplier.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
        target_supplier.forEach((target) => {
          this.supplierSpecTarget.push(
            this.allSupplier.find((all) => all.value === target),
          )
        })
      }),
    )
  }

  @action
  setData(data) {
    const { success_list, fail_list } = data
    this.list = success_list.map((item) => {
      if (!this.isValidAmount(item.purchase_amount)) {
        item.purchase_amount = ''
      }
      return {
        ...item,
        isRelatedTasksCycle: false,
      }
    })
    this.failList = fail_list
  }

  reset() {
    this.list = []
    this.failList = []
    this.supplierSpecMap = {}
    this.allSupplier = []
  }

  @action.bound
  handleChange(index, filed, value) {
    this.list[index][filed] = value
  }

  @action.bound
  handleCycleSwitchChange(index, value) {
    const { time_config_id } = this.list[index]
    if (!time_config_id) {
      const time = _.get(this.serviceTimes, '[0]._id')
      set(this.list[index], 'time_config_id', time)
      set(this.list[index], 'cycle_start_time', moment())
    }
    this.list[index]['isRelatedTasksCycle'] = value
  }

  @action.bound
  handleDelete(index) {
    this.list.splice(index, 1)
  }

  handleChangeBind = (index, filed) => {
    return this.handleChange.bind(null, index, filed)
  }

  throwError(msg) {
    throw new Error(msg)
  }

  getServiceTime = (time_config_id) => {
    return _.find(
      this.serviceTimes,
      (serviceTime) => serviceTime._id === time_config_id,
    )
  }

  isValidAmount(amount) {
    amount = Number(amount)
    return amount > 0
  }

  getParams() {
    return _.map(this.list, (item) => {
      const params = _.pick(item, ['supplier_id', 'spec_id', 'purchase_amount'])
      if (!this.validSupplier(params.supplier_id)) {
        this.throwError('请选择供应商')
      }
      if (!this.isValidAmount(params.purchase_amount)) {
        this.throwError('请输入采购量')
      }
      if (item.isRelatedTasksCycle) {
        let { cycle_start_time, time_config_id } = item
        if (!cycle_start_time || !time_config_id) {
          this.throwError('请选择周期')
        }
        const service_time = this.getServiceTime(time_config_id)
        cycle_start_time =
          calculateCycleTime(cycle_start_time, service_time).begin + ':00'
        Object.assign(params, { cycle_start_time, time_config_id })
      }
      return params
    })
  }

  tryGetParams() {
    try {
      return this.getParams()
    } catch (e) {
      Tip.warning(e.message)
      return false
    }
  }

  handleExport = () => {
    const exportData = _.map(this.failList, (row) => {
      const newRow = {}
      _.forEach(exportOptions, (newField, field) => {
        if (_.isFunction(newField)) {
          const fn = newField
          const [key, val] = fn({
            row,
            value: row[field],
            field,
          })
          newRow[key] = val
          return
        }
        newRow[newField] = row[field]
      })
      return newRow
    })
    requireGmXlsx((res) => {
      const { jsonToSheet } = res
      jsonToSheet([exportData], {
        fileName: '批量创建采购条目_导入失败列表.xlsx',
      })
    })
  }

  @action.bound
  handleSubmit() {
    const params = this.tryGetParams()
    if (params === false) {
      return
    }
    if (_.size(params) === 0) {
      Tip.warning(t('未创建条目！'))
      return
    }
    Request('/purchase/task/batch_create/import')
      .data({
        purchase_task: JSON.stringify(params),
      })
      .post()
      .then(() => {
        history.go(-1)
        showTaskPanel(null, { tabKey: 1 })
      })
  }
}

export default new Store()
