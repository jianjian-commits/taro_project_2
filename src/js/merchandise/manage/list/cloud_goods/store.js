import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { System } from '../../../../common/service'

const initFilter = {
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  query: '',
  // 分类 为 true, pinlei 也是 true
  createFenLeiChecked: true,
  createPinLeiChecked: true,
  createSkuChecked: false,
  sale_menu_selected: [],
  confirmCategory: {
    // 不支持多选
    category1: null,
    category2: null,
    pinlei: null,
  },
}

const initSpuList = {
  list: [],
  isSelectAllPage: false,
  selected: [],
  pagination: {
    count: 0,
    offset: 0,
    limit: 10,
  },
}
const initSaleMenuList = []

const initErrorList = {
  list: [],
  pagination: {
    count: 0,
    offset: 0,
    limit: 10,
  },
}

class TemplateStore {
  constructor() {
    this.doFirstRequest = _.noop()
  }

  @observable loading = true

  @observable filter = {
    ...initFilter,
  }

  @observable spuList = {
    ...initSpuList,
  }

  @observable errorList = {
    ...initErrorList,
  }

  @observable saleMenuList = initSaleMenuList

  @action
  tempalteListClear() {
    this.spuList = {
      ...initSpuList,
    }
    this.filter = {
      ...initFilter,
    }
    this.saleMenuList = initSaleMenuList

    this.loading = true
  }

  @action
  errorListClear() {
    this.errorList = {
      ...initErrorList,
    }
    this.loading = true
  }

  @action
  confirmCategoryClear() {
    this.filter.confirmCategory = {
      category1: null,
      category2: null,
      pinlei: null,
    }
  }

  @action
  saleMenuClear() {
    this.filter.sale_menu_selected = []
  }

  @action
  removeSelectData() {
    this.spuList.selected = []
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value

    if (field === 'createFenLeiChecked') {
      this.filter.createPinLeiChecked = value
      this.filter.confirmCategory = {
        category1: null,
        category2: null,
        pinlei: null,
      }
    }
  }

  @action
  toggleSelectAll(isSelectedAll) {
    if (isSelectedAll) {
      this.spuList.selected = _.map(this.spuList.list, (v) => v.id)
    } else {
      this.spuList.selected.clear()
    }
  }

  @action
  saleMenuSelect(selected) {
    this.filter.sale_menu_selected = selected
  }

  @action
  fetchSaleMenuList() {
    const query = {
      type: 4,
      is_active: 1,
    }

    return Request('/salemenu/list')
      .data(query)
      .get()
      .then((json) => {
        runInAction(() => {
          this.saleMenuList = json.data
        })
      })
  }

  @action
  fetchSpuList(pagination = {}) {
    const { categoryFilter, query } = this.filter
    const { isSelectAllPage } = this.spuList
    const paginationParams = {
      ...pagination,
    }
    paginationParams.page_obj = pagination.page_obj
      ? JSON.stringify(pagination.page_obj)
      : null

    return Request('/merchandise/template/spu/list')
      .data({
        category1_ids: JSON.stringify(
          _.map(categoryFilter.category1_ids, (v) => v.id)
        ),
        category2_ids: JSON.stringify(
          _.map(categoryFilter.category2_ids, (v) => v.id)
        ),
        pinlei_ids: JSON.stringify(
          _.map(categoryFilter.pinlei_ids, (v) => v.id)
        ),
        ...paginationParams,
        q: query,
        count: 1,
      })
      .get()
      .then((json) => {
        runInAction(() => {
          this.spuList.pagination = json.pagination
          this.spuList.list = json.data
          this.loading = false
          if (isSelectAllPage) {
            this.spuList.selected = _.map(json.data, (v) => v.id)
          }
        })
        return json
      })
  }

  @action
  fetchImportErrorList(id, pagination = {}) {
    const paginationParams = {
      ...pagination,
    }
    paginationParams.page_obj = pagination.page_obj
      ? JSON.stringify(pagination.page_obj)
      : null
    if (System.isC()) paginationParams.is_retail_interface = 1

    return Request(`/merchandise/spu/task/import_by_template?task_id=${id}`)
      .data(paginationParams)
      .get()
      .then((json) => {
        runInAction(() => {
          this.errorList.list = json.data
          this.errorList.pagination = json.pagination
          this.loading = false
        })
        return json
      })
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  getSelectedSaleMenuIds() {
    const { sale_menu_selected } = this.filter

    return sale_menu_selected.map((v) => v.id)
  }

  getParams() {
    const {
      filter: {
        createFenLeiChecked,
        confirmCategory,
        categoryFilter,
        createPinLeiChecked,
        query,
        createSkuChecked,
      },
      spuList: { isSelectAllPage, selected },
    } = this
    const { category1, category2, pinlei } = confirmCategory

    const salemenu_ids = this.getSelectedSaleMenuIds()

    const commonParams = {
      auto_create_category1: +createFenLeiChecked,
      auto_create_category2: +createFenLeiChecked,
      auto_create_pinlei: +createPinLeiChecked,
      target_category1_id: createFenLeiChecked ? null : category1.id,
      target_category2_id: createFenLeiChecked ? null : category2.id,
      target_pinlei_id: !createPinLeiChecked ? pinlei.id : null,
      auto_create_sku: +createSkuChecked,
      salemenu_ids: createSkuChecked ? JSON.stringify(salemenu_ids) : null,
    }

    const params = isSelectAllPage
      ? {
          category1_ids: JSON.stringify(
            _.map(categoryFilter.category1_ids, (v) => v.id)
          ),
          category2_ids: JSON.stringify(
            _.map(categoryFilter.category2_ids, (v) => v.id)
          ),
          pinlei_ids: JSON.stringify(
            _.map(categoryFilter.pinlei_ids, (v) => v.id)
          ),
          q: query,
        }
      : {
          spu_ids: JSON.stringify(selected),
        }

    return {
      ...commonParams,
      ...params,
    }
  }

  importByTemplate() {
    const params = this.getParams()
    if (System.isC()) params.is_retail_interface = 1

    return Request(`/merchandise/spu/import_by_template`).data(params).post()
  }

  @action
  toggleIsSelectAllPage(bool) {
    this.spuList.isSelectAllPage = bool
    if (bool) {
      this.spuList.selected = _.map(this.spuList.list, (v) => v.id)
    }
  }

  @action
  select(selected) {
    if (
      this.spuList.isSelectAllPage &&
      selected.length !== this.spuList.list.length
    ) {
      this.spuList.isSelectAllPage = false
    }

    this.spuList.selected = selected
  }
}

export default new TemplateStore()
