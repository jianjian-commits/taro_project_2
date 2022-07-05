import React, { useContext, useRef } from 'react'
import styles from 'common/components/tree_list/category_management.module.less'
import { Checkbox, Flex, Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import { defaultIconContext } from '../icons_management'

const fill = new Array(10).fill(0)
const SystemIcons = (props) => {
  const { icons, onSetDefault } = props

  const handleClick = (id) => {
    onSetDefault(id)
  }

  return (
    <>
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
        <Flex wrap alignCenter justifyBetween>
          {icons.map((item) => (
            <Icon key={item.id} icon={item} onClick={handleClick} />
          ))}
          {fill.map((item, index) => (
            <div key={index + 100} className={styles['img-fill']} />
          ))}
        </Flex>
      </div>
    </>
  )
}
SystemIcons.propTypes = {
  icons: PropTypes.array.isRequired,
  onSetDefault: PropTypes.func,
}

const Icon = (props) => {
  const { icon, onClick } = props
  const defaultIcon = useContext(defaultIconContext)
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
          [styles['img-item-selected']]: icon.selected,
        })}
        onClick={() => handleClick(icon.id)}
      >
        <img src={icon.url} alt={icon.id} />
        {defaultIcon === icon.id && (
          <Checkbox
            className='img-checkbox'
            checked={defaultIcon === icon.id}
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
}

export default SystemIcons
