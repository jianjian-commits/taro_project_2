import React from 'react'
import {
  FormItem,
  RadioGroup,
  Radio,
  InputNumberV2,
  Switch,
  Form,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

const ProcessPlanAlgorithmForm = (props) => {
  const { onChange, data, showProductShowType, ...rest } = props
  const {
    query_order_type,
    query_order_days,
    adjust_ratio,
    stock_up_type,
    stock_up_days,
    is_deduct_stock,
    product_show_type,
  } = data

  const handleChange = (name, value) => {
    onChange(name, value)
  }

  return (
    <Form {...rest} labelWidth='166px' disabledCol>
      <FormItem label={t('日均下单数设置')}>
        <RadioGroup
          name='query_order_type'
          value={query_order_type}
          onChange={(value) => handleChange('query_order_type', value)}
          style={{ marginTop: query_order_type === 1 ? '0px' : '6px' }}
        >
          <Radio value={1}>
            {t('人工填写天数，以此天数计算近期所有商品日均下单数')}
            {query_order_type === 1 && (
              <>
                <div className='gm-gap-20' />
                {t('近')}
                <InputNumberV2
                  min={1}
                  precision={0}
                  max={365}
                  value={query_order_days}
                  onChange={(value) => handleChange('query_order_days', value)}
                  name='query_order_days'
                  style={{ width: '150px', height: '30px' }}
                />
                {t('天')}
              </>
            )}
          </Radio>

          <Radio value={2} className='gm-margin-top-5'>
            {t('以各个商品的保质天数来计算各个商品日均下单数')}
          </Radio>
          <div className='gm-text-desc gm-margin-top-5'>
            {t(
              '根据填写的数值，系统自动拉取近xx日的下单商品数据，如选择人工填写天数则需要填写一个实际天数，如选择“以各个商品的保质天数来计算各个商品日均下单数”则无需填写天数，系统将自动根据商品的保质天数拉取下单商品数据，最长可查近365天的订单数据'
            )}
          </div>
        </RadioGroup>
      </FormItem>
      <FormItem label={t('调整比例')} style={{ width: '280px' }}>
        <div className='input-group'>
          <InputNumberV2
            value={adjust_ratio}
            min={1}
            precision={0}
            onChange={(value) => handleChange('adjust_ratio', value)}
            name='adjust_ratio'
            className='form-control'
          />
          <div className='input-group-addon'>%</div>
        </div>
      </FormItem>
      <FormItem label={t('预计备货天数')}>
        <RadioGroup
          name='stock_up_type'
          value={stock_up_type}
          onChange={(value) => handleChange('stock_up_type', value)}
          style={{ marginTop: stock_up_type === 1 ? '0px' : '6px' }}
        >
          <Radio value={1}>
            {t('人工填写天数，以此天数作为预计备货天数')}
            {stock_up_type === 1 && (
              <>
                <div className='gm-gap-20' />
                <InputNumberV2
                  value={stock_up_days}
                  min={1}
                  precision={0}
                  max={999}
                  onChange={(value) => handleChange('stock_up_days', value)}
                  name='stock_up_days'
                  style={{ width: '150px', height: '30px' }}
                />
                {t('天')}
              </>
            )}
          </Radio>

          <Radio value={2} className='gm-margin-top-5'>
            {t('以各个商品的保质天数来作为备货天数')}
          </Radio>
        </RadioGroup>
        <div className='gm-text-desc gm-margin-top-5'>
          {t(
            '如选择人工填写天数则需要填写一个实际天数，如选择“以各个商品的保质天数来作为备货天数”则无需填写天数，系统将自动根据商品的保质天数作为其备货天数'
          )}
        </div>
      </FormItem>
      <FormItem label={t('是否扣减库存')}>
        <Switch
          type='primary'
          checked={!!is_deduct_stock}
          on={t('扣减')}
          off={t('不扣减')}
          onChange={() => handleChange('is_deduct_stock', !is_deduct_stock)}
        />
        <div className='gm-text-desc gm-margin-top-5'>
          {t('如扣减成品库存后建议计划生产数小于0时，建议计划生产数展示为0')}
        </div>
      </FormItem>
      {showProductShowType && (
        <FormItem label={t('商品展示设置')}>
          <RadioGroup
            name='product_show_type'
            value={product_show_type}
            onChange={(value) => handleChange('product_show_type', value)}
          >
            <Radio value={1}>
              {t('仅展示建议计划生产数大于0的智能推荐商品')}
            </Radio>
            <Radio value={2}>{t('展示全部智能推荐商品')}</Radio>
          </RadioGroup>
          <div className='gm-text-desc gm-margin-top-5'>
            {t(
              '若展示全部智能推荐商品，当扣减成品库存后建议计划生产数小于0，则建议计划生产数展示为0'
            )}
          </div>
        </FormItem>
      )}
    </Form>
  )
}
ProcessPlanAlgorithmForm.defaultProps = {
  showProductShowType: false,
}

ProcessPlanAlgorithmForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  data: PropTypes.shape({
    query_order_type: PropTypes.number, // 日均下单数设置
    query_order_days: PropTypes.number, // 手动填写的最近下单数，query_order_type === 1时使用
    adjust_ratio: PropTypes.number, // 调整比例
    stock_up_type: PropTypes.number, // 备货天数类型，1为按手动填写，2为按保质期
    stock_up_days: PropTypes.number, // 手动填写的备货天数，stock_up_type === 1 时使用
    is_deduct_stock: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]), // 是否扣减库存
    product_show_type: PropTypes.number, // 商品展示设置
  }),
  showProductShowType: PropTypes.bool, // 是否显示商品展示设置
  style: PropTypes.object,
  className: PropTypes.string,
}

export default ProcessPlanAlgorithmForm
