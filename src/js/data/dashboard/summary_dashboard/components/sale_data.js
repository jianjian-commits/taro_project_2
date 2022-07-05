import React from 'react'
import { Flex, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styled from 'styled-components'

import Panel from 'common/components/dashboard/panel'
import SortModal from 'common/components/dashboard/sort_modal'
import Bulletin from 'common/components/dashboard/bulletin'

const core = [1, 2, 3, 4, 5, 6]

const infos = {
  1: {
    text: '1',
    value: 1,
    preValue: '1',
  },
  2: {
    text: '2',
    value: 2,
    preValue: '2',
  },
  3: {
    text: '3',
    value: 3,
    preValue: '3',
  },
  4: {
    text: '4',
    value: 4,
    preValue: '4',
  },
  5: {
    text: '4',
    value: 4,
    preValue: '4',
  },
  6: {
    text: '4',
    value: 4,
    preValue: '4',
  },
  7: {
    text: '4',
    value: 4,
    preValue: '4',
  },
}

const GridContainer = styled.div`
  display: grid;
  background-color: #ffff;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
`

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
      <GridContainer>
        {core.map((key, index) => {
          return <Bulletin key={key} flip options={infos[key]} />
        })}
      </GridContainer>
    </Panel>
  )
}

SaleData.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default SaleData
