import { observer } from 'mobx-react'
import React from 'react'
import { Checkbox, Flex } from '@gmfe/react'
import printerOptionsStore from '../printer_options_store'
import { i18next } from 'gm-i18n'

@observer
class TogglePrinterTemplateVersion extends React.Component {
  handleChangeTemplateVersion(e) {
    e.preventDefault()
    printerOptionsStore.toggleTemplateVersion()
  }

  render() {
    const {
      isOldVersion,
      isVersionSwitcherShow,
      hidePrinterOptionsModal,
      setOptions,
    } = printerOptionsStore

    return (
      <Flex justifyBetween>
        <Checkbox
          inline
          checked={hidePrinterOptionsModal}
          value={hidePrinterOptionsModal}
          onChange={(e) =>
            setOptions('hidePrinterOptionsModal', e.currentTarget.checked)
          }
        >
          {i18next.t('不再弹出单据模板选择窗口')}
        </Checkbox>
        {isVersionSwitcherShow && (
          <a
            className='gm-padding-right-15 text-right gm-padding-top-5 gm-cursor'
            onClick={this.handleChangeTemplateVersion}
          >
            {isOldVersion ? i18next.t('切至新模板') : i18next.t('切回旧模板')}
          </a>
        )}
      </Flex>
    )
  }
}

export default TogglePrinterTemplateVersion
