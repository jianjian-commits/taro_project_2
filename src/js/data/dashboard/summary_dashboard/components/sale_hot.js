import React from 'react'
import { Flex, Button } from '@gmfe/react'
import { Pie as PieChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'

const SaleHot = ({ className }) => {
  return (
    <Panel
      title={t('热销分类')}
      className={classNames('gm-bg', className)}
      right={
        <Flex>
          <Button>{t('一级分类')}</Button>
          <Button>{t('二级分类')}</Button>
        </Flex>
      }
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

SaleHot.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default SaleHot
