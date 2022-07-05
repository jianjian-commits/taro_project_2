import { i18next } from 'gm-i18n'
import { Price } from '@gmfe/react'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'
import Big from 'big.js'
import { money } from 'common/filter'

const reducers = {}
const initState = {
  ruleTypeMap: {
    FIXED_VALUE: 0,
    VARIATION: 1,
    MULTIPLE: 2,
  },
  ruleDetail: {
    // 锁价对象: 1 sku, 2 二级分类
    rule_object_type: 1,
    viewType: 'view',
    type: 'customer',
    addresses: [],
    skus: [],
    category_2_list: [],
    notUpdate: false, // 导入商品是新开页面，所以从导入页面返回到详情页时不刷新
  },
  tabs: [i18next.t('按锁价规则查看'), i18next.t('按商户商品查看')],
  activeTab: 0,
  /** 已迁移 */
  // targetTypes: [
  //   {
  //     id: 'customer',
  //     name: i18next.t('商户')
  //   },
  //   {
  //     id: 'station',
  //     name: i18next.t('站点')
  //   }
  // ],
  /** 已迁移 */
  // statusArr: [
  //   {
  //     id: '',
  //     name: i18next.t('全部状态')
  //   },
  //   {
  //     id: 2,
  //     name: i18next.t('未开始')
  //   },
  //   {
  //     id: 3,
  //     name: i18next.t('有效')
  //   },
  //   {
  //     id: 1,
  //     name: i18next.t('无效')
  //   },
  //   {
  //     id: 0,
  //     name: i18next.t('关闭')
  //   }
  // ],
  statusMap: {
    2: i18next.t('未开始'),
    3: i18next.t('有效'),
    1: i18next.t('无效'),
    0: i18next.t('关闭'),
  },
  salemenus: [],
  stations: [
    {
      id: '',
      name: i18next.t('全部站点'),
    },
  ],
  // dataTab1: {
  //   filter: {
  //     status: 3,
  //     searchText: '',
  //     stationId: null
  //   },
  //   list: [],
  //   pagination: {
  //     count: 0,
  //     offset: 0,
  //     limit: 10
  //   },
  //   loading: false
  // },
  /** 已迁移 */
  // dataTab2: {
  //   filter: {
  //     type: 'customer',
  //     status: 3,
  //     addressText: '',
  //     skuText: '',
  //     stationId: null
  //   },
  //   list: [],
  //   pagination: {
  //     count: 0,
  //     offset: 0,
  //     limit: 10
  //   },
  //   loading: false
  // },
  searchSpuData: {
    loading: true,
    list: [],
  },
  searchObjectData: {
    loading: true,
    list: [],
  },
  upload: {
    list: [],
    tips: [],
  },

  // detail_sku_list 假分页
  pagination: {
    count: 0,
    offset: 0,
    limit: 20,
  },
  currentPage: 0,
}

reducers.price_rule = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.PRICE_RULE_TAB_CHANGE:
      return Object.assign({}, state, {
        activeTab: action.tab,
      })
    /** 已迁移 */
    // case actionTypes.PRICE_RULE_TAB1_FILTER_CHANGE:
    //   return Object.assign({}, state, {
    //     dataTab1: Object.assign({}, state.dataTab1, {
    //       filter: { ...state.dataTab1.filter, ...action.option }
    //     })
    //   })
    /** 已迁移 */
    // case actionTypes.PRICE_RULE_TAB2_FILTER_CHANGE:
    //   return Object.assign({}, state, {
    //     dataTab2: Object.assign({}, state.dataTab2, {
    //       filter: { ...state.dataTab2.filter, ...action.option }
    //     })
    //   })
    case actionTypes.PRICE_RULE_CLEAR:
      return Object.assign({}, state, {
        activeTab: 0,
      })

    /** 迁移 */
    // case actionTypes.PRICE_RULE_EDIT_CHANGE: {
    //   const dataTab1 = state.dataTab1
    //   const rule = dataTab1.list[action.index]
    //   rule.edit = !rule.edit
    //   rule.edit_begin = rule.begin
    //   rule.edit_end = rule.end
    //   rule.edit_status = rule.status
    //   return Object.assign({}, state, {
    //     dataTab1
    //   })
    // }

    /** 似乎没用到 */
    case actionTypes.PRICE_RULE_EDIT_DATA_CHANGE: {
      const dataTab1 = state.dataTab1
      const rule = dataTab1.list[action.index]
      if (action.begin && action.end) {
        rule.edit_begin = action.begin
        rule.edit_end = action.end
      }
      if (action.status !== undefined) {
        rule.edit_status = action.status
      }
      return Object.assign({}, state, {
        dataTab1,
      })
    }

    /** 迁移 */
    // case actionTypes.PRICE_RULE_EDIT_SAVE: {
    //   const dataTab1 = state.dataTab1
    //   const rule = dataTab1.list[action.index]
    //   rule.edit = false
    //   rule.begin = rule.edit_begin
    //   rule.end = rule.edit_end
    //   rule.status = rule.edit_status
    //   return Object.assign({}, state, {
    //     dataTab1
    //   })
    // }

    case actionTypes.PRICE_RULE_DETAIL_GET: {
      const { viewType } = action
      let ruleDetail = action.data
      let skuLength = 0
      if (ruleDetail.salemenu_fee_type) {
        ruleDetail.fee_type = ruleDetail.salemenu_fee_type
      }

      // 🌡‼️这里是老接口逻辑! yx_price传过来的都是分, 把他转成元!
      if (ruleDetail.rule_object_type === 1) {
        ruleDetail.skus.forEach((sku) => {
          // 产品说： 计算规则为乘时，保留四位小数
          sku.yx_price = money(sku.yx_price, sku.rule_type === 2 ? 4 : 2)
        })
        skuLength = ruleDetail.skus.length
      } else {
        ruleDetail.category_2_list.forEach((item) => {
          // 产品说： 计算规则为乘时，保留四位小数
          item.yx_price = money(item.yx_price, item.rule_type === 2 ? 4 : 2)
        })
      }

      if (viewType === 'copy') {
        ruleDetail = _.pick(
          ruleDetail,
          'type',
          'skus',
          'category_2_list',
          'rule_object_type',
          'addresses',
          'salemenu_id',
          'salemenu_name',
          'fee_type',
        )
      }
      ruleDetail.viewType = viewType

      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, ruleDetail),
        pagination: Object.assign({}, state.pagination, { count: skuLength }),
      })
    }

    case actionTypes.PRICE_RULE_DETAIL_CLEAR: {
      return Object.assign({}, state, {
        ruleDetail: {
          viewType: 'view',
          type: 'customer',
          addresses: [],
          skus: [],
          category_2_list: [],
          notUpdate: false,
        },
      })
    }

    case actionTypes.PRICE_RULE_SALEMENUS_GET:
      action.data.unshift({
        salemenu_id: '',
        name: i18next.t('--请选择--'),
      })

      return Object.assign({}, state, {
        salemenus: action.data,
      })
    case actionTypes.PRICE_RULE_STATIONS_GET: {
      const stations = action.data || []
      stations.unshift({
        id: '',
        name: i18next.t('全部站点'),
      })

      return Object.assign({}, state, {
        stations,
      })
    }

    case actionTypes.PRICE_RULE_CREATER_HIDE:
      return Object.assign({}, state, {
        createrShow: false,
      })
    /** 已迁移 */
    // case actionTypes.PRICE_RULE_SEARCH_BY_RULE_LOADDING_TOGGLE:
    //   return Object.assign({}, state, {
    //     dataTab1: Object.assign({}, state.dataTab1, {
    //       loading: !state.dataTab1.loading
    //     })
    //   })
    /** 已迁移 */
    // case actionTypes.PRICE_RULE_SEARCH_BY_RULE_GOT:
    //   return Object.assign({}, state, {
    //     dataTab1: Object.assign({}, state.dataTab1, action.data, {
    //       loading: false
    //     })
    //   })
    /** 已迁移 */
    // case actionTypes.PRICE_RULE_SKUVIEW_RULETYPE_CHANGE:
    //   return Object.assign({}, state, {
    //     dataTab2: Object.assign({}, state.dataTab2, {
    //       filter: { ...state.dataTab2.filter, type: action.targetType },
    //       list: [],
    //       pagination: {
    //         count: 0,
    //         offset: 0,
    //         limit: 10
    //       }
    //     })
    //   })
    /** loading 已迁移 */
    // case actionTypes.PRICE_RULE_SEARCH_BY_SKU_LOADDING_TOGGLE:
    //   return Object.assign({}, state, {
    //     dataTab2: Object.assign({}, state.dataTab2, {
    //       loading: !state.dataTab2.loading
    //     })
    //   })
    /**
     *  获取sku列表，已迁移
     * dataTab2: {
     *  list,
     *  pagination,
     *  loading
     * }
     */
    // case actionTypes.PRICE_RULE_SEARCH_BY_SKU_GOT:
    //   return Object.assign({}, state, {
    //     dataTab2: Object.assign({}, state.dataTab2, action.data, {
    //       loading: false
    //     })
    //   })

    case actionTypes.PRICE_RULE_CREATER_SHOW:
      return Object.assign({}, state, {
        createrShow: true,
        ruleDetail: {
          viewType: 'view',
          type: 'customer',
          addresses: [],
          skus: [],
          notUpdate: false,
        },
      })

    case actionTypes.PRICE_RULE_DETAIL_SKU_CLEAR:
      return Object.assign({}, state, {
        ruleDetail: {
          ...state.ruleDetail,
          skus: [],
        },
      })

    case actionTypes.PRICE_RULE_PRE_CREATE:
      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, state.ruleDetail, action.data),
      })

    case actionTypes.PRICE_RULE_OBJECT_ADD: {
      let addresses = []

      // 是否已经在列表中
      const address = _.find(state.ruleDetail.addresses, (s) => {
        return s.id === action.data.id
      })

      if (address) {
        return state
      } else {
        addresses = [
          {
            id: action.data.id,
            name: action.data.resname,
          },
          ...state.ruleDetail.addresses,
        ]
      }

      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, state.ruleDetail, {
          addresses,
        }),
      })
    }

    case actionTypes.PRICE_RULE_SKU_ADD: {
      let skus = []

      const sku = _.find(state.ruleDetail.skus, (s) => s.id === action.data.id)

      if (sku) {
        return state
      } else {
        action.data.rule_type = 0
        skus = [action.data, ...state.ruleDetail.skus]
      }

      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, state.ruleDetail, {
          skus,
        }),
        pagination: Object.assign({}, state.pagination, { count: skus.length }),
      })
    }

    case actionTypes.PRICE_RULE_OBJECT_DEL: {
      const addresses = [...state.ruleDetail.addresses]
      addresses.splice(action.index, 1)

      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, state.ruleDetail, {
          addresses,
        }),
      })
    }

    case actionTypes.PRICE_RULE_SKU_DEL: {
      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, state.ruleDetail, {
          skus: action.skus,
        }),
        pagination: Object.assign({}, state.pagination, {
          count: action.skus.length,
        }),
        currentPage: action.currentPage,
      })
    }

    case actionTypes.PRICE_RULE_SKU_SEARCH_LOADING:
      return Object.assign({}, state, {
        searchSpuData: Object.assign({}, state.searchSpuData, {
          list: [],
          loading: true,
        }),
      })

    case actionTypes.PRICE_RULE_SKU_SEARCH_ERROR:
      return Object.assign({}, state, {
        searchSpuData: Object.assign({}, state.searchSpuData, {
          list: [],
          loading: false,
        }),
      })

    case actionTypes.PRICE_RULE_SKU_SEARCH_GET: {
      const list = action.data.map((sku) => {
        const pro = _.find(state.ruleDetail.skus, (s) => {
          return sku.id === s.id
        })
        return {
          ...sku,
          spec:
            sku.sale_ratio +
            sku.std_unit_name_forsale +
            '/' +
            sku.sale_unit_name,
          cost: !sku.sku_cost
            ? '-'
            : sku.sku_cost +
              Price.getUnit(sku.fee_type) +
              '/' +
              sku.sale_unit_name,
          original_cost:
            sku.sale_price +
            Price.getUnit(sku.fee_type) +
            '/' +
            sku.sale_unit_name,
          std_unit_name_forsale: sku.std_unit_name_forsale,
          yx_price: (pro && pro.yx_price) || '',
          yx_price_temp: '',
        }
      })

      return Object.assign({}, state, {
        searchSpuData: Object.assign({}, state.searchSpuData, {
          list,
          loading: false,
        }),
      })
    }

    case actionTypes.PRICE_RULE_SHEET_PRICE_CHANGE: {
      const skus = [...state.ruleDetail.skus]

      skus[action.index].yx_price = action.yx_price

      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, state.ruleDetail, {
          skus,
        }),
      })
    }

    case actionTypes.PRICE_RULE_SHEET_RULE_AND_PRICE_CHANGE: {
      const skus = [...state.ruleDetail.skus]

      skus[action.index] = {
        ...skus[action.index],
        ...action.modifyObj,
      }

      return Object.assign({}, state, {
        ruleDetail: Object.assign({}, state.ruleDetail, {
          skus,
        }),
      })
    }

    case actionTypes.PRICE_RULE_OBJECT_SEARCH_LOADING:
      return Object.assign({}, state, {
        searchObjectData: Object.assign({}, state.searchObjectData, {
          loading: true,
          list: [],
        }),
      })

    case actionTypes.PRICE_RULE_OBJECT_SEARCH_ERROR:
      return Object.assign({}, state, {
        searchObjectData: Object.assign({}, state.searchObjectData, {
          loading: false,
          list: [],
        }),
      })

    case actionTypes.PRICE_RULE_OBJECT_SEARCH_GET: {
      const data = action.data || []
      const list = data.map((obj) => {
        return {
          id: obj._id || obj.address_id + '', // 锁价列表中id为字符串
          resname: obj.resname || obj.name,
        }
      })

      return Object.assign({}, state, {
        searchObjectData: Object.assign({}, state.searchObjectData, {
          loading: false,
          list,
        }),
      })
    }

    case actionTypes.PRICE_RULE_OBJECT_INPUT_CLEAR: {
      return Object.assign({}, state, {
        searchObjectData: {
          loading: false,
          list: [],
        },
      })
    }

    case actionTypes.PRICE_RULE_SKU_INPUT_CLEAR: {
      return Object.assign({}, state, {
        searchSpuData: {
          loading: false,
          list: [],
        },
      })
    }
    case actionTypes.PRICE_RULE_UPLOAD: {
      const { upload_type, data } = action
      const tips = []
      let gridList = []

      const addressSalemenuErrMsg = i18next.t('（不属于该报价单）')
      const addressDelErMsg = i18next.t('（已被删除）')
      const addressFrezzErrMsg = i18next.t('（商户已被冻结）')

      if (upload_type === 'sku') {
        gridList = data.map(function (sku) {
          const { fixed_value, multiple, variation } = sku.price_rule
          sku.price_rule = {
            fixed_value: _.isNumber(fixed_value)
              ? parseFloat(Big(fixed_value).toFixed(2))
              : '',
            multiple: _.isNumber(multiple)
              ? parseFloat(Big(multiple).toFixed(4))
              : '',
            variation: _.isNumber(variation)
              ? parseFloat(Big(variation).toFixed(2))
              : '',
          }
          sku.guige = [
            sku.sale_ratio,
            sku.std_unit_name_forsale,
            '/',
            sku.sale_unit_name,
          ].join('')
          sku.chengben = sku.sku_cost
          sku.yuanjia = sku.sale_price
          // 销售状态
          sku.state = sku.check_data.status

          return sku
        })
      } else if (upload_type === 'customer') {
        gridList = data.map(function (address, index) {
          const check_data = address.check_data
          if (!check_data.in_salemenu) {
            tips.push({
              index: index,
              id: address.id,
              msg: addressSalemenuErrMsg,
              field: 'id',
            })
          } else if (check_data.status !== 0) {
            // status: 0有效，-99删除，1冻结
            const errMsg =
              check_data.status === -99 ? addressDelErMsg : addressFrezzErrMsg

            tips.push({
              index: index,
              msg: errMsg,
              id: address.id,
              field: 'id',
            })
          }

          return address
        })
      }

      return Object.assign({}, state, {
        upload: {
          list: gridList,
          tips: tips,
        },
      })
    }

    case actionTypes.PRICE_RULE_DETAIL_UPLOAD_SKU_CHANGE: {
      const list = [...state.upload.list]
      Object.assign(list[action.index].price_rule, action.options)

      return Object.assign({}, state, {
        upload: Object.assign({}, state.upload, {
          list,
        }),
      })
    }

    case actionTypes.PRICE_RULE_DETAIL_UPLOAD_SKU_SELECT: {
      const { list } = state.upload
      Object.assign(list[action.index], action.selected, {
        check_data: {
          in_salemenu: 1,
          status: 1,
        },
      })

      return Object.assign({}, state, {
        upload: Object.assign({}, state.upload, {
          list,
        }),
      })
    }

    case actionTypes.PRICE_RULE_DETAIL_UPLOAD_SKU_DEL: {
      const list = [...state.upload.list]
      list.splice(action.index, 1) // 删除list中的sku

      // 删除对应的tips
      const tips = _.reject(
        state.upload.tips,
        (tip) => tip.index === action.index,
      )
      _.each(tips, (tip) => {
        if (tip.index >= action.index) {
          tip.index--
        }
      })

      return Object.assign({}, state, {
        upload: Object.assign({}, state.upload, {
          list,
          tips,
        }),
      })
    }

    case actionTypes.PRICE_RULE_UPLOAD_CLEAR: {
      return Object.assign({}, state, {
        upload: {
          list: [],
          tips: [],
          upload_type: null,
        },
      })
    }

    case actionTypes.PRICE_RULE_UPDATE_DETAIL_LIST: {
      const { list, listType } = action
      const { ruleDetail } = state
      let pagination = state.pagination

      if (listType === 'sku') {
        _.each(list, (sku) => {
          const ruleObj = _.pickBy(sku.price_rule, (value) => value !== '')
          const key = _.keys(ruleObj)[0]
          sku.yx_price = sku.price_rule[key]
          sku.rule_type = state.ruleTypeMap[key.toUpperCase()]
        })
        ruleDetail.skus = list

        pagination = Object.assign({}, pagination, { count: list.length })
      } else if (listType === 'customer') {
        ruleDetail.addresses = list
      }

      return Object.assign({}, state, {
        ruleDetail,
        pagination,
        upload: {
          tips: [],
          list: [],
          upload_type: null,
        },
      })
    }

    case actionTypes.PRICE_RULE_SHEET_PAGE_CHANGE: {
      const pagination = Object.assign({}, state.pagination, action.data)
      const offset = pagination.offset
      const limit = pagination.limit
      const currentPage = +(offset / limit)

      return Object.assign({}, state, {
        currentPage,
        pagination,
      })
    }

    case actionTypes.PRICE_RULE_SKU_PAGINATION_CLEAR: {
      return Object.assign({}, state, {
        currentPage: 0,
        pagination: {
          count: 0,
          offset: 0,
          limit: 20,
        },
      })
    }

    case actionTypes.PRICE_RULE_SET_RULE_OBJECT_TYPE: {
      return Object.assign({}, state, {
        ruleDetail: {
          ...state.ruleDetail,
          rule_object_type: action.ruleObjectType,
        },
      })
    }

    case actionTypes.PRICE_RULE_DETAIL_NOT_UPDATE: {
      return Object.assign({}, state, {
        ruleDetail: {
          ...state.ruleDetail,
          notUpdate: action.notUpdate,
        },
      })
    }

    default:
      return state
  }
}
mapReducers(reducers)
