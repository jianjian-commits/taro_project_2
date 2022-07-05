import { i18next, t } from 'gm-i18n'
import React from 'react'
import { RadioGroup, Radio, ToolTip, Checkbox } from '@gmfe/react'
import { observer } from 'mobx-react'
import printTemplateStore, {
  __THERMAL_PRINTER,
  isThermalPrinter,
} from './store'
import { isVersionSwitcherShow } from '../../print_log'
import { SvgDown, SvgUp } from 'gm-svg'
import Category1GroupHelper from 'common/components/category_1_group_helper'
import PropTypes from 'prop-types'

@observer
class PrintTemplateRadioGroup extends React.Component {
  state = {
    categoryHelperShow: false,
  }

  handleToggleCategoryHelperShow = () => {
    this.setState({ categoryHelperShow: !this.state.categoryHelperShow })
  }

  async componentDidMount() {
    try {
      await printTemplateStore.getTemplateVersion()
    } finally {
      printTemplateStore.getPrintTemplate()
    }
  }

  handleChangePrintTemp(id) {
    printTemplateStore.setTemplateID(id)
    const handleRadioChange = this.props.handleRadioChange
    handleRadioChange && handleRadioChange()
  }

  handleChangeSplitOrderType(val) {
    printTemplateStore.setSplitOrderType(val)
  }

  handleChangeKidMergeType(val) {
    printTemplateStore.setKidMergeType(val)
  }

  render() {
    const {
      printTemplateList,
      templateId,
      isOldVersion,
      splitOrderType,
      isPrintKid,
      isPrintSid,
      handleChangePrint,
      kidMergeType,
    } = printTemplateStore
    // 配置模板权限
    const { canEdit, isRequirePrint, showKidPrint, addressId } = this.props

    const { categoryHelperShow } = this.state

    // 兼容一下旧版,过渡之后改掉
    const temDetailURL = isOldVersion
      ? '#/system/setting/distribute_templete/detail'
      : '#/system/setting/order_printer/template_editor'
    const temListURL = isOldVersion
      ? '#/system/setting/distribute_templete'
      : '#/system/setting/distribute_templete/order_printer'

    return (
      <div>
        <>
          <Checkbox
            className='gm-margin-bottom-5'
            checked={isPrintSid || isRequirePrint}
            onChange={(v) => handleChangePrint(v, 'isPrintSid')}
          >
            {i18next.t('商户配送单据')}
          </Checkbox>
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
            <Radio value={__THERMAL_PRINTER} key={__THERMAL_PRINTER}>
              {i18next.t('长条单打印')}
            </Radio>
          </RadioGroup>
        </>
        {showKidPrint && (
          <div className='gm-margin-bottom-20'>
            <Checkbox
              className='gm-margin-top-10 gm-margin-bottom-5'
              checked={isPrintKid}
              onChange={(v) => handleChangePrint(v, 'isPrintKid')}
            >
              {i18next.t('账户合并配送单据')}
              <p style={{ paddingLeft: '19px' }} className='gm-text-desc'>
                {i18next.t('将选中的配送任务按账户级汇总进行合并打印')}
              </p>
              <RadioGroup
                name='kidMergeType'
                value={kidMergeType}
                onChange={this.handleChangeKidMergeType.bind(this)}
                className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
              >
                <Radio value={0} key={0}>
                  <span>{i18next.t('商户汇总模板')}</span>
                  <div className='gm-text-desc gm-margin-left-20'>
                    {i18next.t('同一账户下单一商品按所有商户汇总')}
                  </div>
                </Radio>
                <Radio value={1} key={1}>
                  <span>{i18next.t('商户明细模板一')}</span>
                  <div className='gm-text-desc gm-margin-left-20'>
                    {i18next.t('展示账户汇总数据，同时展示商户明细数据')}
                  </div>
                </Radio>
                <Radio value={2} key={2}>
                  <span>{i18next.t('商户明细模板二')}</span>
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
            </Checkbox>
          </div>
        )}
        {!isOldVersion && !isThermalPrinter(templateId) && (
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
              </Radio>
              <Radio value={1} key={1}>
                <span>{i18next.t('固定一个分类一张单')}</span>
                <div className='gm-text-desc' style={{ paddingLeft: '19px' }}>
                  {i18next.t('按一级分类拆分打印，一个分类一张配送单')}
                </div>
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
                  {i18next.t('自定义一级分类组，一个组一张配送单')}
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

PrintTemplateRadioGroup.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  handleRadioChange: PropTypes.func,
  showKidPrint: PropTypes.bool,
  isRequirePrint: PropTypes.bool,
  addressId: PropTypes.string,
}

@observer
class ToggleTemplateVersion extends React.Component {
  state = {
    isVersionSwitcherShow: true,
  }

  async componentDidMount() {
    const isOk = await isVersionSwitcherShow()
    this.setState({ isVersionSwitcherShow: isOk })
  }

  handleChangeTemplateVersion(e) {
    e.preventDefault()
    printTemplateStore.toggleTemplateVersion()
  }

  render() {
    const { isOldVersion } = printTemplateStore

    if (!this.state.isVersionSwitcherShow) {
      return null
    }

    return (
      <a
        className='gm-padding-right-15 text-right gm-padding-top-5'
        onClick={this.handleChangeTemplateVersion}
      >
        {isOldVersion ? i18next.t('切至新模板') : i18next.t('切回旧模板')}
      </a>
    )
  }
}

export { ToggleTemplateVersion, PrintTemplateRadioGroup }
