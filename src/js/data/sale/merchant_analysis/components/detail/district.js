import React from 'react'
import { Pie as PieChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import { observer } from 'mobx-react'
const District = ({ className }) => {
  return (
    <Panel
      title={t('线路销售额分布')}
      className={classNames('gm-bg', className)}
    >
      <PieChart
        data={[
          { item: '事例一', count: 40, percent: 0.4 },
          { item: '事例二', count: 21, percent: 0.21 },
          { item: '事例三', count: 17, percent: 0.17 },
          { item: '事例四', count: 13, percent: 0.13 },
          { item: '事例五', count: 9, percent: 0.09 },
        ]}
        options={{
          height: 300,
          position: 'percent',
          color: 'item',
        }}
      />
    </Panel>
  )
}

District.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(District)
