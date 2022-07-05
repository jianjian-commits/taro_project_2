import React from 'react'
import { i18next } from 'gm-i18n'
import { connect } from 'react-redux'
import { Flex, DateRangePicker, Form, FormItem, Select } from '@gmfe/react'
import PropTypes from 'prop-types'
import CategoryPinleiFilter from '../../common/components/category_filter_hoc'
import actions from '../../actions'

class BatchDialog extends React.Component {
  componentDidMount() {
    // 每次打开dialog初始化库存量筛选的值为全部
    const { batchFilter } = this.props
    actions.product_inventory_batch_filter_change({
      ...batchFilter,
      remaningType: 1,
    })
  }

  handleSelectChange = (name, selected) => {
    const { batchFilter } = this.props
    actions.product_inventory_batch_filter_change({
      ...batchFilter,
      [name]: selected,
    })
  }

  handleChange = (begin, end) => {
    const { batchFilter } = this.props
    actions.product_inventory_batch_filter_change({
      ...batchFilter,
      begin: begin,
      end: end,
    })
  }

  handleCategoryFilterChange = (selected) => {
    const { batchFilter } = this.props
    actions.product_inventory_batch_filter_change({
      ...batchFilter,
      categoryFilter: selected,
    })
  }

  render() {
    const {
      batchFilter: { begin, end, categoryFilter, exportType, remaningType },
    } = this.props

    const exportDateType = [
      { value: 1, text: '按建单时间' },
      { value: 2, text: '按入库时间' },
    ]

    const exportRemaningType = [
      { value: 1, text: '全部' },
      { value: 3, text: '库存大于0' },
      { value: 4, text: '库存等于0' },
      { value: 2, text: '库存小于0' },
    ]

    return (
      <>
        <p className='gm-margin-bottom-10'>
          {i18next.t('请选择需要导出的日期和商品分类')}
        </p>
        <Form labelWidth='92px'>
          <FormItem>
            <Flex>
              <Select
                clean
                data={exportDateType}
                onChange={this.handleSelectChange.bind(this, 'exportType')}
                value={exportType}
              />
              <Flex none flex column>
                <DateRangePicker
                  begin={begin}
                  end={end}
                  onChange={this.handleChange}
                />
              </Flex>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('选择分类')}>
            <CategoryPinleiFilter
              selected={categoryFilter}
              onChange={this.handleCategoryFilterChange}
            />
          </FormItem>
          <FormItem label={i18next.t('库存量筛选')}>
            <Select
              data={exportRemaningType}
              onChange={this.handleSelectChange.bind(this, 'remaningType')}
              value={remaningType}
            />
          </FormItem>
        </Form>
      </>
    )
  }
}

BatchDialog.propTypes = {
  batchFilter: PropTypes.object,
}

export default connect((state) => ({
  batchFilter: state.inventory.batchFilter,
}))(BatchDialog)
