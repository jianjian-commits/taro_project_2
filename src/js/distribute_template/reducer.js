import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action_types'
import _ from 'lodash'
import { defaultTemplateConfig, printSizeMap } from './util'
import globalStore from '../stores/global'

const reducers = {}

const getProductFieldGroup = () => {
  let field = [
    [
      { text: i18next.t('序号'), field: '_index', width: 'auto' },
      { text: i18next.t('商品ID'), field: 'id', width: 50 },
      { text: i18next.t('商品名'), field: 'name', width: '*' },
      { text: i18next.t('类别'), field: 'category_title_1', width: 'auto' },
      {
        text: i18next.t('商品二级分类'),
        field: 'category_title_2',
        width: 'auto',
      },
      { text: i18next.t('商品品类'), field: 'pinlei_title', width: 'auto' },
      { text: i18next.t('SPU名称'), field: 'spu_name', width: 'auto' },
      { text: i18next.t('规格'), field: 'specs', width: 42 },
      { text: i18next.t('下单数'), field: 'quantity', width: 'auto' },
      {
        text: i18next.t('出库数(基本单位)'),
        field: 'real_weight_std',
        width: 'auto',
      },
      {
        text: i18next.t('出库数(销售单位)'),
        field: 'real_weight_sale',
        width: 'auto',
      },
      globalStore.hasViewTaxRate()
        ? {
            text: i18next.t('不含税单价'),
            field: 'sale_price_without_tax',
            width: 50,
          }
        : null,
      {
        text: i18next.t('单价（基本单位）'),
        field: 'std_sale_price',
        width: 42,
      },
      { text: i18next.t('单价（销售单位）'), field: 'sale_price', width: 42 },
      // {text: '原单价', field: "origin_item_price", "width": 'auto'},
      globalStore.hasViewTaxRate()
        ? { text: i18next.t('税率'), field: 'tax_rate', width: 'auto' }
        : null,
      globalStore.hasViewTaxRate()
        ? { text: i18next.t('商品税额'), field: 'tax', width: 'auto' }
        : null,
      globalStore.hasViewTaxRate()
        ? {
            text: i18next.t('应付金额（不含税）'),
            field: 'real_item_price_without_tax',
            width: 50,
          }
        : null,
      { text: i18next.t('应付金额'), field: 'real_item_price', width: 50 },
      { text: i18next.t('自定义编码'), field: 'outer_id', width: 'auto' },
      { text: i18next.t('商品描述'), field: 'desc', width: 'auto' },
      { text: i18next.t('备注'), field: 'remark', width: 'auto' },
      { text: i18next.t('自定义1'), field: '_extra1', width: 'auto' },
      { text: i18next.t('自定义2'), field: '_extra2', width: 'auto' },
      { text: i18next.t('自定义3'), field: '_extra3', width: 'auto' },
    ],
    [
      { text: i18next.t('分类数量'), field: 'category_number' },
      { text: i18next.t('分类金额小计'), field: 'category_total' },
      { text: i18next.t('异常明细'), field: 'abnormals_detail' },
    ],
  ]
  field = _.map(field, (arr) => {
    return _.filter(arr, (v) => !!v)
  })

  return field
}

const initState = {
  printSizeList: Object.keys(printSizeMap),
  defaultTemplateConfig: defaultTemplateConfig,
  templateConfigList: [],
  defaultFieldConfig: {
    fontSize: 10,
    width: '',
    height: '',
    bold: false,
    alignment: 'left',
    sortNo: '',
    capital: false,
  },

  templateConfigLoading: true,
  templateConfig: defaultTemplateConfig,

  fieldAddTargetPath: [], // [blcok, lineNo, columnNo]
  fieldAddDirection: 'forward', // forward、back

  fieldGroupAddDialogShow: false,
  fieldGroup: [],

  infoFieldGroup: [
    [
      { text: i18next.t('下单日期'), field: 'date_time' },
      { text: i18next.t('配送时间'), field: 'receive_time' },
      { text: i18next.t('打印时间'), field: 'print_time' },
      { text: i18next.t('订单号'), field: 'id_PL' },
      { text: i18next.t('流转单号'), field: 'id_LK' },
      { text: i18next.t('序号'), field: 'sort_id' },
      { text: i18next.t('订单备注'), field: 'remark' },
    ],
    [
      { text: i18next.t('收货商户'), field: 'resname' },
      { text: i18next.t('收货人'), field: 'receiver_name' },
      { text: i18next.t('联系电话'), field: 'receiver_phone' },
      { text: i18next.t('收货地址'), field: 'address' },
      { text: i18next.t('地理标签'), field: 'area_sign' },
      { text: i18next.t('商户公司'), field: 'cname' },
      { text: i18next.t('承运商'), field: 'carrier' },
      { text: i18next.t('司机名称'), field: 'driver_name' },
      { text: i18next.t('司机电话'), field: 'driver_phone' },
      { text: i18next.t('结款方式'), field: 'settle_way' },
      { text: i18next.t('销售经理'), field: 'sale_employee' },
      { text: i18next.t('销售经理电话'), field: 'sale_employee_phone' },
    ],
    [
      { text: i18next.t('下单金额'), field: 'total_price' },
      { text: i18next.t('出库金额'), field: 'real_price' },
      { text: i18next.t('运费'), field: 'freight' },
      { text: i18next.t('异常金额'), field: 'abnormal_money' },
      { text: i18next.t('应付金额'), field: 'total_pay' },
    ],
    [
      { text: i18next.t('签收人'), field: '_receiver_name' },
      { text: i18next.t('页码'), field: '_pageCount' },
    ],
  ],

  fieldListSelected: [],

  productFieldGroup: getProductFieldGroup(),

  // 设置
  fieldGroupSettingDialogShow: false,
  fieldSettingTarget: {},
  fieldSettingTargetPath: [], // [blcok, lineNo, columnNo]
}

reducers.distribute_template = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.TEMPLATE_CONFIG_LOADING_SET: {
      return Object.assign({}, state, {
        templateConfig: defaultTemplateConfig,
        templateConfigLoading: action.templateConfigLoading,
      })
    }

    case actionTypes.TEMPLATE_CONFIG_LIST_FETCH: {
      return Object.assign({}, state, {
        templateConfigList: _.sortBy(action.data, 'create_time'),
      })
    }

    case actionTypes.TEMPLATE_CONFIG_DETAIL_FETCH: {
      return Object.assign({}, state, {
        templateConfig: action.data,
        templateConfigLoading: false,
      })
    }

    case actionTypes.TEMPLATE_CONFIG_DETAIL_CHANGE: {
      return Object.assign({}, state, {
        templateConfig: {
          ...state.templateConfig,
          [action.name]: action.value,
        },
      })
    }

    case actionTypes.TEMPLATE_CONFIG_RESET: {
      return Object.assign({}, state, {
        templateConfig: {
          ...state.templateConfig,
          ..._.cloneDeep(state.defaultTemplateConfig),
          is_system_default_template: false,
        },
      })
    }

    case actionTypes.TEMPLATE_LIST_PRINTSIZE_EDIT: {
      const templateConfigList = [...state.templateConfigList]
      const { index } = action

      if (templateConfigList[index]._printSizeEdit) {
        templateConfigList[index]._sizeSelected = null
        templateConfigList[index]._printSizeEdit = false
      } else {
        templateConfigList[index]._sizeSelected =
          templateConfigList[index].print_size
        templateConfigList[index]._printSizeEdit = true
      }

      return Object.assign({}, state, { templateConfigList })
    }

    case actionTypes.TEMPLATE_LIST_PRINT_PROPERTY_CHANGE: {
      const templateConfigList = [...state.templateConfigList]
      const { property, value } = action

      templateConfigList[action.index][property] = value

      return Object.assign({}, state, { templateConfigList })
    }

    case actionTypes.TEMPLATE_LIST_PRINTNAME_EDIT: {
      const templateConfigList = [...state.templateConfigList]
      const { index } = action

      if (templateConfigList[index]._printNameEdit) {
        templateConfigList[index]._nameInput = ''
        templateConfigList[index]._printNameEdit = false
      } else {
        templateConfigList[index]._nameInput = templateConfigList[index].name
        templateConfigList[index]._printNameEdit = true
      }

      return Object.assign({}, state, { templateConfigList })
    }

    case actionTypes.DIALOG_FIELD_SELECTED_CHANGE: {
      const { index, fields } = action
      const fieldListSelected = [...state.fieldListSelected]

      fieldListSelected[index] = fields
      return Object.assign({}, state, { fieldListSelected })
    }

    case actionTypes.FIELDGROUP_ADD_DIALOG_TOGGLE: {
      const { fieldGroupAddDialogShow, infoFieldGroup } = state

      const stateChanges = {
        fieldGroupAddDialogShow: !fieldGroupAddDialogShow,
      }

      if (fieldGroupAddDialogShow) {
        stateChanges.fieldListSelected = []
        stateChanges.fieldAddDirection = 'forward'
        stateChanges.fieldGroup = []
      } else {
        stateChanges.fieldGroup = [...state.infoFieldGroup]

        const { fieldAddTargetPath } = action
        const [blcokName] = fieldAddTargetPath
        const block = state.templateConfig[blcokName]
        const blockFieldList = _.compact(
          _.flattenDeep(
            _.map(block, (line) => _.map(line.content, (col) => col.field))
          )
        )

        state.fieldListSelected = _.map(infoFieldGroup, (list) =>
          _.map(
            _.filter(list, (f) => _.includes(blockFieldList, f.field)),
            'field'
          )
        )
      }

      return Object.assign({}, state, stateChanges)
    }

    case actionTypes.BLOCK_LINE_ADD: {
      return Object.assign({}, state, {
        fieldAddTargetPath: action.fieldAddTargetPath,
        fieldAddDirection: action.fieldAddDirection,
      })
    }

    case actionTypes.BLOCK_PRODUCT_HEADER_ADD: {
      return Object.assign({}, state, {
        fieldAddTargetPath: action.fieldAddTargetPath,
      })
    }

    case actionTypes.BLOCK_PRODUCT_HEADER_DEL: {
      const productBlockHeader = { ...state.templateConfig.productBlockHeader }
      const productFieldGroup = [...state.productFieldGroup]
      const { columnNo } = action

      productBlockHeader.tr.splice(columnNo, 1)[0] // eslint-disable-line

      return Object.assign({}, state, {
        templateConfig: {
          ...state.templateConfig,
          productBlockHeader,
        },
        productFieldGroup,
      })
    }

    case actionTypes.BLOCK_PRODUCT_HEADER_ADD_DIALOG_TOGGLE: {
      const { fieldGroupAddDialogShow, templateConfig } = state

      const stateChanges = {
        fieldGroupAddDialogShow: !fieldGroupAddDialogShow,
      }

      if (fieldGroupAddDialogShow) {
        stateChanges.fieldListSelected = []
        stateChanges.fieldGroup = []
      } else {
        stateChanges.fieldGroup = [...state.productFieldGroup]
        stateChanges.fieldListSelected = []
        stateChanges.fieldListSelected[0] = _.map(
          _.filter(state.productFieldGroup[0], (f) =>
            _.find(
              templateConfig.productBlockHeader.tr,
              (h) => h.field === f.field
            )
          ),
          'field'
        )
        stateChanges.fieldListSelected[1] = _.map(
          _.filter(
            state.productFieldGroup[1],
            (conf) => templateConfig.productBlockHeader[conf.field]
          ),
          'field'
        )
      }

      return Object.assign({}, state, stateChanges)
    }

    case actionTypes.BLOCK_LINE_COLUMN_ADD: {
      return Object.assign({}, state, {
        fieldAddTargetPath: action.fieldAddTargetPath,
      })
    }

    case actionTypes.DIALOG_FIELD_SELECTED_SAVE: {
      const { fieldAddTargetPath, fieldAddDirection } = state
      const allFieldList = _.flatten(state.fieldGroup)
      const allSelectedKeyList = _.compact(_.flatten(state.fieldListSelected))

      let block = null
      let blcokName = null
      let lineNo = null
      let columnNo = null
      let productFieldGroup = state.productFieldGroup

      if (fieldAddTargetPath[0] === 'productBlockHeader') {
        ;[blcokName, columnNo] = fieldAddTargetPath
        block = { ...state.templateConfig[blcokName] }

        const allSelectedKeyList_new = _.reject(allSelectedKeyList, (s) =>
          _.find(block.tr, (td) => td.field === s)
        )
        const AddFieldList = _.filter(
          allFieldList,
          (l) =>
            _.includes(allSelectedKeyList_new, l.field) &&
            l.field !== 'abnormals_detail' &&
            l.field !== 'category_total' &&
            l.field !== 'category_number'
        )

        block.tr = [
          ..._.slice(block.tr, 0, columnNo + 1),
          ...AddFieldList,
          ..._.drop(block.tr, columnNo + 1),
        ]
        block.tr = _.reject(
          block.tr,
          (td) => !_.includes(allSelectedKeyList, td.field)
        )

        // 小计、分类数、异常的显示控制
        const functionFieldList = _.filter(
          allSelectedKeyList,
          (field) =>
            field === 'abnormals_detail' ||
            field === 'category_total' ||
            field === 'category_number'
        )
        if (_.includes(functionFieldList, 'category_number')) {
          block.category_number = true
        } else {
          block.category_number = false
        }
        if (_.includes(functionFieldList, 'abnormals_detail')) {
          block.abnormals_detail = true
        } else {
          block.abnormals_detail = false
        }
        if (_.includes(functionFieldList, 'category_total')) {
          block.category_total = true
        } else {
          block.category_total = false
        }
      } else {
        const { textField } = action
        ;[blcokName, lineNo, columnNo] = fieldAddTargetPath
        block = [...state.templateConfig[blcokName]]

        const blockFieldList = _.compact(
          _.flattenDeep(
            _.map(block, (line) => _.map(line.content, (col) => col.field))
          )
        )
        const allSelectedKeyList_new = _.reject(allSelectedKeyList, (s) =>
          _.includes(blockFieldList, s)
        )
        const fieldList_new = _.filter(allFieldList, (l) =>
          _.includes(allSelectedKeyList_new, l.field)
        )

        // 自定义字段
        textField && fieldList_new.push(textField)

        if (columnNo !== null) {
          const columnsContent = block[lineNo].content

          block[lineNo].content = [
            ..._.slice(columnsContent, 0, columnNo + 1),
            ...fieldList_new,
            ..._.drop(columnsContent, columnNo + 1),
          ]
        } else {
          block.splice(fieldAddDirection === 'back' ? lineNo : lineNo + 1, 0, {
            type: 'columns',
            content: fieldList_new,
          })
        }

        block = _.map(block, (line) => {
          line.content = _.reject(
            line.content,
            (col) => col.field && !_.includes(allSelectedKeyList, col.field)
          )
          return line
        })
      }

      return Object.assign({}, state, {
        templateConfig: {
          ...state.templateConfig,
          [blcokName]: block,
        },
        productFieldGroup,
      })
    }

    case actionTypes.BLOCK_LINE_COLUMN_DEL: {
      const { fieldAddTargetPath } = action
      const [blcokName, lineNo, columnNo] = fieldAddTargetPath
      const block = [...state.templateConfig[blcokName]]
      const infoFieldGroup = [...state.infoFieldGroup]
      const newColumnsContent = [...block[lineNo].content]

      newColumnsContent.splice(columnNo, 1)[0] // eslint-disable-line

      block[lineNo].content = newColumnsContent

      return Object.assign({}, state, {
        templateConfig: {
          ...state.templateConfig,
          [blcokName]: block,
        },
        infoFieldGroup,
      })
    }

    case actionTypes.FIELDGROUP_SETTING_DIALOG_TOGGLE: {
      const { fieldGroupSettingDialogShow } = state

      const stateChanges = {
        fieldGroupSettingDialogShow: !fieldGroupSettingDialogShow,
      }

      if (fieldGroupSettingDialogShow) {
        stateChanges.fieldSettingTarget = initState.fieldSettingTarget
      }

      return Object.assign({}, state, stateChanges)
    }

    case actionTypes.BLOCK_LINE_COLUMN_SETTING: {
      const { fieldSettingTargetPath } = action
      const [blcokName, lineNo, columnNo] = fieldSettingTargetPath
      const fieldSettingTarget = {
        ...state.templateConfig[blcokName][lineNo].content[columnNo],
      }

      return Object.assign({}, state, {
        fieldSettingTargetPath,
        fieldSettingTarget: {
          ...state.defaultFieldConfig,
          ...fieldSettingTarget,
        },
      })
    }

    case actionTypes.BLOCK_PRODUCT_HEADER_SETTING: {
      const { fieldSettingTargetPath } = action
      const [blcokName, columnNo] = fieldSettingTargetPath
      const fieldSettingTarget = {
        ...state.templateConfig[blcokName].tr[columnNo],
      }

      return Object.assign({}, state, {
        fieldSettingTargetPath,
        fieldSettingTarget: {
          ...state.defaultFieldConfig,
          ...fieldSettingTarget,
        },
      })
    }

    case actionTypes.BLOCK_LINE_COLUMN_SETTING_FIELD_CHANGE: {
      const fieldSettingTarget = { ...state.fieldSettingTarget }

      fieldSettingTarget[action.key] = action.value
      return Object.assign({}, state, { fieldSettingTarget })
    }

    case actionTypes.FIELDGROUP_SETTING_DIALOG_SAVE: {
      const { fieldSettingTargetPath, fieldSettingTarget } = state
      let blcokName, lineNo, columnNo, block

      if (fieldSettingTargetPath[0] === 'productBlockHeader') {
        ;[blcokName, columnNo] = fieldSettingTargetPath
        block = { ...state.templateConfig[blcokName] }
        block.tr[columnNo] = fieldSettingTarget
        block.tr = _.sortBy(block.tr, (col) => Number(col.sortNo) || 0)
      } else {
        ;[blcokName, lineNo, columnNo] = fieldSettingTargetPath
        block = [...state.templateConfig[blcokName]]
        block[lineNo].content[columnNo] = fieldSettingTarget
        block[lineNo].content = _.sortBy(
          block[lineNo].content,
          (col) => Number(col.sortNo) || 0
        )
      }

      return Object.assign({}, state, {
        templateConfig: {
          ...state.templateConfig,
          [blcokName]: block,
        },
      })
    }

    default:
      return state
  }
}

mapReducers(reducers)
