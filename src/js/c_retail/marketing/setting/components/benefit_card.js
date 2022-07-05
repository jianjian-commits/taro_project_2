import React from 'react'
import { t } from 'gm-i18n'
import { Checkbox, Flex, Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const BenefitCard = ({
  title,
  icon,
  onSetting,
  desc,
  checked,
  onCheck,
  dataKey,
  tip,
}) => {
  const handleCheck = (e) => {
    onCheck(e.target.name, !checked)
  }

  const handleSetting = () => {
    onSetting(dataKey)
  }

  return (
    <Container
      className='gm-padding-10 gm-margin-right-20'
      alignStart
      justifyBetween
    >
      <Checkbox
        name={dataKey}
        checked={checked}
        onChange={handleCheck}
        className='station-tree-checkbox'
      />
      <Flex flex={1}>
        <IconBox>{icon}</IconBox>
        <div className='gm-margin-left-5'>
          <div className='gm-margin-bottom-10'>{title}</div>
          <div className='gm-text-desc'>{desc}</div>
        </div>
      </Flex>
      <Popover
        type='hover'
        right
        offset={5}
        height={200}
        popup={<div className='gm-padding-5'>{tip || ''}</div>}
      >
        <Link onClick={handleSetting}>{t('点击设置')}</Link>
      </Popover>
    </Container>
  )
}

BenefitCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  desc: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onSetting: PropTypes.func,
  onCheck: PropTypes.func,
  dataKey: PropTypes.string,
  tip: PropTypes.string,
}

BenefitCard.defaultProps = {
  onSetting: () => null,
  onCheck: () => false,
}

const Container = styled(Flex)`
  border: 1px solid #56a3f2;
  border-radius: 5px;
  background-color: rgba(178, 213, 255, 0.2);
  width: 260px;
`

const Link = styled.a`
  text-decoration: underline;
  color: #17233d;
  cursor: pointer;
`

const IconBox = styled.div`
  & * {
    width: 20px;
    height: 20px;
  }
`

export default BenefitCard
