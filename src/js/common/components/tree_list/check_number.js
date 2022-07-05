import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { SvgRemove } from 'gm-svg'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import SVGBusiness from '../../../../svg/business.svg'
import SVGDeleted from '../../../../svg/deleted.svg'
const Icon = styled.span`
  padding-right: 4px;
`

const CheckNumber = (props) => {
  const {
    data,
    handleMoveCategory,
    clearCheckData,
    onHandleBatchDelete,
    isChecked,
  } = props
  const [show, changeShow] = useState(true)

  useEffect(() => {
    changeShow(true)
  }, [show])

  const handleToggle = () => {
    changeShow(!show)
    clearCheckData()
  }

  const getClickText = (e) => {
    onHandleBatchDelete(e.target.innerText)
  }

  const renderButton = () => (
    <Flex className='station-tree-number-tab' alignCenter row>
      <SvgRemove onClick={handleToggle} className='gm-cursor' />
      <div className='gm-gap-10' />
      <span className='station-tree-number-tab-number'>
        {t('已选择商品')}
        <span>{data.length}</span>
        {t('项')}
      </span>
      <div className='gm-margin-lr-15'>|</div>
      <div
        className='station-tree-number-tab-button gm-cursor'
        onClick={handleMoveCategory}
      >
        <Icon>
          <SVGBusiness />
        </Icon>
        {t('转移商品分类')}
      </div>
      <div
        className='station-tree-number-tab-button gm-cursor gm-margin-left-15'
        onClick={getClickText}
      >
        <Icon>
          <SVGDeleted />
        </Icon>
        {t('删除一级分类')}
      </div>
      <div
        className='station-tree-number-tab-button gm-cursor gm-margin-left-15'
        onClick={getClickText}
      >
        <Icon>
          <SVGDeleted />
        </Icon>
        {t('删除二级分类')}
      </div>
      <div
        className='station-tree-number-tab-button gm-cursor gm-margin-left-15'
        onClick={getClickText}
      >
        <Icon>
          <SVGDeleted />
        </Icon>
        {t('删除商品品类')}
      </div>
    </Flex>
  )

  // return show && (data.length ? renderButton() : null)
  return show && (isChecked ? renderButton() : null)
}

CheckNumber.propTypes = {
  data: PropTypes.array.isRequired,
  isChecked: PropTypes.bool,
  handleMoveCategory: PropTypes.func,
  // 清空选中列表
  clearCheckData: PropTypes.func,
  // 点击批量删除商品一级分类、二级分类或品类
  onHandleBatchDelete: PropTypes.func,
}

export default CheckNumber
