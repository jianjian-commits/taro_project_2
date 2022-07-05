import React from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'

const SaleRankAmount = ({ className }) => {
  return (
    <Panel
      title={t('商品销售额排行')}
      className={classNames('gm-bg', className)}
    >
      <BarChart
        data={[
          { type: '金融保险', value: 1234 },
          { type: '医疗卫生', value: 868 },
          { type: '社会公共管理', value: 672 },
          { type: 'IT 通讯电子', value: 491 },
          { type: '教育', value: 367 },
          { type: '建筑房地产', value: 251 },
          { type: '交通运输与仓储邮政', value: 142 },
          { type: '住宿旅游', value: 103 },
          { type: '建材家居', value: 85 },
          { type: '汽车', value: 34 },
        ]}
        options={{
          height: 300,
          position: 'type*value',
          adjust: 'table',
        }}
      />
    </Panel>
  )
}

SaleRankAmount.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default SaleRankAmount
