import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Validator,
  FormButton,
  MoreSelect,
  Tip,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { history, withRouter } from 'common/service'
import store from './store'

@withRouter
@observer
class Component extends React.Component {
  constructor() {
    super()
    this.state = {
      list: [],
      selected: null,
    }
  }

  componentWillMount() {
    store
      .getSaleMenuList({ type: 4, is_active: 1 })
      .then(() => {
        this.setState({
          list: store.salemenuList.slice(),
        })
      })
      .catch(() => {
        Tip.warning(i18next.t('数据错误!'))
      })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const {
      location: {
        query: { guide_type },
      },
    } = this.props
    const { value, text, type, fee_type } = this.state.selected

    history.push({
      pathname: '/merchandise/manage/sale/batch_categories',
      query: {
        salemenuId: value,
        salemenuName: text,
        salemenuType: type,
        feeType: fee_type || '',
        guide_type,
      },
    })
  }

  handleSearch = (value) => {
    const { salemenuList } = store

    if (this.state.selected && value === this.state.selected.text) {
      this.setState({
        list: salemenuList.slice(),
      })
    } else {
      this.setState({
        list: _.filter(salemenuList.slice(), (v) => {
          return v.text.indexOf(value) > -1
        }),
      })
    }
  }

  handleSelect = (selected) => {
    this.setState({ selected })
  }

  render() {
    const { list, selected } = this.state

    return (
      <FormPanel title={i18next.t('批量新建销售商品')}>
        <Form onSubmit={this.handleSubmit} inline colWidth='auto'>
          <FormItem
            label={i18next.t('请选择报价单')}
            width='400px'
            validate={Validator.create([], '')}
          >
            <MoreSelect
              id='salemenu'
              className='gm-text-12'
              data={list}
              selected={selected}
              onSearch={this.handleSearch}
              onSelect={this.handleSelect}
              placeholder={i18next.t('请选择报价单...')}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('确认')}
            </Button>
          </FormButton>
        </Form>
        <a
          style={{ marginLeft: '87px' }}
          href='#/merchandise/manage/sale/menu?viewType=create'
        >
          没有报价单？点击快速新建
        </a>
      </FormPanel>
    )
  }
}

export default Component
