import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'
import { Flex, Popover, IconDownUp } from '@gmfe/react'
import { changeDomainName } from '../../../../common/service'
import Url from '../../../../common/components/url'

const docUrl = '//station.guanmai.cn/gm_help/faq/hkr1kt/255f52'

const Link = (props) => {
  const { cms_key, isCShop } = props
  const [show, setShow] = useState(false)

  const shopName = isCShop ? 'cshop' : 'bshop'

  const moreLink = () => {
    return (
      <div className='gm-padding-5 gm-text-desc'>
        <div style={{ marginBottom: '3px' }}>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{i18next.t('首页链接')}：
          <Url
            target='_brank'
            href={changeDomainName('station', shopName) + '?cms_key=' + cms_key}
          />
        </div>
        <div style={{ marginBottom: '3px' }}>
          {i18next.t('我的订单链接')}：
          <Url
            target='_brank'
            href={
              changeDomainName('station', shopName) +
              '?cms_key=' +
              cms_key +
              '#/order'
            }
          />
        </div>
        <div style={{ marginBottom: '3px' }}>
          {i18next.t('个人中心链接')}：
          <Url
            target='_brank'
            href={
              changeDomainName('station', shopName) +
              '?cms_key=' +
              cms_key +
              '#/my'
            }
          />
        </div>
        <div>
          {i18next.t(
            '根据您公众号设置的菜单业务，将对应功能链接直接复制到您的公众号对应菜单内容中，即可使用。',
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Flex alignCenter style={{ paddingTop: '6px' }}>
        <Url
          href={changeDomainName('', shopName) + '?cms_key=' + cms_key}
          target='_blank'
        />
        <span className='gm-gap-10' />
        {!isCShop && (
          <Popover type='click' showArrow arrowLeft='90' popup={moreLink()}>
            <a onClick={() => setShow(!show)} className='gm-cursor'>
              {i18next.t('更多功能页链接')} <IconDownUp active={show} />
            </a>
          </Popover>
        )}
        <Flex flex />
        <a href={docUrl} target='_blank' rel='noopener noreferrer'>
          {i18next.t('如何生效URL?')}
        </a>
      </Flex>
    </div>
  )
}

Link.propTypes = {
  cms_key: PropTypes.string.isRequired,
  isCShop: PropTypes.bool,
}

export default Link
