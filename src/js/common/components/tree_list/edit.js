import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { is } from '@gm-common/tool'
import { Button, Flex, Input, Tip } from '@gmfe/react'
import styles from './category_management.module.less'
import { SvgRemove } from 'gm-svg'
import AddCategory1 from './add_category1'

const Edit = (props) => {
  const { value, onOk, container, icons, onHighlight } = props
  const { title, level } = value
  const [name, changeName] = useState(level ? title : value.name)
  const [icon, changeIcon] = useState(value.icon)

  useEffect(() => {
    onHighlight(true)
    return () => {
      onHighlight(false)
    }
  }, [])

  const handleChange = useCallback((event) => {
    changeName(event.target.value)
  }, [])

  const handleCancel = () => {
    const { current } = container
    current.apiDoSetActive()
  }

  const handleOk = () => {
    if (!name) {
      Tip.warning(t('请输入分类名称'))
      return
    }
    if (!onOk) {
      console.error(t('请传入onOk方法'))
      return
    }
    const result = onOk(value, name, icon)
    if (!is.promise(result)) {
      console.error(t('请传入一个Promise对象'))
      return
    }
    Promise.resolve(result).then(() => handleCancel())
  }

  const renderFirstLevel = () => (
    <div className='gm-padding-20' style={{ width: '656px' }}>
      <Flex alignCenter>
        <div className={styles.div} />
        <div className='gm-gap-10' />
        <Flex flex={1} className='gm-text-14' style={{ fontWeight: 'bold' }}>
          {t('分类编辑')}
        </Flex>
        <Button
          className='btn'
          style={{ fontSize: '18px' }}
          onClick={handleCancel}
        >
          <SvgRemove />
        </Button>
      </Flex>
      <AddCategory1
        onIconSelected={changeIcon}
        name={name}
        icon={icon}
        onTextChange={changeName}
        icons={icons}
        hideScope
      />
      <Flex justifyEnd alignCenter className='gm-padding-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleOk}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )

  const renderCommon = () => (
    <Flex className='gm-padding-lr-15 gm-padding-tb-10'>
      <Input className='form-control' value={name} onChange={handleChange} />
      <Flex alignCenter className='gm-margin-left-10'>
        <Button type='primary' onClick={handleOk}>
          {t('保存')}
        </Button>
      </Flex>
    </Flex>
  )

  return level ? renderCommon() : renderFirstLevel()
}

Edit.propTypes = {
  value: PropTypes.object,
  container: PropTypes.object,
  icons: PropTypes.array,
  onOk: PropTypes.func,
  onHighlight: PropTypes.func,
}

export default Edit
