import { Flex, Radio, RadioGroup, Button } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import orderStore from '../store/store_order'
import spuStore from '../store/store_spu'
import { openNewTab } from 'common/util'

@observer
class PopupPrint extends React.Component {
  store = null

  handlePrint = () => {
    const { params, view } = this.props
    openNewTab(params + '&template=' + view + '_' + this.store.printTemplate)
  }

  getStore = (view) => {
    if (view === 'order') {
      this.store = orderStore
      return orderStore
    } else if (view === 'spu') {
      this.store = spuStore
      return spuStore
    }
  }

  render() {
    const { view, templates } = this.props
    const { printTemplate, changePrintTemplate } = this.getStore(view)

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

        <RadioGroup
          name='pick_print_popup'
          value={printTemplate}
          onChange={changePrintTemplate}
          className='gm-padding-right-15 b-distribute-order-popup-temp-radio'
        >
          {templates.map((item) => {
            return (
              <Radio value={item.type} key={item.type}>
                <span>{item.name}</span>
              </Radio>
            )
          })}
        </RadioGroup>
      </Flex>
    )
  }
}

PopupPrint.propTypes = {
  view: PropTypes.string.isRequired,
  templates: PropTypes.array.isRequired,
  params: PropTypes.string,
}

export default PopupPrint
