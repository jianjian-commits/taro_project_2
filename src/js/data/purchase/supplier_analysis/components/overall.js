import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styled from 'styled-components'
import Panel from 'common/components/dashboard/panel'
import Bulletin from 'common/components/dashboard/bulletin'
import { colors, icons } from 'common/dashboard'
import store from '../store'
import { observer } from 'mobx-react'

const core = [1, 2, 3]

const infos = {
  1: {
    text: t('采购金额top数'),
    value: 1,
    preValue: 12,
    color: colors.Blue,
    icon: icons.Money,
  },
  2: {
    text: t('采购次数top数'),
    value: 2,
    preValue: 12,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
  },
  3: {
    text: t('交付时长top数'),
    value: 3,
    preValue: 12,
    color: colors.Sunrise_Yellow,
    icon: icons.Person,
  },
}

const GridContainer = styled.div`
  display: grid;
  background-color: #ffff;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
`

const Overall = ({ className }) => {
  const { filter } = store
  const [data, setData] = useState(null)
  useEffect(() => {
    console.log('触发了')

    fetchData(filter)
  }, [filter])

  const fetchData = () => {
    setData(infos)
  }

  return (
    <Panel title={t('销售数据')} className={classNames('gm-bg', className)}>
      <GridContainer>
        {data &&
          core.map((key, index) => {
            return <Bulletin key={key} flip options={data[key]} />
          })}
      </GridContainer>
    </Panel>
  )
}

Overall.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(Overall)
