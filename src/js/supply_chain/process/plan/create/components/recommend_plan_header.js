import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const RecommendPlanHeader = (props) => {
  const { activeStep } = props

  return (
    <Flex row className='b-recommend-plan-header'>
      <Flex
        flex={1}
        alignCenter
        justifyCenter
        className={classNames('b-recommend-plan-header-first-step', {
          active: activeStep === 1,
        })}
      >
        {t('第一步：选择智能推荐算法与配置')}
      </Flex>
      <div
        className={classNames('b-recommend-plan-header-triangle', {
          'first-active': activeStep === 1,
          'second-active': activeStep === 2,
        })}
      />
      <Flex
        flex={1}
        alignCenter
        justifyCenter
        className={classNames('b-recommend-plan-header-second-step', {
          active: activeStep === 2,
        })}
      >
        {t('第二步：查看结果并加入生产计划')}
      </Flex>
    </Flex>
  )
}

RecommendPlanHeader.propTypes = {
  activeStep: PropTypes.number.isRequired,
}

export default RecommendPlanHeader
