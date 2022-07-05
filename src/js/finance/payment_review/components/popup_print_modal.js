import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, RadioGroup, Radio, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import { openNewTab } from '../../../common/util'
import { connect } from 'react-redux'
import store from '../store'
import { observer } from 'mobx-react'
import qs from 'query-string'
import globalStore from '../../../stores/global'

@connect((state) => ({ product: state.product }))
@observer
class PopupPrintModal extends React.Component {
  componentDidMount() {
    store.getTemplateList()
  }

  handlePrint = () => {
    const { closeModal, id } = this.props
    console.log(this.props)
    const params = {
      template_id: store.templateID,
      data_id: id,
    }
    openNewTab(
      `#/system/setting/distribute_templete/settle_printer?${qs.stringify(
        params
      )}`
    )
    closeModal()
  }

  render() {
    const { templateList, templateID, setTemplate } = store
    const canEdit = globalStore.hasPermission('edit_settle_print_config')

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
          <Button onClick={this.handlePrint} type='primary'>
            {i18next.t('打印')}
          </Button>
        </Flex>
        <div>
          <div>{i18next.t('选择结款单模板')}:</div>
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
                    href={`#/system/setting/distribute_templete/settle_editor?template_id=${item.id}`}
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
  closeModal: PropTypes.func.isRequired,
  id: PropTypes.string,
}

export default PopupPrintModal
