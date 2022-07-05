import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  Tip,
  Loading,
  Button,
  RadioGroup,
  Radio,
  Price,
  IconDownUp,
  InputNumberV2,
} from '@gmfe/react'
import GroupTransfer from '../../../common/components/group_transfer'
import { filterGroupList, getLeaf } from '../../../common/util'
import { history } from '../../../common/service'
import {
  renderAddressItem,
  searchAddress,
  deleteTemplate,
  isInteger,
  cAddressConvertTree,
  selectPostObj,
} from './util'
import globalStore from '../../../stores/global'
import _ from 'lodash'
import { toJS } from 'mobx'
import { observer, Provider } from 'mobx-react'
import store from './store'
import FreightType from './components/freightType'

@observer
class FreightTemplate extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isShowLiftFreight: false,
      open: false,
    }
  }

  componentDidMount() {
    const { query } = this.props.location
    store.resetData()
    store.clearTemplateData()
    store.changeMerchantListSelected([])
    store.getFreightMerchantList(query.id)
    store.getCMerchantList()

    if (query.id) {
      // 详情态需获取已选择商户列表
      store.getFreightTemplateDetail(query.id)
      store.changeViewType('edit')
    }
  }

  handleFreightTypeChange = (value, type) => {
    store.changeFreightType(value, type)
  }

  handleStartPriceChange = (value, type) => {
    store.changeStartPrice(value, type)
  }

  handleNameChange = (e) => {
    store.changeName(e.target.value)
  }

  handleSelectClick = (selectedValue, type) => {
    const leftList = toJS(store.merchantGroup)
    const rightLeafs = getLeaf(toJS(store.merchantListSelected))
    let rightValues = _.map(rightLeafs, (leaf) => leaf.value)
    // right --> left
    if (type === 'right') {
      rightValues = _.filter(
        rightValues,
        (leaf) => _.findIndex(selectedValue, (v) => v === leaf) === -1,
      )
    } else {
      // left --> right
      rightValues = rightValues.concat(selectedValue)
    }
    // 加上c客户
    const toc_list = cAddressConvertTree(store.cMerchantList)
    const _rightList = filterGroupList(leftList.concat(toc_list), (v) => {
      return _.includes(rightValues, v.value)
    })

    store.changeMerchantListSelected(_rightList)
  }

  handleCancel = () => {
    store.clearTemplateData()
    store.changeMerchantListSelected([])
    history.push('/system/setting/freight')
  }

  handleChangeFilterType = (v) => {
    const { query } = this.props.location
    store.changeFilterType(v, query.id)
  }

  // 检查输入运费
  checkFreightData = (freightData, type, viewNumber) => {
    const freightType =
      type === 'delivery' ? i18next.t('配送') : i18next.t('自提')
    if (
      freightData.min_total_price === '' ||
      !isInteger(freightData.min_total_price)
    ) {
      Tip.warning(
        `${freightType}${i18next.t(
          '运费起送价不能为空,且必须为不小于0的整数.',
        )}`,
      )
      return false
    }
    // 只有按距离还有按人工设置需要校验section
    if (viewNumber === 2 || viewNumber === 5) {
      for (const s of freightData.section) {
        if (s.max === '' || !isInteger(s.max)) {
          Tip.warning(
            `${freightType}${i18next.t(
              '运费下单金额区间不能为空,且必须为不小于0的整数.',
            )}`,
          )
          return false
        }
        if (s.freight === '' || !isInteger(s.freight)) {
          Tip.warning(
            `${freightType}${i18next.t('运费不能为空,且必须为不小于0的整数.')}`,
          )
          return false
        }
      }
    }
    return true
  }

  handleCheckAutoSetting(type, value) {
    if (
      type === 3 &&
      (!_.isNumber(value.amount_auto_section.addition_fee) ||
        !_.isNumber(value.amount_auto_section.base_charge) ||
        !_.isNumber(value.amount_auto_section.increase_fee) ||
        !_.isNumber(value.amount_auto_section.origin_fee))
    ) {
      return false
    }
    return true
  }

  handleConfirm = () => {
    const {
      templateData,
      viewType,
      merchantListSelected,
      viewDeliveryNumber,
      viewPickUpNumber,
    } = store
    const { delivery_freight, pick_up_freight, name } = templateData
    // 模板名称不能为空
    if (name.trim() === '') {
      Tip.warning(i18next.t('运费模板名称不能为空'))
      return
    }

    // 模板输入运费检查
    const check_delivery_freight = this.checkFreightData(
      delivery_freight,
      'delivery',
      viewDeliveryNumber,
    )
    const check_pick_up_freight = this.checkFreightData(
      pick_up_freight,
      'pick_up',
      viewPickUpNumber,
    )

    if (!check_delivery_freight || !check_pick_up_freight) {
      return
    }
    // 按下单金额比例设置检查
    if (
      viewDeliveryNumber === 4 &&
      !_.isNumber(delivery_freight.scale_set.percentage)
    ) {
      Tip.warning(i18next.t('请输入金额百分比'))
      return
    }
    if (
      viewPickUpNumber === 4 &&
      !_.isNumber(pick_up_freight.scale_set.percentage)
    ) {
      Tip.warning(i18next.t('请输入金额百分比'))
      return
    }

    // 自动设置价格区间与运费
    const checkDeliveryAuto = this.handleCheckAutoSetting(
      viewDeliveryNumber,
      delivery_freight,
    )
    const checkPickUpAuto = this.handleCheckAutoSetting(
      viewPickUpNumber,
      pick_up_freight,
    )
    if (!checkDeliveryAuto || !checkPickUpAuto) {
      Tip.warning(i18next.t('请输入完整价格区间与运费'))
      return
    }
    const list = _.map(
      getLeaf(merchantListSelected.slice()),
      (leaf) => leaf.value,
    )

    // 更新数据
    let postData = {
      name,
      delivery_freight: JSON.stringify(
        selectPostObj(delivery_freight, store.viewDeliveryNumber),
      ),
      pick_up_freight: JSON.stringify(
        selectPostObj(pick_up_freight, store.viewPickUpNumber),
      ),
      address_ids: JSON.stringify(list),
      delivery_type: store.viewDeliveryNumber,
      pick_up_type: store.viewPickUpNumber,
    }

    if (viewType === 'edit') {
      postData = {
        ...postData,
        id: templateData.id,
      }
      store.uploadFreightTemplate(postData)
    } else {
      store.createFreightTemplate(postData)
    }
  }

  handleDelete = () => {
    deleteTemplate(store.templateData)
  }

  getPcikUpFreightSet = () => {
    const { viewType, templateData } = store
    const { pick_up_freight } = templateData

    if (viewType === 'create') {
      // 创建模板 -- 点击才展示自提运费设置
      return this.state.isShowLiftFreight
    } else {
      if (this.state.isShowLiftFreight) {
        return true
      } else if (
        pick_up_freight.min_total_price !== 0 ||
        pick_up_freight.section.length !== 1 ||
        pick_up_freight.section[0].freight !== 0
      ) {
        // 编辑模板 -- 已设置自提运费时直接展示，否则点击才展示
        return true
      } else {
        return false
      }
    }
  }

  handleToggle() {
    this.setState({ open: !this.state.open })
  }

  render() {
    const {
      viewType,
      merchantGroup,
      merchantListSelected,
      templateData,
      isFreightOfDelivery,
      isFreightOfPickUp,
      isLoading,
      merchantCategory,
      filterType,
      placeHolder,
      cMerchantList,
    } = store
    const { open } = this.state
    const canDelFreight = globalStore.hasPermission('delete_freight')
    const canEditFreight = globalStore.hasPermission('edit_freight')
    // 运费模板信息
    const { name, delivery_freight, pick_up_freight } = templateData
    // 过滤选中商户
    const rightList = toJS(merchantListSelected) || []
    const selected = _.map(getLeaf(rightList), (leaf) => leaf.value)
    const leftList = toJS(merchantGroup)
    let _leftList = filterGroupList(leftList, (v) => {
      return !_.includes(selected, v.value)
    })

    // 加入未选择的c端客户
    const noSelected = _.filter(
      cMerchantList,
      (merchant) =>
        _.findIndex(selected, (s) => s === merchant.address_id) === -1,
    )
    const cList = noSelected.length ? cAddressConvertTree(noSelected) : []
    _leftList = _leftList.concat(cList)

    return (
      <FormGroup
        formRefs={[this.refform]}
        onSubmit={this.handleConfirm}
        onCancel={this.handleCancel}
        disabled={!canEditFreight && viewType === 'edit'}
      >
        <FormPanel
          title={i18next.t('基本信息')}
          right={
            viewType === 'edit' && canDelFreight ? (
              <Button type='primary' plain onClick={this.handleDelete}>
                {i18next.t('删除')}
              </Button>
            ) : (
              <span />
            )
          }
        >
          <Form ref={this.refform} labelWidth='180px' colWidth='800px'>
            <FormItem label={i18next.t('运费模板名称')} required>
              <input
                style={{ width: '300px' }}
                className='gm-margin-left-10'
                placeholder={i18next.t('请输入模板名称')}
                type='text'
                value={name}
                onChange={(e) => this.handleNameChange(e)}
                disabled={!canEditFreight && viewType === 'edit'}
              />
            </FormItem>
            <FormItem label={i18next.t('起送价')}>
              <div className='form-inline gm-margin-left-10'>
                <span>{i18next.t('下单金额满')}&nbsp;</span>
                <InputNumberV2
                  min={0}
                  max={999999999}
                  className='form-control'
                  value={delivery_freight.min_total_price}
                  precision={2}
                  style={{ width: '100px', height: '30px' }}
                  onChange={(e) =>
                    this.handleStartPriceChange(e, 'delivery_freight')
                  }
                  disabled={!canEditFreight && viewType === 'edit'}
                />
                &nbsp;
                <span>
                  {`${Price.getUnit()}${i18next.t('起送')}。（${i18next.t(
                    '不设起送价则写0',
                  )}${Price.getUnit()}）`}
                </span>
              </div>
            </FormItem>
            <FormItem label={i18next.t('配送运费')}>
              <RadioGroup
                inline
                name='deliveryFreight'
                value={isFreightOfDelivery}
                onChange={(value) =>
                  this.handleFreightTypeChange(value, 'delivery_freight')
                }
                className='gm-flex gm-padding-bottom-15 gm-padding-left-10'
              >
                <Radio
                  value={0}
                  disabled={!canEditFreight && viewType === 'edit'}
                >
                  {i18next.t('不收运费')}
                </Radio>
                <Radio
                  value={1}
                  disabled={!canEditFreight && viewType === 'edit'}
                >
                  {i18next.t('收运费')}
                </Radio>
              </RadioGroup>
              {isFreightOfDelivery === 0 && (
                <div className='form-inline form-group col-xs-12 gm-margin-top-15'>
                  <span>
                    <i className='ifont ifont-double-right' />
                    &nbsp;{i18next.t('任意下单金额都不收运费。')}&nbsp;
                  </span>
                </div>
              )}
            </FormItem>
            {!!isFreightOfDelivery && (
              <Provider store={store}>
                <FreightType type='delivery_freight' />
              </Provider>
            )}
            <Button
              type='link'
              className='gm-padding-right-0'
              onClick={this.handleToggle.bind(this)}
            >
              {open ? '收起' : '展开'}自提点运费设置
              <IconDownUp active={open} />
            </Button>
            {open && (
              <>
                <FormItem label={i18next.t('起送价')}>
                  <div className='form-inline gm-margin-left-10'>
                    <span>{i18next.t('下单金额满')}&nbsp;</span>
                    <InputNumberV2
                      min={0}
                      max={999999999}
                      className='form-control'
                      value={pick_up_freight.min_total_price}
                      style={{ width: '80px' }}
                      onChange={(e) =>
                        this.handleStartPriceChange(e, 'pick_up_freight')
                      }
                      disabled={!canEditFreight && viewType === 'edit'}
                    />
                    <span>
                      {`${Price.getUnit()}${i18next.t('起送')}。（${i18next.t(
                        '不设起送价则写0',
                      )}
                    ${Price.getUnit()}）`}
                    </span>
                  </div>
                </FormItem>
                <FormItem label={i18next.t('自提运费')}>
                  <RadioGroup
                    inline
                    name='pickUpFreight'
                    value={isFreightOfPickUp}
                    onChange={(value) =>
                      this.handleFreightTypeChange(value, 'pick_up_freight')
                    }
                    className='gm-flex gm-padding-bottom-15 gm-padding-left-10'
                  >
                    <Radio
                      value={0}
                      disabled={!canEditFreight && viewType === 'edit'}
                    >
                      {i18next.t('不收运费')}
                    </Radio>
                    <Radio
                      value={1}
                      disabled={!canEditFreight && viewType === 'edit'}
                    >
                      {i18next.t('收运费')}
                    </Radio>
                  </RadioGroup>
                  {isFreightOfPickUp === 0 && (
                    <div className='form-inline form-group col-xs-12 gm-margin-top-15'>
                      <span>
                        <i className='ifont ifont-double-right' />
                        &nbsp;{i18next.t('任意下单金额都不收运费。')}&nbsp;
                      </span>
                    </div>
                  )}
                </FormItem>
                {!!isFreightOfPickUp && (
                  <Provider store={store}>
                    <FreightType type='pick_up_freight' />
                  </Provider>
                )}
              </>
            )}

            <FormItem label={i18next.t('配置商户')}>
              {isLoading ? (
                <Loading />
              ) : (
                <>
                  <RadioGroup
                    name='merchant-filter'
                    value={filterType}
                    onChange={this.handleChangeFilterType}
                    className='gm-flex gm-padding-bottom-15 gm-padding-left-10'
                  >
                    {merchantCategory.map((item) => (
                      <Radio
                        value={item.value}
                        key={item.value}
                        className='gm-margin-right-20'
                      >
                        {item.text}
                      </Radio>
                    ))}
                  </RadioGroup>
                  <GroupTransfer
                    leftTree={{
                      leftPlaceholder: placeHolder.left,
                      leftTitle: i18next.t('全部商户'),
                      leftList: _leftList,
                    }}
                    rightTree={{
                      rightPlaceholder: placeHolder.right,
                      rightTitle: i18next.t('已选商户'),
                      rightList,
                    }}
                    onToRightClick={(selected) =>
                      this.handleSelectClick(selected, 'left')
                    }
                    onToLeftClick={(selected) =>
                      this.handleSelectClick(selected, 'right')
                    }
                    onLeafItemRender={renderAddressItem}
                    onSearch={searchAddress}
                  />
                </>
              )}
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default FreightTemplate
