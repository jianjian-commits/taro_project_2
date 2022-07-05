import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  BoxForm,
  FormBlock,
  FormButton,
  FormItem,
  Select,
  Input,
  MoreSelect,
  Button,
  Flex,
  DateRangePicker,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import {
  getCategory1,
  getCategory2,
} from '../../common/components/category_filter_hoc/api'
import { Request } from '@gm-common/request'
import { TransformCategoty1Group } from 'common/util'
import moment from 'moment'

const { More } = BoxForm

class InventoryCommonFilter extends Component {
  state = {
    timeType: 1,
    begin: new Date(),
    end: new Date(),
    text: '',
    level1: [],
    level2: [],
    supplier: null,
    list: {
      category1: [],
      category2: [],
      settle_suppliers: [],
    },
  }

  async componentDidMount() {
    const category1 = (await getCategory1()).data.map((item) => ({
      value: item.id,
      text: item.name,
      station_id: item.station_id,
    }))
    const category2 = (await getCategory2()).data.map((item) => ({
      value: item.id,
      text: item.name,
      parent: item.upstream_id,
    }))
    let [{ settle_suppliers }] = (
      await Request('/stock/settle_supplier/get').get()
    ).data
    settle_suppliers = settle_suppliers.map((item) => ({
      value: item.settle_supplier_id,
      text: item.name,
    }))
    this.setState({ list: { category1, category2, settle_suppliers } })
  }

  handleChangeTimeType = (type) => {
    this.setState({ timeType: type })
  }

  handleChangeDate = (begin, end) => {
    this.setState({ begin, end })
  }

  handleChangeText = ({ target: { value } }) => {
    this.setState({ text: value })
  }

  handleChangeLevel = (value, key) => {
    const option = {
      [key]: value,
    }
    if (key === 'level1') {
      option.level2 = []
    }
    this.setState(option)
  }

  handleChangeSupplier = (supplier) => {
    this.setState({ supplier })
  }

  handleSearch = () => {
    const { list, begin, end, supplier, ...rest } = this.state
    const { onSearch } = this.props
    onSearch &&
      onSearch({
        begin: moment(begin).format('YYYY-MM-DD'),
        end: moment(end).format('YYYY-MM-DD'),
        supplier: supplier?.value,
        ...rest,
      })
  }

  handleExport = (event) => {
    event.preventDefault()
    const { list, begin, end, supplier, ...rest } = this.state
    const { onExport } = this.props
    onExport &&
      onExport({
        begin: moment(begin).format('YYYY-MM-DD'),
        end: moment(end).format('YYYY-MM-DD'),
        supplier: supplier?.value,
        ...rest,
      })
  }

  render() {
    const { tag, hasSupplier } = this.props
    const {
      timeType,
      begin,
      end,
      text,
      level1,
      level2,
      supplier,
      list,
    } = this.state
    const { category1, category2, settle_suppliers } = list
    const actualCategory2 = category2.filter((item) =>
      level1.map((i) => i.value).includes(item.parent)
    )
    return (
      <BoxForm
        labelWidth='80px'
        colWidth='360px'
        btnPosition='left'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          <FormItem>
            <Flex>
              <Select
                onChange={this.handleChangeTimeType}
                data={tag}
                value={timeType}
                clean
              />
              <Flex flex={1} column>
                <DateRangePicker
                  begin={begin}
                  end={end}
                  onChange={this.handleChangeDate}
                />
              </Flex>
            </Flex>
          </FormItem>
          <FormItem label={t('搜索')}>
            <Input
              className='form-control'
              placeholder={t('请输入商品名或ID')}
              value={text}
              onChange={this.handleChangeText}
            />
          </FormItem>
        </FormBlock>
        <More>
          <FormBlock col={3}>
            <FormItem label={t('商品筛选')}>
              <Flex justifyBetween>
                <MoreSelect
                  data={TransformCategoty1Group(category1)}
                  selected={level1}
                  multiple
                  isGroupList
                  placeholder={t('全部一级分类')}
                  onSelect={(value) => this.handleChangeLevel(value, 'level1')}
                  style={{ width: '48%' }}
                />
                <MoreSelect
                  data={actualCategory2}
                  selected={level2}
                  multiple
                  placeholder={t('全部二级分类')}
                  onSelect={(value) => this.handleChangeLevel(value, 'level2')}
                  style={{ width: '48%' }}
                />
              </Flex>
            </FormItem>
            {hasSupplier && (
              <FormItem label={t('供应商')}>
                <MoreSelect
                  selected={supplier}
                  data={settle_suppliers}
                  onSelect={this.handleChangeSupplier}
                  placeholder={t('请选择供应商')}
                />
              </FormItem>
            )}
          </FormBlock>
        </More>
        <FormButton>
          <Button
            type='primary'
            htmlType='submit'
            className='gm-margin-right-10'
          >
            {t('搜索')}
          </Button>
          <Button onClick={this.handleExport}>{t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

InventoryCommonFilter.propTypes = {
  tag: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.number,
    })
  ).isRequired,
  hasSupplier: PropTypes.bool,
  onSearch: PropTypes.func,
  onExport: PropTypes.func,
}

export default InventoryCommonFilter
