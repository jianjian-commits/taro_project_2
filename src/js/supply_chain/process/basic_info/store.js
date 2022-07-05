import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  /**
   * 工艺列表
   * @type {{name:string,id:number,desc:string,custom_id:string,custom_cols:{col_name:string,col_id:number,param_list:{param_name:string,param_id:number}}[]}[]}
   */
  @observable processList = []

  @observable activeIndex = 0

  /**
   * 设置active tab
   * @param {number} active
   */
  @action setActiveTab(active) {
    this.activeIndex = active
  }

  /**
   * 获取工艺列表
   * @param option {{q?:string,limit:number}}
   * @returns {Promise<*>}
   */
  @action fetchProcessList(option = { limit: 10000 }) {
    return Request('/process/technic/list')
      .data(option)
      .get()
      .then(({ data }) => {
        runInAction(() => {
          const { technic_data } = data
          this.processList = technic_data
        })
        return data
      })
  }
}

export const store = new Store()
