import { i18next, t } from 'gm-i18n'
import React from 'react'
import { RadioGroup, Radio, ToolTip, Checkbox } from '@gmfe/react'
import { observer } from 'mobx-react'
import printerOptionsStore from '../printer_options_store'
import { SvgDown, SvgUp } from 'gm-svg'
import Category1GroupHelper from 'common/components/category_1_group_helper'
import CategoryGroup from './category_group'
import PropTypes from 'prop-types'
import CommonSwitchControl from './common_switch_control'
import MergePrintDelivery from './merge_print_delivery'

const kidPrintUrl = '#/system/setting/account_printer/template_editor'
@observer
class CommonPrinterOptions extends React.Component {
  state = {
    categoryHelperShow: false,
  }

  handleToggleCategoryHelperShow = () => {
    this.setState({ categoryHelperShow: !this.state.categoryHelperShow })
  }

  async componentDidMount() {
    try {
      await printerOptionsStore.getTemplateVersion()
    } finally {
      printerOptionsStore.getPrintTemplate(1)
    }
  }

  handleChangePrintTemp(id) {
    printerOptionsStore.setTemplateID(id)
    const handleRadioChange = this.props.handleRadioChange
    handleRadioChange && handleRadioChange()
  }

  handleChangeSplitOrderType(val) {
    printerOptionsStore.setSplitOrderType(val)
  }

  handleChangeKidPrintId(val) {
    printerOptionsStore.setKidPrintId(val)
  }

  render() {
    const {
      printTemplateList,
      templateId,
      isOldVersion,
      splitOrderType,
      isPrintSid,
      setOptions,
      kidPrintId,
      printKidTemplateList,
      // isSIDMergePrint,
      // setSIDMergePrint,
      isMergePrintDelivery,
      setMergePrintDelivery,
      isZDPrintConfig,
      setZDPrintConfig,
      categorySort,
      setCategorySort,
    } = printerOptionsStore
    // 配置模板权限
    const {
      canEdit,
      showKidPrint,
      addressId,
      showCommonSwitchControl,
    } = this.props
    const { categoryHelperShow } = this.state

    // 兼容一下旧版,过渡之后改掉
    const temDetailURL = isOldVersion
      ? '#/system/setting/distribute_templete/detail'
      : '#/system/setting/order_printer/template_editor'

    const temListURL = isOldVersion
      ? '#/system/setting/distribute_templete'
      : '#/system/setting/distribute_templete/order_printer'

    const commonSwitchControlProps = {
      commonSwitchControlTitle: i18next.t('合并打印配送单'),
      showCommonSwitchControlTip: true,
      commonSwitchControlCheck: isMergePrintDelivery,
      commonSwitchControlHandle: setMergePrintDelivery,
    }

    /** 整单打印配送单 */
    const commonSwitchForZDPrint = {
      commonSwitchControlTitle: i18next.t('同账户下按商户下单明细打印'),
      showCommonSwitchControlTip: true,
      commonSwitchControlCheck: isZDPrintConfig,
      commonSwitchControlHandle: setZDPrintConfig,
    }

    return (
      <div>
        <Checkbox
          className='gm-margin-bottom-5'
          checked={isPrintSid}
          onChange={(e) => setOptions('isPrintSid', e.currentTarget.checked)}
        >
          {i18next.t('商户配送单据')}
        </Checkbox>
        {/* 需要合并打印配送单 && 是sid && 是新版本 && 不是长条打印订单 */}
        {showCommonSwitchControl &&
          isPrintSid &&
          !isOldVersion &&
          !printerOptionsStore.isThermalPrinter(templateId) && (
            <CommonSwitchControl {...commonSwitchControlProps} />
          )}
        {showCommonSwitchControl &&
          isPrintSid &&
          !isOldVersion &&
          !printerOptionsStore.isThermalPrinter(templateId) &&
          isMergePrintDelivery && <MergePrintDelivery />}

        {isPrintSid && (
          <RadioGroup
            name='template'
            value={templateId}
            onChange={this.handleChangePrintTemp.bind(this)}
            className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
          >
            <Radio value='-1' key={-1}>
              <span>
                {i18next.t('按商户配置')}
                <ToolTip
                  popup={
                    <div className='gm-padding-5'>
                      {i18next.t('若商家未配置指定模板，则不会打印')}
                    </div>
                  }
                />
              </span>
              {canEdit && (
                <a
                  href={temListURL}
                  className='gm-text-12'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {i18next.t('配置商户>')}
                </a>
              )}
            </Radio>
            {printTemplateList.map((item) => (
              <Radio value={item.id} key={item.id}>
                <span>{item.name}</span>
                {canEdit && (
                  <a
                    href={`${temDetailURL}?template_id=${item.id}`}
                    className='gm-text-12'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {i18next.t('设置模板>')}
                  </a>
                )}
              </Radio>
            ))}
            <Radio
              value={printerOptionsStore.__THERMAL_PRINTER}
              key={printerOptionsStore.__THERMAL_PRINTER}
            >
              {i18next.t('长条单打印')}
            </Radio>
          </RadioGroup>
        )}
        {showKidPrint && (
          <div className='gm-margin-bottom-20'>
            <Radio
              className='gm-margin-top-10 gm-margin-bottom-5'
              checked={!isPrintSid}
              onChange={() => setOptions('isPrintSid', false)}
            >
              {i18next.t('账户合并配送单据')}
              <p style={{ paddingLeft: '19px' }} className='gm-text-desc'>
                {i18next.t('将选中的配送任务按账户级汇总进行合并打印')}
              </p>
              {!isPrintSid && (
                <RadioGroup
                  name='kidPrintId'
                  value={kidPrintId}
                  onChange={this.handleChangeKidPrintId.bind(this)}
                  className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
                >
                  {printKidTemplateList.map((item) => (
                    <Radio value={item.id} key={item.id}>
                      <span>{item.name}</span>
                      {canEdit && (
                        <a
                          href={`${kidPrintUrl}?template_id=${item.id}`}
                          className='gm-text-12'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {i18next.t('设置模板>')}
                        </a>
                      )}
                    </Radio>
                  ))}
                  <Radio value={2} key={2}>
                    <span>{i18next.t('商户明细纵列模板')}</span>
                    <div className='gm-text-desc gm-margin-left-20'>
                      <span>{i18next.t('商户数据按单列展示')}</span>
                      <div className='gm-text-red'>
                        {i18next.t(
                          '(选择打印该模板，将不会同时打印商户配送单据。如有需要请分两次打印)',
                        )}
                      </div>
                    </div>
                  </Radio>
                </RadioGroup>
              )}
            </Radio>
          </div>
        )}
        {!isOldVersion && !printerOptionsStore.isThermalPrinter(templateId) && (
          <>
            <div>{i18next.t('选择配送单打印类型')}:</div>
            <RadioGroup
              name='splitOrderType'
              value={splitOrderType}
              onChange={this.handleChangeSplitOrderType.bind(this)}
              className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
            >
              <Radio value={0} key={0}>
                <span>{i18next.t('整单打印')}</span>
                <div className='gm-text-desc' style={{ paddingLeft: '19px' }}>
                  {i18next.t('不拆分打印配送单，传统打印方式（默认）')}
                </div>
                {!isPrintSid && showKidPrint && (
                  <div style={{ paddingLeft: '19px' }}>
                    <CommonSwitchControl {...commonSwitchForZDPrint} />
                  </div>
                )}
                {isPrintSid && (
                  <Checkbox
                    className=' b-distribute-order-popup-temp-radio gm-padding-left-20'
                    checked={categorySort}
                    onChange={(e) => setCategorySort(e.currentTarget.checked)}
                  >
                    {i18next.t('按商品分类管理顺序打印')}
                  </Checkbox>
                )}
              </Radio>
              <Radio value={1} key={1}>
                <span>{i18next.t('固定一个分类一张单')}</span>
                <div className='gm-text-desc' style={{ paddingLeft: '19px' }}>
                  {i18next.t('按分类拆分打印，一个分类一张配送单')}
                </div>
                <CategoryGroup />
              </Radio>
              <Radio value={2} key={2}>
                <span>
                  {i18next.t('自定义多个分类一张单')}
                  <a
                    href='javascrpit:;'
                    onClick={this.handleToggleCategoryHelperShow}
                  >
                    {t('设置')}
                    <span>{categoryHelperShow ? <SvgUp /> : <SvgDown />}</span>
                  </a>
                </span>
                <div className='gm-text-desc' style={{ paddingLeft: '19px' }}>
                  {i18next.t('可选择多个一级/二级分类组成分组，一个分组一张单')}
                </div>
              </Radio>
              {categoryHelperShow && (
                <Category1GroupHelper addressId={addressId} />
              )}
            </RadioGroup>
          </>
        )}
      </div>
    )
  }
}

CommonPrinterOptions.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  handleRadioChange: PropTypes.func,
  showKidPrint: PropTypes.bool,
  addressId: PropTypes.string,
  showCommonSwitchControl: PropTypes.bool, // 查看编辑单据不需要合并打印sid
}

export default CommonPrinterOptions
