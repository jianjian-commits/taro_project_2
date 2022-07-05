/**
 * @description 左侧导航栏/面包屑/顶部导航按钮/头像
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Nav, Popover } from '@gmfe/react'
import {
  changeDomainName,
  gioTrackEvent,
  history,
  withRouter,
} from '../common/service'
import { Breadcrumb, Framework, Info, Left } from '@gmfe/frame'
import { i18next, isEnglish } from 'gm-i18n'
import Notification from '../notification'
import { AccountItem } from './account_switch/account_item'
import { SwitchIcon } from './account_switch/switch_icon'
import _ from 'lodash'
import { changeLanguage, logout, modifyPassword } from './util'
import { getNavConfig } from '../navigation'
import globalStore from '../stores/global'
import { observer } from 'mobx-react'
import SVGMa from '../../svg/ma.svg'
import SVGApplicationCenter from '../../svg/application_center.svg'
import SVGEnvelope from '../../svg/envelope.svg'
import SVGQuestionCircle from '../../svg/question-circle-o.svg'
import SvgUser from '../../svg/user.svg'

const navConfig = getNavConfig()

const Logo = observer(() => {
  return (
    <Flex alignCenter justifyCenter>
      <a href='#/'>
        <img
          src={globalStore.logo.logoPure || globalStore.logo.logo}
          style={{
            maxHeight: '40px',
            maxWidth: '40px',
          }}
        />
      </a>
    </Flex>
  )
})

const Other = withRouter(
  observer((props) => {
    const toMaUrl = changeDomainName('station', 'manage')
    const { pathname } = props.location

    // 保持 navigation 的数据结构
    const ma = {
      name: i18next.t('nav__信息平台'),
      link: '/ma', // 假装是个可用的 url
      icon: <SVGMa />,
      sub: [
        {
          name: i18next.t('nav__信息平台'),
          link: '/ma',
          sub: [
            {
              name: i18next.t('nav__商户'),
              link: toMaUrl + '/#/customer_manage',
            },
            {
              name: i18next.t('nav__售后'),
              link: toMaUrl + '/#/order_manage',
            },
            {
              name: i18next.t('nav__财务'),
              link: toMaUrl + '/#/finance_manage',
            },
            {
              name: i18next.t('nav__运营数据'),
              link: toMaUrl + '/#/operational_data',
            },
          ],
        },
      ],
    }

    const application = {
      name: i18next.t('nav__应用中心'),
      link: '/application_center',
      icon: <SVGApplicationCenter />,
    }

    return (
      <div>
        {!globalStore.logo.hideApp && (
          <Nav.SingleItem
            data={application}
            show={false}
            selected={pathname}
            onSelect={(item) => {
              history.push(item.link)
            }}
          />
        )}

        <Nav.Item
          data={ma}
          selected='/lalala'
          onSelect={(item) => {
            if (item.link && item.link !== '/ma') {
              window.open(item.link)
            }
          }}
        />
      </div>
    )
  }),
)

const Avatar = (props) => {
  const { name, url } = props
  return (
    <Flex
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: '1px solid #56a3f2',
      }}
    >
      <Flex
        alignCenter
        justifyCenter
        style={{
          lineHeight: '30px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid white',
          backgroundColor: 'white',
        }}
      >
        {url ? (
          <img
            src={url}
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
        ) : (
          name.slice(0, 1)[0] && name.slice(0, 1)[0].toUpperCase()
        )}
      </Flex>
    </Flex>
  )
}

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
}

const Menu = withRouter(
  observer((props) => {
    const {
      location: { pathname },
      onClose,
    } = props

    const handleSelect = (selected) => {
      Framework.scrollTop()

      history.push(selected.link)

      onClose()
    }

    return (
      <Left>
        <Nav
          logo={<Logo />}
          logoActive={pathname === '/home'}
          data={navConfig}
          onSelect={handleSelect}
          selected={pathname}
          other={globalStore.otherInfo.isCStation ? null : <Other />}
        />
      </Left>
    )
  }),
)

const ComBreadcrumb = withRouter(
  observer((props) => {
    const {
      location: { pathname },
    } = props

    const handleSelect = (selected) => {
      Framework.scrollTop()

      history.push(selected.link)
    }

    return (
      <Breadcrumb
        breadcrumbs={globalStore.breadcrumbs.slice()}
        pathname={pathname}
        navConfig={navConfig}
        onSelect={handleSelect}
      />
    )
  }),
)

const ComInfo = observer((props) => {
  // const one = `${globalStore.user.station_id} ${globalStore.user.station_name}`
  const two = `${globalStore.user.name}`

  // 页面跳转前打点
  function jumpPage(gioId, url) {
    gioTrackEvent(gioId, 1, {})
    window.open(url)
  }

  return (
    <Info
      more={_.without(
        [
          { text: i18next.t('修改密码'), onClick: modifyPassword },
          { text: i18next.t('语言'), onClick: changeLanguage },
          {
            text: i18next.t('退出'),
            onClick: logout,
          },
        ],
        null,
      )}
    >
      <AccountItem
        station_id={globalStore.user.station_id}
        station_name={globalStore.user.station_name}
        logo={globalStore.bShop.logo}
        username={two}
        icon={<SwitchIcon />}
      />

      {globalStore.otherInfo.isStaff ? (
        <Flex
          alignCenter
          justifyCenter
          style={{
            height: '30px',
            width: '30px',
            borderRadius: '30px',
            color: '#515E74',
          }}
          className='gm-cursor b-frame-top-item gm-margin-right-10 gm-line-height-1'
          onClick={() => jumpPage('user_management', '/gm_account')}
        >
          <Popover
            type='hover'
            showArrow
            center
            offset={5}
            popup={<div className='gm-padding-5'>{i18next.t('用户管理')}</div>}
          >
            <span>
              <SvgUser className='gm-text-18 gm-line-height-1' />
            </span>
          </Popover>
        </Flex>
      ) : null}
      <Notification>
        <Flex
          alignCenter
          justifyCenter
          style={{
            lineHeight: 1,
            height: '30px',
            width: '30px',
            borderRadius: '30px',
            marginRight: '10px',
            color: '#515E74',
          }}
          className='gm-cursor b-frame-top-item'
        >
          <Popover
            type='hover'
            showArrow
            center
            offset={5}
            popup={<div className='gm-padding-5'>{i18next.t('订单提示')}</div>}
          >
            <span>
              <SVGEnvelope style={{ fontSize: '18px', lineHeight: 1 }} />
            </span>
          </Popover>
        </Flex>
      </Notification>
      {globalStore.logo.hideDocument || isEnglish() ? null : (
        <Popover
          type='hover'
          showArrow
          right
          offset={5}
          popup={
            <div className='gm-padding-5' style={{ width: '120px' }}>
              {i18next.t('点击查看使用帮助')}
            </div>
          }
        >
          <Flex
            alignCenter
            justifyCenter
            style={{
              lineHeight: 1,
              height: '30px',
              width: '30px',
              borderRadius: '30px',
              color: '#515E74',
            }}
            className='gm-cursor b-frame-top-item margin-right-10'
            onClick={() =>
              jumpPage('help_document', '//station.guanmai.cn/gm_help/station')
            }
          >
            <SVGQuestionCircle style={{ fontSize: '18px', lineHeight: 1 }} />
          </Flex>
        </Popover>
      )}
    </Info>
  )
})

export { Menu, ComBreadcrumb, ComInfo, Avatar }
