import React from 'react'
import { t } from 'gm-i18n'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  Switch,
  Flex,
  Modal,
  Tip,
  RightSideModal,
  Input
} from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { SvgPlus } from 'gm-svg'

import BenefitCard from './components/benefit_card'
import ChargeCard from './components/charge_card'
import FreightModal from './components/freight_modal'
import UpdateCardModal from './components/update_card_modal'
import GoodsSettingModal from './components/goods_setting_modal'
import store from './store'
import globalStore from '../../../stores/global'
import SVGFreight from '../../../../svg/member_card_freight.svg'
import SVGCoupon from '../../../../svg/member_card_coupon.svg'
import SVGGoods from '../../../../svg/member_card_goods.svg'

@observer
class Setting extends React.Component {
  constructor(props) {
    super(props)
    this.state = { loading: true }

    this.formRef1 = React.createRef(null)
    this.formRef2 = React.createRef(null)
    this.formRef3 = React.createRef(null)
  }

  componentDidMount() {
    store.getMemberCardSetting().then(() => {
      this.setState({ loading: false })
    })
  }

  componentWillUnmount() {
    store.clearMemberSetting()
  }

  handleSubmit = e => {
    const { base_setting, rules, member_freight_id, member_config } = store
    const { member_freight, member_sku, member_coupon } = member_config
    const { is_active, desc } = base_setting

    if (is_active && !member_freight && !member_sku && !member_coupon) {
      Tip.warning(t('请配置会员卡权益'))
      return
    }

    if (!!member_freight && !member_freight_id) {
      Tip.warning(t('请配置会员卡权益-运费减免'))
      return
    }

    if (is_active && rules.length === 0) {
      Tip.warning(t('请配置会员卡定价'))
      return
    }

    if (is_active && !desc) {
      Tip.warning(t('请填写未开通会员描述'))
      return
    }

    Modal.render({
      title: t('更新会员卡设置'),
      style: {
        width: 350
      },
      onHide: Modal.hide,
      children: (
        <UpdateCardModal
          onOk={() => {
            store.setMemberCardSetting().then(() => {
              Tip.success(t('保存成功'))
            })
          }}
        />
      )
    })
  }

  handleAddRules = () => {
    store.addRules()
  }

  handleDeleteCharge = index => {
    store.deleteRules(index)
  }

  handleChangeCharge = (data, index) => {
    store.changeRules(data, index)
  }

  handleBenefit = key => {
    const actions = {
      member_freight: () => {
        Modal.render({
          children: <FreightModal />,
          title: t('选择运费模板'),
          onHide: Modal.hide
        })
      },
      member_sku: () => {
        RightSideModal.render({
          onHide: RightSideModal.hide,
          style: { width: '1040px' },
          children: <GoodsSettingModal />
        })
      },
      member_coupon: () => {
        window.open('#/c_retail/marketing/coupon')
      }
    }

    if (typeof actions[key] !== 'function') return null
    actions[key]()
  }

  handleChangeMemberConfig = (name, val) => {
    store.changeMemberConfig(name, val)
  }

  handleChangeSwitch = val => {
    store.changeBaseSetting('is_active', val)
  }

  handleInputChange = e => {
    const { name, value } = e.target
    store.changeBaseSetting(name, value)
  }

  render() {
    const { rules, base_setting, member_config } = store
    const { member_freight, member_sku, member_coupon } = member_config
    const { is_active, desc } = base_setting
    // 会员卡权益
    const benefit_list = [
      {
        key: 'member_freight',
        title: t('运费减免'),
        icon: <SVGFreight />,
        desc: t('下单时享受订单包邮'),
        checked: member_freight,
        tip: t('调整会员专享运费，在会员期间将会享受此运费')
      },
      {
        key: 'member_sku',
        title: t('专属折扣商品'),
        icon: <SVGGoods />,
        desc: t('下单时打折优惠'),
        checked: member_sku,
        tip: t('设置折扣商品，会员独享')
      },
      {
        key: 'member_coupon',
        title: t('送优惠券'),
        icon: <SVGCoupon />,
        desc: t('赠送优惠券'),
        checked: member_coupon,
        tip: t('在优惠券设置中，选择可见范围为“会员可见”')
      }
    ]

    return (
      <FormGroup
        formRefs={[this.formRef1, this.formRef2, this.formRef3]}
        onSubmit={this.handleSubmit}
        disabled={
          this.state.loading ||
          !globalStore.hasPermission('edit_member_setting')
        }
      >
        <FormPanel title={t('会员卡权益')}>
          <Form ref={this.formRef1}>
            <Flex>
              {_.map(benefit_list.slice(), item => (
                <BenefitCard
                  {...item}
                  dataKey={item.key}
                  onCheck={this.handleChangeMemberConfig}
                  onSetting={this.handleBenefit}
                  key={item.key}
                />
              ))}
            </Flex>
          </Form>
        </FormPanel>
        <FormPanel title={t('会员卡定价')}>
          <Form ref={this.formRef2}>
            <Flex wrap>
              {_.map(rules.slice(), (item, index) => (
                <ChargeCard
                  {...item}
                  onChange={this.handleChangeCharge}
                  onDelete={this.handleDeleteCharge}
                  index={index}
                  key={item.id}
                />
              ))}
              <AddCharge column onClick={this.handleAddRules}>
                <AddIcon />
                <div>{t('添加会员卡定价')}</div>
              </AddCharge>
            </Flex>
          </Form>
        </FormPanel>
        <FormPanel title={t('基础设置')}>
          <Form ref={this.formRef3} disabledCol labelWidth='100px'>
            <FormItem label={t('未开通会员描述')}>
              <DescInput
                className='form-control'
                value={desc}
                name='desc'
                onChange={this.handleInputChange}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {t(
                  '此文案会在用户没有购买会员卡或会员卡过期时展现，可参考如下文案“开通会员卡享受海量优惠”“开通黑卡，尊享优惠”；'
                )}
              </div>
            </FormItem>
            <FormItem label={t('是否开启')}>
              <Switch
                on={t('开启')}
                off={t('关闭')}
                checked={is_active}
                onChange={this.handleChangeSwitch}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {t(
                  '开启后消费者可进行购买，请确认相关权益均已完成设置，避免产生消费者误解'
                )}
              </div>
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

const AddCharge = styled(Flex)`
  border: 4px dotted #d4d8d8;
  width: 180px;
  height: 180px;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #56a3f2;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #56a3f2;
    border: 4px double #fff;
    color: #fff;
  }
`

const AddIcon = styled(SvgPlus)`
  width: 40px;
  height: 40px;
  margin: auto;
`

const DescInput = styled(Input)`
  width: 400px;
`

export default Setting
