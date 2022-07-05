import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, RadioGroup, Radio, Storage, Button } from '@gmfe/react'

class SidePrintModal extends React.Component {
  constructor(props) {
    super(props)
    let { name, templates } = this.props
    // 记住之前选中的模板
    let curType = Storage.get(name)
    const tem = templates.find((o) => o.type === curType)
    this.state = {
      curType: (tem && tem.type) || templates[0].type,
    }
  }

  componentWillUnmount() {
    Storage.set(this.props.name, this.state.curType)
  }

  handlePrint() {
    const { onPrint, templates } = this.props
    const { curType } = this.state
    const obj = templates.find((o) => o.type === curType)

    onPrint(obj)
  }

  handleChangePrintTemp = (v) => {
    this.setState({
      curType: v,
    })
  }

  render() {
    const { templates } = this.props
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
          <Button type='primary' onClick={this.handlePrint.bind(this)}>
            {i18next.t('打印')}
          </Button>
        </Flex>

        <RadioGroup
          value={this.state.curType}
          onChange={this.handleChangePrintTemp}
          className='gm-padding-right-15 b-distribute-order-popup-temp-radio'
        >
          {templates.map((item) => {
            return (
              <Radio value={item.type} key={item.type}>
                <span>{item.name}</span>
                {item.desc && (
                  <div style={{ marginLeft: '20px' }} className='gm-text-desc'>
                    {item.desc}
                  </div>
                )}
              </Radio>
            )
          })}
        </RadioGroup>
      </Flex>
    )
  }
}

export default SidePrintModal
