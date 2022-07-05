import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Modal, Tip, Dialog } from '@gmfe/react'
import _ from 'lodash'
import { groupByWithIndex } from '../../../../../common/util'
import { Request } from '@gm-common/request'

import TechnologyCard from './technology_card'
import Technology from './technology'
const { CardRow } = TechnologyCard

class TechnologyFlow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
    }

    this.handleDelete = ::this.handleDelete
    this.handleSetting = ::this.handleSetting
    this.handleSave = ::this.handleSave
    this.handleCreate = ::this.handleCreate
    this.handleSort = ::this.handleSort
  }

  componentDidMount() {
    this.getTechnologyFlow()
  }

  getTechnologyFlow() {
    const {
      sku_id,
      ingredient_id,
      onChangeTechnicFlowLen,
      index,
      type,
    } = this.props

    const materialCheck = type === 1 && sku_id && ingredient_id
    const combineCheck = type === 2 && sku_id

    if (combineCheck || materialCheck) {
      const req = { sku_id, type }
      if (type === 1) {
        req.ingredient_id = ingredient_id
      }
      return Request('/process/technic_flow/get')
        .data(req)
        .get()
        .then((json) => {
          this.setState({
            list: json.data,
          })
          onChangeTechnicFlowLen({ index, len: json.data.length })
        })
    }
    this.setState({ list: [] })
  }

  handleDelete(id) {
    const self = this
    Dialog.confirm({
      children: i18next.t('确认删除此工艺信息？'),
      title: i18next.t('删除工艺信息'),
    }).then(() => {
      Request('/process/technic_flow/delete_technic')
        .data({ id })
        .post()
        .then(() => {
          Tip.success(i18next.t('删除成功'))
          self.getTechnologyFlow()
        })
    })
  }

  handleSetting(detail) {
    Modal.render({
      children: (
        <Technology
          detail={detail}
          onSave={this.handleSave}
          onCancel={() => Modal.hide()}
        />
      ),
      title: i18next.t('工艺信息'),
      onHide: Modal.hide,
    })
  }

  handleCreate() {
    Modal.render({
      children: (
        <Technology onSave={this.handleSave} onCancel={() => Modal.hide()} />
      ),
      title: i18next.t('工艺信息'),
      onHide: Modal.hide,
    })
  }

  handleSave(detail) {
    const { sku_id, ingredient_id, remark_type, type } = this.props
    let data = Object.assign({}, detail, {
      sku_id,
      ingredient_id,
      remark_type,
      type,
      custom_cols: JSON.stringify(
        _.map(detail.custom_col_params, (v) => {
          return {
            col_id: v.col_id,
            col_param_id: v.col_param_id || '', // 文本时没有，则传空字符串
            col_param_text: v.col_param_text,
          }
        })
      ),
    })
    data = _.omit(data, 'custom_col_params')

    if (data.id) {
      Request('/process/technic_flow/update_technic')
        .data(data)
        .post()
        .then(() => {
          Tip.success(i18next.t('修改成功'))
          Modal.hide()
          this.getTechnologyFlow()
        })
      return
    }

    Request('/process/technic_flow/create_technic')
      .data(data)
      .post()
      .then(() => {
        Tip.success(i18next.t('添加成功'))
        Modal.hide()
        this.getTechnologyFlow()
      })
  }

  addEmptyContent(cards) {
    const result = []
    if (cards && cards.length !== 0 && cards.length % 2 !== 0) {
      const addLength = 2 - (cards.length % 2)
      for (let i = 0; i < addLength; i++) {
        result.push(
          <Flex
            flex
            className='gm-margin-lr-5 gm-margin-bottom-15'
            key={`empty${i}`}
          />
        )
      }
    }
    return result
  }

  handleSort(index, sort) {
    const list = [...this.state.list]
    const positionIndex = sort === 'before' ? index - 1 : index + 2
    const id = list[index].id
    const next_id = positionIndex === list.length ? 0 : list[positionIndex].id

    Request('/process/technic_flow/change_technic_order')
      .data({ id, next_id })
      .post()
      .then(() => {
        Tip.success(i18next.t('修改成功'))
        this.getTechnologyFlow()
      })
  }

  render() {
    // 工艺信息
    const { list } = this.state

    const templates = _.map(list, (v, index) => {
      return (
        <Flex
          flex
          className='menu-card-module gm-margin-lr-5 gm-margin-bottom-15'
          key={'card_' + index}
        >
          <TechnologyCard
            index={index}
            first={index === 0}
            last={index === list.length - 1}
            detail={v}
            onDeleteClick={this.handleDelete}
            onSettingClick={this.handleSetting}
            onSort={this.handleSort}
          >
            <CardRow name={i18next.t('工艺描述')} content={v.desc} />
            {_.map(v.custom_col_params, (col, i) => {
              return (
                <CardRow
                  key={'row' + i}
                  name={`${col.col_name}：`}
                  content={col.param_name}
                />
              )
            })}
          </TechnologyCard>
        </Flex>
      )
    })

    templates.push(
      <Flex
        flex
        className='gm-margin-lr-5 gm-margin-bottom-15'
        key={'card_' + templates.length}
      >
        <Flex
          alignCenter
          justifyCenter
          className='gm-cursor'
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ccc',
          }}
          onClick={this.handleCreate}
        >
          <i className='xfont xfont-plus' />
        </Flex>
      </Flex>
    )

    const emptyTemplates = this.addEmptyContent(templates)

    if (emptyTemplates.length > 0) {
      templates.push(emptyTemplates)
    }

    return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Flex alignCenter className='gm-text-14 gm-border-bottom gm-padding-15'>
          <div
            className='gm-margin-right-5'
            style={{ width: '3px', height: '1em', backgroundColor: '#56a3f2' }}
          />
          <div>{i18next.t('工艺设置')}</div>
        </Flex>
        <div className='gm-inline-block gm-margin-15'>
          {i18next.t('点击页卡')}
          <i className='xfont xfont-left gm-margin-right-5' />
          <i className='xfont xfont-right' />
          {i18next.t('按钮，可以更换加工顺序')}
        </div>
        <Flex justifyBetween column className='gm-padding-15'>
          {_.map(
            groupByWithIndex(templates, (value, i) => parseInt(i / 2, 10)),
            (value, i) => {
              return (
                <Flex flex={1} key={'groupByWithIndex' + i}>
                  {value}
                </Flex>
              )
            }
          )}
        </Flex>
      </div>
    )
  }
}

TechnologyFlow.propTypes = {
  sku_id: PropTypes.string,
  ingredient_id: PropTypes.string,
  remark_type: PropTypes.string,
  onChangeTechnicFlowLen: PropTypes.func,
  index: PropTypes.number,
  type: PropTypes.number.isRequired, // 物料工艺:1,组合工艺：2
}

export default TechnologyFlow
