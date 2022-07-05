import React from 'react'
import { t } from 'gm-i18n'
import { history } from 'common/service'
import {
  FormGroup,
  FormPanel,
  Flex,
  Tip,
  Dialog,
  Form,
  FormItem,
  Validator,
  Select,
  Radio,
  RadioGroup,
  Switch,
  InputNumberV2,
  Price,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'

import ShowPanel from './show_panel'
import Section from './section'
import store from './store'
import { GIFT_TYPE, checkSection } from '../util'

@observer
class ChargeGiftDetail extends React.Component {
  constructor(props) {
    super(props)
    this.charge_gift_Ref = React.createRef()
    this.state = {
      isCreate: true,
    }
  }

  componentDidMount() {
    store.initData()
    if (this.props.location.query.id) {
      this.setState({ isCreate: false })
      store.getDetail(this.props.location.query.id)
    }
  }

  handleChangeDetail = (name, val) => {
    store.changeDetail(name, val)
  }

  handleCheckName = () => {
    const { name } = store
    if (name === '' || name.length > 20) {
      return t('只能输入20个字以内')
    }
    return ''
  }

  handleCancel = () => {
    history.push('/marketing/manage/charge_gift')
  }

  handleSave = async () => {
    const { rule_type, status, gift_section } = store
    let res = true
    // 当按固定值赠送时，检测赠送数额
    if (rule_type === 2) {
      res = checkSection(gift_section)
    }
    if (res) {
      if (status) {
        // 判断是否活动状态是否冲突，确保仅一个活动为有效
        const has_valid_status = await store.checkStatus()
        if (has_valid_status) {
          Dialog.confirm({
            title: t('提示'),
            size: 'md',
            children: (
              <div className='text-center'>
                <p>
                  {t('是否确认将「') + store.name + t('」活动状态设为有效？')}
                </p>
                <p>{t('确认后此活动的活动状态为有效，其余活动变为无效。')}</p>
              </div>
            ),
            onOK: () => this.handleSubmit(),
          })
        } else {
          this.handleSubmit()
        }
      } else {
        this.handleSubmit()
      }
    }
  }

  handleSubmit = () => {
    const isDetail = !!this.props.location.query.id
    if (isDetail) {
      store.edit(this.props.location.query.id).then((json) => {
        this.handleResult(json, t('修改'))
      })
    } else {
      store.save().then((json) => {
        this.handleResult(json, t('新建'))
      })
    }
  }

  handleResult = (json, type) => {
    if (json.code === 0) {
      Tip.success(type + t('成功'))
      history.push('/marketing/manage/charge_gift')
    }
  }

  render() {
    const {
      name,
      gift_type,
      status,
      rule_type,
      gift_rate,
      gift_section,
    } = store
    const { isCreate } = this.state

    return (
      <FormGroup
        formRefs={[this.charge_gift_Ref]}
        onCancel={this.handleCancel}
        onSubmitValidated={this.handleSave}
      >
        <FormPanel title={t('基本信息')}>
          <Flex>
            <Flex flex={7}>
              <Form
                ref={this.charge_gift_Ref}
                disabledCol
                className='gm-padding-15'
                labelWidth='120px'
              >
                <FormItem
                  label={t('活动名称')}
                  required
                  validate={Validator.create([], name, this.handleCheckName)}
                >
                  <input
                    maxLength={20}
                    style={{ width: '260px' }}
                    placeholder={t('请输入活动名称（20个字以内）')}
                    type='text'
                    name='name'
                    disabled={!isCreate}
                    value={name || ''}
                    onChange={({ target: { name, value } }) =>
                      this.handleChangeDetail(name, value)
                    }
                  />
                </FormItem>
                <FormItem label={t('赠送内容')} required>
                  <Select
                    value={gift_type}
                    name='gift_type'
                    style={{ width: '260px' }}
                    disabled={!isCreate}
                    data={_.map(GIFT_TYPE, (gift_type, key) => ({
                      text: gift_type,
                      value: _.toNumber(key),
                    }))}
                    onChange={this.handleChangeDetail.bind(this, 'gift_type')}
                  />
                </FormItem>
                <FormItem label={t('活动状态')} required>
                  <Switch
                    checked={!!status}
                    on={t('有效')}
                    off={t('无效')}
                    onChange={this.handleChangeDetail.bind(this, 'status')}
                  />
                </FormItem>
                <FormItem label={t('赠送规则')} required>
                  <RadioGroup
                    inline
                    name='rule_type'
                    value={rule_type}
                    onChange={this.handleChangeDetail.bind(null, 'rule_type')}
                  >
                    <Radio disabled={!isCreate} value={1}>
                      {t('按比例赠送')}
                    </Radio>
                    <Radio disabled={!isCreate} value={2}>
                      {t('按固定值赠送')}
                    </Radio>
                  </RadioGroup>
                  <div className='gm-text-12 gm-text-desc gm-margin-top-10'>
                    <div>
                      {t(
                        '按比例赠送时需设置赠送比例，商城充值时可按设置比例获得赠送的余额或积分'
                      )}
                    </div>
                    <div>
                      {t(
                        '按固定值赠送时需设置充值范围内的赠送数额，系统根据充值金额所在区间进行赠送'
                      )}
                    </div>
                  </div>
                </FormItem>
                {rule_type === 1 && (
                  <FormItem
                    label={t('赠送比例')}
                    required
                    validate={Validator.create([], gift_rate)}
                  >
                    <Flex alignCenter>
                      {isCreate ? (
                        <InputNumberV2
                          disabled={!isCreate}
                          max={100}
                          min={0}
                          precision={0}
                          style={{ width: '260px' }}
                          type='text'
                          name='gift_rate'
                          className='form-control'
                          value={gift_rate}
                          onChange={this.handleChangeDetail.bind(
                            this,
                            'gift_rate'
                          )}
                        />
                      ) : (
                        <input
                          style={{ width: '260px' }}
                          type='text'
                          disabled
                          readOnly
                          value={gift_rate}
                          className='form-control'
                        />
                      )}
                      <span className='gm-padding-5'>%</span>
                    </Flex>
                    <div className='gm-text-12 gm-text-desc gm-margin-top-10'>
                      <div>
                        {t(
                          '设置商户充值余额赠送比例，如设置为10%，则用户充值金额为100元时，可额外获得10元余额或10积分'
                        )}
                      </div>
                    </div>
                  </FormItem>
                )}
                {rule_type === 2 && (
                  <FormItem label={t('赠送数额')} required>
                    <Section
                      disabled={!isCreate}
                      data={gift_section.slice()}
                      unit={gift_type === 1 ? Price.getUnit() : t('积分')}
                      onChange={this.handleChangeDetail.bind(
                        this,
                        'gift_section'
                      )}
                    />
                  </FormItem>
                )}
              </Form>
            </Flex>
            <Flex flex={5}>
              <ShowPanel />
            </Flex>
          </Flex>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default ChargeGiftDetail
