import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  /** 搜索栏输入框 */
  @observable q = ''

  /**
   * 输入
   * @param text {string}
   */
  @action setQ(text) {
    this.q = text
  }

  /**
   * 车间列表
   * @type {{workshop_id:number,custom_id:string,name:string,technics:{technic_id:number,name:string}[]}[]}
   */
  @observable workShopList = []

  /**
   *
   * @param pagination {{q?:string,page_obj?:string,reverse?:boolean,limit?:number}}
   * @returns {Promise<object>}
   */
  @action fetchWorkShopList(pagination) {
    return Request('/process/workshop/list')
      .data({
        ...pagination,
        q: this.q,
      })
      .get()
      .then((result) => {
        runInAction(() => {
          const { data } = result
          this.workShopList = data
        })
        return result
      })
  }

  /**
   * 设置列表单行
   * @param item {object}
   * @param index {number}
   */
  @action setWorkShopListItem(item, index) {
    Object.assign(this.workShopList[index], item)
  }

  @action deleteWorkShop(workshop_id) {
    return Request('/process/workshop/delete').data({ workshop_id }).post()
  }

  @action createWorkShop(data) {
    return Request('/process/workshop/create').data(data).post()
  }

  @action editWorkShop(data) {
    return Request('/process/workshop/update').data(data).post()
  }
}

export const store = new Store()
