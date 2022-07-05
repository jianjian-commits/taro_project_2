import React, { useState, useEffect } from 'react'
import { Flex, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Gird from 'common/components/grid'
import Panel from 'common/components/dashboard/panel'
import SortModal from 'common/components/dashboard/sort_modal'
import Bulletin from 'common/components/dashboard/bulletin'
import store from '../store'
import { colors, icons } from 'common/dashboard'
import { observer } from 'mobx-react'

const core = [1, 2, 3]

const infos = {
  1: {
    text: t('采购总额'),
    value: 1,
    preValue: 12,
    color: colors.Blue,
    icon: icons.Money,
  },
  2: {
    text: t('入库金额'),
    value: 2,
    preValue: 12,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
  },
  3: {
    text: t('周转率'),
    value: 3,
    preValue: 12,
    color: colors.Sunrise_Yellow,
    icon: icons.Person,
  },
}

const SaleData = ({ className }) => {
  const { filter } = store
  const [data, setData] = useState(null)
  useEffect(() => {
    console.log('触发了')

    fetchData(filter)
  }, [filter])

  const fetchData = () => {
    setData(infos)
  }

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
      title={t('采购数据')}
      className={classNames('gm-bg', className)}
      right={
        <Flex alignCenter style={{ paddingBottom: 4 }}>
          <span
            className='text-primary gm-text-12 gm-cursor'
            onClick={() => handleConfig(infos)}
          >
            {t('自定义设置')}
          </span>
        </Flex>
      }
    >
      <Gird column={3} className='gm-bg gm-padding-0'>
        {data &&
          core.map((key) => <Bulletin key={key} flip options={data[key]} />)}
      </Gird>
    </Panel>
  )
}

SaleData.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(SaleData)
