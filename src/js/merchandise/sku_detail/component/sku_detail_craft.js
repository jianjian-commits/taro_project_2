import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  FormItem,
  Select,
  Option,
  Validator,
  FilterSelect,
  Flex,
  Popover,
  InputNumber,
  Drawer,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { Table } from '@gmfe/table'
import TechnologyFlow from './technology_flow'
import _ from 'lodash'
import { ENUM } from '../../util'
import { remarkType } from '../../../common/filter'
import Big from 'big.js'
import { pinYinFilter } from '@gm-common/tool'
import actions from '../../../actions'
import '../actions'

class SkuDetailCraft extends React.Component {
  // 校验净菜多物料信息是否填写完整
  validateIngredient = (ingredients) => {
    // 筛选出物料ID不为空的物料
    const ingredientsFilter = _.filter(
      ingredients,
      (ingredient) => ingredient.id
    )

    if (ingredientsFilter.length === 0) return i18next.t('物料信息至少一条')

    let isInfoComplete = true // 信息是否填写完整
    let isProportionCorrect = true // 单位数量是否合理

    _.each(ingredientsFilter, (ingredient) => {
      // 当商品类型为原料时，默认供应商为必选
      if (ingredient.remark_type === 1 && !ingredient.supplier_id) {
        isInfoComplete = false
        return false
      }
      // 单位数量判断是否大于0
      if (+ingredient.proportion === 0) {
        isProportionCorrect = false
        return false
      }
    })

    if (!isInfoComplete) return i18next.t('物料信息填写不完善')
    if (!isProportionCorrect) return i18next.t('单位数量需大于0')
    return ''
  }

  handleChangeRemarkType = (value) => {
    this.props.onChangeCraftInfo({ remark_type: value })
  }

  // todo不知道为啥当执行onSelect的时候，会执行这个方法，所以需要屏蔽一下value为空的情况，不发请求
  handleSearchIngredient = (value) => {
    const sku_id = this.props.skuDetail.sku_id
    const data = sku_id ? { q: value, sku_id } : { q: value }
    value && this.props.onSearchIngredient(data)
  }

  // 多物料选择
  handleSelectIngredient = (index, selected) => {
    const ingredients = [...this.props.skuDetail.ingredients]
    ingredients[index] = Object.assign({}, ingredients[index], selected)
    ingredients[index].proportion = 0
    ingredients[index].sale_proportion = 0

    this.props.onChangeCraftInfo({ ingredients })
  }

  // 修改单位数量（基本单位）
  handleChangeProportion = (index, value) => {
    const ingredients = [...this.props.skuDetail.ingredients]
    ingredients[index].proportion = value
    ingredients[index].sale_proportion = parseFloat(
      Big(value || 0)
        .div(ingredients[index].ratio)
        .toFixed(2)
    )

    this.props.onChangeCraftInfo({ ingredients })
  }

  // 修改单位数量（包装单位）
  handleChangeSaleProportion = (index, value) => {
    const ingredients = [...this.props.skuDetail.ingredients]
    ingredients[index].sale_proportion = value
    ingredients[index].proportion = parseFloat(
      Big(ingredients[index].ratio)
        .times(value || 0)
        .toFixed(2)
    )

    this.props.onChangeCraftInfo({ ingredients })
  }

  // 多物料供应商搜索
  handleFilterSupply = (list, query) => {
    return pinYinFilter(list, query, (value) => value.name)
  }

  // 多物料供应商选择
  handleSelectSupply = (index, selected) => {
    const ingredients = this.props.skuDetail.ingredients
    ingredients[index] = Object.assign({}, ingredients[index])
    ingredients[index].supplier_id = selected.supplier_id

    this.props.onChangeCraftInfo({ ingredients })
  }

  // 多物料设置工艺
  handleSettingTech = (skuDetail, ingredient_id, remark_type) => {
    // 希捷说，在设置工艺的时候要强制保存sku信息，才能进行设置，因为工艺是单独接口，如果不保存sku也是可以绑定的
    // 所以导致这里有可能会出现物料信息没有，但是工艺已经绑定给sku了。在设置工艺的时候强行保存sku信息，希捷说的，这样改动最少，所需时间最少
    if (skuDetail.sku_id !== '') {
      actions.merchandise_sku_common_sku_update(skuDetail, 'sale').then(() => {
        Drawer.render({
          children: (
            <TechnologyFlow
              sku_id={skuDetail.sku_id}
              ingredient_id={ingredient_id}
              remark_type={remark_type}
            />
          ),
          onHide: Drawer.hide,
          opacityMask: true,
          style: {
            width: '700px',
          },
        })
      })
    } else {
      actions.merchandise_sku_common_sale_sku_create(skuDetail).then((json) => {
        Drawer.render({
          children: (
            <TechnologyFlow
              sku_id={json.data}
              ingredient_id={ingredient_id}
              remark_type={remark_type}
            />
          ),
          onHide: Drawer.hide,
          opacityMask: true,
          style: {
            width: '700px',
          },
        })
      })
    }
  }

  // 净菜多物料增加
  handleAddIngredient = () => {
    const ingredients = [...this.props.skuDetail.ingredients]
    ingredients.push({ name: i18next.t('请选择物料') })

    this.props.onChangeCraftInfo({ ingredients })
  }

  // 净菜多物料删除
  handleDeleteIngredient = (index) => {
    const ingredients = [...this.props.skuDetail.ingredients]
    ingredients.splice(index, 1)
    if (ingredients.length === 0) {
      ingredients.push({ name: i18next.t('请选择物料') })
    }
    this.props.onChangeCraftInfo({ ingredients })
  }

  render() {
    const { skuDetail, ingredientList, ingredientSupplyList } = this.props
    return (
      <QuickPanel
        icon='network'
        iconColor='#7f4f6e'
        title={i18next.t('工艺信息')}
      >
        <Form horizontal labelWidth='116px' hasButtonInGroup>
          <FormItem label={i18next.t('商品类型')} inline>
            <Select
              value={skuDetail.remark_type || 2}
              onChange={this.handleChangeRemarkType}
            >
              {_.map(ENUM.remarkTypes, (value, key) => (
                <Option key={+key} value={+key}>
                  {value}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem
            label={i18next.t('物料信息')}
            inline
            validate={Validator.create(
              [],
              skuDetail.ingredients,
              this.validateIngredient.bind(this, skuDetail.ingredients)
            )}
          >
            <Table
              data={
                skuDetail.ingredients || [
                  { name: i18next.t('请选择物料'), attrition_rate: 0 },
                ]
              }
              columns={[
                {
                  Header: i18next.t('物料名'),
                  accessor: 'id',
                  Cell: (data) => {
                    const ingredientListFilter = []
                    let ingredientSelected
                    // 获取列表中存在的物料id，后面用来过滤
                    const ingredientIds = _.map(
                      skuDetail.ingredients,
                      (v) => v.id
                    )
                    _.each(ingredientList, (d) => {
                      const filterIngredient = _.filter(
                        d.children,
                        (ingredient) => {
                          if (data.value === ingredient.id) {
                            ingredientSelected = ingredient
                          }
                          return !_.includes(ingredientIds, ingredient.id)
                        }
                      )
                      filterIngredient.length > 0 &&
                        ingredientListFilter.push({
                          label: d.label,
                          children: filterIngredient,
                        })
                    })
                    return (
                      <FilterSelect
                        id={data.value || 'ingredient_'}
                        list={ingredientListFilter}
                        isGroupList
                        selected={
                          ingredientSelected || { name: data.original.name }
                        }
                        onSearch={this.handleSearchIngredient}
                        onSelect={this.handleSelectIngredient.bind(
                          this,
                          data.index
                        )}
                        renderItemName={(v) => (
                          <Flex alignCenter>
                            <div
                              style={{
                                backgroundColor: 'pink',
                                borderRadius: '5px',
                              }}
                              className='gm-padding-lr-5 gm-margin-right-5'
                            >
                              {remarkType(v.remark_type)}
                            </div>
                            <div>{`${v.name}|${v.ratio}${v.std_unit_name}/${v.sale_unit_name}`}</div>
                          </Flex>
                        )}
                        placeholder={i18next.t('搜索')}
                      />
                    )
                  },
                },
                {
                  Header: i18next.t('商品类型'),
                  accessor: 'remark_type',
                  Cell: (data) => remarkType(data.value),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>
                        {i18next.t('单位数量')}
                        <br />
                        {`(${i18next.t('基本单位')})`}
                      </span>
                      <Popover
                        showArrow
                        type='hover'
                        popup={
                          <div className='gm-margin-15'>
                            {i18next.t(
                              '请录入生成1个销售单位当前商品所需的物料数，如1盒果篮，请录入1个篮子，1个包装袋'
                            )}
                          </div>
                        }
                      >
                        <i className='xfont xfont-warning-circle gm-cursor gm-margin-left-5' />
                      </Popover>
                    </Flex>
                  ),
                  accessor: 'proportion',
                  Cell: (data) =>
                    data.original.id ? (
                      <div>
                        <InputNumber
                          min={0}
                          precision={2}
                          style={{ width: '100px', marginRight: '5px' }}
                          value={data.value}
                          onChange={this.handleChangeProportion.bind(
                            this,
                            data.index
                          )}
                        />
                        {data.original.std_unit_name}
                      </div>
                    ) : (
                      '-'
                    ),
                },
                {
                  Header: i18next.t('规格'),
                  accessor: 'ratio',
                  Cell: (data) =>
                    data.original.id
                      ? data.original.std_unit_name ===
                        data.original.sale_unit_name
                        ? `${data.value}${data.original.std_unit_name}`
                        : `${data.value}${data.original.std_unit_name}/${data.original.sale_unit_name}`
                      : '-',
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>
                        {i18next.t('单位数量')}
                        <br />
                        {`(${i18next.t('包装单位')})`}
                      </span>
                    </Flex>
                  ),
                  accessor: 'sale_proportion',
                  Cell: (data) =>
                    data.original.id ? (
                      <div>
                        <InputNumber
                          min={0}
                          precision={2}
                          style={{ width: '100px', marginRight: '5px' }}
                          value={parseFloat(Big(data.value || 0).toFixed(2))}
                          onChange={this.handleChangeSaleProportion.bind(
                            this,
                            data.index
                          )}
                        />
                        {data.original.sale_unit_name}
                      </div>
                    ) : (
                      '-'
                    ),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('默认供应商')}</span>
                      <Popover
                        showArrow
                        type='hover'
                        popup={
                          <div className='gm-margin-15'>
                            {i18next.t(
                              '所选物料类型为原料时可选择供应商，非原料类型无需选择供应商。'
                            )}
                          </div>
                        }
                      >
                        <i className='xfont xfont-warning-circle gm-cursor gm-margin-left-5' />
                      </Popover>
                    </Flex>
                  ),
                  accessor: 'remark_type',
                  Cell: (data) => {
                    if (data.value !== 1) return '-'
                    const ingredientFilterSupplyList = _.filter(
                      ingredientSupplyList,
                      (s) => {
                        return _.includes(
                          s.merchandise,
                          data.original.category_id_2
                        )
                      }
                    )
                    const selected = _.find(
                      ingredientFilterSupplyList,
                      (s) => s.supplier_id === data.original.supplier_id
                    )
                    return (
                      <FilterSelect
                        id={`supply_${data.original.id || ''}`}
                        list={ingredientFilterSupplyList}
                        selected={
                          selected || { name: i18next.t('请选择供应商') }
                        }
                        withFilter={this.handleFilterSupply}
                        onSelect={this.handleSelectSupply.bind(
                          this,
                          data.index
                        )}
                        placeholder={i18next.t('搜索')}
                      />
                    )
                  },
                },
                {
                  Header: i18next.t('工艺数'),
                  accessor: 'technic_flow_len',
                  Cell: (data) => (
                    <a
                      href='javascript:;'
                      onClick={this.handleSettingTech.bind(
                        this,
                        skuDetail,
                        data.original.id,
                        data.original.remark_type
                      )}
                    >
                      {data.value || i18next.t('设置工艺')}
                    </a>
                  ),
                },
                {
                  Header: <i className='xfont xfont-fun text-primary' />,
                  accessor: 'id',
                  Cell: (data) => (
                    <div>
                      <i
                        className='xfont xfont-plus  gm-cursor gm-margin-right-5'
                        onClick={this.handleAddIngredient}
                      />
                      <i
                        className='xfont xfont-delete gm-cursor'
                        onClick={this.handleDeleteIngredient.bind(
                          this,
                          data.index
                        )}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </FormItem>
        </Form>
      </QuickPanel>
    )
  }
}

SkuDetailCraft.propTypes = {
  skuDetail: PropTypes.object,
  ingredientList: PropTypes.array,
  ingredientSupplyList: PropTypes.array,
  onSearchIngredient: PropTypes.func,
  onChangeCraftInfo: PropTypes.func,
}

export default SkuDetailCraft
