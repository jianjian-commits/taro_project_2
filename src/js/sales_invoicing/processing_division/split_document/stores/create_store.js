import { action, computed, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import moment from 'moment'

export class CreateStore {
  /**
   * @type {'create'|'details'|'edit'}
   */
  @observable viewType = 'create'

  /**
   * 单据是否冻结
   */
  @observable is_frozen = false

  @action setViewType = (type) => (this.viewType = type)

  /**
   * 分割单号
   * @type {string}
   */
  @observable sheet_no

  /**
   * 分割方案
   * @type {{name,source_spu_name,source_spu_id,version}}
   */
  @observable splitPlan = null

  @action setSplitPlan = (value) => {
    this.splitPlan = value
    if (value) {
      const { id, version } = value
      this.loading = true
      Request('/stock/split/plan/detail')
        .data({ id, version })
        .get()
        .then(({ data }) => {
          runInAction(() => {
            const { gain_spus } = data
            this.gainSpus = gain_spus.map((item) => ({
              ...item,
              real_quantity: null,
              remain_quantity: null,
              in_stock_price: null,
            }))
            const [{ std_unit_name }] = gain_spus
            this.stdUnitName = std_unit_name
          })
        })
        .finally(() => (this.loading = false))
    }
  }

  /**
   * 待分割品消耗量
   * @type {number|null}
   */
  @observable sourceQuantity = null

  @action setSourceQuantity = (value) => {
    this.sourceQuantity = value
    this.gainSpus.forEach((item) => {
      const { split_ratio } = item
      item.remain_quantity = _.isNil(value)
        ? null
        : Big(value).times(split_ratio).toFixed(2)
      if (_.isNil(value)) {
        item.real_quantity = null
      }
    })
  }

  /**
   * 获得品总量
   * @returns {null|number}
   */
  @computed get gainCount() {
    if (
      !this.gainSpus.length ||
      this.gainSpus.some((item) => _.isNil(item.real_quantity))
    ) {
      return null
    }
    let count = 0
    this.gainSpus.forEach((item) => {
      count = Big(count).plus(item.real_quantity || 0)
    })
    return count
  }

  /**
   * 分割时间
   * @type {Date}
   */
  @observable
  splitTime = new Date()

  @action setSplitTime = (date) => {
    this.splitTime = date
  }

  /**
   * 状态
   */
  @observable status

  /**
   * 操作人
   */
  @observable operator

  /**
   * 获得品明细
   * @type {*[]}
   */
  @observable gainSpus = []

  @action setGainSpusItem = (index, data) => {
    Object.assign(this.gainSpus[index], data)
  }

  @observable loading = false

  @observable stdUnitName = t('斤')

  handleCreate = () => {
    const { version, source_spu_id, id } = this.splitPlan
    const params = {
      plan_id: id,
      plan_version: version,
      source_spu_id,
      source_quantity: this.sourceQuantity,
      split_time: moment(this.splitTime).format('YYYY-MM-DD HH:mm:ss'),
      gain_spus: JSON.stringify(
        this.gainSpus.map((item) => {
          const { spu_id, real_quantity, in_stock_price } = item
          return { spu_id, real_quantity, in_stock_price }
        })
      ),
    }
    return Request('/stock/split/sheet/create').data(params).post()
  }
}

export default new CreateStore()
