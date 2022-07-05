import React, { useEffect } from 'react'
import { Select } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { Observer, observer } from 'mobx-react'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import MapEChart from 'common/components/customize_echarts/map_echart'

import store from '../store'

const SaleMap = ({ className }) => {
  useEffect(() => {
    store.fetchSaleMap()
  }, [])

  const handleSelectCity = (value) => {
    store.changeAreaCode(value)
  }

  return (
    <Panel
      title={t('运营地图')}
      className={classNames(className)}
      right={
        <Observer>
          {() => (
            <Select
              data={store.cityList}
              value={store.selectAreaCode}
              onChange={handleSelectCity}
            />
          )}
        </Observer>
      }
    >
      <MapEChart data={store.location} areaCode={store.selectAreaCode} />
    </Panel>
  )
}

SaleMap.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(SaleMap)
