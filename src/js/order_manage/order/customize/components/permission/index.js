import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { CheckboxGroup, Checkbox, ToolTip } from '@gmfe/react'
import { TableX, selectTableXHOC } from '@gmfe/table-x'

const Table = selectTableXHOC(TableX)

function parseDataWithConfig(data, config) {
  const selected = []
  const list = config.map((v, i) => {
    const isSelected = v.content.reduce(
      (sum, v) => sum && !!data[v.value],
      true,
    )
    if (isSelected) {
      selected.push(i)
    }
    return {
      ...v,
      id: i,
      content: v.content.map((v) => {
        return {
          ...v,
          checked: !!data[v.value],
        }
      }),
    }
  })
  return { list, selected }
}

const Permission = ({ data, config, onChange }) => {
  const { list, selected } = parseDataWithConfig(data, config)
  function handleSelect(newList) {
    const map = {}
    newList
      .map((v) => list[v])
      .forEach((v) =>
        v.content.forEach((k) => {
          map[k.value] = 1
        }),
      )
    onChange(_.keys(map))
  }

  function handleSelectSingle(keys, target) {
    const map = {}
    selected
      .map((v) => list[v])
      .forEach((v) => {
        if (v.id !== target) {
          v.content.forEach((k) => {
            map[k.value] = 1
          })
        }
      })
    onChange([...keys, ..._.keys(map)])
  }

  return (
    <Table
      selected={selected}
      onSelect={handleSelect}
      data={list}
      keyField='id'
      tiled
      columns={[
        {
          Header: t('一级模块'),
          minWidth: 80,
          accessor: 'name',
        },
        {
          Header: t('二级模块'),
          minWidth: 260,
          id: 'content',
          accessor: (d) => {
            const selected = d.content
              .map((v) => (v.checked ? v.value : ''))
              .filter((v) => v)
            return (
              <CheckboxGroup
                name={'permission' + d.id}
                value={selected}
                inline
                onChange={(value) => {
                  handleSelectSingle(value, d.id)
                }}
              >
                {_.map(d.content, (v) => (
                  <Checkbox
                    key={v.value}
                    value={v.value}
                    checked={v.checked}
                    disabled={v.disabled}
                    className='gm-margin-right-10'
                  >
                    {v.text}
                    {v.tip && (
                      <ToolTip
                        popup={
                          <div
                            className='gm-padding-5'
                            style={{ minWidth: '170px' }}
                          >
                            {v.tip}
                          </div>
                        }
                        className='gm-margin-left-5'
                      />
                    )}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            )
          },
        },
      ]}
    />
  )
}

Permission.propTypes = {
  data: PropTypes.object.isRequired,
  config: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default Permission
