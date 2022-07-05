import { i18next } from 'gm-i18n'
import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action_types'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { getTemplateList, getTemplateDetail } from './util'
import { isLK, isPL } from '../order/util'
import globalStore from '../stores/global'

const actions = {}

actions.block_line_add = (fieldAddDirection, ...fieldAddTargetPath) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.BLOCK_LINE_ADD,
      fieldAddTargetPath,
      fieldAddDirection,
    })

    dispatch({
      type: actionTypes.FIELDGROUP_ADD_DIALOG_TOGGLE,
      fieldAddTargetPath,
    })
  }
}

actions.block_product_header_add = (...fieldAddTargetPath) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.BLOCK_PRODUCT_HEADER_ADD,
      fieldAddTargetPath,
    })

    dispatch({ type: actionTypes.BLOCK_PRODUCT_HEADER_ADD_DIALOG_TOGGLE })
  }
}

actions.block_product_header_del = (columnNo) => {
  return {
    type: actionTypes.BLOCK_PRODUCT_HEADER_DEL,
    columnNo,
  }
}

actions.block_product_header_setting = (...fieldSettingTargetPath) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.FIELDGROUP_SETTING_DIALOG_TOGGLE,
    })

    dispatch({
      type: actionTypes.BLOCK_PRODUCT_HEADER_SETTING,
      fieldSettingTargetPath,
    })
  }
}

actions.dialog_field_selected_change = (index, fields) => {
  return {
    type: actionTypes.DIALOG_FIELD_SELECTED_CHANGE,
    fields,
    index,
  }
}

actions.fieldgroup_add_dialog_toggle = () => {
  return {
    type: actionTypes.FIELDGROUP_ADD_DIALOG_TOGGLE,
  }
}

actions.dialog_field_selected_save = (textField) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.DIALOG_FIELD_SELECTED_SAVE,
      textField,
    })

    dispatch({ type: actionTypes.FIELDGROUP_ADD_DIALOG_TOGGLE })
  }
}

actions.block_line_column_add = (...fieldAddTargetPath) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.FIELDGROUP_ADD_DIALOG_TOGGLE,
      fieldAddTargetPath,
    })

    dispatch({
      type: actionTypes.BLOCK_LINE_COLUMN_ADD,
      fieldAddTargetPath,
    })
  }
}

actions.block_line_column_del = (...fieldAddTargetPath) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.BLOCK_LINE_COLUMN_DEL,
      fieldAddTargetPath,
    })
  }
}

actions.fieldGroup_setting_dialog_toggle = () => {
  return {
    type: actionTypes.FIELDGROUP_SETTING_DIALOG_TOGGLE,
  }
}

actions.block_line_column_setting = (...fieldSettingTargetPath) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.FIELDGROUP_SETTING_DIALOG_TOGGLE,
    })

    dispatch({
      type: actionTypes.BLOCK_LINE_COLUMN_SETTING,
      fieldSettingTargetPath,
    })
  }
}

actions.block_line_column_setting_field_change = (key, value) => {
  return {
    type: actionTypes.BLOCK_LINE_COLUMN_SETTING_FIELD_CHANGE,
    key,
    value,
  }
}

actions.fieldGroup_setting_dialog_save = () => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.FIELDGROUP_SETTING_DIALOG_SAVE,
    })

    dispatch({
      type: actionTypes.FIELDGROUP_SETTING_DIALOG_TOGGLE,
    })
  }
}

actions.template_config_list_fetch = () => {
  return (dispatch) => {
    return getTemplateList().then((data) => {
      dispatch({
        type: actionTypes.TEMPLATE_CONFIG_LIST_FETCH,
        data: data,
      })

      return data
    })
  }
}

actions.template_config_detail_fetch = (template_id) => {
  return (dispatch) => {
    actions.template_config_loading_set(true)
    return getTemplateDetail(template_id).then((data) => {
      dispatch({
        type: actionTypes.TEMPLATE_CONFIG_DETAIL_FETCH,
        data: data,
      })
      return data
    })
  }
}

actions.template_config_loading_set = (bool) => {
  return {
    type: actionTypes.TEMPLATE_CONFIG_LOADING_SET,
    templateConfigLoading: bool,
  }
}

actions.template_config_reset = () => {
  return {
    type: actionTypes.TEMPLATE_CONFIG_RESET,
  }
}

actions.template_config_save = (config) => {
  return () => {
    return Request('/station/distribute_config/save')
      .data({ config: JSON.stringify(config) })
      .post()
  }
}

actions.template_config_update = (config) => {
  return () => {
    return Request('/station/distribute_config/edit')
      .data({ config: JSON.stringify(config) })
      .post()
  }
}

actions.template_config_detail_change = (name, value) => {
  return {
    type: actionTypes.TEMPLATE_CONFIG_DETAIL_CHANGE,
    name,
    value,
  }
}

actions.template_config_list_del = (id, is_force) => {
  return () => {
    return Request('/station/distribute_config/delete')
      .data({
        id,
        is_force,
      })
      .post()
  }
}

actions.template_list_update = (index) => {
  return (dispatch, getState) => {
    const { templateConfigList } = getState().distribute_template
    const templateConfig = { ...templateConfigList[index] }
    return getTemplateDetail(templateConfig.id).then((oldConfig) => {
      const newConfig = {
        ...oldConfig,
        print_size: templateConfig._printSizeEdit
          ? templateConfig._sizeSelected
          : oldConfig.print_size,
        name: templateConfig._printNameEdit
          ? templateConfig._nameInput
          : oldConfig.name,
      }

      delete newConfig._printSizeEdit
      delete newConfig._sizeSelected
      delete newConfig._printNameEdit
      delete newConfig._nameInput

      return actions.template_config_update(newConfig)()
    })
  }
}

actions.fetch_distribute_info = (query) => {
  return () => {
    return Request('/station/distribute/get_order_by_id')
      .data(query)
      .get()
      .then((json) => {
        return _.map(json.data, (order) => {
          let customerInfo = {}

          if (
            order.origin_customer.origin_area &&
            order.origin_customer.origin_area.name
          ) {
            customerInfo = {
              resname: `${order.origin_customer.origin_resname}(${
                order.origin_customer.address_id || '-'
              })`,
              receiver_name: order.origin_customer.origin_receiver_name,
              receiver_phone: order.origin_customer.origin_receiver_phone,
              address: `${order.origin_customer.origin_area.first_name}-${order.origin_customer.origin_area.name}-${order.origin_customer.address}`,
            }
          } else {
            customerInfo = {
              resname: `${order.resname}(${order.sid || '-'})`,
              receiver_name: order.receiver_name,
              receiver_phone: order.receiver_phone,
              address: `${
                order.address_sign === i18next.t('未指定')
                  ? order.address
                  : order.address_sign + '|' + order.address
              }`,
            }
          }

          _.each(order.details, (sku) => {
            sku.tax_rate = globalStore.hasViewTaxRate()
              ? Big(sku.tax_rate).div(100).toFixed(2) + '%'
              : ''
            sku.specs =
              sku.std_unit_name === sku.sale_unit_name && sku.sale_ratio === 1
                ? i18next.t('KEY6', {
                    VAR1: sku.sale_unit_name,
                  }) /* src:`按${sku.sale_unit_name}` => tpl:按${VAR1} */
                : `${sku.sale_ratio}${sku.std_unit_name}/${sku.sale_unit_name}`
            sku.quantity = sku.quantity + sku.sale_unit_name
            sku.real_weight_std = sku.real_weight + sku.std_unit_name // 出库数(基本单位)
            sku.real_weight_sale =
              parseFloat(Big(sku.real_weight).div(sku.sale_ratio).toFixed(2)) +
              sku.sale_unit_name // 出库数(销售单位)
            sku.name =
              sku.real_is_weight && !sku.is_weigh ? `*${sku.name}` : sku.name // 未称重商品名加*
          })

          _.each(order.abnormals, (abnormal) => {
            abnormal.amount_delta = Big(
              Big(abnormal.amount_delta).toFixed(2),
            ).toString() // 后台返回小数问题fix
          })

          if (_.isNil(order.remark) || order.remark === '') {
            order.remark = '-'
          }
          return {
            ...order,
            ...customerInfo,
            origin_date_time: order.date_time,
            id_PL: isPL(order.id) ? order.id : '',
            id_LK: isLK(order.id) ? order.id : '',
            print_time: moment().format('YYYY-MM-DD HH:mm:ss'),
            receive_time: `${moment(order.receive_begin_time).format(
              'MM-DD HH:mm',
            )}~${moment(order.receive_end_time).format('MM-DD HH:mm')} `,
            origin_order_id: order.origin_customer.origin_order_id,
            sort_id: `${order.sort_id} ${order.child_sort_id} `,
            date_time: moment(order.date_time).format('YYYY-MM-DD'),
            area_sign: `${order.city}${order.area_l1}${order.area_l2}`, // 地理标签
          }
        })
      })
  }
}

actions.template_list_printsize_edit = (index) => {
  return {
    type: actionTypes.TEMPLATE_LIST_PRINTSIZE_EDIT,
    index,
  }
}

actions.template_list_print_property_change = (index, property, value) => {
  return {
    type: actionTypes.TEMPLATE_LIST_PRINT_PROPERTY_CHANGE,
    index,
    property,
    value,
  }
}

actions.template_list_printname_edit = (index) => {
  return {
    type: actionTypes.TEMPLATE_LIST_PRINTNAME_EDIT,
    index,
  }
}

actions.fetch_driver_info = (print_drivers) => {
  return () => {
    return Request('/station/transport/driver_tasks/print')
      .data({ print_drivers })
      .get()
      .then((json) => {
        return _.toArray(json.data)
      })
  }
}

actions.template_customer_search = (templateId, selectedIDs = []) => {
  return () => {
    return Promise.all([
      getTemplateList(),
      Request('/station/order/customer/search')
        .get()
        .then((json) => json.data.list),
    ]).then((result) => {
      const [templateList, list] = result
      const options = []
      const selected = []

      _.each(list, (customer) => {
        const template = _.find(templateList, (t) =>
          _.includes(t.address_ids, customer.address_id),
        )

        const opt = {
          value: customer.address_id,
          name: template
            ? `${customer.resname}(${template.name})`
            : customer.resname,
        }

        // 已选商户
        if (_.includes(selectedIDs, customer.address_id)) {
          selected.push(customer.address_id)
        }

        options.push(opt)
      })

      return {
        options,
        selected,
      }
    })
  }
}

mapActions(actions)
