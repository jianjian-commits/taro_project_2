import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, FormItem, Input, Flex, Select } from '@gmfe/react'
import { t } from 'gm-i18n'
import styles from './category_management.module.less'
import classNames from 'classnames'

const fill = new Array(10).fill(0)
function AddCategory1(props) {
  const {
    icon,
    name,
    icons,
    onIconSelected,
    onTextChange,
    onScopeSelected,
    hideScope,
  } = props
  const [cloneIcons, changeIcons] = useState([])
  const [value, changeValue] = useState('')
  const [scopeType, changeScopeType] = useState(0)
  const scopeTypes = [
    {
      text: t('通用'),
      value: 0,
    },
    {
      text: t('本站'),
      value: 1,
    },
  ]

  useEffect(() => {
    if (icon || name) {
      // 编辑
      changeValue(name)
      icons.forEach((item) => {
        item.selected = item.id === icon
      })
    } else {
      onIconSelected(null) // 新增
      onTextChange('')
      onScopeSelected(0)
      icons.forEach((item) => {
        item.selected = false
      })
    }
    changeIcons(icons)
  }, [])

  const handleInput = useCallback(({ target: { value } }) => {
    changeValue(value)
    onTextChange(value)
  }, [])

  const handleScopeSelect = (value) => {
    changeScopeType(value)
    onScopeSelected(value)
  }

  const handleIconSelect = ({ id, selected }) => {
    cloneIcons.forEach((item) => {
      item.selected = item.id === id ? !selected : false
    })
    changeIcons([...cloneIcons])
    const find = cloneIcons.find((item) => item.selected)
    onIconSelected(find ? find.id : null)
  }

  const handleRenderIcon = (type) => (
    <Flex wrap alignCenter justifyBetween>
      {cloneIcons
        .filter((item) => item.type === type)
        .map((item) => (
          <div
            key={item.id}
            className={classNames({
              [styles['img-item']]: true,
              [styles['img-item-selected']]: item.selected,
            })}
            onClick={() => handleIconSelect(item)}
          >
            <img src={item.url} alt={item.id} />
          </div>
        ))}
      {fill.map((item, index) => (
        <div key={index + 100} className={classNames(styles['img-fill'])} />
      ))}
    </Flex>
  )

  return (
    <Form labelWidth='80px' horizontal>
      <FormItem label={t('分类名称')} className='gm-margin-bottom-20'>
        <Input
          className='form-control'
          style={{ width: '220px' }}
          value={value}
          onChange={handleInput}
        />
      </FormItem>
      {hideScope ? null : (
        <FormItem
          label={t('分类类型')}
          className='gm-margin-bottom-20'
          toolTip={
            <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
              {t(
                '适用于总分仓，现有系统分类全部为通用分类。本站表示仅本站可见可用',
              )}
            </div>
          }
        >
          <Select
            style={{ width: '220px' }}
            data={scopeTypes}
            value={scopeType}
            onChange={handleScopeSelect}
          />
        </FormItem>
      )}
      <FormItem label={t('选择图标')}>
        <div className={styles['img-container']} style={{ padding: '12px' }}>
          {handleRenderIcon(1)}
          <div style={{ height: '20px', borderTop: '1px solid #ccc' }} />
          {handleRenderIcon(2)}
        </div>
      </FormItem>
    </Form>
  )
}

AddCategory1.propTypes = {
  icons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      url: PropTypes.string,
    }),
  ).isRequired,
  name: PropTypes.string,
  icon: PropTypes.number,
  hideScope: PropTypes.bool,
  onTextChange: PropTypes.func.isRequired,
  onIconSelected: PropTypes.func.isRequired,
  onScopeSelected: PropTypes.func.isRequired,
}

AddCategory1.defaultProps = {
  icons: [],
}
export default AddCategory1
