import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import {
  FormBlock,
  BoxForm,
  FormItem,
  DateRangePicker,
  Flex,
  Select,
  FormButton,
  Button,
  MoreSelect,
} from '@gmfe/react'
import {
  getCategory1,
  getCategory2,
} from 'common/components/category_filter_hoc/api'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { TransformCategoty1Group } from 'common/util'
import { Storage } from '@gmfe/react'

const { More } = BoxForm

class Filter extends Component {
  static propTypes = {
    dateSelectBox: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    hasSupplier: PropTypes.bool,
    hasRecver: PropTypes.bool,
    onSearch: PropTypes.func,
    onExport: PropTypes.func,
    labelWidth: PropTypes.string,
    placeholder: PropTypes.string,
    renderDate: PropTypes.element,
    categoryMultiple: PropTypes.bool,
  }

  static defaultProps = {
    labelWidth: '80px',
    placeholder: t('请输入商品名或商品ID'),
    categoryMultiple: true,
  }

  state = {
    begin: new Date(),
    end: new Date(),
    time_type: 1,
    find_type: Storage.get('FIND_TYPE') || 1,
    text: '',
    category_1: this.props.categoryMultiple ? [] : null,
    category_2: this.props.categoryMultiple ? [] : null,
    settle_supplier: null,
    settle_recver: null, // 领料人
    category1List: [],
    category2List: [],
    supplierList: [],
    recverList: [],
  }

  componentDidMount() {
    this._init().then()
  }

  async _init() {
    const category1List = (await getCategory1()).data.map((item) => ({
      value: item.id,
      text: item.name,
      station_id: item.station_id,
    }))
    const category2List = (await getCategory2()).data.map((item) => ({
      value: item.id,
      text: item.name,
      parent: item.upstream_id,
    }))
    const [{ settle_suppliers }] = (
      await Request('/stock/settle_supplier/get').get()
    ).data
    const supplierList = settle_suppliers.map((item) => ({
      value: item.settle_supplier_id,
      text: item.name || item.username,
    }))
    const {
      data: { users },
    } = await Request('/gm_account/station/clean_food/user/search').get()
    const recverList = users.map((item) => ({
      value: item.id,
      text: item.name,
    }))

    this.setState({
      category1List,
      category2List,
      supplierList,
      recverList,
      find_type: Storage.get('FIND_TYPE') || 1,
    })
  }

  /**
   * @param value {Object}
   */
  handleChangeState = (value) => {
    this.setState(value)
  }

  handleChangeFindTypeState = (value) => {
    this.setState(value)
    Storage.set('FIND_TYPE', value.find_type)
  }

  renderDatePicker = () => {
    const { dateSelectBox, renderDate } = this.props
    if (renderDate) {
      return renderDate
    }

    const { time_type, begin, end } = this.state
    if (typeof dateSelectBox === 'string') {
      return (
        <FormItem label={dateSelectBox}>
          <DateRangePicker
            begin={begin}
            end={end}
            onChange={(begin, end) => this.handleChangeState({ begin, end })}
          />
        </FormItem>
      )
    }
    const timeType = Object.entries(dateSelectBox).map(([key, value]) => ({
      value: parseInt(key),
      text: value,
    }))

    return (
      <FormItem>
        <Flex>
          <Select
            clean
            value={time_type}
            data={timeType}
            onChange={(value) => this.handleChangeState({ time_type: value })}
          />
          <Flex flex={1} column>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={(begin, end) => this.handleChangeState({ begin, end })}
            />
          </Flex>
        </Flex>
      </FormItem>
    )
  }

  handleSearch = () => {
    const { onSearch } = this.props
    onSearch && onSearch(this._initFilter())
  }

  handleExport = (event) => {
    event.preventDefault()
    const { onExport } = this.props
    onExport && onExport(this._initFilter())
  }

  _initFilter = () => {
    const {
      begin,
      end,
      time_type,
      text,
      category_1,
      category_2,
      settle_supplier,
      settle_recver,
      find_type,
    } = this.state
    const {
      dateSelectBox,
      hasSupplier,
      renderDate,
      categoryMultiple,
      hasRecver,
    } = this.props

    const result = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    }

    if (text) {
      result.text = text
    }

    if (find_type) {
      result.find_type = find_type
    }

    if (categoryMultiple) {
      if (category_1.length) {
        result.category_id_1 = JSON.stringify(
          category_1.map((item) => item.value),
        )
      }

      if (category_2.length) {
        result.category_id_2 = JSON.stringify(
          category_2.map((item) => item.value),
        )
      }
    } else {
      if (category_1) {
        result.category_id_1 = category_1.value
      }

      if (category_2) {
        result.category_id_2 = category_2.value
      }
    }

    if (typeof dateSelectBox !== 'string') {
      result.time_type = time_type
    }

    if (hasSupplier && settle_supplier) {
      result.settle_supplier_id = settle_supplier.value
    }

    if (hasRecver && settle_recver) {
      result.recver_id = settle_recver.value
    }
    if (renderDate) {
      delete result.time_type
      delete result.begin
      delete result.end
    }

    return result
  }

  render() {
    const { hasRecver, hasSupplier, labelWidth, categoryMultiple } = this.props
    const {
      text,
      category1List,
      category2List,
      supplierList,
      recverList,
      category_1,
      category_2,
      settle_supplier,
      settle_recver,
      find_type,
    } = this.state
    const actualCategory2List = category2List.filter((item) =>
      categoryMultiple
        ? category_1.map((item) => item.value).includes(item.parent)
        : item.parent === category_1,
    )

    const findType = [
      { value: 1, text: t('按商品名') },
      { value: 2, text: t('按商品ID') },
    ]

    return (
      <BoxForm
        labelWidth={labelWidth}
        colWidth='360px'
        btnPosition='left'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          {this.renderDatePicker()}
          <FormItem>
            <Flex>
              <Select
                clean
                value={find_type}
                data={findType}
                onChange={(value) =>
                  this.handleChangeFindTypeState({ find_type: value })
                }
              />
              <Flex flex={1} column>
                <input
                  className='gm-inline-block form-control'
                  placeholder={
                    find_type === 1 ? '请输入商品名' : '请输入商品ID'
                  }
                  value={text}
                  onChange={(event) =>
                    this.handleChangeState({ text: event.target.value })
                  }
                />
              </Flex>
            </Flex>
          </FormItem>
          {/* <FormItem label={t('搜索')}>
            <input
              placeholder={placeholder}
              value={text}
              onChange={(event) =>
                this.handleChangeState({ text: event.target.value })
              }
            />
          </FormItem> */}
        </FormBlock>
        <More>
          <FormBlock col={3}>
            <FormItem label={t('商品筛选')}>
              <Flex justifyBetween>
                <MoreSelect
                  selected={category_1}
                  data={TransformCategoty1Group(category1List)}
                  onSelect={(value) =>
                    this.setState({
                      category_1: value,
                      category_2: categoryMultiple ? [] : null,
                    })
                  }
                  isGroupList
                  placeholder={t('全部一级分类')}
                  style={{ width: '48%' }}
                  multiple={categoryMultiple}
                />
                <MoreSelect
                  selected={category_2}
                  data={actualCategory2List}
                  onSelect={(value) => this.setState({ category_2: value })}
                  placeholder={t('全部二级分类')}
                  style={{ width: '48%' }}
                  multiple={categoryMultiple}
                />
              </Flex>
            </FormItem>
            {hasSupplier && (
              <FormItem label={t('供应商')}>
                <MoreSelect
                  selected={settle_supplier}
                  data={supplierList}
                  onSelect={(value) =>
                    this.setState({ settle_supplier: value })
                  }
                  placeholder={t('请选择供应商')}
                />
              </FormItem>
            )}
            {hasRecver && (
              <FormItem label={t('领料人')}>
                <MoreSelect
                  selected={settle_recver}
                  data={recverList}
                  onSelect={(value) => this.setState({ settle_recver: value })}
                  placeholder={t('请选择领料人')}
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

export default Filter
