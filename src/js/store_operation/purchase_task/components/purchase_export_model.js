import React, { useState, useEffect } from 'react'
import { i18next, t } from 'gm-i18n'
import { Flex, Button, RadioGroup, Radio, Storage } from '@gmfe/react'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { customerExport as purchaseExport } from '../../../export/customer'

const KEY = 'purchase_export_template'
const PurchaseExportModal = observer((props) => {
  const [templateId, setTemplateId] = useState(
    Storage.get(KEY) === null ? -1 : Storage.get(KEY),
  )
  const [templateList, setTemplateList] = useState([])

  useEffect(() => {
    handleGetTemplate()
  }, [])

  const handleGetTemplate = () => {
    Request('/fe/purchase_tpl/list')
      .get()
      .then((json) => {
        const list = _.sortBy(json.data, 'create_time')
        const templateList = _.map(list, (item) => {
          return {
            name: item.content.name,
            id: item.id,
            is_default: item.is_default,
          }
        })
        setTemplateList(templateList)
      })
  }
  const handleExport = async (templateId) => {
    if (templateId === -1) {
      props.onHandleBatchExport()
    } else {
      // purchaseExport(props.query, templateId, true)
      const templateName = _.find(
        templateList,
        (item) => item.id === templateId,
      ).name
      console.log('purchase_export_model', templateId)
      props.onHandleBatchExport(templateId, templateName)
    }
    props.closeModal()
  }

  const handleSetTemplateId = (id) => {
    setTemplateId(id)
    Storage.set(KEY, id)
  }

  return (
    <Flex column className='b-distribute-order-popup-right'>
      <Flex
        justifyBetween
        alignCenter
        className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
      >
        <h4>{t('选择单据模板')}</h4>
        <Button type='primary' onClick={handleExport.bind(null, templateId)}>
          {t('导出')}
        </Button>
      </Flex>
      <ExportTemplateRadioGroup
        templateList={templateList}
        templateId={templateId}
        handleRadioChange={handleSetTemplateId}
        onHandleShowSetModal={props.onHandleShowSetModal}
      />
    </Flex>
  )
})

const ExportTemplateRadioGroup = (props) => {
  const handleChangeExportTemp = (id) => {
    // const templateName = _.find(props.templateList, (item) => item.id === id)
    const handleRadioChange = props.handleRadioChange
    handleRadioChange && handleRadioChange(id)
  }

  const temDetailURL = '#/system/setting/distribute_templete/purchase_editor'

  return (
    <div className='gm-padding-top-10'>
      <div>{i18next.t('选择采购单模板')}:</div>
      <RadioGroup
        name='template'
        value={props.templateId}
        onChange={handleChangeExportTemp}
        className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
      >
        <Radio value={-1} key={-1}>
          <span>{i18next.t('固定模板')}</span>
          <a className='gm-cursor' onClick={props.onHandleShowSetModal}>
            {i18next.t('设置导出字段')}
          </a>
        </Radio>
        {props.templateList.map((item) => (
          <Radio value={item.id} key={item.id}>
            <span>{item.name}</span>

            <a
              href={`${temDetailURL}?template_id=${item.id}`}
              className='gm-text-12'
              target='_blank'
              rel='noopener noreferrer'
            >
              {i18next.t('设置模板>')}
            </a>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  )
}

ExportTemplateRadioGroup.propTypes = {
  templateList: PropTypes.array.isRequired,
  templateId: PropTypes.number.isRequired,
  handleRadioChange: PropTypes.func.isRequired,
  onHandleShowSetModal: PropTypes.func,
}

export default PurchaseExportModal
