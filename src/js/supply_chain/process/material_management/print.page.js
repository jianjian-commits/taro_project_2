import React from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import JsBarcode from 'jsbarcode'

@observer
class MaterialPrint extends React.Component {
  componentDidMount() {
    const { code } = this.props.location.query
    JsBarcode('#material_code', code, { height: 50, fontSize: 14 })
    window.print()
    setTimeout(() => window.closeWindow(), 150)
  }

  render() {
    const { name } = this.props.location.query
    return (
      <Flex>
        <div style={{ padding: '5px', border: '1px solid black' }}>
          <div>
            <svg id='material_code' />
          </div>
          <div className='text-center' style={{ fontSize: '18px' }}>
            {name}
          </div>
        </div>
        <Flex flex />
      </Flex>
    )
  }
}

export default MaterialPrint
