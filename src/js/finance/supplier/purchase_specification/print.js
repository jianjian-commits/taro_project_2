import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import JsBarcode from 'jsbarcode'
import moment from 'moment'
import '../actions'
import '../reducer'
import actions from '../../../actions'

@observer
class PurchaseSpecificationPrint extends React.Component {
  constructor(props) {
    super(props)
    this.printRef = React.createRef()
    this.state = {
      code: '',
      name: '',
    }
  }

  componentDidMount() {
    const { id } = this.props.location.query
    actions
      .supplier_get_purchase_specification_list({
        offset: 0,
        limit: 10,
        search_text: id,
      })
      .then((json) => {
        const list = json.purchase_spec
        if (list.length && list[0].barcode) {
          this.setState({
            code: list[0].barcode,
            name: list[0].name,
          })
          JsBarcode('#code', list[0].barcode, { height: 80, fontSize: 14 })
          const cssStyle = ` html, body {
            padding: 0;
            margin: 0;
          }
          body {
             width: calc(7cm - .2cm);
             height: calc(5cm - .3cm);
             overflow: hidden;
          }
          @page {
             margin: .3cm .2cm 0 .2cm;
          }  
          svg {
             width: calc(7cm - .7cm);
             height: calc(5cm - 2.4cm);
          }`
          const style = window.document.createElement('style')
          style.type = 'text/css'
          style.appendChild(window.document.createTextNode(cssStyle))
          window.document.head.appendChild(style)
          window.document.body.innerHTML = this.printRef.current.innerHTML
          window.print()
          setTimeout(() => window.closeWindow(), 1000)
        }
      })
  }

  render() {
    return (
      <div
        className='gm-flex'
        ref={this.printRef}
        style={{ backgroundColor: 'white' }}
      >
        <Flex alignContentStart>
          {i18next.t('打印')}：{moment(new Date()).format('YYYY-MM-DD')}
        </Flex>
        <Flex column style={{ padding: '0px 5px' }}>
          <Flex
            justifyCenter
            style={{ fontSize: '18px', borderBottom: '1px solid black' }}
          >
            <Flex
              alignCenter
              style={{
                textAlign: 'center',
                height: '52px',
                marginBottom: '3px',
              }}
            >
              <div>{this.state.name}</div>
            </Flex>
          </Flex>
          <Flex justifyCenter>
            <svg id='code' />
          </Flex>
        </Flex>
      </div>
    )
  }
}

export default PurchaseSpecificationPrint
