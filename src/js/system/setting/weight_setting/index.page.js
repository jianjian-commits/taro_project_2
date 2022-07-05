import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  RadioGroup,
  Radio,
  Select,
  Flex,
  Tip,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import weightStore from '../../../stores/weight'
import globalStore from '../../../stores/global'
import bridge from '../../../bridge'
import DragWeight from '../../../common/components/weight/drag_weight'

@observer
class WeightSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      precision: weightStore.precision || 1,
      weightUnit: weightStore.weightUnit || i18next.t('公斤'),
      isReverse: weightStore.isReverse || 0,
      electronic_type: weightStore.selectedDevice || i18next.t('无限量'),
      isInstallMesApp: false,
    }

    this.refform = React.createRef()
  }

  componentDidMount() {
    if (
      globalStore.groundWeightInfo.weigh_stock_in ||
      globalStore.groundWeightInfo.weigh_check
    ) {
      bridge.mes_app.isInstalledChromeMesApp()
      bridge.mes_app.getWeightData()
      weightStore.start()
    }
  }

  handleChangeRadio = (name, value) => {
    this.setState({
      [name]: value,
    })
  }

  handleConnectWeight = () => {
    if (
      globalStore.groundWeightInfo.weigh_stock_in ||
      globalStore.groundWeightInfo.weigh_check
    ) {
      bridge.mes_app.connectWeight()
      bridge.mes_app.getWeightData()
      weightStore.start()
    }
  }

  handleSave = () => {
    const { precision, weightUnit, isReverse, electronic_type } = this.state
    weightStore.setPrecision(precision)
    weightStore.setWeightUnit(weightUnit)
    weightStore.setIsReverse(isReverse)
    weightStore.setSelectedDevice(electronic_type)

    Tip.success('保存成功')
  }

  render() {
    const { precision, weightUnit, isReverse, electronic_type } = this.state
    return (
      <FormGroup
        disabled={!globalStore.hasPermission('edit_weighing_config')}
        formRefs={[this.refform]}
        onSubmit={this.handleSave}
      >
        <FormPanel title={i18next.t('地磅设置')}>
          <Form labelWidth='180px' ref={this.refform}>
            <FormItem label={i18next.t('电子秤读数位数')}>
              <RadioGroup
                name='precision'
                value={precision}
                inline
                onChange={(value) => this.handleChangeRadio('precision', value)}
              >
                <Radio value={1}>1</Radio>
                <Radio value={2}>2</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label={i18next.t('电子秤读数单位')}>
              <RadioGroup
                name='kg_or_g'
                value={weightUnit}
                inline
                onChange={(value) =>
                  this.handleChangeRadio('weightUnit', value)
                }
              >
                <Radio value={i18next.t('公斤')}>{i18next.t('公斤')}</Radio>
                <Radio value={i18next.t('斤')}>{i18next.t('斤')}</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label={i18next.t('电子秤读数顺序')}>
              <RadioGroup
                name='isReverse'
                value={isReverse}
                inline
                onChange={(value) => this.handleChangeRadio('isReverse', value)}
              >
                <Radio value={1}>{i18next.t('反序')}</Radio>
                <Radio value={0}>{i18next.t('正序')}</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label={i18next.t('电子秤型号')}>
              <Select
                onChange={(value) =>
                  this.handleChangeRadio('electronic_type', value)
                }
                value={electronic_type}
                data={_.map(weightStore.deviceList, (device) => ({
                  value: device,
                  text: device,
                }))}
              />
            </FormItem>
            <FormItem label={i18next.t('电子秤数据')}>
              <Flex
                alignCenter
                className='gm-text-desc'
                style={{ height: '30px' }}
              >
                {weightStore.data + weightUnit}
              </Flex>
            </FormItem>
            <FormItem label={i18next.t('电子秤连接')}>
              <Button onClick={() => this.handleConnectWeight()}>
                {i18next.t('连接串口')}
              </Button>
            </FormItem>
            <FormItem label={i18next.t('电子秤插件')} unLabelTop>
              <a
                href='https://station.guanmai.cn/gm_help/download'
                target='_blank'
                rel='noopener noreferrer'
              >
                {i18next.t('Chrome_MES_助手')}
              </a>
            </FormItem>
          </Form>
        </FormPanel>
        <DragWeight />
      </FormGroup>
    )
  }
}

export default WeightSetting
