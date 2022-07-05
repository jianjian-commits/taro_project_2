import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Price, InputNumberV2 } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

class FreightRule extends React.Component {
  renderSectionFreightWithOne = () => {
    const {
      templateData,
      onAddSection,
      onFreightAmountChange,
      type,
      disabled,
      unitType,
      textType,
      viewNumber,
    } = this.props
    const { section } = templateData
    return (
      <>
        <div className='form-inline form-group'>
          <span
            className='gm-inline-block'
            style={{
              height: '30px',
              lineHeight: '30px',
            }}
          >
            {i18next.t('根据更细的价格区间设置运费。')}
          </span>
          <i
            className='xfont xfont-plus gm-cursor'
            onClick={disabled ? null : () => onAddSection(section[0].min, type)}
          />
        </div>
        <div className='form-inline form-group'>
          <span>
            <i className='ifont ifont-double-right' />
            &nbsp;{textType}&nbsp;
          </span>
          <input
            type='text'
            className='form-control'
            value={section[0].min}
            readOnly
            style={{ width: '80px' }}
            disabled={disabled}
          />
          <span>&nbsp;{unitType + i18next.t('及以上,收')}&nbsp;</span>
          <InputNumberV2
            className='form-control'
            value={section[0].freight}
            style={{ width: '80px' }}
            min={0}
            max={999999999}
            onChange={(value) => onFreightAmountChange(0, value, type)}
            disabled={disabled}
          />
          <span>
            &nbsp;
            {`${Price.getUnit()}${i18next.t('运费')}。`}
            {viewNumber === 2
              ? `(${i18next.t('满额免运费则运费写0')}${Price.getUnit()})`
              : null}
            &nbsp;
          </span>
        </div>
      </>
    )
  }

  renderSectionFreightMiddle = (index, price, data, config_btn) => {
    const {
      onMaxPriceChange,
      onFreightAmountChange,
      type,
      disabled,
      unitType,
      textType,
    } = this.props
    return (
      <div key={index} className='form-inline form-group'>
        <span>
          <i className='ifont ifont-double-right' />
          &nbsp;{textType}&nbsp;
        </span>
        <input
          type='text'
          className='form-control'
          value={price}
          readOnly
          style={{ width: '80px' }}
          disabled={disabled}
        />
        <span>&nbsp;{unitType + i18next.t('(包含)——')}&nbsp;</span>
        <InputNumberV2
          min={1}
          max={999999999}
          className='form-control'
          value={data.max}
          style={{ width: '80px' }}
          onChange={(value) => onMaxPriceChange(index, value, type)}
          disabled={disabled}
        />
        <span>&nbsp;{unitType + i18next.t('（不包含）,收')}&nbsp;</span>
        <InputNumberV2
          min={0}
          max={999999999}
          className='form-control'
          value={data.freight}
          style={{ width: '80px' }}
          onChange={(value) => onFreightAmountChange(index, value, type)}
          disabled={disabled}
        />
        <span>&nbsp;{Price.getUnit() + i18next.t('运费')}。&nbsp;</span>
        {config_btn}
      </div>
    )
  }

  renderSectionFreightFinal = (index, data) => {
    const {
      onFreightAmountChange,
      type,
      disabled,
      unitType,
      textType,
      viewNumber,
    } = this.props
    return (
      <div key={index} className='gm-block form-inline form-group'>
        <span>
          <i className='ifont ifont-double-right' />
          &nbsp;{textType}&nbsp;
        </span>
        <input
          type='text'
          className='form-control'
          value={data.min}
          readOnly
          style={{ width: '80px' }}
          disabled={disabled}
        />
        <span>&nbsp;{unitType + i18next.t('及以上,收')}&nbsp;</span>
        <InputNumberV2
          min={0}
          max={999999999}
          className='form-control'
          value={data.freight}
          style={{ width: '80px' }}
          onChange={(value) => onFreightAmountChange(index, value, type)}
          disabled={disabled}
        />
        <span>
          &nbsp;
          {`${Price.getUnit()}${i18next.t('运费')}。`}
          {viewNumber === 2
            ? `(${i18next.t('满额免运费则运费写0')}${Price.getUnit()})`
            : null}
          &nbsp;
        </span>
      </div>
    )
  }

  // 更细价格区间调整运费
  renderSectionFreight = () => {
    const {
      templateData,
      onAddSection,
      onDeleteSection,
      type,
      disabled,
    } = this.props
    const { section } = templateData

    if (section.length === 1) {
      return this.renderSectionFreightWithOne()
    } else {
      return section.map((data, index, array) => {
        if (data.max !== 0) {
          // 中间区间设置
          const price = index === 0 ? section[0].min : data.min
          const config_btn = []
          if (index === array.length - 2) {
            let noData = false
            if (data.min === '' || data.max === '' || data.freight === '') {
              noData = true
            }
            config_btn.push(
              <i
                key='1'
                style={{ cursor: !noData ? 'pointer' : 'not-allowed' }}
                className={classNames('xfont xfont-plus gm-margin-right-10', {
                  'gm-text-desc': noData,
                })}
                onClick={
                  noData || disabled ? null : () => onAddSection(data.max, type)
                }
              />,
              <i
                key='2'
                className='xfont xfont-delete gm-cursor'
                onClick={() => onDeleteSection(index, type)}
              />,
            )
          }

          return this.renderSectionFreightMiddle(index, price, data, config_btn)
        } else {
          // 达到运费最大上限
          return this.renderSectionFreightFinal(index, data)
        }
      })
    }
  }

  renderCommonFreightSet = () => {
    const { templateData } = this.props
    const { isFreight } = templateData
    return (
      <div className='col-xs-12 gm-margin-top-15'>
        {isFreight === 0 && (
          <div className='form-inline form-group'>
            <span>
              <i className='ifont ifont-double-right' />
              &nbsp;{i18next.t('任意下单金额都不收运费。')}&nbsp;
            </span>
          </div>
        )}
        {isFreight === 1 && <div>{this.renderSectionFreight()}</div>}
      </div>
    )
  }

  render() {
    return (
      <Flex column className='gm-margin-left-10'>
        {this.renderSectionFreight()}
      </Flex>
    )
  }
}

FreightRule.propTypes = {
  templateData: PropTypes.object,
  onAddSection: PropTypes.func,
  onFreightAmountChange: PropTypes.func,
  onStartPriceChange: PropTypes.func,
  onDeleteSection: PropTypes.func,
  onMaxPriceChange: PropTypes.func,
  onFreightTypeChange: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  textType: PropTypes.string,
  unitType: PropTypes.string,
  viewNumber: PropTypes.number,
}

FreightRule.defaultProps = {
  textType: i18next.t('下单金额'),
  unitType: Price.getUnit(),
}

export default FreightRule
