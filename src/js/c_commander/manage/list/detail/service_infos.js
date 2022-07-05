import React from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormItem,
  Validator,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import Map from 'gm-map'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { handleValidateName } from '../../../util'
import AreaSelect from 'common/components/area_select'
import { getAreaDict } from '../../../../self_lifting/util'

const ServiceInfos = React.forwardRef((props, ref) => {
  const {
    detail: {
      name,
      district_code,
      area_id_2,
      area_id_3,
      address,
      service_type,
      commanderServiceType,
    },
    centerPoint: center,
    setDetailFields,
  } = props.store

  const handleAreaSelect = (citySelected) => {
    const selected = getAreaDict(citySelected)
    setDetailFields(selected.district_code, 'district_code')
    setDetailFields(selected.area_l1, 'area_id_2')
    setDetailFields(selected.area_l2, 'area_id_3')
  }

  const handleGetLocation = (info) => {
    setDetailFields(info.address, 'address')
    setDetailFields(info.latitude, 'lat')
    setDetailFields(info.longitude, 'lng')
  }

  const handleAddress = (address) => {
    setDetailFields(address, 'address')
  }

  const initData = React.useMemo(
    () => ({
      district_code,
      area_l1: area_id_2,
      area_l2: area_id_3,
    }),
    [district_code, area_id_2, area_id_3]
  )

  return (
    <Form ref={ref} colWidth='400px' labelWidth='120px'>
      <FormItem
        label={t('团长姓名')}
        required
        validate={Validator.create([], name, (name) =>
          handleValidateName(name)
        )}
      >
        <input
          value={name}
          onChange={(e) => setDetailFields(e.target.value, 'name')}
          placeholder={t('输入团长姓名')}
        />
      </FormItem>
      <FormItem
        label={t('地理标签')}
        required
        validate={Validator.create([], district_code)}
      >
        <AreaSelect
          initData={initData}
          placeholder={t('选择地理标签')}
          onSelect={handleAreaSelect}
        />
      </FormItem>
      <FormItem
        label={t('地理位置')}
        required
        colWidth='800px'
        validate={Validator.create([], _.trim(address))}
        className='gm-padding-bottom-20'
      >
        <div style={{ width: '100%', height: '400px' }}>
          <Map
            amapkey='e805d5ba2ef44393f20bc9176c3821a2'
            onGetLocation={handleGetLocation}
            {...center}
            mapAddress={address}
            inputFocusColor='#56a3f2'
            placeholder={t('请输入地理位置')}
          />
        </div>
      </FormItem>
      <FormItem label={t('收货地址')} required colWidth='800px'>
        <input
          value={address}
          placeholder={t('请输入收货地址')}
          onChange={(e) => handleAddress(e.target.value)}
        />
      </FormItem>
      <FormItem
        label={t('服务能力')}
        colWidth='800px'
        required
        validate={Validator.create([], service_type)}
      >
        <>
          <RadioGroup
            name='service_type'
            value={service_type}
            onChange={(value) => setDetailFields(value, 'service_type')}
          >
            <Radio value={1}>
              {t('跟随平台配置')}
              <div className='gm-text-desc gm-margin-bottom-5'>
                {t(
                  '团长不做配送服务，使用平台设置的收货方式进行配送，详细查看店铺运营设置'
                )}
              </div>
            </Radio>
            <Radio value={2}>
              {t('团长自行服务')}
              <div className='gm-text-desc '>
                {t('团长做配送服务，使用社区店作为自提点或团长送货上门')}
              </div>
            </Radio>
          </RadioGroup>

          {service_type === 2 ? (
            <CheckboxGroup
              inline
              name='commanderServiceType'
              value={commanderServiceType.slice()}
              onChange={(value) =>
                setDetailFields(value, 'commanderServiceType')
              }
            >
              <Checkbox value={2}>{t('自提')}</Checkbox>
              <Checkbox value={3}>{t('配送')}</Checkbox>
            </CheckboxGroup>
          ) : null}
        </>
      </FormItem>
    </Form>
  )
})

ServiceInfos.propTypes = {
  store: PropTypes.object,
}

export default observer(ServiceInfos)
