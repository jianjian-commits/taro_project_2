import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

interface DetailsOptions {
  /* 订单状态 */
  status: number
  /* 审核状态 */
  audit_status: number
  order_id: string
  order_time: string
  /* 申请人/改单账号 */
  applicant: string
  address_name: string
  address_id: string
  edit_time: string
  skus: SkuOptions[]
}

interface SkuOptions {
  sku_id: string
  img: string
  name: string
  category_name_2: string
  sale_ratio: number
  std_sale_price_forsale: number
  std_unit_name_forsale: string
  sale_unit_name: string
  remark: {
    before: string
    after: string
  }
  /* 下单数 */
  purchase_quantity: {
    before: string
    after: string
  }
  /* 下单金额 */
  sale_money: { before: number; after: number }
}

class Store {
  @observable id: number | undefined

  @action setId = (id: number) => {
    this.id = id
  }

  @observable reason = ''

  @action setReason = (reason: string) => {
    this.reason = reason
  }

  @observable details: DetailsOptions = {
    order_id: '',
    order_time: '',
    applicant: '',
    address_name: '',
    address_id: '',
    edit_time: '',
    status: 0,
    audit_status: 0,
    skus: [],
  }

  @action fetchDetails = (id: number) => {
    return Request<DetailsOptions>('/station/order_edit_audit/get')
      .data({ id })
      .get()
      .then((result) => {
        runInAction(() => {
          this.details = result.data
        })
      })
  }

  handleUpdate = (params: any) => {
    return Request('/station/order_edit_audit/update').data(params).post()
  }
}

export default new Store()
