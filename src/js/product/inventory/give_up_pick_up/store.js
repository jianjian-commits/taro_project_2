import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'

class Store {
  /**
   * @type {{spu_id:string,spu_name:string,category_name_2:string,
   * request_amount:number,
   * request_refund_money:number,create_time:string,
   * operator:string,order_id:string}[]}
   * 放弃取货列表
   */
  @observable giveUpList = []

  @observable loading = false

  /**
   * 获取放弃货位列表
   * @param filter
   * @returns {Q.Promise<any> | void | PromiseLike<any>}
   */
  @action fetchGiveUpList(filter) {
    this.loading = true
    return Request('/stock/abandon_goods/log/list')
      .data({ ...filter, count: 1 }) // 后端默认的
      .get()
      .then((result) => {
        runInAction(() => {
          const { data } = result
          this.giveUpList = data
          this.loading = false
        })
        return result
      })
  }

  /**
   * @type {{begin:string,end:string,category1:{value:number,text:string}[],category2:{value:number,text:string}[],q:string}}
   * 筛选条件
   */
  @observable filter = {
    begin: moment(new Date()).format('YYYY-MM-DD'),
    end: moment(new Date()).format('YYYY-MM-DD'),
    category1: [],
    category2: [],
    q: '',
  }

  /**
   * 设置筛选条件
   * @param key {string}
   * @param value {any}
   */
  @action setFilter(key, value) {
    this.filter[key] = value
  }

  @action resetFilter() {
    this.filter = {
      begin: new Date(),
      end: new Date(),
      category1: [],
      category2: [],
      q: '',
    }
  }
}

export const store = new Store()
