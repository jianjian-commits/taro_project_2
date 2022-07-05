import { Request } from '@gm-common/request'
import {
  Checkbox,
  CheckboxGroup,
  Flex,
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  InputNumber,
  Radio,
  RadioGroup,
  Tip,
  ToolTip,
  Uploader,
  Validator,
} from '@gmfe/react'
import { history, isCStationAndC, System } from 'common/service'
import { i18next, t } from 'gm-i18n'
import { SvgCloseCircle } from 'gm-svg'
import { getStaticStorage } from 'gm_static_storage'
import React from 'react'
import InitShopRegister from '../../../../guides/init/guide/init_shop_register'
import globalStore from '../../../../stores/global'
import Irrigation from './irrigation'
import Link from './link'
import Logo from './logo'
import PriceCheckBox from './price_checkbox'
import RedEnvelope from './red_envelope'
import SalemenuSelect from './salemenu_select'
import BSwitch from './switch'

class ShopSetting extends React.Component {
  constructor(props) {
    super(props)

    this.formRef1 = React.createRef()
    this.formRef2 = React.createRef()
    this.formRef3 = React.createRef()
    this.formRef4 = React.createRef()
    this.formRef5 = React.createRef()

    this.state = {
      loading: true,
      preview: {},
      data: {
        optional_receive_way: 1,
        customer_regist_type: 1,
        receive_way_arr: [1],
        registration_types: [1],
        title: '',
        phone: '',
        logo: '',
        customer_pic: [],
        account: [],
        price_diversification: 0, // 商品价格多样化
        is_open_sku_detail: 0, // 是否开启商品详情
        is_open_full_present: 0, // 是否开启商品满赠
        min_full_present_amount: 0, // 商品满赠金额
        is_open_buy_present: 0, // 是否开启商品买赠
        is_need_invitation_code: 0, // 邀请码是否必填，1：必填，0：非必填
        default_salemenu_id: '', // 默认报价单id
        is_open_order_edit: 0, // 是否开启下单后自主编辑订单信息
        is_open_new_merchandise: 0, // 是否开启 用于标识是否在 bshop 中开启新品需求
        is_open_manage_stock: 0, // 是否开启 商城进销存
        is_user_change_own_pwd: 0, // 是否开启短信找回密码
        is_verify_phone_on_register: 0, // 是否开启手机号注册号
        support_point_exchange: 0, // 是否开启积分
        reward_exchange_ratio: 0, // 全局积分兑换比例
        is_open_product_reward: 0, // 商品维度积分开关
        is_open_max_reward_limit: 0, // 是否开启积分上限
        max_reward_limit: 0, // 积分上限
        exchange_reward_min_money: 0, // 起兑金额
        show_driver_location: 0, // 司机位置
        is_order_many_days: 0, // 多日下单
        show_enterprise_brand: 0, // 企业品牌厅
        is_open_order_statement: 0, // 商户对账单
        is_open_report: 0, // 运营报表
        invitation_register: 0, // 是否开启邀请注册, 0: 关闭, 1: 开启
        bshop_qr_code: '', // 微信公众号二维码
        is_auto_check: 0, // 商户自动审核
        is_open_nutrition_analysis: 0, // 营养分析
        is_open_index_notice: 0, // 是否开启商城公告
        index_notice: '', // 商城公告
        is_open_wechat_login: 0, // 微信登陆
        is_open_wechat_miniprogram_live: 0, // 直播
        is_open_cancel_order: 0, // cshop取消订单设置
        shopTypeList: [1], // 商城类型数组
        can_change_distributor: 1, // 是否允许更换团长
        is_open_red_envelope: 0, // 是否开启红包分享
        coupon_info_id: '', // 红包券id
        is_open_order_signature: 0, // 是否能修改签名
        order_edit_audit_type: 0, // 改单是否需要审核
        is_open_nologin_show_price: 1, // 未登录是否展示商品价格
      },
      msgSetting: {},
      salemenuList: [], // 报价单list
      showRedEnvelope: [], // 微商城红包分享开关显示的station_id，后面陆续打包后会去掉
    }
  }

  getShowCShopRedEnvelope = () => {
    getStaticStorage('/cshop/xcx_red_envelope.json').then((json) => {
      this.setState({
        showRedEnvelope: json.showStationId,
      })
    })
  }

  getData = () => {
    let url = '/station/customized'
    // 纯C站点或零售时拉取C的配置
    if (isCStationAndC()) {
      url = '/station/cshop/customized_info/get'
    }

    Request(url)
      .get()
      .then((json) => {
        const {
          optional_receive_way,
          customer_regist_type,
          shop_type,
        } = json.data

        const data = {
          ...json.data,
          min_full_present_amount: json.data.min_full_present_amount / 100,
          receive_way_arr:
            optional_receive_way === 10 ? [1, 2] : [optional_receive_way || 1],
          registration_types:
            customer_regist_type === 3 ? [1, 2] : [customer_regist_type || 1],
          shopTypeList: shop_type === 3 ? [1, 2] : [shop_type],
        }
        this.setState({
          loading: false,
          data,
        })
      })
  }

  getSale = () => {
    // 拉取报价单
    Request('/salemenu/sale/list')
      .data({ has_cms_key_salemenu: 1 })
      .get()
      .then((json) => {
        this.setState({
          salemenuList: json.data,
        })
      })
  }

  getMsgSetting() {
    Request('/sms/customized_info/get')
      .get()
      .then((json) => {
        this.setState({ msgSetting: json.data })
      })
  }

  componentDidMount() {
    this.getData()
    !globalStore.otherInfo.isCStation && this.getSale()
    this.getMsgSetting()
    isCStationAndC() && this.getShowCShopRedEnvelope()
  }

  // 提交不跟原来的混淆, 只传必须的字段，直接新起一个函数，cshop设置 -- C站点跟零售入口保存
  handleCShopSetting = () => {
    const {
      title,
      phone,
      logo,
      price_diversification,
      is_open_sku_detail,
      is_open_full_present,
      is_open_buy_present,
      cshop_cms_key,
      optional_receive_way,
      is_open_index_notice,
      index_notice,
      is_open_cancel_order,
      shopTypeList,
      can_change_distributor,
      is_open_wechat_miniprogram_live,
      is_open_red_envelope,
      coupon_info_id,
    } = this.state.data

    // 1:平台运营 2:社区团购，3:平台运营+社区团购
    const shop_type = shopTypeList.length > 1 ? 3 : shopTypeList[0]

    const data = {
      title,
      phone,
      logo,
      price_diversification,
      is_open_sku_detail,
      is_open_full_present,
      is_open_buy_present,
      optional_receive_way: optional_receive_way || 1,
      is_open_index_notice,
      index_notice,
      is_open_cancel_order,
      is_open_wechat_miniprogram_live,
      shop_type,
      can_change_distributor: can_change_distributor ? 1 : 0,
      is_open_red_envelope: is_open_red_envelope ? 1 : 0,
      coupon_info_id: coupon_info_id,
    }

    if (cshop_cms_key && cshop_cms_key !== 'gm') {
      data.price_diversification = price_diversification
    }
    // 如果logo有变更则传
    if (this.state.preview[logo]) {
      data.logo = logo
    }

    if (
      is_open_index_notice &&
      (!index_notice || (index_notice && !index_notice.trim()))
    ) {
      return Tip.warning('请填写商城公告')
    }

    if (!optional_receive_way) {
      return Tip.warning(i18next.t('请勾选至少一种收货方式'))
    }

    if (!shop_type) {
      return Tip.warning(i18next.t('请勾选至少一种商城类型'))
    }

    if (!!is_open_red_envelope && !coupon_info_id) {
      return Tip.warning(i18next.t('请选择红包分享券'))
    }

    return Request('/station/cshop/customized_info/update')
      .data(data)
      .post()
      .then(() => {
        Tip.success(i18next.t('保存成功'))
        this.getData()
      })
  }

  handleSubmit = () => {
    if (isCStationAndC()) {
      this.handleCShopSetting()
      return
    }

    const {
      is_open_order_statement,
      is_open_report,
      show_enterprise_brand,
      is_open_order_edit,
      is_open_new_merchandise,
      is_open_manage_stock,
      order_edit_time_limit,
      title,
      phone,
      logo,
      price_diversification,
      is_open_sku_detail,
      is_open_full_present,
      min_full_present_amount,
      is_open_buy_present,
      is_need_invitation_code,
      default_salemenu_id,
      key,
      is_user_change_own_pwd,
      is_verify_phone_on_register,
      customer_regist_type,
      optional_receive_way,
      support_point_exchange,
      exchange_reward_min_money,
      show_driver_location,
      is_order_many_days,
      invitation_register,
      bshop_qr_code,
      is_auto_check,
      is_open_nutrition_analysis,
      is_open_index_notice,
      index_notice,
      is_open_wechat_login,
      is_open_wechat_miniprogram_live,
      is_open_order_signature,
      order_edit_audit_type,
      reward_exchange_ratio,
      is_open_product_reward,
      is_open_max_reward_limit,
      max_reward_limit,
      is_open_nologin_show_price,
    } = this.state.data
    const data = {
      title,
      phone,
      is_need_invitation_code,
      is_open_sku_detail,
      is_open_full_present,
      is_open_buy_present,
      is_open_order_edit,
      is_open_manage_stock,
      is_user_change_own_pwd,
      is_open_new_merchandise,
      is_verify_phone_on_register,
      customer_regist_type,
      optional_receive_way: optional_receive_way || 1,
      support_point_exchange,
      show_driver_location,
      is_order_many_days,
      show_enterprise_brand,
      is_open_order_statement,
      is_open_report,
      invitation_register,
      bshop_qr_code,
      is_auto_check,
      is_open_nutrition_analysis,
      is_open_index_notice,
      index_notice,
      is_open_wechat_login,
      is_open_wechat_miniprogram_live,
      is_open_order_signature,
      order_edit_audit_type,
      reward_exchange_ratio,
      is_open_product_reward,
      is_open_max_reward_limit,
      max_reward_limit,
      is_open_nologin_show_price,
    }

    if (is_open_order_edit) {
      if (order_edit_time_limit <= 0) {
        Tip.warning(i18next.t('自主改单时间必须大于0！'))
        return
      }
      data.order_edit_time_limit = +order_edit_time_limit
    }

    if (is_open_full_present) {
      if (+min_full_present_amount <= 0) {
        Tip.warning('满赠订单金额必须大于0!')
        return
      }
      data.min_full_present_amount = +min_full_present_amount * 100
    }

    if (support_point_exchange) {
      if (+exchange_reward_min_money <= 0) {
        Tip.warning('起兑金额必须大于0！')
        return
      }
      data.exchange_reward_min_money = +exchange_reward_min_money
    }

    // 如果没有默认报价单就不传值
    if (default_salemenu_id !== '') {
      data.default_salemenu_id = default_salemenu_id
    }

    if (key && key !== 'gm') {
      data.price_diversification = price_diversification
    }
    // 如果logo有变更则传
    if (this.state.preview[logo]) {
      data.logo = logo
    }

    if (
      is_open_index_notice &&
      (!index_notice || (index_notice && !index_notice.trim()))
    ) {
      return Tip.warning('请填写商城公告')
    }
    let url = '/station/customized/update'
    if (isCStationAndC()) url = '/station/cshop/customized_info/update'

    return Request(url)
      .data(data)
      .post()
      .then(() => {
        Tip.success(i18next.t('保存成功'))
        this.getData()
      })
  }

  handleChange = (e) => {
    this.setState({
      data: {
        ...this.state.data,
        [e.target.name]: e.target.value,
      },
    })
  }

  handleChangeField = (filed, value) => {
    this.setState({
      data: {
        ...this.state.data,
        [filed]: value,
      },
    })
  }

  handleChangeCheckbox = (value) => {
    this.setState({
      data: {
        ...this.state.data,
        receive_way_arr: [...value],
        optional_receive_way: value.length > 1 ? 10 : value[0],
      },
    })
  }

  handleChangeRegistration = (value) => {
    this.setState({
      data: {
        ...this.state.data,
        registration_types: [...value],
        customer_regist_type: value.length > 1 ? 3 : value[0],
      },
    })
  }

  handleChangeShopType = (value) => {
    this.setState({
      data: {
        ...this.state.data,
        shopTypeList: [...value],
      },
    })
  }

  handleChangeSwitch = (filed, value) => {
    if (
      filed === 'is_user_change_own_pwd' ||
      filed === 'is_verify_phone_on_register'
    ) {
      if (
        value &&
        this.state.msgSetting.is_open_sms_telephone_verify === false
      ) {
        Tip.warning(i18next.t('短信设置手机验证未开启，无法开启此开关'))
        return
      }
    }

    this.setState({
      data: {
        ...this.state.data,
        [filed]: value ? 1 : 0,
      },
    })
  }

  handleUpload = (files, event) => {
    event.preventDefault()

    const { data, preview } = this.state
    if (files[0].size > 1024 * 50) {
      Tip.warning(i18next.t('logo不能超过50kb'))
      return
    }

    Request('/station/image/upload')
      .data({
        image_file: files[0],
      })
      .post()
      .then((json) => {
        preview[json.data.img_path_id] = json.data.image_url
        data.logo = json.data.img_path_id
        this.setState(this.state)
      })
  }

  handleImgUpload = (field, files) => {
    return Request('/image/upload')
      .data({
        image_file: files[0],
        is_retail_interface: System.isC() ? 1 : null,
      })
      .post()
      .then((json) => {
        this.handleChangeField(field, json.data.image_url)
      })
  }

  handleIrrigation = () => {
    const { account } = this.state.data

    Irrigation.render({
      data: account ? account.slice() : [],
      onSave: () => {
        this.getData()
      },
    })
  }

  validatorGreater = (value) => {
    if (value <= 0) {
      return t('需输入大于0的值')
    }
    return ''
  }

  render() {
    const { data = {}, preview, showRedEnvelope } = this.state
    const key = data.key ? data.key : 'xscs'
    const cshop_key = data.cshop_cms_key ? data.cshop_cms_key : 'xscs'
    const cms_key = isCStationAndC() ? cshop_key : key
    const isGm =
      !globalStore.hasPermission('edit_base_setting') || cms_key === 'gm'
    // 希捷说： 'xscs': 销售测试
    // 有部分客户用的cms_key: 'gm'，isGm === true 则不能修改任何内容，且屏蔽默认报价单、邀请码必填、多价格展示、到账渠道
    // 在配置内的station_id才能使用红包功能
    const canUseRedEnvelope = showRedEnvelope.includes(
      globalStore.user.station_id,
    )

    if (!data) {
      return <div className='gm-padding-10'>{i18next.t('无个性化配置')}</div>
    }

    // 只有选了社区团购才展示是否更换团长按钮
    const isCanChangeDistributor = data.shopTypeList.includes(2)
    return (
      <FormGroup
        formRefs={
          isCStationAndC()
            ? [this.formRef1, this.formRef3, this.formRef4]
            : [
                this.formRef1,
                this.formRef2,
                this.formRef3,
                this.formRef4,
                this.formRef5,
              ]
        }
        onSubmitValidated={this.handleSubmit}
      >
        <FormPanel title={i18next.t('店铺设置')}>
          <Form ref={this.formRef1} disabledCol labelWidth='166px'>
            <FormItem label={i18next.t('店铺URL')}>
              <Link cms_key={cms_key} isCShop={isCStationAndC()} />
            </FormItem>
            {!isGm && !isCStationAndC() && (
              <FormItem label={i18next.t('默认报价单')} className='form-inline'>
                <Flex alignCenter>
                  <SalemenuSelect
                    selected={data.default_salemenu_id}
                    onChange={this.handleChangeField.bind(
                      this,
                      'default_salemenu_id',
                    )}
                    params={{ has_cms_key_salemenu: 1 }}
                  />
                  <ToolTip
                    popup={
                      <div
                        className='gm-padding-10 gm-bg'
                        style={{ width: '540px' }}
                      >
                        <p style={{ marginBottom: '4px', fontSize: '12px' }}>
                          {i18next.t(
                            '1、商户空邀请码注册时，默认展示的报价单(在信息平台-商户管理中可更换商户所绑定报价单)；',
                          )}
                        </p>
                        <p style={{ marginBottom: 0, fontSize: '12px' }}>
                          {i18next.t('2、商户未注册时，默认展示该报价单商品。')}
                        </p>
                      </div>
                    }
                    className='gm-padding-lr-5'
                  />
                </Flex>
              </FormItem>
            )}
            <FormItem label={i18next.t('未登录展示商品价格')}>
              <BSwitch
                checked={!!data.is_open_nologin_show_price}
                onChange={this.handleChangeSwitch.bind(
                  this,
                  'is_open_nologin_show_price',
                )}
                disabled={isGm}
                tip={i18next.t('关闭后，用户未登录商城时无法看到商品售价')}
              />
            </FormItem>
            <FormItem
              label={i18next.t('店铺名称')}
              required
              validate={Validator.create([], data.title)}
            >
              <input
                type='text'
                name='title'
                style={{ width: '220px' }}
                placeholder={i18next.t('店铺名称')}
                value={data.title}
                disabled={isGm}
                onChange={this.handleChange}
              />
            </FormItem>
            <FormItem
              label={i18next.t('客服电话')}
              required
              validate={Validator.create([], data.phone)}
            >
              <input
                type='text'
                name='phone'
                style={{ width: '220px' }}
                placeholder={i18next.t('手机或座机')}
                value={data.phone}
                disabled={isGm}
                onChange={this.handleChange}
              />
            </FormItem>
            {!isGm && !isCStationAndC() && (
              <FormItem label={i18next.t('到账渠道')} unLabelTop>
                <Flex alignCenter>
                  <a href='javscript:void(0);' onClick={this.handleIrrigation}>
                    {i18next.t('点击管理')}
                  </a>
                  <ToolTip
                    popup={
                      <div
                        className='gm-padding-10 gm-bg'
                        style={{ width: '212px' }}
                      >
                        {i18next.t('微信支付，线下付款不需在这里配置')}
                      </div>
                    }
                    className='gm-padding-lr-5'
                  />
                </Flex>
              </FormItem>
            )}
            <FormItem label={i18next.t('商城公告')}>
              <BSwitch
                checked={!!data.is_open_index_notice}
                onChange={this.handleChangeSwitch.bind(
                  this,
                  'is_open_index_notice',
                )}
                disabled={isGm}
                tip={i18next.t('开启后，用户登录商城后会收到通知信息')}
              />
            </FormItem>
            {!!data.is_open_index_notice && (
              <FormItem label={i18next.t('公告内容')}>
                <textarea
                  placeholder={i18next.t(
                    '请输入公告内容，用户登录后将在商城端收到信息',
                  )}
                  name='index_notice'
                  value={data.index_notice}
                  onChange={this.handleChange.bind(this)}
                  disabled={isGm}
                  style={{ width: '300px', height: '70px' }}
                />
              </FormItem>
            )}
            <FormItem label={i18next.t('店铺LOGO')}>
              <Logo
                disabled={isGm}
                logo={preview[data.logo] || data.logo}
                onUpload={this.handleUpload}
              />
            </FormItem>
          </Form>
        </FormPanel>
        {!isCStationAndC() && (
          <FormPanel title={i18next.t('注册流程')} data-id='initShopRegister'>
            <Form ref={this.formRef2} disabledCol labelWidth='166px'>
              {!isGm && !isCStationAndC() && (
                <FormItem label={i18next.t('邀请码')}>
                  <BSwitch
                    checked={!!data.is_need_invitation_code}
                    onChange={this.handleChangeSwitch.bind(
                      this,
                      'is_need_invitation_code',
                    )}
                    tip={i18next.t('关闭时，允许商户免邀请码注册')}
                  />
                </FormItem>
              )}
              <FormItem label={i18next.t('微信授权登陆')}>
                <BSwitch
                  checked={!!data.is_open_wechat_login}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_wechat_login',
                  )}
                  disabled={isGm}
                />
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '开启后，新商户可使用微信直接登录商城，老商户登陆商城绑定微信后也可使用微信登录商城',
                  )}
                </div>
              </FormItem>
              {!isGm && (
                <FormItem label={i18next.t('商户自动审核')}>
                  <BSwitch
                    checked={!!data.is_auto_check}
                    onChange={this.handleChangeSwitch.bind(
                      this,
                      'is_auto_check',
                    )}
                    tip={
                      <div>
                        {i18next.t(
                          '开启后，新商户注册后审核状态自动为已审核，可以直接下单。',
                        )}
                        <br />
                        {i18next.t('关闭后，新商户注册后下单需审核。')}
                      </div>
                    }
                  />
                </FormItem>
              )}
              {key !== 'xscs' && (
                <FormItem label={i18next.t('短信找回密码')}>
                  <BSwitch
                    checked={!!data.is_user_change_own_pwd}
                    onChange={this.handleChangeSwitch.bind(
                      this,
                      'is_user_change_own_pwd',
                    )}
                    disabled={isGm}
                    tip={
                      <div>
                        {i18next.t(
                          '开启后，商户可通过验证手机修改登录密码，同时可修改绑定手机号。',
                        )}
                        <br />
                        {i18next.t('关闭后，商户无法使用忘记密码功能。')}
                      </div>
                    }
                  />
                </FormItem>
              )}
              {key !== 'xscs' && (
                <FormItem label={i18next.t('手机号注册')}>
                  <BSwitch
                    checked={!!data.is_verify_phone_on_register}
                    onChange={this.handleChangeSwitch.bind(
                      this,
                      'is_verify_phone_on_register',
                    )}
                    disabled={isGm}
                    tip={
                      <div>
                        {i18next.t(
                          '开启后，新商户注册时须验证手机号，否则无法完成注册。',
                        )}
                        <br />
                        {i18next.t('关闭后，新用户注册时无需填写手机号。')}
                      </div>
                    }
                  />
                </FormItem>
              )}
              <FormItem
                label={i18next.t('注册类型')}
                required
                validate={Validator.create([], data.customer_regist_type)}
              >
                <CheckboxGroup
                  name='registration_types'
                  className='gm-padding-top-0'
                  inline
                  value={data.registration_types}
                  onChange={this.handleChangeRegistration}
                >
                  <Checkbox value={1}>{i18next.t('店铺')}</Checkbox>
                  <Checkbox value={2}>{i18next.t('个人')}</Checkbox>
                </CheckboxGroup>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t('新注册的用户按照此设置进入不同的注册流程')}
                </div>
              </FormItem>
              <FormItem
                label={i18next.t('默认改单审核')}
                required
                validate={Validator.create([], data.customer_regist_type)}
              >
                <RadioGroup
                  name='order_edit_audit_type'
                  className='gm-padding-top-0'
                  inline
                  value={data.order_edit_audit_type}
                  onChange={this.handleChangeField.bind(
                    this,
                    'order_edit_audit_type',
                  )}
                >
                  <Radio value={0}>{i18next.t('改单无需审核')}</Radio>
                  <Radio value={1}>{i18next.t('改单需审核')}</Radio>
                </RadioGroup>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '配置新商户注册后默认是否需要改单审核，需审核的商户商城改单后需配送企业后台审核后修改才会生效',
                  )}
                </div>
              </FormItem>
            </Form>
          </FormPanel>
        )}
        <FormPanel title={i18next.t('操作设置')}>
          <Form ref={this.formRef3} disabledCol labelWidth='166px'>
            {!isCStationAndC() && (
              <FormItem label={i18next.t('新品需求')}>
                <BSwitch
                  type='primary'
                  checked={!!data.is_open_new_merchandise}
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_new_merchandise',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '设置为"开启"后，可以允许商户在商城提交新品需求并查看处理状态',
                  )}
                />
              </FormItem>
            )}
            {!isCStationAndC() && (
              <FormItem
                label={i18next.t('商城改单')}
                validate={Validator.create([], data.is_open_order_edit)}
              >
                <BSwitch
                  checked={!!data.is_open_order_edit}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_order_edit',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '设置为"开启"后，可以允许商户在规定时间内自主修改已提交订单内容',
                  )}
                />
              </FormItem>
            )}
            {!!data.is_open_order_edit && !isCStationAndC() && (
              <FormItem
                label={i18next.t('时间限制')}
                required
                validate={Validator.create([], data.order_edit_time_limit)}
              >
                <Flex alignCenter>
                  <InputNumber
                    disabled={isGm}
                    value={data.order_edit_time_limit}
                    className='form-control'
                    style={{ width: '220px', marginRight: '3px' }}
                    precision={0}
                    min={0}
                    max={99999}
                    onChange={this.handleChangeField.bind(
                      this,
                      'order_edit_time_limit',
                    )}
                  />
                  {i18next.t('分钟内')}
                </Flex>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '设置商户可以修改的时间期限，如设置为30分钟，则在下单后的30分钟内，且订单未进入"分拣中"时可自主在商城修改未支付的订单信息',
                  )}
                </div>
              </FormItem>
            )}
            {!isCStationAndC() && (
              <FormItem
                label={i18next.t('修改电子签名')}
                validate={Validator.create([], data.is_open_order_signature)}
              >
                <BSwitch
                  checked={!!data.is_open_order_signature}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_order_signature',
                  )}
                  tip={i18next.t(
                    '开启后，商城端可对订单的签名信息进行二次编辑修改',
                  )}
                />
              </FormItem>
            )}
            <FormItem label={i18next.t('收货方式')}>
              <CheckboxGroup
                name='receive_way'
                className='gm-padding-top-0'
                inline
                value={data.receive_way_arr}
                onChange={this.handleChangeCheckbox}
              >
                <Checkbox value={1} disabled={!isCStationAndC()}>
                  {i18next.t('配送')}
                </Checkbox>
                <Checkbox value={2}>{i18next.t('自提')}</Checkbox>
              </CheckboxGroup>
            </FormItem>
            {isCStationAndC() && (
              <FormItem
                label={i18next.t('取消订单')}
                validate={Validator.create([], data.is_open_cancel_order)}
              >
                <BSwitch
                  checked={!!data.is_open_cancel_order}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_cancel_order',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '开启后，用户可在商城自主取消订单状态为等待分拣的订单，系统将自动发起订单退款',
                  )}
                />
              </FormItem>
            )}
            {isCStationAndC() && (
              <FormItem
                label={i18next.t('商城类型')}
                required
                validate={Validator.create([], data.shopTypeList)}
              >
                <CheckboxGroup
                  name='shopTypeList'
                  inline
                  value={data.shopTypeList}
                  onChange={this.handleChangeShopType}
                >
                  <Checkbox value={1}>{i18next.t('微商城')}</Checkbox>
                  <Checkbox value={2}>{i18next.t('社区团购')}</Checkbox>
                </CheckboxGroup>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t('微商城：传统站点运营方式，下单后由仓库直接配送')}
                  <br />
                  {i18next.t(
                    '社区团购：引入团长引流分销模式；开启后，支持社区团长参与推广，商城端下单可关联团长进行分佣（详情咨询客服）',
                  )}
                </div>
              </FormItem>
            )}
            {isCStationAndC() && isCanChangeDistributor && (
              <FormItem label={i18next.t('商城是否允许更换团长')}>
                <BSwitch
                  checked={!!data.can_change_distributor}
                  onChange={(value) =>
                    this.handleChangeSwitch('can_change_distributor', value)
                  }
                  tip={
                    <div>
                      {i18next.t('开启：商城可更换团长，引入团长竞争引流')}
                      <br />
                      {i18next.t(
                        '关闭：商城端下单仅可由专属推广图所属的团长（或上次下单的团长）参与分销，不可更换其他团长',
                      )}
                    </div>
                  }
                />
              </FormItem>
            )}
          </Form>
        </FormPanel>
        <FormPanel title={i18next.t('营销设置')}>
          <Form ref={this.formRef4} disabledCol labelWidth='166px'>
            <FormItem
              label={i18next.t('商品详情')}
              validate={Validator.create([], data.is_open_sku_detail)}
            >
              <BSwitch
                checked={!!data.is_open_sku_detail}
                onChange={this.handleChangeSwitch.bind(
                  this,
                  'is_open_sku_detail',
                )}
                disabled={isGm}
                tip={i18next.t('开启时，点击商品名称可进入商品详情页')}
              />
            </FormItem>
            {!isCStationAndC() && (
              <FormItem
                label={i18next.t('商品满赠')}
                validate={Validator.create([], data.is_open_full_present)}
              >
                <BSwitch
                  checked={!!data.is_open_full_present}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_full_present',
                  )}
                  disabled={isGm}
                  tip={
                    <div>
                      {i18next.t(
                        '开启后，单笔订单金额达到指定金额可免费领取指定赠品（此功能需要订单中相同商品拆分下单开关开启,否则设置无效）',
                      )}
                      {data.is_open_full_present ? (
                        <Flex alignCenter>
                          {i18next.t('单笔订单满')}
                          <InputNumber
                            value={data.min_full_present_amount}
                            className='form-control'
                            style={{ width: '220px', marginRight: '3px' }}
                            precision={2}
                            min={0}
                            max={99999}
                            onChange={this.handleChangeField.bind(
                              this,
                              'min_full_present_amount',
                            )}
                          />
                          {i18next.t('元可使用')}
                        </Flex>
                      ) : null}
                    </div>
                  }
                />
              </FormItem>
            )}
            {!isCStationAndC() && (
              <FormItem
                label={i18next.t('商品买赠')}
                validate={Validator.create([], data.is_open_buy_present)}
              >
                <BSwitch
                  checked={!!data.is_open_buy_present}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_buy_present',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '开启时，购买指定商品免费获取赠品，买赠和满赠可以叠加（此功能需要订单中相同商品拆分下单开关开启,否则设置无效）',
                  )}
                />
              </FormItem>
            )}
            {!isGm &&
              (isCStationAndC() ? (
                <FormItem
                  label={i18next.t('多价格展示')}
                  validate={Validator.create([], data.price_diversification)}
                >
                  <BSwitch
                    checked={!!data.price_diversification}
                    onChange={this.handleChangeSwitch.bind(
                      this,
                      'price_diversification',
                    )}
                    tip={
                      <div>
                        {i18next.t(
                          '开启时，若商品「基本单位」与「销售单位」不一致时，商户端两种价格均展现；',
                        )}
                        <br />
                        {i18next.t('关闭时，仅展现「销售单位」。')}
                      </div>
                    }
                  />
                </FormItem>
              ) : (
                <FormItem
                  label={i18next.t('多价格展示')}
                  validate={Validator.create([], data.price_diversification)}
                >
                  <PriceCheckBox
                    value={data.price_diversification}
                    onChange={this.handleChangeField.bind(
                      this,
                      'price_diversification',
                    )}
                    tip={
                      <div>
                        {i18next.t(
                          '均勾选时，若商品「基本单位」与「销售单位」不一致时，商户端两种价格均展现',
                        )}
                      </div>
                    }
                  />
                </FormItem>
              ))}
            {!isCStationAndC() && (
              <FormItem label={i18next.t('司机位置')}>
                <BSwitch
                  checked={!!data.show_driver_location}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'show_driver_location',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '设置为"开启"后，可以允许商户在商城查看配送中的司机位置，需使用司机app且开启定位功能',
                  )}
                />
              </FormItem>
            )}
            {!isCStationAndC() && (
              <FormItem label={i18next.t('企业品牌厅')}>
                <BSwitch
                  checked={!!data.show_enterprise_brand}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'show_enterprise_brand',
                  )}
                  disabled={isGm}
                />
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '设置为"开启"后，在商城首页展示企业品牌厅入口，下拉页面可进入二楼品牌厅',
                  )}
                </div>
              </FormItem>
            )}
            {!isCStationAndC() && (
              <FormItem label={i18next.t('邀请有礼')}>
                <BSwitch
                  checked={!!data.invitation_register}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'invitation_register',
                  )}
                  disabled={isGm}
                />
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '设置为"开启"后，商户可进入邀请有礼邀请好友注册下单',
                  )}
                </div>
              </FormItem>
            )}
            {!!data.invitation_register && !isCStationAndC() && (
              <FormItem
                label={i18next.t('公众号二维码')}
                className='gm-position-relative'
              >
                <Uploader
                  onUpload={this.handleImgUpload.bind(this, 'bshop_qr_code')}
                  accept='image/*'
                >
                  {data.bshop_qr_code ? (
                    <img
                      style={{
                        cursor: 'pointer',
                        width: '90px',
                        height: '90px',
                      }}
                      src={data.bshop_qr_code}
                    />
                  ) : (
                    <Uploader.DefaultImage />
                  )}
                </Uploader>
                {!!data.bshop_qr_code && (
                  <SvgCloseCircle
                    onClick={this.handleChangeField.bind(
                      this,
                      'bshop_qr_code',
                      '',
                    )}
                    className='gm-cursor'
                    style={{
                      color: 'red',
                      position: 'absolute',
                      left: '81px',
                      top: '0px',
                      zIndex: 1,
                    }}
                  />
                )}
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '此二维码用于邀请有礼新用户注册成功后，提示用户关注公众号',
                  )}
                </div>
              </FormItem>
            )}
            {!isCStationAndC() && (
              <FormItem
                label={i18next.t('积分')}
                validate={Validator.create([], data.support_point_exchange)}
              >
                <BSwitch
                  checked={!!data.support_point_exchange}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'support_point_exchange',
                  )}
                  tip={i18next.t('设置为“开启”后，商户支付订单即可获得积分')}
                />
              </FormItem>
            )}
            {!!data.support_point_exchange && !isCStationAndC() && (
              <>
                <FormItem
                  label={i18next.t('默认积分规则')}
                  required
                  validate={Validator.create(
                    [],
                    data.reward_exchange_ratio,
                    (value) => this.validatorGreater(value),
                  )}
                >
                  <Flex style={{ flexWrap: 'wrap' }}>
                    <span style={{ paddingTop: '6px' }}>
                      {i18next.t(
                        '按下单金额计算，支付订单即可获得积分，订单每满',
                      )}
                    </span>
                    <InputNumber
                      value={data.reward_exchange_ratio}
                      className='form-control'
                      style={{
                        width: '60px',
                        margin: '0 3px',
                      }}
                      precision={0}
                      min={0}
                      max={99999}
                      onChange={this.handleChangeField.bind(
                        this,
                        'reward_exchange_ratio',
                      )}
                    />
                    <span style={{ paddingTop: '6px' }}>
                      {i18next.t('元积一分。')}
                    </span>
                    <span className='gm-text-desc' style={{ padding: '6px 0' }}>
                      {i18next.t(
                        '(若订单使用优惠券，则订单中全部商品均按照此设置计算获得积分，即与下方按商品分类设置规则无关。）',
                      )}
                    </span>
                  </Flex>
                </FormItem>
                <FormItem label={i18next.t('按分类设置积分')}>
                  <Flex alignCenter style={{ paddingTop: '6px' }}>
                    <BSwitch
                      checked={!!data.is_open_product_reward}
                      onChange={this.handleChangeSwitch.bind(
                        this,
                        'is_open_product_reward',
                      )}
                    />
                    {!!data.is_open_product_reward && (
                      <a
                        className='gm-margin-left-5'
                        onClick={() => {
                          history.push(
                            '/system/setting/custom_page/shop_setting/integral_rule',
                          )
                        }}
                      >
                        {i18next.t('按商品分类单独设置积分规则')}
                      </a>
                    )}
                  </Flex>
                  <span
                    className='gm-margin-top-5 gm-text-desc'
                    style={{ display: 'block' }}
                  >
                    {i18next.t('开启后，可单独设置分类获得积分比例')}
                  </span>
                </FormItem>
                <FormItem label={i18next.t('商户积分上限')}>
                  <BSwitch
                    checked={!!data.is_open_max_reward_limit}
                    onChange={this.handleChangeSwitch.bind(
                      this,
                      'is_open_max_reward_limit',
                    )}
                    tip={i18next.t(
                      '开启后，商户积分到达上限分值无法继续获取积分',
                    )}
                  />
                </FormItem>
                {!!data.is_open_max_reward_limit && (
                  <FormItem
                    label={i18next.t('积分上限值')}
                    required
                    validate={Validator.create(
                      [],
                      data.max_reward_limit,
                      (value) => this.validatorGreater(value),
                    )}
                  >
                    <Flex alignCenter>
                      <InputNumber
                        className='form-control'
                        value={data.max_reward_limit}
                        style={{
                          width: '220px',
                          marginRight: '3px',
                        }}
                        precision={0}
                        min={0}
                        max={999999}
                        onChange={this.handleChangeField.bind(
                          this,
                          'max_reward_limit',
                        )}
                      />
                      {i18next.t('积分')}
                    </Flex>
                  </FormItem>
                )}
                <FormItem
                  label={i18next.t('起兑金额')}
                  required
                  validate={Validator.create(
                    [],
                    data.exchange_reward_min_money,
                  )}
                >
                  <Flex alignCenter>
                    <InputNumber
                      value={data.exchange_reward_min_money}
                      className='form-control'
                      style={{ width: '220px', marginRight: '3px' }}
                      precision={2}
                      min={0}
                      max={99999}
                      onChange={this.handleChangeField.bind(
                        this,
                        'exchange_reward_min_money',
                      )}
                    />
                    {i18next.t('元')}
                  </Flex>
                  <div className='gm-text-desc gm-margin-top-5'>
                    {i18next.t(
                      '设置商户可以兑换积分商品的下单金额，如设置为100元，则下单金额达到100元时，可以使用积分兑换积分商品',
                    )}
                  </div>
                </FormItem>
              </>
            )}
            <FormItem label={i18next.t('小程序直播')}>
              <BSwitch
                checked={!!data.is_open_wechat_miniprogram_live}
                onChange={this.handleChangeSwitch.bind(
                  this,
                  'is_open_wechat_miniprogram_live',
                )}
                tip={i18next.t(
                  '设置为"开启"后，使用小程序商城时增加直播入口，可在小程序后台配置直播相关内容',
                )}
              />
            </FormItem>
            {canUseRedEnvelope && isCStationAndC() && (
              <FormItem label={i18next.t('红包分享')}>
                <BSwitch
                  checked={!!data.is_open_red_envelope}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_red_envelope',
                  )}
                  tip={i18next.t(
                    '开启时，商城下单后可在订单详情分享红包给好友',
                  )}
                />
              </FormItem>
            )}
            {canUseRedEnvelope &&
              isCStationAndC() &&
              !!data.is_open_red_envelope && (
                <FormItem
                  label={i18next.t('红包券选择')}
                  required
                  validate={Validator.create([], data.coupon_info_id)}
                >
                  <RedEnvelope
                    selected={data.coupon_info_id}
                    onChange={this.handleChangeField.bind(
                      this,
                      'coupon_info_id',
                    )}
                  />
                </FormItem>
              )}
          </Form>
        </FormPanel>
        {!isCStationAndC() && (
          <FormPanel title={i18next.t('工具设置')}>
            <Form ref={this.formRef5} disabledCol labelWidth='166px'>
              <FormItem label={i18next.t('商户对账单')}>
                <BSwitch
                  checked={!!data.is_open_order_statement}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_order_statement',
                  )}
                  disabled={isGm}
                />
                <div className='gm-text-desc gm-margin-top-10'>
                  {i18next.t(
                    '设置为“开启”后，可允许商户在商城导出对账单到指定邮箱',
                  )}
                </div>
              </FormItem>
              <FormItem label={i18next.t('运营报表')}>
                <BSwitch
                  checked={!!data.is_open_report}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_report',
                  )}
                  disabled={isGm}
                />
                <div className='gm-text-desc gm-margin-top-10'>
                  {i18next.t(
                    '设置为“开启”后，可允许商户在商城查看运营报表信息',
                  )}
                </div>
              </FormItem>
              <FormItem label={i18next.t('商城进销存')}>
                <BSwitch
                  checked={!!data.is_open_manage_stock}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_manage_stock',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '设置为"开启"后，可以允许商户在商城自主操作出入库以及查看商品库存',
                  )}
                />
              </FormItem>
              <FormItem label={i18next.t('商城下多日订单')}>
                <BSwitch
                  checked={!!data.is_order_many_days}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_order_many_days',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '设置为"开启"后，商城端在订单提交前，可选择是否按当前订单内容，一次性连下多日订单（需商户绑定有运营时间类型为“预售”的报价单）',
                  )}
                />
              </FormItem>
              <FormItem label={i18next.t('营养分析')}>
                <BSwitch
                  checked={!!data.is_open_nutrition_analysis}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'is_open_nutrition_analysis',
                  )}
                  disabled={isGm}
                  tip={i18next.t(
                    '设置为"开启"后，可以允许商户在商城查看营养分析信息',
                  )}
                />
              </FormItem>
            </Form>
          </FormPanel>
        )}
        <InitShopRegister ready={!this.state.loading} />
      </FormGroup>
    )
  }
}

export default ShopSetting
