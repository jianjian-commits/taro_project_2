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
        Tip.success(i18next.t('????????????'))
        history.push('/sales_invoicing/base/supplier')
      })
    } else {
      actions.supplier_create(req).then(() => {
        Tip.success(i18next.t('????????????'))
        history.push('/sales_invoicing/base/supplier')
      })
    }
  }

  handleCheckMerchandise(merchandise) {
    if (merchandise.length === 0) {
      return i18next.t('?????????')
    }
    return ''
  }

  handleCheckCustomerId(customer_id) {
    if (!customer_id || !isNumOrEnglish(customer_id)) {
      return i18next.t('?????????????????????????????????')
    }
    return ''
  }

  handleCheckUsername(username) {
    if (!isNumberCombination(username)) {
      return i18next.t('???????????????????????????')
    }
    return ''
  }

  handleDelete() {
    const { supplier_id } = this.props.location.query

    Dialog.confirm({
      children: i18next.t(
        '??????????????????,???????????????????????????????????????????????????,???????????????????',
      ),
      title: i18next.t('???????????????'),
    }).then(() => {
      if (supplier_id) {
        return actions.supplier_delete({ id: supplier_id }).then(() => {
          Tip.success(i18next.t('????????????'))
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
      Tip.success(i18next.t('????????????????????????'))
    })
  }

  handleUpload(files, event) {
    const { qualification_images } = this.props.supplier.supplierInfo

    if (_.filter(files, (item) => item.size > 1024 * 1024 * 2).length > 0) {
      Tip.warning(i18next.t('????????????????????????2mb'))
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
      children: i18next.t('???????????????'),
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
      children: i18next.t('???????????????'),
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
        <span>{i18next.t('?????????') + item.supplier_name}</span>
      </div>
    )
  }

  render() {
    const { supplier_id } = this.props.location.query
    const { supplierInfo, purchasers, stations } = this.props.supplier
    const title = supplier_id
      ? i18next.t('???????????????')
      : i18next.t('???????????????')
    const editAuth = supplier_id
      ? globalStore.hasPermission('edit_settle_supplier')
      : globalStore.hasPermission('add_settle_supplier')
    const { users } = this.state

    const formatUser = (value, text) => ({ value, text })
    const userList = [
      formatUser('', i18next.t('???')),
      ...users.map(({ user_id, username }) => formatUser(user_id, username)),
    ]

    const {
      location_lat,
      location_lon,
      default_purchaser_id,
      purchaser_name,
      associate_station_id,
    } = supplierInfo
    const purchaserList = [{ value: -1, text: i18next.t('???') }, ...purchasers]
    const stationList = [{ value: -1, text: i18next.t('???') }, ...stations]
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
                    {i18next.t('??????')}
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
                label={i18next.t('???????????????')}
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
                label={i18next.t('???????????????')}
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
              <FormItem label={i18next.t('????????????')} inline>
                <MoreSelect
                  name='user_id'
                  data={userList}
                  selected={userList.find(
                    (user) => user.value === supplierInfo.user_id,
                  )}
                  onSelect={this.handleChangeUser}
                />
              </FormItem>
              <FormItem label={i18next.t('????????????')} inline>
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
              <FormItem label={i18next.t('????????????')} inline>
                <input
                  type='text'
                  name='company_name'
                  value={supplierInfo.company_name || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormItem label={i18next.t('????????????')}>
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
                label={i18next.t('???????????????')}
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
                    label={i18next.t('??????????????????')}
                    disabledSelected={!editAuth}
                    selected={supplierInfo.merchandise || []}
                    onSelect={this.handleSelectMerchandise}
                  />
                </div>
              </FormItem>
              <FormItem
                label={i18next.t('???????????????')}
                toolTip={
                  <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
                    {i18next.t(
                      '?????????????????????????????????????????????????????????????????????????????????????????????????????????',
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
                  placeholder={i18next.t('???????????????')}
                />
              </FormItem>
              <FormItem
                label={i18next.t('????????????')}
                toolTip={
                  <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
                    {i18next.t(
                      '??????????????????????????????????????????????????????????????????????????????????????????????????????',
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
                  placeholder={i18next.t('??????????????????')}
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={i18next.t('???????????????')} inline>
                <input
                  type='text'
                  name='finance_manager'
                  value={supplierInfo.finance_manager || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
              <FormItem label={i18next.t('???????????????')} inline>
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
              <FormItem label={i18next.t('?????????')} inline>
                <input
                  type='text'
                  name='account_name'
                  value={supplierInfo.account_name || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
              <FormItem label={i18next.t('????????????')} inline>
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
              <FormItem label={i18next.t('????????????')} inline>
                <input
                  type='text'
                  name='card_no'
                  value={supplierInfo.card_no || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
              <FormItem label={i18next.t('???????????????')} inline>
                <input
                  type='text'
                  name='business_licence'
                  value={supplierInfo.business_licence || ''}
                  onChange={this.handleChangeValue}
                  disabled={!editAuth}
                />
              </FormItem>
            </FormBlock>
            <FormItem label={i18next.t('????????????')} inline>
              <RadioGroup
                style={{ width: '230px' }}
                name='pay_method'
                inline
                value={supplierInfo.pay_method || 1}
                onChange={this.handleChangePayMethod}
              >
                <Radio value={1} disabled={!editAuth}>
                  {i18next.t('??????')}
                </Radio>
                <Radio value={2} disabled={!editAuth}>
                  {i18next.t('??????')}
                </Radio>
                <Radio value={3} disabled={!editAuth}>
                  {i18next.t('?????????')}
                </Radio>
                <Radio value={4} disabled={!editAuth}>
                  {i18next.t('??????')}
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              label={i18next.t('????????????')}
              colWidth='420px'
              toolTip={
                <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
                  {i18next.t('????????????????????????????????????????????????')}
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
                  {i18next.t('???????????????')}
                </Radio>
                <Radio value={2} disabled={!editAuth}>
                  {i18next.t('??????????????????')}
                </Radio>
                <Radio value={3} disabled={!editAuth}>
                  {i18next.t('???????????????')}
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem col={3} label={i18next.t('????????????????????????')}>
              <Switch
                type='primary'
                checked={!!supplierInfo.auto_apply_require_goods_sheet}
                on={i18next.t('??????')}
                off={i18next.t('??????')}
                onChange={(v) =>
                  this.handleSwitchChangeValue(
                    'auto_apply_require_goods_sheet',
                    v ? 1 : 0,
                  )
                }
              />
              <div>
                {i18next.t(
                  '??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
                )}
              </div>
              <div>
                {i18next.t(
                  '??????????????????????????????????????????????????????????????????????????????',
                )}
              </div>
            </FormItem>
            <FormItem col={3} label={i18next.t('????????????')}>
              <div style={{ width: '100%', height: '400px' }}>
                <Map
                  amapkey='e805d5ba2ef44393f20bc9176c3821a2'
                  onGetLocation={this.handleGetLocation}
                  {...center}
                  mapAddress={supplierInfo.map_address}
                  inputFocusColor='#56a3f2'
                  placeholder={i18next.t('?????????????????????')}
                />
              </div>
            </FormItem>
            <FormItem col={3} label={i18next.t('????????????')}>
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
                      '???????????????10???????????????????????????????????????2mb?????????jpg/png/gif??????',
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
