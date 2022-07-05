import React from 'react'
import { Flex, Modal, Button } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import diyStore from '../store/diy_store'
import templates from './templates'
import SelectModuleList from './select_module'

const SelectImage = (props) => {
  const { image, title, onApply } = props

  return (
    <div className='gm-padding-20'>
      <Flex column className='gm-border'>
        <div style={{ width: '200px' }}>
          <img src={image} style={{ width: '100%' }} />
        </div>
        <Flex column>
          <Flex alignCenter justifyAround className='gm-margin-tb-10'>
            <div style={{ fontSize: '14px' }}>{title}</div>
            <Button
              type='primary'
              plain
              onClick={() => {
                onApply()
              }}
            >
              {i18next.t('立即应用')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </div>
  )
}

const TemplateShower = (props) => {
  const handleClick = (i) => {
    // 得到对应模板的配置
    let { config } = templates[i]
    diyStore.setConfig(config)
    SelectModuleList.externalSetActive(0)
    Modal.hide()
  }
  return (
    <Flex justifyAround>
      {templates.map((tpl, index) => {
        return (
          <SelectImage
            key={index}
            image={tpl.image}
            title={tpl.title}
            onApply={handleClick.bind(null, index)}
          />
        )
      })}
    </Flex>
  )
}

export default TemplateShower
