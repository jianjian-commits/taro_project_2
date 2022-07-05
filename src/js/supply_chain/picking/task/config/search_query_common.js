import { searchDateTypes } from 'common/enum'
import moment from 'moment'

const begin = moment().startOf('day')
const end = moment().endOf('day')

export default {
  dateType: searchDateTypes.ORDER.type,
  begin,
  end,
  time_config_id: '',
  // 订单号、商户
  search_text: '',
  customized_field: {},
  detail_customized_field: {},
}
