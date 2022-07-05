import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  FormButton,
  MoreSelect,
  Button,
  Input,
} from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'
import styled from 'styled-components'

const ItemDiv = styled.div`
  max-width: 400px;
`
class Technology extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: props.detail || {
        desc: '',
        technic_id: '',
        custom_col_params: [],
        col_type: '',
      },
      list: [],
      selected: null,
    }

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
        const technicData = this.adapteList(json.data.technic_data)
        // 匹配已选择的工艺
        const selected = _.find(technicData, (d) => {
          return detail.technic_id === d.id
        })

        // 设置选择的工艺
        if (selected && selected.id) {
          return this.handleDefaultSelect(selected)
        }

        this.setState({
          list: technicData,
          selected,
        })
      })
  }

  // 工艺moreselect和自定义字段moreselect
  adapteList = (data) => {
    return _.map(data, (item) => {
      const adapteCcp = _.map(item.custom_col_params, (ccp) => {
        return {
          ...ccp,
          params:
            ccp.col_type === 0
              ? _.map(ccp.params, (param) => {
                  return {
                    ...param,
                    value: param.param_id,
                    text: param.param_name,
                  }
                })
              : [], // 单选时moreselect数据结构，文本为空数组就好
        }
      })
      return {
        ...item,
        text: item.name,
        value: item.id,
        custom_col_params: adapteCcp,
      }
    })
  }

  /**
   * 设置已选择的工艺
   * {array} selected 选中的工艺
   */
  handleDefaultSelect = (selected) => {
    const detail = Object.assign({}, this.state.detail)
    const ccp = _.map(selected.custom_col_params, (customColParam) => {
      // 设置值时需要从props.detail中取，selected中的值不可用,匹配到对应col数据
      const dataFromPropDetail = _.filter(
        this.props.detail.custom_col_params,
        (item) => item.col_id === customColParam.col_id
      )

      if (customColParam.col_type === 0) {
        let pSelected = {}
        // 匹配到对应col下select的数据
        if (dataFromPropDetail.length > 0) {
          pSelected = _.find(customColParam.params, (item) => {
            return item.param_id === dataFromPropDetail[0].param_id
          })
        }
        return {
          ...customColParam,
          col_param_id: pSelected.param_id, // detail中选择的数据
          paramSelected: pSelected,
        }
      } else if (customColParam.col_type === 1) {
        return {
          ...customColParam,
          ...dataFromPropDetail[0],
          col_param_id: '', // 文本时为空字符串
          col_param_text:
            dataFromPropDetail.length > 0
              ? dataFromPropDetail[0].param_name
              : '', // 后台文本的输入值和单选的text值共用一个字段
        }
      }
    })

    detail.custom_col_params = ccp
    detail.technic_id = selected.id
    detail.desc = selected.desc

    this.setState({ selected, detail })
  }

  handleSelect(selected) {
    const detail = Object.assign({}, this.state.detail)
    detail.custom_col_params = selected.custom_col_params
    detail.technic_id = selected.id
    detail.desc = selected.desc
    this.setState({ selected, detail })
  }

  handleSubmit() {
    this.props.onSave && this.props.onSave(this.state.detail)
  }

  handleCancel() {
    this.props.onCancel && this.props.onCancel()
  }

  handleSelectParam = (index, selected) => {
    const { detail } = this.state
    detail.custom_col_params[index].col_param_id = selected
      ? selected.value
      : ''

    detail.custom_col_params[index].paramSelected = selected
    this.setState({
      detail,
    })
  }

  handleChangeInput = (index, event) => {
    const { detail } = this.state
    detail.custom_col_params[index].col_param_text = event.target.value

    this.setState({
      detail,
    })
  }

  render() {
    const { list, detail, selected } = this.state
    const { id, desc, custom_col_params } = detail

    let panel = [
      <FormItem
        colWidth='100%'
        label={i18next.t('工艺名称')}
        key='formitem_technology'
      >
        <MoreSelect
          id='technology'
          data={list}
          selected={selected}
          renderListFilterType='pinyin'
          onSelect={this.handleSelect}
          placeholder={i18next.t('搜索')}
          disabled={!!id}
        />
      </FormItem>,
      <FormItem
        colWidth='100%'
        label={i18next.t('工艺描述')}
        unLabelTop
        key='formitem_desc'
      >
        <div>{desc}</div>
      </FormItem>,
    ]
    panel = panel.concat(
      _.map(custom_col_params, (col, index) => {
        return (
          <FormItem colWidth='100%' key={index} label={`${col.col_name}`}>
            {col.col_type === 0 ? (
              <MoreSelect
                data={col.params}
                selected={col.paramSelected}
                onSelect={this.handleSelectParam.bind(this, index)}
                renderListItem={(item) => <ItemDiv>{item.text}</ItemDiv>}
              />
            ) : (
              <Input
                className='form-control'
                value={col.col_param_text || ''}
                onChange={this.handleChangeInput.bind(this, index)}
              />
            )}
          </FormItem>
        )
      })
    )
    panel.push(
      <FormButton key={panel.length + 'panel'}>
        <Button
          className='gm-margin-right-5'
          htmlType='button'
          onClick={this.handleCancel}
        >
          {i18next.t('取消')}
        </Button>
        <Button type='primary' htmlType='submit'>
          {i18next.t('保存')}
        </Button>
      </FormButton>
    )

    return (
      <Form onSubmit={this.handleSubmit} labelWidth='150px'>
        {panel}
      </Form>
    )
  }
}

Technology.propTypes = {
  detail: PropTypes.object,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
}

export default Technology
