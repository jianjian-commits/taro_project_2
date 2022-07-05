import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, RadioGroup, Radio, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import { openNewTab } from '../../../../common/util'
import store from '../store/list_store'
import { observer } from 'mobx-react'
import qs from 'query-string'
import globalStore from '../../../../stores/global'

@observer
class PopupPrintModal extends React.Component {
  componentDidMount() {
    store.getTemplateList()
  }

  handlePrint = () => {
    const { data_ids } = this.props

    let request_parameters
    if (data_ids.length > 0) {
      // 根据id数组打印
      request_parameters = JSON.stringify({
        ids: JSON.stringify(data_ids),
      })
    } else {
      // 根据筛选条件,打印所有单
      request_parameters = JSON.stringify(store.getReqDataList())
    }

    openNewTab(
      `#/system/setting/distribute_templete/stockout_printer?${qs.stringify({
        template_id: store.templateID,
        request_parameters,
      })}`
    )
  }

  render() {
    const { templateList, templateID, setTemplate } = store
    const canEdit = globalStore.hasPermission('edit_out_stock_print_config')

    return (
      <Flex
        column
        style={{ width: '300px' }}
        className='b-distribute-order-popup-right'
      >
        <Flex
          justifyBetween
          alignCenter
          className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
        >
          <h4>{i18next.t('选择单据模板')}</h4>
          <Button type='primary' onClick={this.handlePrint}>
            {i18next.t('打印')}
          </Button>
        </Flex>
        <div>
          <div>{i18next.t('选择出库单模板')}:</div>
          <RadioGroup
            name='template'
            value={templateID}
            onChange={setTemplate}
            className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
          >
            {templateList.map((item) => (
              <Radio value={item.id} key={item.id}>
                <span>{item.content.name}</span>
                {canEdit && (
                  <a
                    href={`#/system/setting/distribute_templete/stockout_editor?template_id=${item.id}`}
                    className='gm-text-12'
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {i18next.t('设置模板>')}
                  </a>
                )}
              </Radio>
            ))}
          </RadioGroup>
        </div>
      </Flex>
    )
  }
}

PopupPrintModal.propTypes = {
  data_ids: PropTypes.array, // 根据id数组打印单据
}

export default PopupPrintModal
