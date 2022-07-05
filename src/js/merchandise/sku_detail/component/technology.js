import { i18next } from 'gm-i18n'
import React from 'react'
import { Form, FormItem, FormButton, FilterSelect, Button } from '@gmfe/react'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'
import { Request } from '@gm-common/request'

class Technology extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: props.detail || { desc: '', technic_id: '', custom_cols: [] },
      list: [],
      selected: null,
    }

    this.handleWithFilter = ::this.handleWithFilter
    this.handleSelect = ::this.handleSelect
    this.handleCancel = ::this.handleCancel
    this.handleSubmit = ::this.handleSubmit
  }

  componentDidMount() {
    const { detail } = this.state
    Request('/process/technic/list')
      .data({ limit: 0 })
      .get()
      .then((json) => {
        const selected = _.find(json.data.technic_data, (d) => {
          return detail.technic_id === d.id
        })

        this.setState({
          list: json.data.technic_data,
          selected,
        })
      })
  }

  handleWithFilter(list, query) {
    return pinYinFilter(list, query, (value) => value.name)
  }

  handleSelect(selected) {
    const detail = Object.assign({}, this.state.detail)
    detail.custom_cols = _.map(selected.custom_cols, (col) => {
      return { name: col, desc: '' }
    })
    detail.technic_id = selected.id
    detail.desc = selected.desc
    this.setState({ selected, detail })
  }

  handleChangeValue(index, e) {
    const detail = Object.assign({}, this.state.detail)
    detail.custom_cols[index].desc = e.target.value
    this.setState({ detail })
  }

  handleSubmit() {
    this.props.onSave && this.props.onSave(this.state.detail)
  }

  handleCancel() {
    this.props.onCancel && this.props.onCancel()
  }

  render() {
    const { list, detail, selected } = this.state
    const { id, desc, custom_cols } = detail

    let panel = [
      <FormItem label={i18next.t('工艺名称')}>
        <FilterSelect
          id='technology'
          list={list}
          selected={selected}
          withFilter={this.handleWithFilter}
          onSelect={this.handleSelect}
          placeholder={i18next.t('搜索')}
          disabled={id}
        />
      </FormItem>,
      <FormItem label={i18next.t('工艺描述')} unLabelTop>
        <div>{desc}</div>
      </FormItem>,
    ]
    panel = panel.concat(
      _.map(custom_cols, (col, index) => {
        return (
          <FormItem key={index} label={`${col.name}`}>
            <input
              type='text'
              name={col.name}
              value={col.desc}
              onChange={this.handleChangeValue.bind(this, index)}
            />
          </FormItem>
        )
      })
    )
    panel.push(
      <FormButton>
        <Button className='gm-margin-right-5' onClick={this.handleCancel}>
          {i18next.t('取消')}
        </Button>
        <Button type='primary' htmlType='submit'>
          {i18next.t('保存')}
        </Button>
      </FormButton>
    )

    return (
      <Form onSubmit={this.handleSubmit} labelWidth='150px' horizontal>
        {panel}
      </Form>
    )
  }
}

export default Technology
