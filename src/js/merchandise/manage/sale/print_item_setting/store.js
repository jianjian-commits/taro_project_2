import { action, observable } from 'mobx'
import _ from 'lodash'
import { Request } from '@gm-common/request'

class Store {
  @observable treeData = []

  @observable selectedIdList = []

  allIdList = []
  salemenu_id = ''

  @action.bound
  async fetchData(salemenu_id) {
    this.treeData = []

    const { data } = await Request('/station/salemenu/get_pre_print')
      .data({ salemenu_id })
      .get()

    const selectedIdList = []
    const allIdList = []
    const treeData = data.category_list_1.map((category1) => {
      return {
        value: category1.category_id_1,
        text: category1.category_name_1,
        children: category1.category_list_2.map((category2) => {
          return {
            value: category2.category_id_2,
            text: category2.category_name_2,
            children: category2.pinlei_list.map((pinlei) => {
              return {
                value: pinlei.pinlei_id,
                text: pinlei.pinlei_name,
                children: pinlei.sku_list.map((sku) => {
                  // 选中的
                  if (sku.select === 1) {
                    selectedIdList.push(sku.sku_id)
                  }
                  allIdList.push(sku.sku_id)
                  return {
                    value: sku.sku_id,
                    text: sku.sku_name,
                  }
                }),
              }
            }),
          }
        }),
      }
    })

    this.salemenu_id = salemenu_id
    this.treeData = treeData
    this.selectedIdList = selectedIdList
    this.allIdList = allIdList
  }

  @action.bound
  saveData() {
    const selected = this.selectedIdList.slice()
    const req = {
      salemenu_id: this.salemenu_id,
      selected_sku_ids: JSON.stringify(selected),
      unselect_sku_ids: JSON.stringify(
        _.pullAll(this.allIdList.slice(), selected),
      ),
    }

    return Request('/station/salemenu/set_pre_print').data(req).post()
  }

  @action.bound
  onSelected(list) {
    this.selectedIdList = list
  }
}

export default new Store()
