import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import skuStore from '../sku_store'
import spuStore from '../spu_store'
import {
  FormItem,
  Select,
  Validator,
  Form,
  ToolTip,
  Switch,
  Drawer,
  Flex,
  InputNumberV2,
} from '@gmfe/react'
import _ from 'lodash'
import CraftInfoTable from './craft_info_component/craft_info_table'
import { history, System } from '../../../../common/service'
import merchandiseStore from '../../store'
import TechnologyFlow from './technology_flow'

import Big from 'big.js'

@observer
class CraftForm extends React.Component {
  // 校验净菜多物料信息是否填写完整
  validateIngredient = (list) => {
    // 筛选出物料ID不为空的物料
    const ingredientsFilter = _.filter(list, (ingredient) => ingredient.id)

    if (ingredientsFilter.length === 0) return i18next.t('物料信息至少一条')

    let isProportionCorrect = true // 单位数量是否合理

    _.each(ingredientsFilter, (ingredient) => {
      // 单位数量判断是否大于0
      if (+ingredient.proportion === 0) {
        isProportionCorrect = false
        return false
      }
    })

    if (!isProportionCorrect) return i18next.t('单位数量需大于0')
    return ''
  }

  handleChangeProcessLabel = (value) => {
    skuStore.changeCleanFoodInfo({
      process_label_id: value,
    })
  }

  handleChangeSelect = (index, name, selected) => {
    skuStore.changeIngredients(index, { [name]: selected.value })
  }

  handleDelete = (index) => {
    skuStore.deleteIngredient(index)
  }

  handleProcessLabel = () => {
    history.push(System.getUrl('/merchandise/manage/list/process_label'))
  }

  handleChangeCombine = () => {
    const {
      clean_food_info: { combine_technic_status },
    } = skuStore.skuDetail
    skuStore.changeCleanFoodInfo({
      combine_technic_status: !combine_technic_status,
    })
  }

  handleChangeUnitSwitch = (name) => {
    const data = skuStore.skuDetail.clean_food_info[name]

    // 关闭时，需要通过ratio再次换算出sale_proportion
    if (data) {
      _.each(skuStore.skuDetail.ingredients, (item, index) => {
        const value = +Big(item.proportion || 0)
          .div(item.ratio)
          .toFixed(4)

        skuStore.changeIngredients(index, { sale_proportion: value })
      })
    }

    skuStore.changeCleanFoodInfo({ [name]: !data })
  }

  // 改变组合工艺数
  handleChangeTechnicFlowLen = ({ len }) => {
    skuStore.changeCleanFoodInfo({
      combine_technic_length: len,
    })
  }

  renderTechnologyFlow = () => {
    const { sku_id } = skuStore.skuDetail
    Drawer.render({
      children: (
        <TechnologyFlow
          sku_id={sku_id}
          onChangeTechnicFlowLen={this.handleChangeTechnicFlowLen}
          type={2} // 组合工艺
        />
      ),
      onHide: Drawer.hide,
      opacityMask: false,
      style: {
        width: '700px',
      },
    })
  }

  handleSettingTech = () => {
    const { sku_id } = skuStore.skuDetail
    // 希捷说，在设置工艺的时候要强制保存sku信息，才能进行设置，因为工艺是单独接口，如果不保存sku也是可以绑定的
    // 所以导致这里有可能会出现物料信息没有，但是工艺已经绑定给sku了。在设置工艺的时候强行保存sku信息，希捷说的，这样改动最少，所需时间最少
    if (sku_id) {
      // 更新sku信息
      skuStore.updateSku().then(() => {
        this.renderTechnologyFlow()
      })
    } else {
      // 新增sku
      skuStore.createSku(spuStore.spuDetail.id).then((id) => {
        this.renderTechnologyFlow(id)
      })
    }
  }

  handleChangeInput = (name, value) => {
    skuStore.changeCleanFoodInfo({ [name]: value })
  }

  render() {
    const {
      skuDetail: {
        clean_food_info: {
          combine_technic_status,
          process_label_id,
          combine_technic_length,
          process_unit_status,
          unit_process_cost,
        },
        ingredients,
      },
    } = skuStore
    const { processLabelList } = merchandiseStore

    return (
      <Form
        hasButtonInGroup
        ref={this.props.forwardRef}
        labelWidth='179px'
        colWidth='500px'
      >
        <FormItem label={i18next.t('商品加工标签')}>
          <Flex row alignCenter>
            <Select
              value={process_label_id}
              onChange={this.handleChangeProcessLabel}
              data={[{ value: 0, text: i18next.t('无') }].concat(
                processLabelList.slice(),
              )}
              style={{ minWidth: '280px' }}
            />

            <ToolTip
              popup={
                <div className='gm-padding-5'>
                  {i18next.t(
                    '设置标签后，可在加工任务中通过筛选不同的加工标签，对任务进行分批下达，可设置标签如净菜、熟食',
                  )}
                </div>
              }
              className='gm-padding-lr-5'
            />
            <a style={{ width: '70px' }} onClick={this.handleProcessLabel}>
              {i18next.t('管理标签')}
            </a>
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('是否开启组合工艺')}>
          <Switch
            type='primary'
            checked={!!combine_technic_status}
            on={i18next.t('启用')}
            off={i18next.t('不启用')}
            onChange={this.handleChangeCombine}
          />
          {!!combine_technic_status && (
            <>
              <div className='gm-gap-10' />
              <a href='javascript:;' onClick={this.handleSettingTech}>
                {i18next.t('technic_num', {
                  num: combine_technic_length || 0,
                })}
                {/* 设置工艺（工艺数：${num}） */}
              </a>
            </>
          )}
          <div
            style={{ width: '1000px' }}
            className='gm-text-desc gm-margin-top-5'
          >
            {i18next.t(
              '启用后可设置商品的组合工艺以及组合物料；如无需设置组合物料，选择“不启用”',
            )}
          </div>
          <div
            className='gm-text-desc gm-margin-top-5'
            style={{ width: '1000px' }}
          >
            {i18next.t(
              '示例：如需设置“土豆丝炒肉”这个菜品，则需开启组合工艺，在组合工艺中设置菜品的做法，在物料信息中填写所需的土豆丝、肉片、油、盐等bom信息',
            )}
          </div>
        </FormItem>
        <FormItem
          colWidth='70%'
          label={i18next.t('物料信息')}
          validate={Validator.create(
            [],
            ingredients,
            this.validateIngredient.bind(this, ingredients),
          )}
        >
          <Flex column>
            <div>
              <Flex alignCenter>
                <span className='gm-margin-right-10'>
                  {i18next.t('是否开启加工计量单位录入')}
                </span>
                <Switch
                  type='primary'
                  checked={!!process_unit_status}
                  on={i18next.t('启用')}
                  off={i18next.t('不启用')}
                  onChange={this.handleChangeUnitSwitch.bind(
                    this,
                    'process_unit_status',
                  )}
                />
              </Flex>
              <div className='gm-text-desc gm-margin-tb-10'>
                {i18next.t(
                  '开启后，可自主选择物料的录入单位，如馒头的设置，所需食用碱用量多以克为单位，但库存多以斤或公斤为单位',
                )}
              </div>
            </div>
            <CraftInfoTable />
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('单位加工成本')}>
          <Flex alignCenter>
            <InputNumberV2
              min={0}
              precision={2}
              className='form-control'
              value={unit_process_cost}
              onChange={this.handleChangeInput.bind(this, 'unit_process_cost')}
            />
            <span className='gm-margin-left-5'>{i18next.t('元')}</span>
          </Flex>
        </FormItem>
      </Form>
    )
  }
}

CraftForm.propTypes = {
  spu_id: PropTypes.string,
  forwardRef: PropTypes.object,
}

// 转发form示例，在提交的时候能触发验证
export default React.forwardRef((props, ref) => (
  <CraftForm forwardRef={ref} {...props} />
))
