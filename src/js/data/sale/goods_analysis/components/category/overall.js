import React from 'react'
import { Flex, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Gird from 'common/components/grid'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'
import SortModal from 'common/components/dashboard/sort_modal'
import Bulletin from 'common/components/dashboard/bulletin'

import { colors, icons } from 'common/dashboard/sale/theme'

const core = [1, 2, 3, 4]

const infos = {
  1: {
    text: t('销售额(元)'),
    value: 1,
    preValue: 12,
    color: colors.Blue,
    icon: icons.Money,
  },
  2: {
    text: t('订单数'),
    value: 2,
    preValue: 12,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
  },
  3: {
    text: t('下单客户数'),
    value: 3,
    preValue: 12,
    color: colors.Sunrise_Yellow,
    icon: icons.Person,
  },
  4: {
    text: t('销售毛利(元)'),
    value: 4,
    preValue: 12,
    color: colors.Dark_Green,
    icon: icons.Money2,
  },
}

const SaleData = ({ className }) => {
  const handleConfig = () => {
    Modal.render({
      title: t('运营简报'),
      size: 'lg',
      children: <SortModal infos={infos} onConfirm={handleSort} core={core} />,
      onHide: Modal.hide,
    })
  }

  const handleSort = () => {}

  return (
    <Panel
      title={t('销售数据')}
      className={classNames('gm-bg', className)}
      right={
        <Flex alignCenter style={{ paddingBottom: 4 }}>
          {/* {!isCStation && (
          <OrderTypeSelector
            className='gm-margin-right-10'
            style={{ width: '60px' }}
            orderType={orderType}
            onChange={this.handleOrderTypeChange}
          />
        )}
        {!this.props.isForeign && (
          <Button onClick={this.handleFullScreen}>
            {t('投屏模式')}&nbsp;
            <SvgNext />
          </Button>
        )} */}
          <span
            className='text-primary gm-text-12 gm-cursor'
            onClick={() => handleConfig(infos)}
          >
            {t('自定义设置')}
          </span>
        </Flex>
      }
    >
      <Gird column={4} className='gm-bg gm-padding-0'>
        {core.map((key, index) => {
          return <Bulletin key={key} flip options={infos[key]} />
        })}
      </Gird>
    </Panel>
  )
}

SaleData.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(SaleData)
