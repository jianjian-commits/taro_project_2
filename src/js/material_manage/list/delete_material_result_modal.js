import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Modal, Button } from '@gmfe/react'
import _ from 'lodash'

function Table(props) {
  let { header, list } = props

  return (
    <table className='b-material-manage-delete-table'>
      <thead>
        <tr style={{ backgroundColor: '#efefef' }}>
          {header.names.map((name) => (
            <td>{name}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.map((item) => {
          return (
            <tr>
              {header.fields.map((field) => {
                if (_.isFunction(field)) {
                  return field(item)
                }
                return <td>{item[field]}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const HEADERS = {
  1: {
    fields: ['id', 'name'],
    names: [i18next.t('商品 ID'), i18next.t('商品名')],
  },
  4: {
    fields: ['id', 'name', (item) => item.amount + item.unit_name],
    names: [i18next.t('商品 ID'), i18next.t('商品名'), i18next.t('未归还数量')],
  },
}
class DeleteMaterialModal extends React.Component {
  renderType(typeInfo, num) {
    let { type } = typeInfo
    switch (type) {
      case 1:
        let { sku_info } = typeInfo
        return (
          <div>
            {num}
            {i18next.t('当前周转物已关联以下商品，请解除关联后再删除')}
            <Table header={HEADERS[type]} list={sku_info} />
          </div>
        )
      case 2:
        return (
          <div>
            {num}
            {i18next.t('当前周转物存在待归还状态条目，请确认入库后再删除')}
          </div>
        )
      case 3:
        return (
          <div>
            {num}
            {i18next.t('当前周转物存在待借出状态条目，请确认出库后再删除')}
          </div>
        )
      case 4:
        let { address_info } = typeInfo
        return (
          <div>
            {num}
            {i18next.t('如下商户未归还当前周转物，请确认归还后再操作')}
            <Table header={HEADERS[type]} list={address_info} />
          </div>
        )
    }
  }
  render() {
    let { deleteResult } = this.props
    let isMultiple = deleteResult.length > 0
    return (
      <div style={{ maxHeight: '500px', overflow: 'auto' }}>
        {isMultiple && i18next.t('该周转物存在以下情况无法删除：')}
        {deleteResult.map((typeInfo, i) => {
          return (
            <div key={i} className='gm-margin-top-5'>
              {this.renderType(typeInfo, isMultiple && i + 1 + '.')}
            </div>
          )
        })}
        <Flex justifyCenter className='gm-margin-top-5'>
          <Button type='primary' onClick={() => Modal.hide()}>
            {i18next.t('确定')}
          </Button>
        </Flex>
      </div>
    )
  }
}
export default DeleteMaterialModal
