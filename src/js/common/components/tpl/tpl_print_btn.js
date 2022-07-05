import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Popover } from '@gmfe/react'
import PropTypes from 'prop-types'

const TplPrintBtn = ({ children, goToPrint, tplStore }) => {
  const { hidePrinterOptionsModal, syncObservableFromLocalstorage } = tplStore

  return (
    <Popover
      offset={-80}
      popup={
        hidePrinterOptionsModal ? (
          <div className='gm-padding-10'>
            <a
              className='gm-cursor'
              onClick={() => {
                syncObservableFromLocalstorage()
                goToPrint({ hideModal: false })
              }}
            >
              {i18next.t('点击拉取单据模板')}
            </a>
            ，{i18next.t('自主选择打印模板')}
          </div>
        ) : null
      }
      type='hover'
    >
      <span
        className='gm-inline-block'
        onClick={() => {
          syncObservableFromLocalstorage()
          goToPrint({ hideModal: hidePrinterOptionsModal })
        }}
      >
        {children}
      </span>
    </Popover>
  )
}

TplPrintBtn.propTypes = {
  goToPrint: PropTypes.func.isRequired,
  tplStore: PropTypes.object.isRequired,
}

export default observer(TplPrintBtn)
