import { observable } from 'mobx'
import { BaseStore as CommonStore } from '../tabs/base_store'
import moment from 'moment'

export class BaseStore extends CommonStore {
  @observable filter = {
    begin: moment(new Date()).format('YYYY-MM-DD'),
    end: moment(new Date()).format('YYYY-MM-DD'),
    category_id_1: '',
    category_id_2: '',
    text: '',
  }
}
