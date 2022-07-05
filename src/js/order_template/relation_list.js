import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, ToolTip } from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'

import Relations from './components/relations'
import SystemKeySelector from './components/system_key'
import ColumnSelector from './components/selector'
import Action from './components/action'
import store from './store'

const RelationsList = observer(() => {
  const handleAdd = (index) => {
    store.addRelationship(index)
  }

  const handleDelete = (index) => {
    store.deleteRelationship(index)
  }

  const handleChange = (index, key, value) => {
    store.changeRelationshipItem(index, key, value)
  }

  const {
    relationshipList,
    detail: { relation_columns, type },
  } = store

  const selectorList = _.map(relation_columns, (item, key) => ({
    text: item,
    value: +key,
  }))

  return (
    <Flex alignCenter>
      <Relations
        data={relationshipList.slice()}
        columns={[
          {
            header: (
              <Flex>
                {i18next.t('系统名称')}
                <ToolTip
                  className='gm-padding-lr-5 gm-text-14'
                  popup={
                    <div className='gm-padding-5' style={{ width: 250 }}>
                      {type === 1
                        ? i18next.t(
                            '商品、商户和下单信息必选，其中商品ID、自定义编码、商品名至少必选任意一项；商户SID和商户名至少必选任意一项；下单数必选。',
                          )
                        : i18next.t(
                            '商品和下单信息必选，其中商品ID、自定义编码、商品名至少必选任意一项；下单数必选。',
                          )}
                    </div>
                  }
                />
              </Flex>
            ),
            width: 110,
            Cell: (item) => (
              <SystemKeySelector
                type={type}
                original={item.original}
                systemKeys={_.map(relationshipList, (item) => item.system_key)}
                onChange={(value) => {
                  handleChange(item.index, 'system_key', value)
                }}
              />
            ),
          },
          {
            header: i18next.t('导入表格内名称'),
            width: 150,
            Cell: (item) => (
              <ColumnSelector
                list={[
                  {
                    text: i18next.t('选择名称'),
                    value: null,
                  },
                  ...selectorList,
                ]}
                original={item.original}
                onChange={(value) =>
                  handleChange(item.index, 'col_index', value)
                }
              />
            ),
          },
          {
            width: 60,
            Cell: (item) => (
              <Action
                original={item.original}
                onAdd={() => handleAdd(item.index)}
                onDelete={() => handleDelete(item.index)}
              />
            ),
          },
        ]}
      />
    </Flex>
  )
})

export default RelationsList
