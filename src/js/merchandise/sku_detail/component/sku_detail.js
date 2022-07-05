import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Switch,
  Tip,
  Popover,
  InputNumber,
  Flex,
  Form,
  FormItem,
  Validator,
  Select,
  Dialog,
  Price,
  RadioGroup,
  Radio,
  FormGroup,
  MoreSelect,
  Button,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { isPrice } from '../../../common/util'
import { getOptionalMeasurementUnitList } from '../../util'
import Big from 'big.js'
import _ from 'lodash'
import { history } from '../../../common/service'
import { pinYinFilter } from '@gm-common/tool'
import { saleReferencePrice } from '../../../common/enum'
import SkuDetailCraft from './sku_detail_craft'

import actions from '../../../actions'
import '../../actions'
import '../../reducer'
import '../../list/actions'
import '../../list/reducer'
import globalStore from '../../../stores/global'
import UploadDeleteImgs from './upload_delete_imgs'
import { SvgSupplier } from 'gm-svg'

class SkuDetail extends React.Component {
  constructor(props) {
    super(props)
    // typeSale 由 sale_unit_name 和 sale_ratio 决定，当sale_ratio为1并且sale_unit_name 为标准单位时，才显示1(按标准单位)
    this.state = {
      materialList: [],
      typeSale:
        props.skuDetail.sale_unit_name === props.skuDetail.std_unit_name &&
        props.skuDetail.sale_ratio === 1
          ? 1
          : 2,
      createPurchaseSpec: false,
      supplier_id: props.skuDetail.supplier_id,
      purchaseSpecInfo: {
        purchaseSpec: 1,
        std_unit_name: props.skuDetail.std_unit_name,
        ratio: props.skuDetail.sale_ratio,
        unit_name: props.skuDetail.sale_unit_name,
      },
      purchaseSpecList: [],
      purchaseSpecSourceList: [],
      purchase_spec_id: props.skuDetail.purchase_spec_id,
      price: '',
      outer_id: props.skuDetail.outer_id,
      sku_id: props.skuDetail.sku_id,
      sale_ratio: props.skuDetail.sale_ratio,
      sale_unit_name: props.skuDetail.sale_unit_name,
      sale_price: props.skuDetail.sale_price,
      ingredientSupplyList: [],
      quoted_from_supplier: false,
      latest_quote_from_supplier: false,
      std_unit_name_forsale: props.skuDetail.std_unit_name_forsale,
    }
    this.saleForm = React.createRef()
    this.distForm = React.createRef()
    this.turnoverForm = React.createRef()
  }

  componentDidMount() {
    const { spuId, skuDetail, supplyList } = this.props
    const req = { spu_id: spuId, fee_type: skuDetail.fee_type }
    const sList = _.map(supplyList, (value, key) => ({
      label:
        key === 'recommend_suppliers'
          ? i18next.t('推荐供应商')
          : i18next.t('其他供应商'),
      children: value.map((item) => ({
        value: item.id,
        text: item.name,
        upstream: item.upstream,
      })),
    }))
    const allSuppliers = [].concat.apply(
      [],
      sList.map((item) => item.children),
    )

    const supplierSelected = _.find(
      allSuppliers,
      (supplier) => supplier.value === skuDetail.supplier_id,
    )
    if (supplierSelected) {
      req.supplier_id = skuDetail.supplier_id
    } else {
      req.supplier_id = _.isEmpty(supplyList[0]) ? null : supplyList[0].id
    }

    // 周转物列表
    if (globalStore.hasPermission('get_turnover')) {
      actions.merchandise_get_material_list().then(({ data }) => {
        this.setState({
          materialList: data.map((item) => ({
            value: item.id,
            text: item.name,
          })),
        })
      })
    }

    if (req.supplier_id !== null) {
      actions.merchandise_get_purchase_specification_list(req).then((json) => {
        const purchaseSpec = _.find(json.data, (spec) => {
          return skuDetail.purchase_spec_id === spec.id
        })
        this.setState({
          purchaseSpecList: json.data,
          purchaseSpecSourceList: json.data,
          price: purchaseSpec
            ? Number(Big(purchaseSpec.ref_price || 0).div(100))
            : '',
          quoted_from_supplier: purchaseSpec.quoted_from_supplier,
          latest_quote_from_supplier: purchaseSpec.latest_quote_from_supplier,
        })
      })
    } else {
      Tip.warning(
        i18next.t('当前二级分类没有可供应的供应商,请在供应商信息里进行设置'),
      )
    }

    // 拉取所有的供应商，供多物料是用，与后台讨论说这样暂时最简单
    globalStore.isCleanFood() &&
      actions
        .merchandise_sku_common_ingredient_supply_list()
        .then((json) => this.setState({ ingredientSupplyList: json.data }))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      purchase_spec_id,
      supplier_id,
      purchaseSpecInfo,
      sku_id,
      purchaseSpecList,
    } = this.state
    const {
      outer_id,
      sale_ratio,
      sale_unit_name,
      sale_price,
      std_unit_name,
      std_unit_name_forsale,
    } = nextProps.skuDetail
    let typeSale = 1

    if (
      nextProps.skuDetail.sku_id === '' &&
      sku_id !== nextProps.skuDetail.sku_id
    ) {
      if (sale_ratio !== 1 || sale_unit_name !== std_unit_name) {
        typeSale = 2
      }
      this.setState({
        outer_id: '',
        createPurchaseSpec: false,
        sku_id: '',
        typeSale,
      })
    }

    // 切换sku信息
    if (nextProps.skuDetail.sku_id && sku_id !== nextProps.skuDetail.sku_id) {
      if (sale_ratio !== 1 || sale_unit_name !== std_unit_name) {
        typeSale = 2
      }
      this.setState({
        sku_id: nextProps.skuDetail.sku_id,
        createPurchaseSpec: false,
        sale_ratio,
        sale_unit_name,
        sale_price,
        outer_id: outer_id || '',
        typeSale,
        std_unit_name_forsale,
      })
    }

    // 新建sku信息
    if (nextProps.skuDetail.isNew) {
      this.setState({
        sale_ratio,
        sale_unit_name,
        sale_price,
        outer_id,
        std_unit_name_forsale,
      })
    }

    if (
      nextProps.skuDetail.purchase_spec_id !== purchase_spec_id &&
      nextProps.skuDetail.sku_id !== sku_id
    ) {
      const purchaseSpec = _.find(purchaseSpecList, (spec) => {
        return nextProps.skuDetail.purchase_spec_id === spec.id
      })

      this.setState({
        purchase_spec_id: nextProps.skuDetail.purchase_spec_id,
        price: purchaseSpec
          ? Number(Big(purchaseSpec.ref_price || 0).div(100))
          : '',
        quoted_from_supplier: purchaseSpec.quoted_from_supplier,
      })
    }

    if (
      nextProps.skuDetail.supplier_id !== supplier_id &&
      nextProps.skuDetail.sku_id !== sku_id
    ) {
      this.setState({
        supplier_id: nextProps.skuDetail.supplier_id,
      })

      const { spuId, skuDetail, supplyList } = nextProps
      const req = { spu_id: spuId }
      let purchase_spec_id = ''

      _.find(supplyList, (supplier) => {
        if (supplier.id === skuDetail.supplier_id) {
          purchase_spec_id = skuDetail.purchase_spec_id
          return true
        }
      })
      req.supplier_id = nextProps.skuDetail.supplier_id

      req.supplier_id &&
        actions
          .merchandise_get_purchase_specification_list(req)
          .then((json) => {
            const purchaseSpec = _.find(json.data, (spec) => {
              return purchase_spec_id === spec.id
            })

            this.setState({
              purchaseSpecList: json.data,
              purchaseSpecSourceList: json.data,
              purchase_spec_id: purchase_spec_id,
              price: purchaseSpec
                ? Number(Big(purchaseSpec.ref_price || 0).div(100))
                : '',
              quoted_from_supplier: purchaseSpec.quoted_from_supplier,
            })
          })
    }

    if (
      (purchaseSpecInfo.std_unit_name !== std_unit_name ||
        purchaseSpecInfo.ratio !== sale_ratio ||
        purchaseSpecInfo.unit_name !== sale_unit_name) &&
      nextProps.skuDetail.sku_id !== sku_id
    ) {
      this.setState({
        purchaseSpecInfo: {
          purchaseSpec: 1,
          std_unit_name: std_unit_name,
          ratio: sale_ratio,
          unit_name: sale_unit_name,
        },
      })
    }
  }

  handleChangeSalePrice = (e) => {
    const salePrice = e.target.value
    const { skuDetail } = this.props
    if (isPrice(salePrice)) {
      let stdSalePrice
      if (skuDetail.sale_ratio.toString() === '0') {
        stdSalePrice = '0'
      } else {
        if (salePrice === '') {
          stdSalePrice = '0'
        } else {
          stdSalePrice = parseFloat(
            Big(salePrice).div(skuDetail.sale_ratio).toFixed(2),
          )
        }
      }
      this.props.onChangeInfo({
        sale_price: salePrice,
        std_sale_price_forsale: stdSalePrice,
      })
      this.setState({ sale_price: salePrice })
    }
  }

  handleChangeTypeSale = (e) => {
    const type = parseInt(e.target.value)
    const { typeSale, std_unit_name_forsale } = this.state
    const { skuDetail, onChangeInfo } = this.props
    if (typeSale === type) {
      return
    }
    if (type === 1) {
      this.setState({
        typeSale: type,
        sale_ratio: 1,
        sale_unit_name: std_unit_name_forsale,
        sale_price: parseFloat(
          Big(skuDetail.std_sale_price_forsale || 0)
            .times(1)
            .toFixed(2),
        ),
      })
      onChangeInfo({
        sale_ratio: 1,
        sale_unit_name: std_unit_name_forsale,
        sale_price: Big(skuDetail.std_sale_price_forsale || 0)
          .times(1)
          .toFixed(2),
      })
    } else {
      this.setState({
        typeSale: type,
        sale_ratio: skuDetail.sale_ratio,
        sale_unit_name: skuDetail.sale_unit_name,
        sale_price: Big(skuDetail.std_sale_price_forsale || 0)
          .times(skuDetail.sale_ratio)
          .toFixed(2),
      })
      onChangeInfo({
        sale_ratio: skuDetail.sale_ratio,
        sale_unit_name: skuDetail.sale_unit_name,
        sale_price: Big(skuDetail.std_sale_price_forsale || 0)
          .times(skuDetail.sale_ratio)
          .toFixed(2),
      })
    }
  }

  handleChangeStdSalePrice = (e) => {
    const stdSalePrice = e.target.value
    const { sale_ratio } = this.state
    if (isPrice(stdSalePrice)) {
      if (stdSalePrice === '') {
        this.props.onChangeInfo({
          std_sale_price_forsale: stdSalePrice,
          sale_price: '0',
        })
        this.setState({ sale_price: 0 })
      } else {
        this.props.onChangeInfo({
          std_sale_price_forsale: stdSalePrice,
          sale_price: parseFloat(
            Big(stdSalePrice).times(sale_ratio).toFixed(2),
          ),
        })
        this.setState({
          sale_price: parseFloat(
            Big(stdSalePrice).times(sale_ratio).toFixed(2),
          ),
        })
      }
    }
  }

  handleChangeSaleRatio = (value) => {
    const { skuDetail } = this.props
    this.props.onChangeInfo({
      sale_ratio: value,
      sale_price: value
        ? parseFloat(
            Big(value).times(skuDetail.std_sale_price_forsale).toFixed(2),
          )
        : '',
    })
    this.setState({
      sale_ratio: value,
      sale_price: value
        ? parseFloat(
            Big(value).times(skuDetail.std_sale_price_forsale).toFixed(2),
          )
        : '',
    })
  }

  handleChangeOuterId = (e) => {
    const outer_id = e.target.value
      .toUpperCase()
      .replace(/^D/g, '')
      .slice(0, 20)
    this.props.onChangeInfo({ outer_id })
    this.setState({ outer_id })
  }

  handleChangeInputValue(name, e) {
    if (name === 'sale_unit_name')
      this.setState({ sale_unit_name: e.target.value })

    this.props.onChangeInfo({ [name]: e.target.value })
  }

  handleChangeValue(name, value) {
    this.props.onChangeInfo({ [name]: value })
  }

  handleChangeCraftInfo = (value) => {
    this.props.onChangeInfo(value)
  }

  handleSelectSaleMenu = (selected) => {
    this.props.onChangeInfo({ salemenu_id: selected.value })
  }

  handleChangeStockType = (v) => {
    const { skuDetail } = this.props
    if (skuDetail.stock_type === v) {
      return
    }
    if (v === 2) {
      this.props.onChangeInfo({
        stocks: '',
        stock_type: v,
      })
    } else {
      this.props.onChangeInfo({
        stocks: -99999,
        stock_type: v,
      })
    }
  }

  handleChangeSelect = (selected) => {
    const sale_unit_name =
      this.state.sale_ratio === 1 ? selected : this.state.sale_unit_name
    this.setState({
      std_unit_name_forsale: selected,
      sale_unit_name,
    })
    this.props.onChangeInfo({
      std_unit_name_forsale: selected,
      sale_unit_name,
    })
  }

  onUpload = (type, index, file, event) => {
    // index 用来标识图片
    const { skuDetail } = this.props
    const { imgUrlList } = skuDetail
    event.preventDefault()
    file.forEach((item) => {
      if ((type === 'logo' || type === 'source') && item.size > 1024 * 100) {
        Tip.warning(i18next.t('图片不能超过100kb'))
        return
      }
      if (imgUrlList[index]) {
        this.props.onUploadImg(item, type, index)
      } else {
        this.props.onUploadImg(item, type)
      }
    })
  }

  handleChangeStatus(name) {
    const { skuDetail } = this.props
    if (name === 'state') {
      this.props.onChangeInfo({ state: !skuDetail.state ? 1 : 0 })
    } else {
      this.props.onChangeInfo({ [name]: !skuDetail[name] })
    }
  }

  save(upstream) {
    const { spuId, onSave, spuName, skuDetail } = this.props
    const {
      createPurchaseSpec,
      purchaseSpecInfo,
      price,
      supplier_id,
      purchase_spec_id,
    } = this.state

    // 如果是净菜，则没有供应商和采购规格的下面逻辑了,那直接save,返回了
    if (+skuDetail.clean_food) {
      return onSave(supplier_id, purchase_spec_id)
    }

    if (createPurchaseSpec) {
      const { std_unit_name, ratio, unit_name, purchaseSpec } = purchaseSpecInfo
      const newRatio = +purchaseSpec === 1 ? 1 : ratio
      const new_unit_name = +purchaseSpec === 1 ? std_unit_name : unit_name

      const req = {
        spu_id: spuId,
        price: Number(Big(price || 0).times(100)),
        name: spuName + '|' + newRatio + std_unit_name + '/' + new_unit_name,
        unit_name: new_unit_name,
        ratio: newRatio,
      }
      actions.merchandise_purchase_specification_create(req).then((json) => {
        const psId = json.data.purchase_spec_id
        actions
          .merchandise_get_purchase_specification_list({
            spu_id: spuId,
            supplier_id: supplier_id,
          })
          .then((json) => {
            this.setState({
              purchaseSpecList: json.data,
              createPurchaseSpec: false,
              purchase_spec_id: psId,
            })
            onSave(supplier_id, psId)
          })
      })
    } else {
      if (+upstream === 1) {
        onSave(supplier_id, purchase_spec_id)
      } else {
        actions
          .merchandise_get_purchase_specification_list({
            spu_id: spuId,
            supplier_id: supplier_id,
          })
          .then((json) => {
            this.setState({
              purchaseSpecList: json.data,
              purchaseSpecSourceList: json.data,
            })
          })
        onSave(supplier_id, purchase_spec_id)
      }
    }
  }

  handleSaveSku(upstream) {
    const {
      skuDetail: {
        std_sale_price_forsale,
        suggest_price_max,
        suggest_price_min,
        is_price_timing,
      },
    } = this.props

    // 如果商品价格不在建议价格区间内，则弹框二次确认
    if (globalStore.otherInfo.showSuggestPrice && !is_price_timing) {
      if (
        suggest_price_min &&
        suggest_price_max &&
        Big(suggest_price_min).gt(suggest_price_max)
      ) {
        Tip.warning(i18next.t('定价区间的最大值必须大于最小值'))
        return
      } else if (
        (suggest_price_min &&
          Big(std_sale_price_forsale).lt(suggest_price_min)) ||
        (suggest_price_max && Big(std_sale_price_forsale).gt(suggest_price_max))
      ) {
        Dialog.confirm({
          children: i18next.t('当前商品超出建议价格区间，确认要保存吗？'),
          title: i18next.t('提示'),
        }).then(
          () => {
            // 如果是创建采购规格
            this.save(upstream)
          },
          () => {
            console.log('reject')
          },
        )

        return
      }
    }

    this.save(upstream)
  }

  handleDelete = () => {
    const { skuDetail } = this.props
    this.props.onDelete(skuDetail.sku_id)
  }

  handleSelectPurchaseSpec = (select) => {
    if (select.value === '0') {
      this.setState({ createPurchaseSpec: true, price: '' })
      return false
    }

    this.setState({
      createPurchaseSpec: false,
      purchase_spec_id: select.value,
      price: select.price ? Big(select.price).div(100) : select.price,
      unit_name: select.unit_name,
    })
  }

  handleChangeSpecType = (e) => {
    const purchaseSpecInfo = Object.assign({}, this.state.purchaseSpecInfo)
    purchaseSpecInfo.purchaseSpec = e.target.value
    if (+e.target.value === 1) {
      purchaseSpecInfo.ratio = 1
    }
    this.setState({ purchaseSpecInfo })
  }

  handleChangePurchaseRatio = (value) => {
    const purchaseSpecInfo = Object.assign({}, this.state.purchaseSpecInfo)
    purchaseSpecInfo.ratio = value
    this.setState({ purchaseSpecInfo })
  }

  handleChangePurchaseUnitName = (e) => {
    const purchaseSpecInfo = Object.assign({}, this.state.purchaseSpecInfo)
    purchaseSpecInfo.unit_name = e.target.value
    this.setState({ purchaseSpecInfo })
  }

  handleSelectMaterial = (selectedMaterial) => {
    this.props.onChangeInfo({ tid: selectedMaterial.value })
  }

  handleSelectSupplier = (feeType, selected) => {
    const { spuId } = this.props
    this.setState({
      supplier_id: selected.value,
      createPurchaseSpec: false,
      purchase_spec_id: '',
      price: '',
    })
    const reqData = { spu_id: spuId }
    reqData.supplier_id = selected.value
    reqData.fee_type = feeType || null
    actions
      .merchandise_get_purchase_specification_list(reqData)
      .then((json) => {
        this.setState({
          purchaseSpecList: json.data,
          purchaseSpecSourceList: json.data,
        })
      })
  }

  handleToPrioritySupplier(skuDetail, saleMenuSelected, supplierSelected) {
    const { sale_unit_name, sale_ratio } = this.state
    const { std_unit_name_forsale, sku_id, sku_name } = skuDetail
    const saleName = `${sale_ratio || 1}${std_unit_name_forsale}/${
      sale_unit_name || std_unit_name_forsale
    }`
    history.push({
      pathname: '/merchandise/manage/sale/priority_supplier/all_by_sku',
      search: `?sku_id=${sku_id}&sale_menu_name=${
        saleMenuSelected.name
      }&sku=${sku_name}：${saleName}&supplier=${i18next.t('供应商')}：${
        supplierSelected.text
      }`,
    })
  }

  validateOuterId(outer_id) {
    if (
      outer_id &&
      outer_id.length !== 0 &&
      (outer_id.length > 20 || outer_id.length < 1)
    ) {
      return i18next.t('自定义编码长度为1-20位!')
    }
    return ''
  }

  onSearchData = (list, query) => {
    return pinYinFilter(list, query, (value) => value.name)
  }

  validateStock(skuDetail) {
    if (+skuDetail.stock_type === 2 && skuDetail.stocks === '') {
      return i18next.t('请填写')
    }
    return ''
  }

  validateSaleSpec(typeSale, sale_ratio, sale_unit_name) {
    if (+typeSale === 2) {
      if (sale_ratio === '' || _.trim(sale_unit_name) === '') {
        return i18next.t('请填写')
      }
      if (+sale_ratio === 0) {
        return i18next.t('销售规格不能为0')
      }
    }
    return ''
  }

  validateNumLeast(sale_num_least) {
    if (+sale_num_least === 0) {
      return i18next.t('最下下单数不能为0')
    }
    return ''
  }

  validatePecSpec(purchaseSpecInfo) {
    const { purchaseSpec, ratio, unit_name } = purchaseSpecInfo

    if (+purchaseSpec === 2) {
      if (_.trim(unit_name) === '' || _.trim(ratio) === '') {
        return i18next.t('请填写')
      }

      if (+ratio === 0) {
        return i18next.t('采购规格不能为0')
      }
    }

    return ''
  }

  turnOverRender() {
    const { skuDetail } = this.props

    // 不是代售 && 有编辑权限
    const editable =
      globalStore.hasPermission('add_turnover_sku_info') &&
      this.props.type !== 'proxy'
    // 开启了关联状态
    const enabelMaterial = editable && skuDetail.bind_turnover
    const disableMaterial = !enabelMaterial
    const { materialList } = this.state
    const selectedMaterial = _.find(
      materialList,
      (m) => m.value === skuDetail.tid,
    )

    // 非 disableMaterial 才添加校验
    const addValidateProps = (value) => {
      if (disableMaterial) {
        return null
      }
      return {
        required: true,
        validate: Validator.create([], value),
      }
    }

    const fragment = (
      <>
        <FormItem label={i18next.t('周转物关联')} inline>
          <Switch
            type='primary'
            checked={!!skuDetail.bind_turnover}
            on={i18next.t('开启')}
            off={i18next.t('关闭')}
            onChange={(v) => {
              this.handleChangeValue('bind_turnover', v ? 1 : 0)
            }}
            disabled={!editable}
          />
          <div className='gm-margin-bottom-10 gm-text-desc'>
            {i18next.t('设置周转物关联后，下单后自动记录待借出的周转物数')}
          </div>
        </FormItem>
        <FormItem
          label={i18next.t('选择周转物')}
          inline
          {...addValidateProps(skuDetail.tid)}
        >
          <div className='gm-margin-bottom-10' style={{ width: '410px' }}>
            <MoreSelect
              selected={selectedMaterial}
              data={materialList}
              onSelect={this.handleSelectMaterial}
              placeholder={i18next.t('输入名称搜索')}
              renderListFilter={this.onSearchData}
              disabled={disableMaterial}
            />
          </div>
        </FormItem>
        <FormItem
          label={i18next.t('换算方式')}
          inline
          {...addValidateProps(skuDetail.turnover_bind_type)}
        >
          <RadioGroup
            name='stock_method'
            inline
            className='gm-margin-bottom-10'
            value={skuDetail.turnover_bind_type}
            onChange={this.handleChangeValue.bind(this, 'turnover_bind_type')}
          >
            <Radio disabled={disableMaterial} value={1}>
              {i18next.t('取固定值')}
            </Radio>
            <Radio disabled={disableMaterial} value={2}>
              {i18next.t('按下单数设置')}
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label={i18next.t('数量')}
          inline
          {...addValidateProps(skuDetail.turnover_ratio)}
        >
          <div className='gm-margin-bottom-10'>
            <Flex alignCenter>
              <div style={{ width: '180px' }}>
                <InputNumber
                  className='form-control'
                  value={skuDetail.turnover_ratio || ''}
                  min={0}
                  precision={0}
                  max={999999999}
                  onChange={this.handleChangeValue.bind(this, 'turnover_ratio')}
                  disabled={disableMaterial}
                />
              </div>
              <span className='gm-margin-left-5'>
                {_.get(selectedMaterial, 'unit_name')}
              </span>
            </Flex>
            {skuDetail.turnover_bind_type === 1 && (
              <div className='gm-text-desc'>
                {i18next.t(
                  '按固定值设置的情况下，不管下单数为多少，均借出固定的数量；',
                )}
                <br />
                {i18next.t(
                  '如设置为固定值3板，则不管客户下单多少板，均借出3板。',
                )}
              </div>
            )}
            {skuDetail.turnover_bind_type === 2 && (
              <div className='gm-text-desc'>
                {i18next.t(
                  '按下单数设置的情况下，借出周转物数随着下单数变动而变动；',
                )}
                <br />
                {i18next.t(
                  '如设置比例值为1板，则客户下单2板，则借出2板；若下单数为小数时，则借出周转物数向上取整。',
                )}
              </div>
            )}
          </div>
        </FormItem>
      </>
    )

    return fragment.props.children
  }

  handleChangeCleanFood = () => {
    // 当修改为净菜时，此时只能为不计重商品，所以此时必须修改计重属性值为不计重
    const data = this.props.skuDetail.clean_food
      ? { clean_food: 0 }
      : { clean_food: 1, is_weigh: 0 }
    this.props.onChangeInfo(data)
  }

  // todo不知道为啥当执行onSelect的时候，会执行这个方法，所以需要屏蔽一下value为空的情况，不发请求
  handleSearchIngredient = (value) => {
    value && actions.merchandise_common_get_ingredient_list(value)
  }

  onDeleteImg = (index, event) => {
    // 阻止事件冒泡，删除图片但不触发上传图片事件
    event.stopPropagation()

    actions.merchandise_sku_delete_image(index)
  }

  // 改变净菜信息
  handleChangeCleanFoodValue(name, e) {
    this.props.onChangeCleanFoodInfo({ [name]: e.target.value })
  }

  render() {
    const {
      supplyList,
      skuDetail,
      saleList,
      salemenuId,
      reference_price_type,
      ingredientList,
      spuUnitName,
    } = this.props

    const {
      createPurchaseSpec,
      purchaseSpecInfo,
      supplier_id,
      purchaseSpecList,
      purchase_spec_id,
      price,
      outer_id,
      typeSale,
      sale_ratio,
      sale_unit_name,
      sale_price,
      ingredientSupplyList,
      quoted_from_supplier,
      latest_quote_from_supplier,
      std_unit_name_forsale,
    } = this.state

    const tooltip = (
      <div
        className='gm-bg gm-padding-10'
        style={{ width: '200px', fontSize: '12px' }}
      >
        {i18next.t('根据耗损的百分比额外增加采购数量')}
      </div>
    )

    const suggestPriceTip = (
      <div
        className='gm-bg gm-padding-10'
        style={{ width: '200px', fontSize: '12px' }}
      >
        {i18next.t(
          '设置单价（基本单位）的建议价格区间， 当所设置的单价 <下限或 >上限时，则展示商品预警。避免超限定价。',
        )}
      </div>
    )

    // 结合销售sku权限和不是新增的状态下，则为无编辑权限.
    // ''为新增sku的sku_id;
    const editSkuPermission =
      globalStore.hasPermission('edit_sku') || skuDetail.sku_id === ''
    const deleteSkuPermission = globalStore.hasPermission('delete_sale_sku')
    const watchStocksPermission =
      globalStore.hasPermission('get_sku_stocks') || skuDetail.sku_id === ''
    const editStocksPermission =
      globalStore.hasPermission('edit_sku_stocks') || skuDetail.sku_id === ''

    // 所在报价单
    const saleMenuList = _.map(saleList, (salemenu) => {
      return { ...salemenu, text: salemenu.name, value: salemenu.id }
    })

    const saleMenuSelected = _.find(saleMenuList, (salemenu) => {
      return skuDetail.salemenu_id === salemenu.value
    })

    const feeType = saleMenuSelected ? saleMenuSelected.fee_type : ''

    // 选中供应商
    const sList = _.map(supplyList, (value, key) => ({
      label:
        key === 'recommend_suppliers'
          ? i18next.t('推荐供应商')
          : i18next.t('其他供应商'),
      children: value.map((item) => ({
        value: item.id,
        text: item.name,
        upstream: item.upstream,
      })),
    }))

    const allSuppliers = [].concat.apply(
      [],
      sList.map((item) => item.children),
    )
    const supplierSelected = _.find(
      allSuppliers,
      (supplier) => supplier.value === supplier_id,
    )

    // 结合采购来源权限和不是新增状态以及采购来源自身判断是否可以编辑，则为无编辑权限
    const editSupplyPermission = globalStore.hasPermission('edit_supplier_sku')
    const editPrioritySupplier = globalStore.hasPermission(
      'edit_priority_supplier',
    )

    const psList = _.map(purchaseSpecList, (purchaseSpec) => {
      const {
        id,
        name,
        purchase_unit_name,
        ratio,
        std_price,
        ref_price,
        std_unit_name,
        quoted_from_supplier,
        latest_quote_from_supplier,
      } = purchaseSpec
      if (supplierSelected && +supplierSelected.upstream === 1) {
        return {
          text:
            name +
            '|' +
            ratio +
            std_unit_name +
            '/' +
            purchase_unit_name +
            '|' +
            Big(std_price || 0).div(100) +
            Price.getUnit() +
            '/' +
            std_unit_name,
          value: purchaseSpec.id,
          price: purchaseSpec.ref_price,
          unit_name: purchaseSpec.std_unit_name,
          quoted_from_supplier: quoted_from_supplier,
          latest_quote_from_supplier: latest_quote_from_supplier,
        }
      }
      return {
        text: name,
        value: id,
        price: ref_price,
        unit_name: std_unit_name,
        quoted_from_supplier: quoted_from_supplier,
      }
    })

    const psSelected = _.find(psList, (ps) => {
      return ps.value === purchase_spec_id
    })

    if (supplierSelected && +supplierSelected.upstream === 0) {
      psList.push({ name: i18next.t('新建采购规格+'), value: '0' })
    }

    let referencePriceName = ''
    let referencePriceflag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === reference_price_type) {
        referencePriceName = item.name
        referencePriceflag = item.flag

        return true
      }
    })

    let isSupplierPrice = false
    if (
      referencePriceflag === 'latest_quote_price' &&
      latest_quote_from_supplier
    ) {
      isSupplierPrice = true
    } else if (
      referencePriceflag === 'last_quote_price' &&
      quoted_from_supplier
    ) {
      isSupplierPrice = true
    }
    // 是否可以修改价格
    const editSkuPrice = !editSkuPermission || !!skuDetail.is_price_timing

    // 选择销售计量单位
    const measurementUnitList = getOptionalMeasurementUnitList(spuUnitName)
    const stdUnitNameForSaleSelected = _.find(
      measurementUnitList,
      (v) => v.value === std_unit_name_forsale,
    )
    let stdUnitNameForSaleRatio = 1
    if (stdUnitNameForSaleSelected)
      stdUnitNameForSaleRatio = stdUnitNameForSaleSelected.ratio

    const itemWidth = { width: '410px' }
    const imgUrlList = skuDetail.imgUrlList

    let imagesContent = null
    // 没有权限时，展示的商品图片
    if (!editSkuPermission) {
      imagesContent =
        imgUrlList.length !== 0 ? (
          <div>
            {imgUrlList.map((image, index) => {
              return (
                <div
                  className='sku-detail-uploader gm-margin-right-10'
                  key={index}
                >
                  <div className='sku-detail-logo'>
                    <img src={image} className='sku-detail-logo-img' alt='' />
                  </div>
                  {index === 0 ? (
                    <Flex justifyCenter className='sku-detail-fix'>
                      {i18next.t('商品主图')}
                    </Flex>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <div className='sku-detail-uploader'>
            <div className='sku-detail-logo'>
              <span className='sku-detail-logo-img sku-detail-default-plus'>
                +
              </span>
            </div>
            <Flex justifyCenter className='sku-detail-fix'>
              {i18next.t('商品主图')}
            </Flex>
          </div>
        )
    }

    const clean_food_infos = [
      {
        value: 'origin_place',
        name: i18next.t('产地'),
      },
      {
        value: 'material_description',
        name: i18next.t('原料说明'),
      },
      {
        value: 'recommended_method',
        name: i18next.t('建议使用方法'),
      },
      {
        value: 'nutrition',
        name: i18next.t('营养成分表'),
      },
      {
        value: 'storage_condition',
        name: i18next.t('贮存条件'),
      },
      {
        value: 'cut_specification',
        name: i18next.t('切配规格'),
      },
      {
        value: 'license',
        name: i18next.t('许可证'),
      },
      {
        value: 'product_performance_standards',
        name: i18next.t('产品执行标准'),
      },
    ]

    return (
      <FormGroup
        className='sku-detail-module clearfix gm-margin-bottom-20'
        formRefs={[this.saleForm, this.distForm, this.turnoverForm]}
        onSubmitValidated={this.handleSaveSku.bind(
          this,
          supplierSelected ? supplierSelected.upstream : 0,
        )}
        disabled={!(editSupplyPermission || editSkuPermission)}
      >
        <QuickPanel
          icon='todo'
          iconColor='#4fb7de'
          title={i18next.t('销售信息')}
          right={
            skuDetail.sku_id &&
            deleteSkuPermission &&
            skuDetail.sku_id !== '' ? (
              <Button type='primary' plain onClick={this.handleDelete}>
                <i className='xfont xfont-delete' />
              </Button>
            ) : null
          }
        >
          <Form
            horizontal
            labelWidth='116px'
            ref={this.saleForm}
            hasButtonInGroup
          >
            <FormItem label={i18next.t('规格ID')}>
              <div className='gm-margin-top-5 gm-margin-bottom-10'>
                {skuDetail.sku_id || '-'}
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('规格名称')}
              required
              validate={Validator.create([], _.trim(skuDetail.sku_name))}
            >
              <Flex alignCenter className='gm-margin-bottom-10'>
                <input
                  className='form-control'
                  type='text'
                  placeholder={i18next.t('规格名称')}
                  value={skuDetail.sku_name || ''}
                  onChange={this.handleChangeInputValue.bind(this, 'sku_name')}
                  disabled={!editSkuPermission}
                  style={itemWidth}
                />
              </Flex>
            </FormItem>
            <FormItem
              label={i18next.t('自定义编码')}
              validate={Validator.create(
                [],
                outer_id,
                this.validateOuterId.bind(this, outer_id),
              )}
            >
              <input
                className='gm-margin-bottom-10'
                type='text'
                value={outer_id}
                placeholder={i18next.t('选填...')}
                onChange={this.handleChangeOuterId}
                disabled={!editSkuPermission}
                style={itemWidth}
              />
            </FormItem>
            <FormItem
              label={i18next.t('所在报价单')}
              required
              validate={Validator.create([], skuDetail.salemenu_id)}
            >
              <div className='gm-margin-bottom-10' style={itemWidth}>
                <MoreSelect
                  selected={saleMenuSelected}
                  data={saleMenuList}
                  placeholder={i18next.t('选择所在报价单')}
                  onSelect={this.handleSelectSaleMenu}
                  renderListFilter={this.onSearchData}
                  disabled={
                    !!skuDetail.sku_id || !editSkuPermission || !!salemenuId
                  }
                />
              </div>
            </FormItem>
            <FormItem
              className='gm-margin-bottom-15'
              label={i18next.t('是否时价')}
            >
              <Switch
                type='primary'
                checked={!!skuDetail.is_price_timing}
                on={i18next.t('时价')}
                off={i18next.t('非时价')}
                onChange={this.handleChangeStatus.bind(this, 'is_price_timing')}
                disabled={!editSkuPermission}
              />
            </FormItem>
            <FormItem
              className='gm-margin-bottom-15'
              label={i18next.t('是否称重')}
            >
              <Switch
                type='primary'
                checked={!!skuDetail.is_weigh}
                on={i18next.t('称重')}
                off={i18next.t('不称重')}
                onChange={this.handleChangeStatus.bind(this, 'is_weigh')}
                disabled={!editSkuPermission || !!skuDetail.clean_food}
              />
            </FormItem>
            <FormItem
              className='gm-margin-bottom-15'
              label={i18next.t('销售状态')}
            >
              <Switch
                type='primary'
                checked={!!skuDetail.state}
                on={i18next.t('上架')}
                off={i18next.t('下架')}
                onChange={this.handleChangeStatus.bind(this, 'state')}
                disabled={!editSkuPermission}
              />
            </FormItem>
            {globalStore.hasPermission('edit_measurement') && (
              <FormItem
                className='gm-margin-bottom-15'
                label={i18next.t('选择销售计量单位')}
              >
                <div>
                  {measurementUnitList.length ? (
                    <Select
                      value={std_unit_name_forsale}
                      data={_.map(measurementUnitList, (i) => ({
                        value: i.value,
                        text: i.text,
                      }))}
                      style={{ minWidth: '120px' }}
                      onChange={this.handleChangeSelect}
                    />
                  ) : (
                    <div className='gm-padding-top-5'>
                      {std_unit_name_forsale}
                    </div>
                  )}
                </div>
              </FormItem>
            )}
            <FormItem
              label={i18next.t('单价(基本单位)')}
              required
              validate={Validator.create([], skuDetail.std_sale_price_forsale)}
            >
              <div className='input-group sku-detail-input-group-width gm-margin-bottom-10'>
                <input
                  className='form-control'
                  type='text'
                  value={skuDetail.std_sale_price_forsale}
                  onChange={this.handleChangeStdSalePrice}
                  disabled={editSkuPrice}
                />
                <div className='input-group-addon'>
                  {' '}
                  {Price.getUnit(feeType) + '/'} {std_unit_name_forsale}
                </div>
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('单价(销售单位)')}
              required
              validate={Validator.create([], sale_price)}
            >
              <div className='input-group sku-detail-input-group-width gm-margin-bottom-10'>
                <input
                  className='form-control'
                  type='text'
                  value={sale_price}
                  onChange={this.handleChangeSalePrice}
                  disabled={editSkuPrice}
                />
                <div className='input-group-addon'>
                  {Price.getUnit(feeType) + '/'}{' '}
                  {sale_unit_name || std_unit_name_forsale}
                </div>
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('最小下单数')}
              required
              validate={Validator.create(
                [],
                skuDetail.sale_num_least,
                this.validateNumLeast.bind(this, skuDetail.sale_num_least),
              )}
            >
              <div className='input-group sku-detail-input-group-width'>
                <InputNumber
                  className='form-control'
                  value={skuDetail.sale_num_least}
                  min={0}
                  precision={2}
                  onChange={this.handleChangeValue.bind(this, 'sale_num_least')}
                  disabled={!editSkuPermission}
                />
                <div className='input-group-addon'>
                  {sale_unit_name || std_unit_name_forsale}
                </div>
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('销售规格')}
              required
              validate={Validator.create(
                [],
                skuDetail.sale_ratio,
                this.validateSaleSpec.bind(
                  this,
                  typeSale,
                  sale_ratio,
                  sale_unit_name,
                ),
              )}
            >
              <div className='gm-margin-bottom-10'>
                <label className='radio-inline sku-detail-radio'>
                  <input
                    className='sku-detail-radio-circle'
                    type='radio'
                    name='typeSale'
                    value={1}
                    checked={typeSale === 1}
                    onChange={this.handleChangeTypeSale}
                    disabled={!editSkuPermission}
                  />
                  {i18next.t('按')}
                  {std_unit_name_forsale}
                </label>
                <div>
                  <label className='radio-inline sku-detail-radio sku-detail-radio-width'>
                    {this.state.typeSale !== 2 ? (
                      <div className='sku-detail-radio-block' />
                    ) : null}
                    <input
                      className='sku-detail-radio-circle'
                      type='radio'
                      name='typeSale'
                      value={2}
                      checked={typeSale === 2}
                      onChange={this.handleChangeTypeSale}
                      disabled={!editSkuPermission}
                    />
                    <InputNumber
                      value={sale_ratio}
                      onChange={this.handleChangeSaleRatio}
                      min={0}
                      precision={2}
                      disabled={!editSkuPermission}
                      className='sku-detail-radio-input'
                    />
                    <div className='sku-detail-radio-input-addon'>
                      {std_unit_name_forsale}/
                    </div>
                    <input
                      className='sku-detail-radio-input'
                      type='text'
                      value={sale_unit_name}
                      onChange={this.handleChangeInputValue.bind(
                        this,
                        'sale_unit_name',
                      )}
                      disabled={!editSkuPermission}
                    />
                  </label>
                </div>
              </div>
            </FormItem>
            <FormItem label={i18next.t('商品描述')}>
              <textarea
                className='form-control gm-margin-bottom-10'
                rows='4'
                placeholder={i18next.t('规格描述')}
                value={skuDetail.desc || ''}
                onChange={this.handleChangeInputValue.bind(this, 'desc')}
                disabled={!editSkuPermission}
                style={itemWidth}
              />
            </FormItem>
            <FormItem label={i18next.t('商品图片')}>
              <div className='sku-detail-logo-wrap gm-margin-bottom-10'>
                {editSkuPermission ? (
                  <UploadDeleteImgs
                    imgArray={imgUrlList || []}
                    handleUpload={this.onUpload}
                    handleDeleteImg={this.onDeleteImg}
                  />
                ) : (
                  <div>{imagesContent}</div>
                )}
              </div>
            </FormItem>
            {globalStore.otherInfo.showSuggestPrice ? (
              <FormItem
                label={`${i18next.t('建议价格区间')}
                ${i18next.t('（基本单位）')}`}
              >
                <Flex>
                  <div className='input-group sku-detail-input-group-width'>
                    <InputNumber
                      className='form-control'
                      value={skuDetail.suggest_price_min}
                      min={0}
                      max={9999999999}
                      precision={2}
                      onChange={this.handleChangeValue.bind(
                        this,
                        'suggest_price_min',
                      )}
                      disabled={editSkuPrice}
                    />
                    <div className='input-group-addon'>
                      {Price.getUnit() + '/'} {std_unit_name_forsale}
                    </div>
                  </div>
                  <div
                    className='gm-margin-lr-5'
                    style={{ lineHeight: '30px' }}
                  >
                    -
                  </div>
                  <div className='input-group sku-detail-input-group-width'>
                    <InputNumber
                      className='form-control'
                      value={skuDetail.suggest_price_max}
                      min={0}
                      max={9999999999}
                      precision={2}
                      onChange={this.handleChangeValue.bind(
                        this,
                        'suggest_price_max',
                      )}
                      disabled={editSkuPrice}
                    />
                    <div className='input-group-addon'>
                      {' '}
                      {Price.getUnit(feeType) + '/'} {std_unit_name_forsale}
                    </div>
                  </div>
                  <Popover showArrow type='hover' popup={suggestPriceTip}>
                    <i
                      className='xfont xfont-warning-circle gm-margin-left-5'
                      style={{ paddingTop: '7px' }}
                    />
                  </Popover>
                </Flex>
              </FormItem>
            ) : null}
          </Form>
        </QuickPanel>
        <QuickPanel
          icon='network'
          iconColor='#7f4f6e'
          title={i18next.t('供应链信息')}
        >
          <Form
            horizontal
            labelWidth='116px'
            ref={this.distForm}
            hasButtonInGroup
          >
            {globalStore.isCleanFood() && (
              <FormItem label={i18next.t('是否开启加工')} inline>
                <>
                  <Switch
                    type='primary'
                    checked={!!skuDetail.clean_food}
                    on={i18next.t('启用')}
                    off={i18next.t('不启用')}
                    onChange={this.handleChangeCleanFood}
                  />
                  <div className='gm-text-desc gm-text-12 gm-margin-top-5'>
                    {i18next.t(
                      '启用后商品额外进入生产流程，发布生产计划；如无需进入生产流程，选择“不启用”',
                    )}
                  </div>
                </>
              </FormItem>
            )}
            {!skuDetail.clean_food && (
              <FormItem
                label={i18next.t('默认供应商')}
                required
                validate={Validator.create(
                  [],
                  supplierSelected ? supplierSelected.value : '',
                )}
              >
                <div>
                  <div
                    className='gm-margin-bottom-10 gm-margin-right-10 gm-inline-block'
                    style={itemWidth}
                  >
                    <MoreSelect
                      selected={supplierSelected}
                      data={sList}
                      isGroupList
                      onSelect={this.handleSelectSupplier.bind(this, feeType)}
                      renderListFilter={this.onSearchData}
                      placeholder={i18next.t('选择供应商')}
                    />
                  </div>
                  {!skuDetail.isNew &&
                  editPrioritySupplier &&
                  supplierSelected &&
                  saleMenuSelected ? (
                    <div className='gm-margin-bottom-10 gm-margin-right-10 gm-inline-block'>
                      <a
                        className='gm-margin-right-5'
                        onClick={this.handleToPrioritySupplier.bind(
                          this,
                          skuDetail,
                          saleMenuSelected,
                          supplierSelected,
                        )}
                        href='javascript:;'
                      >
                        {i18next.t('设置客户指定供应商')}
                      </a>
                      <Popover
                        showArrow
                        type='hover'
                        popup={
                          <div
                            className='gm-border gm-padding-5 gm-bg gm-text-12'
                            style={{ width: '320px' }}
                          >
                            {i18next.t(
                              '采购任务优先按默认供应商汇总，如设置客户指定供应商后，则此客户的订单将按指定供应商汇总',
                            )}
                          </div>
                        }
                      >
                        <i
                          className='xfont xfont-warning-circle'
                          style={{ paddingTop: '7px' }}
                        />
                      </Popover>
                    </div>
                  ) : null}
                </div>
              </FormItem>
            )}
            {!skuDetail.clean_food &&
              (createPurchaseSpec ? (
                <FormItem
                  label={i18next.t('采购规格')}
                  required
                  validate={Validator.create(
                    [],
                    purchaseSpecInfo.purchaseSpec,
                    this.validatePecSpec.bind(this, purchaseSpecInfo),
                  )}
                >
                  <div className='gm-margin-bottom-10'>
                    <label className='radio-inline sku-detail-radio'>
                      <input
                        className='sku-detail-radio-circle'
                        type='radio'
                        name='purchaseSpec'
                        value={1}
                        checked={+purchaseSpecInfo.purchaseSpec !== 2}
                        onChange={this.handleChangeSpecType}
                        disabled={!editSkuPermission}
                      />
                      {i18next.t('按')}
                      {purchaseSpecInfo.std_unit_name}
                    </label>
                    <div>
                      <label className='radio-inline sku-detail-radio sku-detail-radio-width'>
                        {+purchaseSpecInfo.purchaseSpec !== 2 ? (
                          <div className='sku-detail-radio-block' />
                        ) : null}
                        <input
                          className='sku-detail-radio-circle'
                          type='radio'
                          name='purchaseSpec'
                          value={2}
                          checked={+purchaseSpecInfo.purchaseSpec === 2}
                          onChange={this.handleChangeSpecType}
                          disabled={!editSkuPermission}
                        />
                        <InputNumber
                          value={purchaseSpecInfo.ratio}
                          onChange={this.handleChangePurchaseRatio}
                          min={0}
                          precision={2}
                          className='sku-detail-radio-input'
                          disabled={!editSkuPermission}
                        />
                        <div className='sku-detail-radio-input-addon'>
                          {purchaseSpecInfo.std_unit_name}/
                        </div>
                        <input
                          className='sku-detail-radio-input'
                          type='text'
                          value={purchaseSpecInfo.unit_name}
                          onChange={this.handleChangePurchaseUnitName}
                          disabled={!editSkuPermission}
                        />
                      </label>
                    </div>
                  </div>
                </FormItem>
              ) : (
                <FormItem
                  label={i18next.t('采购规格')}
                  required
                  validate={Validator.create(
                    [],
                    psSelected ? psSelected.value : '',
                  )}
                >
                  <div style={itemWidth} className='gm-margin-bottom-10'>
                    <MoreSelect
                      selected={psSelected}
                      data={psList}
                      onSelect={this.handleSelectPurchaseSpec}
                      renderListFilter={this.onSearchData}
                      placeholder={i18next.t('选择采购规格')}
                    />
                  </div>
                </FormItem>
              ))}
            {/* globalStore.isCleanFood()：是否为净菜站点
            skuDetail.clean_food：是否为净菜商品
            两者联系：净菜站点并非所有商品均为净菜商品，非净菜站点没有净菜商品 */}
            {supplierSelected && +supplierSelected.upstream === 1 ? null : (
              <FormItem
                label={i18next.t('参考成本')}
                validate={Validator.create([], price)}
              >
                <Flex alignCenter className='gm-margin-bottom-10'>
                  <div
                    className='gm-margin-right-5'
                    style={{ paddingTop: '7px' }}
                  >
                    {' '}
                    {price
                      ? Big(price).toFixed(2) +
                        Price.getUnit(feeType) +
                        '/' +
                        skuDetail.std_unit_name
                      : '-'}
                  </div>
                  {
                    <Popover
                      showArrow
                      type='hover'
                      popup={
                        <div
                          className='gm-border gm-padding-5 gm-bg gm-text-12'
                          style={{ minWidth: '130px' }}
                        >
                          {i18next.t('来源')}：{referencePriceName}
                        </div>
                      }
                    >
                      <i
                        className='xfont xfont-warning-circle'
                        style={{ paddingTop: '7px' }}
                      />
                    </Popover>
                  }
                  {isSupplierPrice && (
                    <Popover
                      top
                      showArrow
                      type='hover'
                      popup={<div>{i18next.t('供应商报价')}</div>}
                    >
                      <SvgSupplier
                        className='gm-text-14'
                        style={{
                          color: 'green',
                          marginLeft: '5px',
                          marginTop: '7px',
                        }}
                      />
                    </Popover>
                  )}
                </Flex>
              </FormItem>
            )}
            {supplierSelected && +supplierSelected.upstream === 1 ? (
              <FormItem label={i18next.t('分拣设置')}>
                <Flex>
                  <label className='checkbox-inline'>
                    <input
                      type='checkbox'
                      value='slitting'
                      checked={skuDetail.slitting}
                      onChange={this.handleChangeStatus.bind(this, 'slitting')}
                      disabled={!editSkuPermission}
                    />{' '}
                    {i18next.t('我能分切')}
                  </label>
                  <label className='checkbox-inline'>
                    <input
                      type='checkbox'
                      value='partframe'
                      checked={skuDetail.partframe}
                      onChange={this.handleChangeStatus.bind(this, 'partframe')}
                      disabled={!editSkuPermission}
                    />{' '}
                    {i18next.t('我能投框')}
                  </label>
                </Flex>
              </FormItem>
            ) : null}
            {skuDetail.slitting && !skuDetail.clean_food ? (
              <FormItem label={i18next.t('设置耗损比例')}>
                <Flex className='gm-margin-bottom-10'>
                  <div className='input-group sku-detail-input-group-width gm-margin-right-5'>
                    <InputNumber
                      value={skuDetail.attrition_rate}
                      onChange={this.handleChangeValue.bind(
                        this,
                        'attrition_rate',
                      )}
                      min={0}
                      precision={2}
                      className='form-control sku-detail-inner-group-input'
                    />
                    <div className='input-group-addon'>%</div>
                  </div>
                  <Popover
                    showArrow
                    type='hover'
                    popup={tooltip}
                    component={<span />}
                  >
                    <i
                      className='xfont xfont-question-circle'
                      style={{ lineHeight: '30px' }}
                    />
                  </Popover>
                </Flex>
              </FormItem>
            ) : null}
            {globalStore.isCleanFood() &&
              !!skuDetail.clean_food &&
              _.map(clean_food_infos, (item, index) => {
                return (
                  <FormItem
                    label={item.name}
                    key={index}
                    style={{ width: '50%' }}
                  >
                    <input
                      value={skuDetail.clean_food_info[item.value]}
                      onChange={this.handleChangeCleanFoodValue.bind(
                        this,
                        `${item.value}`,
                      )}
                    />
                  </FormItem>
                )
              })}
            {watchStocksPermission ? (
              <FormItem
                label={i18next.t('库存设置')}
                required
                validate={Validator.create(
                  [],
                  skuDetail.stock_type,
                  this.validateStock.bind(this, skuDetail),
                )}
              >
                <RadioGroup
                  name='storeSetting'
                  style={{ marginTop: '-9px' }}
                  value={skuDetail.stock_type || 1}
                  inline
                  onChange={this.handleChangeStockType}
                >
                  <Radio
                    value={1}
                    disabled={!editSkuPermission || !editStocksPermission}
                  >
                    {i18next.t('不设置库存')}
                  </Radio>
                  {supplierSelected && +supplierSelected.upstream === 1 && (
                    <Radio
                      value={0}
                      disabled={!editSkuPermission || !editStocksPermission}
                    >
                      {i18next.t('读取上游库存')}
                    </Radio>
                  )}
                  <Radio
                    value={3}
                    disabled={!editSkuPermission || !editStocksPermission}
                  >
                    {i18next.t('限制库存')}&nbsp;
                    {
                      // 若是净菜，则直接取skuDetail.spu_stock的值
                      skuDetail.sku_id
                        ? i18next.t('当前可用库存') +
                          (!skuDetail.clean_food
                            ? _.floor(
                                skuDetail.spu_stock /
                                  sale_ratio /
                                  stdUnitNameForSaleRatio,
                              ) + sale_unit_name
                            : `${parseFloat(
                                Big(skuDetail.spu_stock || 0).toFixed(2),
                              )}${sale_unit_name}`)
                        : ''
                    }
                  </Radio>
                  <Radio
                    value={2}
                    disabled={!editSkuPermission || !editStocksPermission}
                  >
                    <div className='sku-detail-radio gm-inline-block'>
                      {skuDetail.stock_type !== 2 ? (
                        <div className='sku-detail-radio-stocks-block' />
                      ) : null}
                      {i18next.t('设置库存')}&nbsp;
                      <InputNumber
                        className='sku-detail-radio-input'
                        style={{ width: '80px' }}
                        min={0}
                        precision={2}
                        value={skuDetail.stocks}
                        onChange={this.handleChangeValue.bind(this, 'stocks')}
                        disabled={!editSkuPermission || !editStocksPermission}
                      />
                      <div className='sku-detail-radio-input-addon'>
                        {_.trim(sale_unit_name)
                          ? sale_unit_name
                          : skuDetail.std_unit_name_forsale}
                      </div>
                    </div>
                  </Radio>
                </RadioGroup>
              </FormItem>
            ) : null}
          </Form>
        </QuickPanel>
        {globalStore.isCleanFood() && !!skuDetail.clean_food && (
          <SkuDetailCraft
            skuDetail={skuDetail}
            ingredientList={ingredientList}
            onSearchIngredient={this.handleSearchIngredient}
            onChangeCraftInfo={this.handleChangeCraftInfo}
            ingredientSupplyList={ingredientSupplyList}
          />
        )}
        <QuickPanel
          icon='square'
          iconColor='#fe7b8c'
          title={i18next.t('周转物')}
        >
          <Form
            horizontal
            labelWidth='116px'
            ref={this.turnoverForm}
            hasButtonInGroup
          >
            {this.turnOverRender()}
          </Form>
        </QuickPanel>
      </FormGroup>
    )
  }
}

SkuDetail.propTypes = {
  onUploadImg: PropTypes.func,
  spuId: PropTypes.string,
  salemenuId: PropTypes.string,
  reference_price_type: PropTypes.number,
  spuName: PropTypes.string,
  spuUnitName: PropTypes.string,
  type: PropTypes.oneOf(['sale', 'proxy', 'saleOnly']),
  skuDetail: PropTypes.object,
  saleList: PropTypes.array,
  supplyList: PropTypes.object,
  onChangeInfo: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  ingredientList: PropTypes.array,
  onChangeCleanFoodInfo: PropTypes.func,
}
SkuDetail.defaultProps = {
  onUploadImg: () => {},
  type: 'sale',
  spuUnitName: '斤',
  skuDetail: {
    imgUrlList: [],
  },
  saleList: [],
  supplyList: [],
  onChangeInfo: () => {},
  onSave: () => {},
  onDelete: () => {},
  ingredientList: [],
  onChangeCleanFoodInfo: () => {},
}

export default SkuDetail
