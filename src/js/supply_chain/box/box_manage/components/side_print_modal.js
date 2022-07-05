import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Button, RadioGroup, Radio } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { HideModalCheckbox } from 'common/components/tpl'

const SidePrintModal = ({ templates, onPrint, tplStore }) => {
  const handleChangePrintTemp = (tpl_id) => {
    tplStore.setObservable('tpl_id', tpl_id)
  }

  const handlePrint = () => {
    onPrint(tplStore.tpl_id)
  }

  return (
    <Flex column className='b-distribute-order-popup-right'>
      <Flex
        justifyBetween
        alignCenter
        className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
      >
        <h4>{i18next.t('选择箱签模板')}</h4>
        <Button type='primary' onClick={handlePrint}>
          {i18next.t('打印')}
        </Button>
      </Flex>

      <HideModalCheckbox
        onChange={tplStore.setObservable}
        checked={tplStore.hidePrinterOptionsModal}
      />

      <RadioGroup
        name='print_temp'
        value={tplStore.tpl_id}
        onChange={handleChangePrintTemp}
        className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-margin-top-5'
      >
        {_.map(templates, (item) => {
          const url = !item.id
            ? '#/system/setting/distribute_templete'
            : `#/system/setting/distribute_templete/box_label_editor?template_id=${item.id}`
          return (
            <Radio key={item.id} value={item.id}>
              <span>{item.name}</span>
              <a href={url} target='_blank' rel='noopener noreferrer'>
                {!item.id ? i18next.t('配置商户>') : i18next.t('设置模板>')}
              </a>
            </Radio>
          )
        })}
      </RadioGroup>
    </Flex>
  )
}

SidePrintModal.propTypes = {
  templates: PropTypes.array.isRequired,
  onPrint: PropTypes.func,
  tplStore: PropTypes.object,
}

export default observer(SidePrintModal)
