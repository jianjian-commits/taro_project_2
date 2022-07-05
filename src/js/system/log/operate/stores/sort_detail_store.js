import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { generateUIList } from '../common/utils'
class SortDetailStore {
  @observable list = []

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable title = {}

  @observable isLoading = false

  // 加入采购规格信息
  getTitleText = (data, list) => {
    const { modify } = data
    const op_after = _.filter(modify, function (item, key) {
      return key !== 'belong_cat' && key !== 'category1_icon'
    })[0]
    const firstText = op_after.before || op_after.after
    return firstText
  }

  @action.bound
  getLogDetail(id) {
    this.isLoading = true
    Request('/station/op_log/get')
      .data({ id })
      .get()
      .then(
        action('getDetail', (json) => {
          const data = json.data
          const { op_type, log_type, modify, cat_type } = data
          if (cat_type === 1) {
            modify.belong_cat = {}
          }
          switch (op_type) {
            case 1:
              modify.detail_cat_type = { before: '', after: cat_type }
              break
            case 2:
              modify.detail_cat_type = { before: cat_type, after: cat_type }
              break
            case 3:
              modify.detail_cat_type = { before: cat_type, after: '' }
              break
          }
          const list = generateUIList({ modifyObj: modify, log_type })
          const firstText = this.getTitleText(data, list)
          this.isLoading = false
          this.list = list
          this.title = {
            firstText: firstText,
            create_time: moment(data.create_time).format('YYYY-MM-DD HH:mm:ss'),
            op_user: data.op_user,
            log_type: log_type,
            op_source: data.op_source === 1 ? '单条操作' : '批量操作',
          }
        }),
      )
      .catch((e) => {
        this.isLoading = false
        console.log(e)
      })
  }
}

export default new SortDetailStore()
