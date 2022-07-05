import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

class Store {
  @observable list = []


  @observable loading = false

  init() {
    this.list = []
    this.loading = false
  }

  @action
  updateListItem(index, key, value) {
    this.list[index][key] = value
  }

  deleteListItem(index) {
    this.list.splice(index, 1)
  }

  /**
   * 报价单-批量新建
   * @param {*} saleMenuId
   * @param {*} templateId
   * @param {*} import_file
   */
  @action
  batchImportSku(saleMenuId, templateId, import_file) {
    this.loading = true
    const params = {
      salemenu_id: saleMenuId,
      template_id: templateId,
      import_file: import_file,
    }
    return Request('/product/sku/batch/import')
      .data(params)
      .post()
      .then((json) => {
        runInAction(() => {
          this.list = _.map(json.data, (v, i) => {
            return {
              ...v,
              ...(v.spus[0] && {
                spu_info: {
                  text: `${v.spus[0]?.spu_name}(${v.spus[0]?.spu_id})`,
                  value: v.spus[0]?.spu_id,
                },
              }),
            }
          })
          this.loading = false
        })
        console.log(this.list, '1111')
        return json
      })
  }

  /**
   * 报价单-批量新建-全部提交
   * @param {*} saleMenuId
   * @param {*} templateId
   * @returns
   */
  @action
  batchSubmitAll(saleMenuId, templateId) {
    const params = {
      salemenu_id: saleMenuId,
      template_id: templateId,
      sku_data: JSON.stringify(
        _.map(this.list, (_, index) => this.formatSkuData4Submit(index)),
      ),
    }
    return Request('/product/sku/batch/submit/all')
      .data(params)
      .post()
      .then((json) => {
        return json
      })
  }

  /**
   * 报价单-批量新建-单个保存
   * @param {*} saleMenuId
   * @param {*} index
   * @returns
   */
  @action
  batchSubmitOne(saleMenuId, index) {
    this.loading = true
    const params = {
      salemenu_id: saleMenuId,
      sku_data: JSON.stringify(this.formatSkuData4Submit(index)),
    }
    return Request('/product/sku/batch/submit/one')
      .data(params)
      .post()
      .then((json) => {
        this.loading = false
        return json
      })
      .catch(() => {
        this.loading = false
        return null
      })
  }

  formatSkuData4Submit(index) {
    const spu = this.list[index].spu_info
      ? _.find(
          this.list[index].spus,
          (it) => it.spu_id === this.list[index].spu_info.value,
        )
      : {}
    return {
      ..._.omit(this.list[index], ['spus', 'spu_info']),
      ...spu,
    }
  }
}
export default new Store()
