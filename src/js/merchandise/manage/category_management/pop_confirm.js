import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from 'common/components/tree_list/category_management.module.less'
import { Button, Flex } from '@gmfe/react'
import { SvgRemove } from 'gm-svg'
import { t } from 'gm-i18n'
import { is } from '@gm-common/tool'

function PopConfirm(props) {
  const { title, value, content, onOkText, onOkType, onOk, onHighlight } = props

  const { addRef, deleteRef } = value

  const handleCancel = () => {
    addRef && addRef.apiDoSetActive()
    deleteRef && deleteRef.apiDoSetActive()
  }

  useEffect(() => {
    value.highlight = true
    onHighlight()
    return () => {
      value.highlight = false
      onHighlight()
    }
  }, [])

  const handleOk = () => {
    const result = onOk()
    if (!is.promise(result)) {
      console.error(t('请传入一个Promise对象'))
      return
    }
    Promise.resolve(result).finally(() => handleCancel())
  }

  return (
    <div
      className='gm-padding-lr-15 gm-padding-tb-10'
      style={{ minWidth: '420px' }}
    >
      <Flex alignCenter>
        <div className={styles.div} />
        <div className='gm-gap-10' />
        <Flex flex={1} className='gm-text-14' style={{ fontWeight: 'bold' }}>
          {title}
        </Flex>
        <Button
          className='btn'
          style={{ fontSize: '18px' }}
          onClick={handleCancel}
        >
          <SvgRemove />
        </Button>
      </Flex>
      <div className='gm-padding-tb-10 gm-padding-lr-15'>{content}</div>
      <Flex justifyEnd alignCenter className='gm-padding-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button
          type={onOkType === 'primary' ? 'primary' : 'danger'}
          onClick={handleOk}
        >
          {onOkText || t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

PopConfirm.propTypes = {
  title: PropTypes.string,
  value: PropTypes.object,
  content: PropTypes.node,
  onOkText: PropTypes.string,
  onOkType: PropTypes.oneOf(['primary', 'danger']),
  onOk: PropTypes.func,
  onHighlight: PropTypes.func,
}
export default PopConfirm
