import React from 'react'
import { i18next } from 'gm-i18n'
import {
  Form,
  FormItem,
  Switch,
  Tip,
  Loading,
  Flex,
  Validator,
  FormGroup,
  FormPanel,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Map from 'gm-map'
import { isForeignCustomer } from 'common/util'
import TableListTips from '../../common/components/table_list_tips'
import AreaSelect from '../../common/components/area_select'
import { history } from '../../common/service'
import { getAreaDict } from '../util'
import store from '../store'
import { GLocationMap } from '@gm-common/google-map'
@observer
class Component extends React.Component {
  constructor(props) {
    super(props)
    this.refform = React.createRef()
  }

  componentDidMount() {
    const { id } = this.props
    if (id) store.getDetail(id)
  }

  componentWillUnmount() {
    store.clearDetail()
  }

  update(obj) {
    const { id } = this.props
    if (id) {
      store.updateDetailFd(obj)
    }
    store.updateDetail(obj)
  }

  handleSwitch = () => {
    const { business_status } = store.detail
    const newBusinessStatus = business_status === 1 ? 2 : 1
    this.update({ business_status: newBusinessStatus })
  }

  handleSubmit = async () => {
    const { id } = this.props
    if (id) {
      await store.update(id)
      Tip.success(i18next.t('更新成功'))
    } else {
      await store.create()
      Tip.success(i18next.t('创建成功'))
    }
    history.goBack()
  }

  handleCancel = () => {
    history.goBack()
  }

  handleAreaSelect = (citySelected) => {
    this.update(getAreaDict(citySelected))
  }

  handleInput = (key, e) => {
    this.update({ [key]: e.target.value })
  }

  handleGetLocation = (info) => {
    this.update({
      address: info.address,
      lat: info.latitude || info.lat,
      lng: info.longitude || info.lng,
    })
  }

  render() {
    const {
      loading,
      detail: {
        name,
        principal,
        phone,
        address,
        business_status,
        type,
        district_code,
        area_l1,
        area_l2,
      },
      centerPoint: center,
    } = store

    if (loading) {
      return (
        <Flex justifyCenter style={{ paddingTop: '100px' }}>
          <Loading text={i18next.t('加载中...')} />
        </Flex>
      )
    }
    return (
      <div>
        <FormGroup
          formRefs={[this.refform]}
          onCancel={this.handleCancel}
          disabled={type === 2}
          onSubmitValidated={this.handleSubmit}
        >
          {type === 2 && (
            <TableListTips
              className='gm-padding-bottom-5'
              tips={[i18next.t('当前为团长专属自提点，请移步至团长管理中修改')]}
            />
          )}
          <FormPanel title={i18next.t('基本信息')}>
            <Form
              ref={this.refform}
              hasButtonInGroup
              labelWidth='141px'
              colWidth='371px'
              horizontal
            >
              <FormItem
                label={i18next.t('自提点名称')}
                required
                validate={Validator.create([], _.trim(name))}
                className='gm-padding-bottom-5'
              >
                <input
                  type='text'
                  value={name}
                  placeholder={i18next.t('自提点名称')}
                  onChange={this.handleInput.bind(this, 'name')}
                />
              </FormItem>
              <FormItem
                label={i18next.t('负责人')}
                required
                validate={Validator.create([], _.trim(principal))}
                className='gm-padding-bottom-5'
              >
                <input
                  type='text'
                  className='form-control'
                  value={principal}
                  placeholder={i18next.t('负责人')}
                  onChange={this.handleInput.bind(this, 'principal')}
                />
              </FormItem>
              <FormItem
                label={i18next.t('联系电话')}
                required
                validate={Validator.create([], _.trim(phone))}
                className='gm-padding-bottom-5'
              >
                <input
                  type='text'
                  className='form-control'
                  value={phone}
                  placeholder={i18next.t('联系电话')}
                  onChange={this.handleInput.bind(this, 'phone')}
                />
              </FormItem>
              <FormItem
                label={i18next.t('地理标签')}
                required
                validate={Validator.create([], district_code)}
                className='gm-padding-bottom-5'
              >
                <AreaSelect
                  initData={{
                    district_code,
                    area_l1,
                    area_l2,
                  }}
                  placeholder={i18next.t('选择地理标签')}
                  onSelect={this.handleAreaSelect}
                />
              </FormItem>
              <FormItem
                label={i18next.t('地理位置')}
                required
                colWidth='800px'
                validate={Validator.create([], _.trim(address))}
                className='gm-padding-bottom-5'
              >
                <div style={{ width: '100%', height: '400px' }}>
                  {isForeignCustomer() ? (
                    <GLocationMap
                      defaultLocation={{
                        lat:
                          center && center.center
                            ? parseFloat(center.center.latitude)
                            : undefined,
                        lng:
                          center && center.center
                            ? parseFloat(center.center.longitude)
                            : undefined,
                        address,
                      }}
                      onLocation={this.handleGetLocation}
                      placeholder={i18next.t('请输入地理位置')}
                    />
                  ) : (
                    <Map
                      amapkey='e805d5ba2ef44393f20bc9176c3821a2'
                      onGetLocation={this.handleGetLocation}
                      {...center}
                      mapAddress={address}
                      inputFocusColor='#56a3f2'
                      placeholder={i18next.t('请输入地理位置')}
                    />
                  )}
                </div>
              </FormItem>
              <FormItem
                label={i18next.t('营业状态')}
                required
                className='gm-padding-bottom-5'
              >
                <Switch
                  type='primary'
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  checked={business_status === 1}
                  onChange={this.handleSwitch}
                />
              </FormItem>
            </Form>
          </FormPanel>
        </FormGroup>
      </div>
    )
  }
}

Component.propTypes = {
  id: PropTypes.number,
}

export default Component
