import React from 'react'
import { i18next } from 'gm-i18n'
import { Flex, Popover } from '@gmfe/react'
import {
  SvgLeftTriangle,
  SvgUpTriangle,
  SvgDownTriangle,
  SvgRightTriangle,
  SvgQuestionCircleO,
} from 'gm-svg'

function Tips() {
  return (
    <Flex row className='gm-padding-tb-10'>
      <Flex column style={{ width: '80px' }} alignEnd>
        <Flex alignCenter className='gm-padding-bottom-10'>
          <SvgUpTriangle />
          <span>上键：</span>
        </Flex>
        <Flex
          alignCenter
          style={{ marginBottom: '17px' }}
          className='gm-padding-bottom-10'
        >
          <SvgDownTriangle />
          <span>下键：</span>
        </Flex>
        <Flex alignCenter className='gm-padding-bottom-10'>
          <SvgLeftTriangle />
          <span>左键：</span>
        </Flex>
        <Flex alignCenter className='gm-padding-bottom-10'>
          <SvgRightTriangle />
          <span>右键：</span>
        </Flex>
        <span style={{ height: '45px' }} className='gm-padding-bottom-10'>
          Enter&nbsp;&nbsp;
        </span>
        <span>Tab&nbsp;&nbsp;</span>
      </Flex>
      <Flex column style={{ width: '220px' }}>
        <span className='gm-padding-bottom-10'>列中编辑框间上移</span>
        <Flex
          column
          style={{ height: '45px' }}
          className='gm-padding-bottom-10'
        >
          <span>列中编辑框间下移</span>
          <span>下移至最后一个编辑框时可新增一行</span>
        </Flex>
        <span className='gm-padding-bottom-10'>行内编辑框间左移</span>
        <span className='gm-padding-bottom-10'>行内编辑框间右移</span>
        <Flex
          column
          style={{ height: '45px' }}
          className='gm-padding-bottom-10'
        >
          <span>编辑框间移动至下一个</span>
          <span>移动至最后一个编辑框时可新增一行</span>
        </Flex>
        <span className='gm-padding-bottom-10'>编辑框间移动至下一个</span>
      </Flex>
    </Flex>
  )
}

function KeyBoardTips() {
  return (
    <Flex row alignCenter className='gm-text-12'>
      <span className='gm-text' style={{ marginRight: '3px' }}>
        {i18next.t('全键盘说明')}
      </span>
      <Popover
        right
        showArrow
        type='hover'
        popup={<Tips />}
        component={<div />}
      >
        <span>
          <SvgQuestionCircleO className='gm-text' />
        </span>
      </Popover>
    </Flex>
  )
}

export default KeyBoardTips
