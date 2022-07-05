import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'

const reducers = {}
const initDetailStat = {
  spuDetail: {
    imgUrlList: [],
  },
  skuDetail: {
    ingredients: [{ name: '请选择物料', attrition_rate: 0 }],
    imgUrlList: [],
    clean_food_info: {}, // 净菜信息
  }, // sku信息
  spuCreate: null, // 当前create spu id
  spuUpdate: null,
  spuCategory: [],
  spuList: [],
  spuImg: {},
  spuDelete: {},
  skuList: [],
  saleList: [],
  supplyList: [],
  skuSelected: '',
  ingredientList: [],
}
reducers.merchandiseDetail = (state = initDetailStat, action) => {
  switch (action.type) {
    case actionTypes.MERCHANDISE_LIST_SPU_DETAIL:
      const { images, ...rest } = action.data
      return {
        ...state,
        spuCreate: action.data.id,
        spuDetail: {
          ...rest,
          imgUrlList: images,
        },
      }
    case actionTypes.MERCHANDISE_SPU_CATEGORY:
      return Object.assign({}, state, {
        spuCategory: action.data,
      })
    case actionTypes.MERCHANDISE_LIST_SPU_LIST:
      return Object.assign({}, state, {
        spuList: action.data,
      })
    case actionTypes.MERCHANDISE_LIST_SPU_DETAIL_INIT:
      return Object.assign({}, state, {
        spuDetail: {},
        spuImg: {},
        spuCreate: null,
      })
    case actionTypes.MERCHANDISE_LIST_SPU_DETAIL_CHANGE: {
      const spuDetail = state.spuDetail
      spuDetail[action.name] = action.value
      return Object.assign({}, state, {
        spuDetail,
      })
    }
    case actionTypes.MERCHANDISE_LIST_SPU_UPDATE:
      return Object.assign({}, state, {
        spuUpdate: action.data,
      })
    case actionTypes.MERCHANDISE_LIST_SPU_CREATE:
      return Object.assign({}, state, {
        spuCreate: action.data,
      })
    case actionTypes.MERCHANDISE_SPU_DELETE:
      return Object.assign({}, state, {
        spuDelete: action.data,
      })
    // 上传spu图片
    case actionTypes.MERCHANDISE_SPU_IMG_UPLOAD: {
      const spuImg = Object.assign({}, state.spuImg)
      const spuDetail = { ...state.spuDetail }
      spuImg[action.what] = action.data
      const imgUrlList = [...spuDetail.imgUrlList]
      const logo = spuImg.logo || []
      const imgUrl = logo.image_url
      if (action.what === 'logo') {
        if (imgUrlList[action.index]) {
          imgUrlList[action.index] = imgUrl
        } else if (imgUrlList.length < 5) {
          imgUrlList.push(imgUrl)
        }
      }
      return {
        ...state,
        spuImg,
        spuDetail: {
          ...spuDetail,
          imgUrlList,
        },
      }
    }
    // 删除SPU中的图片
    case actionTypes.MERCHANDISE_SPU_DELETE_IMAGE: {
      const { spuDetail } = state

      return {
        ...state,
        spuDetail: {
          ...spuDetail,
          imgUrlList: _.filter(spuDetail.imgUrlList, (value, index) => {
            return index !== action.index
          }),
        },
      }
    }
    // 把spu中的图片同步到sku中
    case actionTypes.MERCHANDISE_SPU_SYNC_IMG_TO_SKU: {
      const { skuList } = state
      // 获取更新后的图片
      const newImages = _.values(action.data)[0]

      // 更新skuDetail、skuList中的图片
      return {
        ...state,
        skuList: _.map(skuList, (sku) => ({
          ...sku,
          imgUrlList: newImages.slice(),
        })),
        skuDetail: {
          ...state.skuDetail,
          imgUrlList: newImages.slice(),
        },
      }
    }
    // 删除SKU中的图片
    case actionTypes.MERCHANDISE_SKU_DELETE_IMAGE: {
      const { skuDetail } = state

      return {
        ...state,
        skuDetail: {
          ...skuDetail,
          imgUrlList: _.filter(skuDetail.imgUrlList, (value, index) => {
            return index !== action.index
          }),
        },
      }
    }
    // 获取SKU列表
    // 修改skuList
    case actionTypes.MERCHANDISE_SKU_COMMON_SKU_LIST: {
      const skuList = _.map(action.skuList, (sku) => {
        const { img_url, ...rest } = sku
        // 后端传的字段img_url，是个数组，为了代码可读性，前端统一用imgUrlList代替
        return {
          ...rest,
          imgUrlList: img_url,
        }
      })

      return Object.assign({}, state, {
        skuList,
      })
    }
    // 报价单列表
    case actionTypes.MERCHANDISE_SKU_COMMON_SALE_LIST: {
      const skuDetail = Object.assign({}, state.skuDetail)
      const saleList = action.saleList
      if (saleList.length) {
        const targetSalemenu = _.find(saleList, (salemenu) => {
          return salemenu.id === skuDetail
        })
        // 如果找到是已经建立的skuDetail
        if (targetSalemenu) {
          skuDetail.salemenu_id = targetSalemenu.id
        } else {
          // 否则为新建的skuDetail
          skuDetail.salemenu_id = saleList[0].id
        }
      }
      return Object.assign({}, state, { saleList, skuDetail })
    }
    // 获取采购来源
    case actionTypes.MERCHANDISE_SKU_COMMON_SUPPLY_LIST: {
      return Object.assign({}, state, { supplyList: action.supplyList })
    }
    // 修改skuDetail
    case actionTypes.MERCHANDISE_SKU_COMMON_CHANGE_SKU_INFO: {
      const skuDetail = Object.assign({}, state.skuDetail, action.changeData)
      const skuSelected = skuDetail.sku_id
      // skuDetail不为空
      if (skuDetail.supply_sku || skuDetail.supply_sku === '') {
        const targetSupply = _.find(state.supplyList, (supply) => {
          return supply.sku_id === skuDetail.supply_sku
        })

        // 新建采购来源id为''
        if (
          targetSupply &&
          (action.changeData.supply_sku || action.changeData.supply_sku === '')
        ) {
          // supplyDetail = targetSupply;

          // 如果是新建采购来源，名字默认skuDetail的名字
          if (action.changeData.supply_sku === '') {
            // const copySupply = Object.assign({}, supplyDetail);
            // copySupply.sku_name = skuDetail.sku_name;
            // supplyDetail = copySupply;
          }
        }
      }

      if (action.changeData.supply_sku && action.changeData.supply_sku === '') {
        // supplyDetail.sku_name = skuDetail.sku_name;
      }

      return Object.assign({}, state, { skuDetail, skuSelected })
    }
    // 修改净菜类信息 skuDetail.clean_food_info
    case actionTypes.MERCHANDISE_SKU_CHANGE_CLEAN_FOOD_INFO: {
      return {
        ...state,
        skuDetail: {
          ...state.skuDetail,
          clean_food_info: {
            ...state.skuDetail.clean_food_info,
            ...action.changeData,
          },
        },
        skuSelected: state.skuDetail.sku_id,
      }
    }
    // 上传图片，包括sku图片和采购来源图片
    case actionTypes.MERCHANDISE_SKU_COMMON_IMG_UPLOAD: {
      const skuDetail = Object.assign({}, state.skuDetail)
      // 进行浅拷贝
      const imgUrlList = [...skuDetail.imgUrlList]
      if (action.what === 'logo') {
        // 有图时，修改图片信息，无图时，新建
        if (imgUrlList[action.index]) {
          imgUrlList[action.index] = action.data.image_url
        } else if (imgUrlList.length < 5) {
          imgUrlList.push(action.data.image_url)
        }
      } else if (action.what === 'source') {
        // supplyDetail.img_url = action.data.image_url;
        // supplyDetail.image = action.data.img_path_id;
      }
      return {
        ...state,
        skuDetail: {
          ...skuDetail,
          imgUrlList,
        },
      }
    }
    // 按钮显示SKU选择
    // 根据按钮选择的sku_id, 修改要显示的skuDetail
    case actionTypes.MERCHANDISE_SKU_COMMON_SKU_SELECTED: {
      const skuSelected = action.skuId
      const skuDetail = _.find(
        state.skuList,
        (sku) => sku.sku_id === skuSelected
      )

      if (!skuDetail) {
        Tip.warning(i18next.t('没有找到对应的销售规格，请刷新后重试'))
        return
      }

      return Object.assign({}, state, { skuSelected, skuDetail })
    }
    // 更新sku
    case actionTypes.MERCHANDISE_SKU_COMMON_SKU_UPDATE: {
      const supplyList = state.supplyList.slice()
      const skuList = state.skuList.slice()

      const changingSale = _.find(skuList, (sku) => {
        return sku.sku_id === action.updateInfo.sku_id
      })
      Object.assign(changingSale, action.updateInfo)
      return Object.assign({}, state, { supplyList, skuList })
    }
    // 创建报价单
    case actionTypes.MERCHANDISE_SKU_COMMON_SALE_SKU_CREATE: {
      const skuDetail = Object.assign({}, state.skuDetail, {
        ...action.saleSku,
      })
      const salemenu = _.find(
        state.saleList,
        (sale) => sale.id === skuDetail.salemenu_id
      )
      skuDetail.salemenu_name = salemenu.name
      skuDetail.isNew = false
      const skuList = state.skuList.slice()
      skuList.push(skuDetail)
      const skuSelected = skuDetail.sku_id
      return Object.assign({}, state, { skuDetail, skuList, skuSelected })
    }
    case actionTypes.MERCHANDISE_SKU_COMMON_RESET_STORE:
      return Object.assign({}, state, {
        sourceImg: {},
        skuSelected: '',
        skuList: [],
        skuLoading: true,

        skuDetail: {
          ingredients: [{ name: '请选择物料', attrition_rate: 0 }],
          imgUrlList: [],
          clean_food_info: {},
        }, // sku信息
        saleList: [], // 报价单列表
        supplyList: [], // 采购来源
      })
    // 删除sku
    // skuList 要删除该sku
    // skuSelected 默认选择第一个
    // skuDetail 修改为第一个的详情
    // supplyDetail 修改为skuDetail的来源详情
    case actionTypes.MERCHANDISE_SKU_COMMON_SKU_DELETE: {
      // 删除sku
      // const supplyList = state.supplyList.slice();
      const deleteSkuId = action.deleteSkuId
      const skuList = state.skuList.slice()
      const newSkuList = _.filter(skuList, (sku) => sku.sku_id !== deleteSkuId)
      // 删除sku后根据sku剩下的长度处理skuSelected, skuDetail, supplyDetail
      let skuSelected = state.skuSelected
      let skuDetail = state.skuDetail
      // supplyDetail = state.supplyDetail;
      if (newSkuList.length) {
        // skuSelected 处理
        skuSelected = newSkuList[0].sku_id
        // skuDetail
        skuDetail = Object.assign({}, state.skuDetail, newSkuList[0])
        // supplyDetail
        // const newSupplyDetail = _.find(supplyList, supply => supply.sku_id === skuDetail.supply_sku);
        // supplyDetail = Object.assign({}, state.supplyDetail, newSupplyDetail);
      } else {
        // 如果没有sku了，则skuDetail为空
        skuDetail = {}
      }
      return Object.assign({}, state, {
        skuList: newSkuList,
        skuSelected,
        skuDetail,
      })
    }
    // 获取物料商品列表
    case actionTypes.MERCHANDISE_COMMON_GET_INGREDIENT_LIST: {
      return Object.assign({}, state, { ingredientList: action.data })
    }

    default:
      return state
  }
}
mapReducers(reducers)
