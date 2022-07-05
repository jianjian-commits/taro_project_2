import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Box, Form, FormBlock, FormItem, Select, Button } from '@gmfe/react'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { COMBINATION_GOODS_SALES_STATUS } from 'common/enum'
import store from '../store'
import { saleState, showMultipleSaleMenus, combineLevel } from '../../util'

@observer
class SearchFilter extends React.Component {
  handleSearch = () => {
    const { pagination } = this.props
    pagination.current.apiDoFirstRequest()
  }

  handleFilterSelectChange = (val) => {
    store.changeFilter('state', val)
  }

  handleFilterInputChange = (e) => {
    e.preventDefault()
    store.changeFilter('search_text', e.target.value)
  }

  handleExport = () => {
    store.export().then((json) => {
      const exportData = _.map(json.data, (item) => ({
        [i18next.t('组合商品id')]: item.id,
        [i18next.t('组合商品名')]: item.name,
        [i18next.t('类型')]: combineLevel[item.combine_level],
        [i18next.t('销售状态')]: saleState(item.state),
        [i18next.t('销售单位')]: item.sale_unit_name,
        [i18next.t('可见报价单')]: showMultipleSaleMenus(item.salemenus),
        [i18next.t('商品描述')]: item.desc,
      }))

      requireGmXlsx((res) => {
        const { jsonToSheet } = res
        jsonToSheet([exportData], { fileName: i18next.t('组合商品.xlsx') })
      })
    })
  }

  render() {
    const { state, search_text } = store.filter
    return (
      <Box hasGap>
        <Form onSubmit={this.handleSearch} inline labelWidth='62px'>
          <FormBlock col={3}>
            <FormItem label={i18next.t('销售状态')}>
              <Select
                data={COMBINATION_GOODS_SALES_STATUS}
                value={state}
                onChange={this.handleFilterSelectChange}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                placeholder={i18next.t('输入组合商品名搜索')}
                value={search_text}
                onChange={this.handleFilterInputChange}
              />
            </FormItem>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <Button className='gm-margin-left-10' onClick={this.handleExport}>
              {i18next.t('导出')}
            </Button>
          </FormBlock>
        </Form>
      </Box>
    )
  }
}

SearchFilter.propTypes = {
  pagination: PropTypes.object,
}

export default SearchFilter
