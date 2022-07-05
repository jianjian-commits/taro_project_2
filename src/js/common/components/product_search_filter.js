import { i18next } from 'gm-i18n'
import React from 'react'
import {
  DateRangePicker,
  BoxForm,
  FormItem,
  FormButton,
  Select,
  FormBlock,
  Input,
  Button,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import moment from 'moment'
import CategoryFilterHoc from './category_filter_hoc/single'
import { SAFE_STOCK_TYPE, DELAY_STOCK_TYPE } from '../enum'

const { More } = BoxForm

// 不需要清理，留着即可。 因为列表等其他数据也没有清理
const cacheData = {}

class SearchFilter extends React.Component {
  constructor(props) {
    super(props)
    const now = new Date()

    // defaultFilter优先级最高
    this.state = this.props.defaultFilter ??
      cacheData[props.tab] ?? {
        begin: now,
        end: now,
        remainType: 0,
        level: {},
        search_text: '',
        safe_stock_type: 0, // 安全库存类型
        retention_type: 0, // 呆滞库存类型
      }
  }

  componentWillUnmount() {
    cacheData[this.props.tab] = this.state
  }

  handleSearch = () => {
    const { noTime, hasStockFilter, hasSafeStock, hasDelayStock } = this.props
    const {
      begin,
      end,
      level,
      remainType,
      search_text,
      safe_stock_type,
      retention_type,
    } = this.state
    // level.category 可能为null
    const { category1, category2 } = level
    const { id: level1 } = !category1 ? { id: null } : category1
    const { id: level2 } = !category2 ? { id: null } : category2

    this.props.handleSearch &&
      this.props.handleSearch(
        Object.assign(
          noTime
            ? {}
            : {
                begin: moment(begin).format('YYYY-MM-DD'),
                end: moment(end).format('YYYY-MM-DD'),
              },
          {
            level1,
            level2,
            search_text,
          },
          hasStockFilter ? { remainType } : {},
          hasSafeStock ? { safe_stock_type } : {},
          hasDelayStock ? { retention_type } : {},
        ),
      )
  }

  handleExport = (e) => {
    e.preventDefault()
    const { noTime, hasStockFilter, hasSafeStock, hasDelayStock } = this.props
    const {
      begin,
      end,
      remainType,
      search_text,
      level,
      safe_stock_type,
      retention_type,
    } = this.state
    // level.category 可能为null
    const { category1, category2 } = level
    const { id: level1 } = !category1 ? { id: null } : category1
    const { id: level2 } = !category2 ? { id: null } : category2

    this.props.handleExport &&
      this.props.handleExport(
        Object.assign(
          noTime
            ? {}
            : {
                begin: moment(begin).format('YYYY-MM-DD'),
                end: moment(end).format('YYYY-MM-DD'),
              },
          {
            level1,
            level2,
            search_text,
          },
          hasStockFilter ? { remainType } : {},
          hasSafeStock ? { safe_stock_type } : {},
          hasDelayStock ? { retention_type } : {},
        ),
      )
  }

  handleReset = (event) => {
    event.preventDefault()
    this.setState({
      begin: new Date(),
      end: new Date(),
      remainType: 0,
      level: {},
      search_text: '',
      safe_stock_type: 0,
      retention_type: 0,
    })
  }

  handleDateChange = (begin, end) => {
    this.setState({
      begin,
      end,
    })
  }

  handleChangeLevel = (level) => {
    this.setState({ level })
  }

  handleChangeLevelSecond = (value) => {
    this.setState({
      level2: value,
    })
  }

  handleChangeType = (name, value) => {
    this.setState({
      [name]: value,
    })
  }

  handleChangeSearchText = ({ target: { value } }) => {
    this.setState({ search_text: value })
  }

  render() {
    const {
      begin,
      end,
      remainType,
      level,
      search_text,
      safe_stock_type,
      retention_type,
    } = this.state
    const {
      noTime,
      tab,
      noColl,
      placeholder,
      hasStockFilter,
      big,
      hasSafeStock,
      hasDelayStock,
    } = this.props

    return (
      <BoxForm
        onSubmit={this.handleSearch}
        labelWidth={`${big ? 90 : 70}px`}
        colWidth='360px'
        btnPosition='left'
      >
        <FormBlock col={3}>
          {noTime ? null : (
            <FormItem label={tab + i18next.t('时间')}>
              <DateRangePicker
                begin={begin}
                end={end}
                onChange={this.handleDateChange}
              />
            </FormItem>
          )}
          <FormItem label={i18next.t('搜索')}>
            <Input
              value={search_text}
              onChange={this.handleChangeSearchText}
              className='form-control'
              placeholder={placeholder || i18next.t('输入商品名或ID')}
            />
          </FormItem>
        </FormBlock>
        <More>
          <FormBlock col={3}>
            {noColl ? null : (
              <FormItem label={i18next.t('商品筛选')}>
                <CategoryFilterHoc
                  disablePinLei
                  selected={level}
                  onChange={this.handleChangeLevel}
                />
              </FormItem>
            )}
            {hasStockFilter && (
              <FormItem label={i18next.t('库存')}>
                <Select
                  value={remainType}
                  onChange={this.handleChangeType.bind(this, 'remainType')}
                  data={[
                    { value: 0, text: i18next.t('全部') },
                    { value: 1, text: i18next.t('库存大于0') },
                    { value: 2, text: i18next.t('库存等于0') },
                    { value: 3, text: i18next.t('库存小于0') },
                  ]}
                />
              </FormItem>
            )}
            {hasSafeStock && (
              <FormItem label={i18next.t('安全库存')}>
                <Select
                  value={safe_stock_type}
                  onChange={this.handleChangeType.bind(this, 'safe_stock_type')}
                  data={SAFE_STOCK_TYPE}
                />
              </FormItem>
            )}
            {hasDelayStock && (
              <FormItem label={i18next.t('呆滞库存')}>
                <Select
                  value={retention_type}
                  onChange={this.handleChangeType.bind(this, 'retention_type')}
                  data={DELAY_STOCK_TYPE}
                />
              </FormItem>
            )}
          </FormBlock>
        </More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <More>
            <div className='gm-gap-10' />
            <Button onClick={this.handleReset}>{i18next.t('重置')}</Button>
          </More>
          <div className='gm-gap-10' />
          <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

SearchFilter.defaultProps = {
  list: [],
  noTime: false,
  noColl: false,
  hasStockFilter: false,
  tab: '',
  placeholder: i18next.t('输入商品名或ID'),
}

SearchFilter.propTypes = {
  list: PropTypes.array,
  noTime: PropTypes.bool,
  noColl: PropTypes.bool,
  hasStockFilter: PropTypes.bool,
  hasSafeStock: PropTypes.bool,
  hasDelayStock: PropTypes.bool,
  big: PropTypes.bool,
  placeholder: PropTypes.string,
  tab: PropTypes.string.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleExport: PropTypes.func.isRequired,
  defaultFilter: PropTypes.object,
}

export default SearchFilter
