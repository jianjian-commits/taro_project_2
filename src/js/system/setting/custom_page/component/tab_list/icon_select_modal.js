import React, { useEffect, useState, useRef } from 'react'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import {
  Button,
  Divider,
  Flex,
  LoadingChunk,
  Modal,
  Popover,
  Checkbox,
} from '@gmfe/react'
import styles from '../../../../../common/components/tree_list/category_management.module.less'
import { Request } from '@gm-common/request'

function IconSelectModal({ onOk }) {
  const [loading, changeLoading] = useState(false)
  const [icons, changeIcons] = useState([])
  const [defaultIcon, changeDefaultIcon] = useState()

  useEffect(() => {
    /** 获取按钮集合 */
    changeLoading(true)
    Request('/merchandise/category1/icon')
      .get()
      .then(({ data }) => {
        changeIcons(data)
        changeLoading(false)
      })
  }, [])

  const handleCancel = () => {
    Modal.hide()
  }

  const handleSave = () => {
    const icon = _.find(icons, (icon) => icon.id === defaultIcon)
    onOk(icon.url)
    Modal.hide()
  }

  const handleClick = (value) => {
    changeDefaultIcon(value)
  }

  const renderIconsLayout = () => {
    const systemIcons = _.filter(icons, (icon) => icon.type === 1)
    const localIcons = _.filter(icons, (icon) => icon.type === 2)
    return (
      <div
        className={styles['img-container']}
        style={{
          padding: '12px',
          width: '100%',
          borderTop: 'none',
          height: 'auto',
          maxHeight: '300px',
          minHeight: '200px',
        }}
      >
        {systemIcons.length > 0 && <Divider>{t('系统图标')}</Divider>}
        <Flex wrap alignCenter justifyBetween>
          {_.map(systemIcons, (item) => (
            <Icon
              selectedIcon={defaultIcon}
              key={item.id}
              icon={item}
              onClick={handleClick}
            />
          ))}
        </Flex>
        {localIcons.length > 0 && <Divider>{t('本地图标')}</Divider>}
        <Flex wrap alignCenter justifyStart>
          {_.map(localIcons, (item) => (
            <Icon
              selectedIcon={defaultIcon}
              key={item.id}
              icon={item}
              onClick={handleClick}
            />
          ))}
        </Flex>
      </div>
    )
  }

  return (
    <>
      <LoadingChunk loading={loading}>{renderIconsLayout()}</LoadingChunk>
      <Flex justifyEnd row className='gm-margin-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleSave}>
          {t('确定')}
        </Button>
      </Flex>
    </>
  )
}

IconSelectModal.propTypes = {
  onOk: PropTypes.func,
}

const Icon = (props) => {
  const { icon, onClick, selectedIcon } = props
  const popRef = useRef()

  const handleClick = (id) => {
    setTimeout(() => {
      popRef.current && popRef.current.apiDoSetActive()
    }, 3000)
    onClick(id)
  }

  const handleCheck = (event) => {
    event.preventDefault()
  }

  return (
    <Popover
      key={icon.id}
      popup={
        <div
          className='gm-padding-lr-15 gm-padding-tb-5'
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          {t('默认图标')}
        </div>
      }
      showArrow
      top
      offset={18}
      ref={popRef}
    >
      <div
        className={classNames({
          [styles['img-item']]: true,
        })}
        onClick={() => handleClick(icon.id)}
      >
        <img src={icon.url} alt={icon.id} />
        {selectedIcon === icon.id && (
          <Checkbox
            className='img-checkbox'
            checked={selectedIcon === icon.id}
            onChange={handleCheck}
          />
        )}
      </div>
    </Popover>
  )
}

Icon.propTypes = {
  icon: PropTypes.object,
  onClick: PropTypes.func,
  selectedIcon: PropTypes.number,
}

export default IconSelectModal
