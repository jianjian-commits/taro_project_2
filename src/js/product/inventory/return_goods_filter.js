import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  BoxForm,
  DateRangePicker,
  FormBlock,
  FormItem,
  FormButton,
  Input,
  Button,
  Flex,
  MoreSelect,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import {
  getCategory1,
  getCategory2,
} from '../../common/components/category_filter_hoc/api'
import moment from 'moment'
import { TransformCategoty1Group } from 'common/util'

const { More } = BoxForm

class ReturnGoodsFilter extends Component {
  static propTypes = {
    tag: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    labelWidth: PropTypes.number,
    onSearch: PropTypes.func,
    onExport: PropTypes.func,
  }

  static defaultProps = {
    placeholder: t('输入商品名或ID'),
    labelWidth: 70,
  }

  state = {
    begin: new Date(),
    end: new Date(),
    search_text: '',
    category1: [],
    category2: [],
    list: {
      level1: [],
      level2: [],
    },
  }

  async componentDidMount() {
    const level1 = (await getCategory1()).data.map((i) => ({
      value: i.id,
      text: i.name,
      station_id: i.station_id,
    }))
    const level2 = (await getCategory2()).data.map((i) => ({
      value: i.id,
      text: i.name,
      parent: i.upstream_id,
    }))
    this.setState({ list: { level1, level2 } })
  }

  handleDateChange = (begin, end) => {
    this.setState({ begin, end })
  }

  handleChangeSearchText = (text) => {
    this.setState({ search_text: text })
  }

  handleChangeSelect = (selected, level) => {
    const option = {
      [level]: selected,
    }
    if (level === 'category1') {
      option.category2 = []
    }
    this.setState(option)
  }

  handleSearch = () => {
    const { onSearch } = this.props
    const { list, begin, end, ...rest } = this.state
    const option = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      ...rest,
    }
    onSearch && onSearch(option)
  }

  handleExport = (e) => {
    e.preventDefault()
    const { onExport } = this.props
    const { list, begin, end, ...rest } = this.state
    const option = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      ...rest,
    }
    onExport && onExport(option)
  }

  render() {
    const { begin, end, list, category1, category2, search_text } = this.state
    const { level1, level2 } = list
    const { tag, placeholder, labelWidth } = this.props
    const realList2 = level2.filter((item) =>
      category1.map((i) => i.value).includes(item.parent),
    )
    return (
      <BoxForm
        onSubmit={this.handleSearch}
        labelWidth={`${labelWidth}px`}
        colWidth='360px'
        btnPosition='left'
      >
        <FormBlock col={3}>
          <FormItem label={tag + t('时间')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={this.handleDateChange}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <Input
              value={search_text}
              onChange={({ target: { value } }) =>
                this.handleChangeSearchText(value)
              }
              className='form-control'
              placeholder={placeholder}
            />
          </FormItem>
        </FormBlock>
        <More>
          <FormBlock col={3}>
            <FormItem label={t('商品筛选')}>
              <Flex row justifyBetween>
                <MoreSelect
                  data={level1}
                  selected={TransformCategoty1Group(category1)}
                  multiple
                  isGroupList
                  onSelect={(selected) =>
                    this.handleChangeSelect(selected, 'category1')
                  }
                  style={{ width: '48%' }}
                  placeholder={t('全部一级分类')}
                />
                <MoreSelect
                  data={realList2}
                  selected={category2}
                  multiple
                  onSelect={(selected) =>
                    this.handleChangeSelect(selected, 'category2')
                  }
                  style={{ width: '48%' }}
                  placeholder={t('全部二级分类')}
                />
              </Flex>
            </FormItem>
          </FormBlock>
        </More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <Button onClick={this.handleExport}>{t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

export default ReturnGoodsFilter
