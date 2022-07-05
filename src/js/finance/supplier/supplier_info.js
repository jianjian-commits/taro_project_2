import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import {
  Dialog,
  Form,
  FormBlock,
  FormGroup,
  FormItem,
  FormPanel,
  ImgUploader,
  Radio,
  RadioGroup,
  Switch,
  Tip,
  Validator,
  Button,
  MoreSelect,
} from '@gmfe/react'
import { TreeSelect } from '@gmfe/react-deprecated'
import Map from 'gm-map'
import globalStore from 'stores/global'
import './actions'
import './reducer'
import actions from '../../actions'
import { history, System } from 'common/service'
import styles from './style.module.less'
import {
  isNumOrEnglish,
  isNumberCombination,
  isInvalidLocation,
} from 'common/util'
import SortList from 'common/components/sort_list'
import { pinYinFilter } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'

class SupplierInfo extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      users: [],
    }
    this.refform = React.createRef()

    this.handleCancel = ::this.handleCancel
    this.handleChangePayMethod = ::this.handleChangePayMethod
    this.handleSelectMerchandise = ::this.handleSelectMerchandise
    this.handleChangeValue = ::this.handleChangeValue
    this.handleValidated = ::this.handleValidated
    this.handleDelete = ::this.handleDelete
    this.handleSaveAccount = ::this.handleSaveAccount
    this.handleUpload = ::this.handleUpload
    this.handleChangeUser = ::this.handleChangeUser
  }

  componentDidMount() {
    const { supplier_id } = this.props.location.query
    actions.get_purchasers()
    actions.supplier_get_category1()
    actions.supplier_get_category2()
    actions.supplier_stations(supplier_id)
    actions.get_supplier_account_and_username().then((users) => {
      this.setState({ users })
    })

    if (supplier_id) {
      actions.supplier_get_detail({ id: supplier_id })
    }
  }

  handleSearch(value) {
    console.log(value)
    actions.get_purchasers(_.trim(value))
  }

  handleCancel() {
    history.push('/sales_invoicing/base/supplier')
  }

  handleChangePayMethod(value) {
    actions.supplier_change_info('pay_method', value)
  }

  handleChangeBillType = (value) => {
    actions.supplier_change_info('bill_type', value)
  }

  getMerchandise() {
    const { category1List, category2List } = this.props.supplier
    return _.map(category1List, (category1) => {
      const list2 = _.map(
        _.filter(category2List, (c2) => category1.id === c2.upstream_id),
        (category2) => {
          return { name: category2.name, value: category2.id }
        },
      )
      return {
        value: category1.id,
        name: category1.name,
        children: list2,
      }
    })
  }

  handleSelectMerchandise(selected) {
    this.setState({ selectedMerchandise: selected })
    actions.supplier_change_info('merchandise', selected)
  }

  handleChangeValue(e) {
    actions.supplier_change_info(e.target.name, e.target.value)
  }

  handleSwitchChangeValue = (name, value) => {
    actions.supplier_change_info(name, value)
  }

  handleChangeUser(selected) {
    actions.supplier_change_info('user_id', selected.value)
  }

  handleValidated() {
    const { supplier_id } = this.props.location.query
    const { supplierInfo } = this.props.supplier

    const req = _.omit(
      _.omit(
        Object.assign({}, supplierInfo, {
          merchandise: JSON.stringify(supplierInfo.merchandise),
          qualification_images: JSON.stringify(
            _.map(supplierInfo.qualification_images, 'id'),
          ),
        }),
        'username',
      ),
      'is_active',
    )

    if (supplier_id) {
      actions.supplier_update(req).then(() => {
        Tip.success(i18next.t('保存成功'))
        history.push('/sales_invoicing/base/supplier')
      })
    } else {
      actions.supplier_create(req).then(() => {
        Tip.success(i18next.t('新建成功'))
        history.push('/sales_invoicing/base/supplier')
      })
    }
  }

  handleCheckMerchandise(merchandise) {
    if (merchandise.length === 0) {
      return i18next.t('请勾选')
    }
    return ''
  }

  handleCheckCustomerId(customer_id) {
    if (!customer_id || !isNumOrEnglish(customer_id)) {
      return i18next.t('只能输入英文字母和数字')
    }
    return ''
  }

  handleCheckUsername(username) {
    if (!isNumberCombination(username)) {
      return i18next.t('请输入正确的手机号')
    }
    return ''
  }

  handleDelete() {
    const { supplier_id } = this.props.location.query

    Dialog.confirm({
      children: i18next.t(
        '供应商删除后,其绑定的采购规格将无法生成采购任务,是否确定删除?',
      ),
      title: i18next.t('删除供应商'),
    }).then(() => {
      if (supplier_id) {
        return actions.supplier_delete({ id: supplier_id }).then(() => {
          Tip.success(i18next.t('删除成功'))
          history.push('/sales_invoicing/base/supplier')
        })
      }
    })
  }

  handleSaveAccount() {
    const { supplier_id } = this.props.location.query
    const { supplierInfo } = this.props.supplier
    const req = {
      id: supplier_id,
      username: supplierInfo.username,
      is_active: supplierInfo.is_active,
    }
    actions.supplier_account_save(req).then(() => {
      Tip.success(i18next.t('保存账号信息成功'))
    })
  }

  handleUpload(files, event) {
    const { qualification_images } = this.props.supplier.supplierInfo

    if (_.filter(files, (item) => item.size > 1024 * 1024 * 2).length > 0) {
      Tip.warning(i18next.t('图片大小不能超过2mb'))
      return
    }

    _.forEach(files, (item) => {
      Request('/image/upload')
        .data({
          image_file: item,
          is_retail_interface: System.isC() ? 1 : null,
        })
        .post()
        .then((json) => {
          qualification_images.push({
            key: json.data.img_path_id,
            id: json.data.img_path_id,
            name: json.data.image_url,
          })

          actions.supplier_change_info(
            'qualification_images',
            qualification_images,
          )
        })
    })
  }

  handleGetLocation = (loc) => {
    actions.supplier_change_info('location_lon', loc.longitude)
    actions.supplier_change_info('location_lat', loc.latitude)
    actions.supplier_change_info('map_address', loc.address)
  }

  handleImageSort(qualification_images) {
    actions.supplier_change_info('qualification_images', qualification_images)
  }

  handleImageClose(i) {
    Dialog.confirm({
      children: i18next.t('确认删除？'),
    }).then(() => {
      const { qualification_images } = this.props.supplier.supplierInfo
      qualification_images.splice(i, 1)

      actions.supplier_change_info('qualification_images', qualification_images)
    })
  }

  handleMoreSelectChange = (name, selected) => {
    actions.supplier_change_info(name, selected.value)
  }

  handleUploadChange = (data) => {
    Dialog.confirm({
      children: i18next.t('确认删除？'),
    }).then(() => {
      actions.supplier_pics(data)
    })
  }

  renderStationItem = (item) => {
    if (!item.supplier_id) {
      return <div>{item.text}</div>
    }

    return (
      <div>
        {item.text}
        &nbsp;&nbsp;
        <span>{i18next.t('已关联') + item.supplier_name}</span>
      </div>
    )
  }

  render() {
    const { supplier_id } = this.props.location.query
    const { supplierInfo, purchasers, stations } = this.props.supplier
    const title = supplier_id
      ? i18next.t('供应商信息')
      : i18next.t('新建供应商')
    const editAuth = supplier_id
      ? globalStore.hasPermission('edit_settle_supplier')
      : globalStore.hasPermission('add_settle_supplier')
    const { users } = this.state

    const formatUser = (value, text) => ({ value, text })
    const userList = [
      formatUser('', i18next.t('无')),
      ...users.map(({ user_id, username }) => formatUser(user_id, username)),
    ]

    const {
      location_lat,
      location_lon,
      default_purchaser_id,
      purchaser_name,
      associate_station_id,
    } = supplierInfo
    const purchaserList = [{ value: -1, text: i18next.t('无') }, ...purchasers]
    const stationList = [{ value: -1, text: i18next.t('无') }, ...stations]
    const purchaserId = default_purchaser_id || -1
    console.log('default_purchaser_name', purchaser_name)
    console.log('default_purchaser_id', default_purchaser_id)
    const curSelected =
      _.find(purchaserList, (item) => purchaserId === item.value) || {
        text: purchaser_name,
        value: default_purchaser_id,
      } ||
      null
    const stationSelected =
      _.find(stationList, (item) => associate_station_id === item.value) || null
    const center = isInvalidLocation(location_lat, location_lon)
      ? {}
      : { center: { latitude: location_lat, longitude: location_lon } }

    return (
      <FormGroup
        formRefs={[this.refform]}
        onSubmitValidated={this.handleValidated}
        onCancel={this.handleCancel}
        disabled={!editAuth}
      >
        <FormPanel
          title={title}
          right={
            <>
              {supplier_id &&
                globalStore.hasPermission('delete_settle_supplier') && (
                  <Button onClick={this.handleDelete}>
                    {i18next.t('删除')}
                  </Button>
                )}
            </>
          }
        >
          <Form
            ref={this.refform}
            labelWidth='120px'
            horizontal
            colWidth='350px'
            hasButtonInGroup
          >
            <FormBlock>
              <FormItem
                label={i18next.t('供应商编号')}
                required
                inline
                validate={Validator.create(
                  [],
                  supplierInfo.customer_id,
                  this.handleCheckCustomerId.bind(
                    this,
                    supplierInfo.customer_id,
                  ),
                )}
              >
                <input
                  type='text'
                  name='customer_id'
                  value={supplierInfo.customer_id || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
              <FormItem
                label={i18next.t('供应商名称')}
                required
                inline
                validate={Validator.create([], _.trim(supplierInfo.name))}
              >
                <input
                  type='text'
                  name='name'
                  value={supplierInfo.name || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={i18next.t('登录账户')} inline>
                <MoreSelect
                  name='user_id'
                  data={userList}
                  selected={userList.find(
                    (user) => user.value === supplierInfo.user_id,
                  )}
                  onSelect={this.handleChangeUser}
                />
              </FormItem>
              <FormItem label={i18next.t('联系电话')} inline>
                <input
                  type='text'
                  name='phone'
                  value={supplierInfo.phone || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={i18next.t('公司名称')} inline>
                <input
                  type='text'
                  name='company_name'
                  value={supplierInfo.company_name || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormItem label={i18next.t('公司地址')}>
              <textarea
                name='company_address'
                style={{ width: '400px' }}
                value={supplierInfo.company_address || ''}
                onChange={this.handleChangeValue}
                disabled={!editAuth}
              />
            </FormItem>
            <FormBlock>
              <FormItem
                label={i18next.t('可供应商品')}
                required
                validate={Validator.create(
                  [],
                  supplierInfo.merchandise,
                  this.handleCheckMerchandise.bind(
                    this,
                    supplierInfo.merchandise,
                  ),
                )}
              >
                <div style={{ width: '400px' }}>
                  <TreeSelect
                    list={this.getMerchandise()}
                    label={i18next.t('选择全部商品')}
                    disabledSelected={!editAuth}
                    selected={supplierInfo.merchandise || []}
                    onSelect={this.handleSelectMerchandise}
                  />
                </div>
              </FormItem>
              <FormItem
                label={i18next.t('默认采购员')}
                toolTip={
                  <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
                    {i18next.t(
                      '展示所有的有效采购员；选择默认采购员，生成采购任务时将默认展示该采购员',
                    )}
                  </div>
                }
              >
                <MoreSelect
                  id='purchasers'
                  className={styles.purchasersSelect}
                  data={purchaserList}
                  selected={curSelected}
                  onSearch={this.handleSearch.bind(this)}
                  onSelect={this.handleMoreSelectChange.bind(
                    this,
                    'default_purchaser_id',
                  )}
                  withFilter={(list, query) =>
                    pinYinFilter(list, query, (supplier) => supplier.text)
                  }
                  placeholder={i18next.t('选择采购员')}
                />
              </FormItem>
              <FormItem
                label={i18next.t('关联站点')}
                toolTip={
                  <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
                    {i18next.t(
                      '关联站点后，向该站点下代售订单后，采购任务将默认使用站点绑定的供应商',
                    )}
                  </div>
                }
              >
                <MoreSelect
                  id='associate_station_id'
                  className={styles.purchasersSelect}
                  data={stationList}
                  selected={stationSelected}
                  renderListItem={this.renderStationItem}
                  onSelect={this.handleMoreSelectChange.bind(
                    this,
                    'associate_station_id',
                  )}
                  renderListFilterType='pinyin'
                  placeholder={i18next.t('选择关联站点')}
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={i18next.t('财务联系人')} inline>
                <input
                  type='text'
                  name='finance_manager'
                  value={supplierInfo.finance_manager || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
              <FormItem label={i18next.t('联系人电话')} inline>
                <input
                  type='text'
                  name='finance_manager_phone'
                  value={supplierInfo.finance_manager_phone || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={i18next.t('开户名')} inline>
                <input
                  type='text'
                  name='account_name'
                  value={supplierInfo.account_name || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
              <FormItem label={i18next.t('开户银行')} inline>
                <input
                  type='text'
                  name='bank'
                  value={supplierInfo.bank || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={i18next.t('银行账号')} inline>
                <input
                  type='text'
                  name='card_no'
                  value={supplierInfo.card_no || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
              <FormItem label={i18next.t('营业执照号')} inline>
                <input
                  type='text'
                  name='business_licence'
                  value={supplierInfo.business_licence || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormItem label={i18next.t('结款周期')} inline>
              <RadioGroup
                style={{ width: '230px' }}
                name='pay_method'
                inline
                value={supplierInfo.pay_method || 1}
                onChange={this.handleChangePayMethod}
              >
                <Radio value={1} disabled={!editAuth}>
                  {i18next.t('日结')}
                </Radio>
                <Radio value={2} disabled={!editAuth}>
                  {i18next.t('周结')}
                </Radio>
                <Radio value={3} disabled={!editAuth}>
                  {i18next.t('半月结')}
                </Radio>
                <Radio value={4} disabled={!editAuth}>
                  {i18next.t('月结')}
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              label={i18next.t('开票类型')}
              colWidth='420px'
              toolTip={
                <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
                  {i18next.t('根据供应商提供的发票类型进行分类')}
                </div>
              }
            >
              <RadioGroup
                name='bill_type'
                inline
                value={supplierInfo.bill_type || 1}
                onChange={this.handleChangeBillType}
              >
                <Radio value={1} disabled={!editAuth}>
                  {i18next.t('一般纳税人')}
                </Radio>
                <Radio value={2} disabled={!editAuth}>
                  {i18next.t('小规模纳税人')}
                </Radio>
                <Radio value={3} disabled={!editAuth}>
                  {i18next.t('普票或无票')}
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem col={3} label={i18next.t('采购单据自动同步')}>
              <Switch
                type='primary'
                checked={!!supplierInfo.auto_apply_require_goods_sheet}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={(v) =>
                  this.handleSwitchChangeValue(
                    'auto_apply_require_goods_sheet',
                    v ? 1 : 0,
                  )
                }
              />
              <div>
                {i18next.t(
                  '开启后，采购单据将自动同步给供应商，供应商登录后可查看并编辑单据，编辑后数据会同步至业务平台',
                )}
              </div>
              <div>
                {i18next.t(
                  '关闭后，采购单据不会同步给供应商，已同步单据不受影响',
                )}
              </div>
            </FormItem>
            <FormItem col={3} label={i18next.t('地理位置')}>
              <div style={{ width: '100%', height: '400px' }}>
                <Map
                  amapkey='e805d5ba2ef44393f20bc9176c3821a2'
                  onGetLocation={this.handleGetLocation}
                  {...center}
                  mapAddress={supplierInfo.map_address}
                  inputFocusColor='#56a3f2'
                  placeholder={i18next.t('请输入地理位置')}
                />
              </div>
            </FormItem>
            <FormItem col={3} label={i18next.t('资质图片')}>
              <div>
                <div className='gm-margin-bottom-10'>
                  <ImgUploader
                    disabled={supplierInfo.qualification_images.length >= 10}
                    data={_.map(
                      this.props.supplier.supplierInfo.qualification_images,
                      (i) => i.name,
                    )}
                    onUpload={this.handleUpload}
                    onChange={this.handleUploadChange}
                    accept='image/jpg, image/png, image/gif'
                    desc={i18next.t(
                      '最多可上传10张图片，图片大小请不要超过2mb，支持jpg/png/gif格式',
                    )}
                    multiple
                  />
                </div>
                {supplierInfo.qualification_images.length > 0 ? (
                  <SortList
                    list={supplierInfo.qualification_images}
                    onChange={this.handleImageSort}
                    renderItem={(v, i) => (
                      <div className='b-cp-banner gm-margin-tb-10'>
                        <button
                          type='button'
                          className='close'
                          onClick={this.handleImageClose.bind(this, i)}
                        >
                          <span>&times;</span>
                        </button>
                        <img style={{ maxWidth: '100%' }} src={v.name} />
                      </div>
                    )}
                  />
                ) : null}
              </div>
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

SupplierInfo.propTypes = {
  supplier: PropTypes.object,
}

export default connect((state) => ({
  supplier: state.supplier,
}))(SupplierInfo)
