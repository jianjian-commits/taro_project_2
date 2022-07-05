import { Request } from '@gm-common/request'
import { observable, action } from 'mobx'

interface AccountInfo {
  user_id: number
  username: string
  account_bounding: number
  station_id?: string
  station_name?: string
  name: string
  logo: string
}
class Store {
  @observable list: AccountInfo[] = [
    // {
    //   user_id: 1,
    //   username: 'mxtxest',
    //   account_bounding: 2,
    //   station_id: 'T123',
    //   station_name: 'SZ-从仓',
    //   name: '我才是张三丰',
    //   logo:
    //     'https://img.guanmai.cn/station_pic/e676b4d184f9a137.png??imageslim',
    // },
  ]

  @action
  getMultiAccountList() {
    Request('/station/multi/account/list')
      .get()
      .then(
        action('getMultiAccountList', (res) => {
          this.list = res.data as AccountInfo[]
        }),
      )
  }
}

export default new Store()
