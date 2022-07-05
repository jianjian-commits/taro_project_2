import { i18next } from 'gm-i18n'
import React, { useMemo } from 'react'
import {
  Flex,
  Form,
  FormButton,
  CheckboxGroup,
  Checkbox,
  Modal,
  Tip,
  Button,
  Popover,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { observer } from 'mobx-react'

import cf from './cf_store'
import Panel from 'common/components/report/panel'
import styled from 'styled-components'
import SvgSetting from 'svg/setting.svg'

const IconTip = styled.div`
  padding: 8px;
`

const ComputedCheckbox = ({ item, selected, onChange, subs, bold }) => {
  // 三级路由确定一个模块，原本的方式不适用
  const isChecked = useMemo(
    () =>
      _.filter(selected, v => subs.includes(v)).length === subs.length &&
      !!subs.length,
    [selected, subs]
  )

  const handleChange = () => {
    if (isChecked) {
      // 取消全选
      const newSelected = _.pull(selected, ...subs)
      onChange(newSelected)
    } else {
      // 全选
      const newSelected = _.union(selected, subs)
      onChange(newSelected)
    }
  }

  return (
    <Checkbox
      style={{ width: '200px' }}
      checked={isChecked}
      onChange={handleChange}
    >
      <span style={{ color: 'black', fontWeight: bold ? 'bold' : '' }}>
        {item.name}
      </span>
    </Checkbox>
  )
}
ComputedCheckbox.propTypes = {
  item: PropTypes.object,
  selected: PropTypes.array,
  onChange: PropTypes.func,
  subs: PropTypes.array,
  bold: PropTypes.bool,
}

const Modify = observer(() => {
  const subOne = (item) => {
    return _.reduce(
      item.sub,
      (pre, two) => [...pre, ..._.map(two.sub, (three) => three.link)],
      []
    )
  }
  const subTwo = (item) => {
    return _.map(item.sub, (v) => v.link)
  }

  const handleSubmit = () => {
    cf.postConfigList().then(() => {
      Tip.success(i18next.t('保存成功'))
    })
    Modal.hide()
  }

  return (
    <Form onSubmit={handleSubmit} className='gm-text-12'>
      <div>
        {_.map(cf.navConfig, (one, i) => (
          <div key={`${i}${one.link}`}>
            <ComputedCheckbox
              item={one}
              subs={subOne(one)}
              selected={cf.configList.slice()}
              onChange={(selected) => cf.selectedItem(selected)}
            />
            {_.map(one.sub, (two, i) => (
              <div key={`${i}${two.link}`}>
                <Flex alignStart className='gm-margin-tb-10 gm-margin-left-20'>
                  <ComputedCheckbox
                    bold
                    item={two}
                    subs={subTwo(two)}
                    selected={cf.configList.slice()}
                    onChange={(selected) => cf.selectedItem(selected)}
                  />
                  <CheckboxGroup
                    inline
                    name={two.link}
                    value={cf.configList.slice()}
                    onChange={(selected) => cf.selectedItem(selected)}
                    className='gm-margin-bottom-0 gm-margin-top-0'
                  >
                    {_.map(two.sub, (there) => (
                      <Checkbox
                        key={there.link}
                        value={there.link}
                        style={{ width: '120px' }}
                      >
                        <span style={{ color: 'black' }}>{there.name}</span>
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </Flex>
              </div>
            ))}
          </div>
        ))}
      </div>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {i18next.t('保存')}
        </Button>
      </FormButton>
    </Form>
  )
})

@observer
class CommonFunction extends React.Component {
  tipRef = React.createRef()

  componentDidMount() {
    cf.fetchConfigList()
  }

  handleConfig = () => {
    this.tipRef.current.apiDoSetActive()
    Modal.render({
      title: i18next.t('配置常用功能'),
      children: <Modify />,
      size: 'lg',
      onHide: Modal.hide,
    })
  }

  render() {
    return (
      <Panel
        className='b-home-commmon-function'
        title={i18next.t('常用功能')}
        right={
          <Popover
            ref={this.tipRef}
            type='hover'
            popup={<IconTip>{i18next.t('自定义设置')}</IconTip>}
            right
            showArrow
            offset={8}
          >
            <span onClick={this.handleConfig}>
              <SvgSetting className='gm-cursor gm-text-14 icon-setting' />
            </span>
          </Popover>
        }
      >
        {cf.configList.length ? (
          <Flex wrap height='146px' alignContentStart className='gm-overflow'>
            {_.map(cf.configList, (link) => (
              <a
                key={link}
                href={'#' + link}
                target='_blank'
                rel='noopener noreferrer'
                className='function-item'
              >
                {cf.allConfigMap[link]}
              </a>
            ))}
          </Flex>
        ) : (
          <Flex
            justifyCenter
            alignCenter
            className='gm-text-desc'
            style={{ height: '146px' }}
          >
            {i18next.t('当前无常用功能,请先进行')}&nbsp;
            <a
              onClick={this.handleConfig}
              className='gm-text-primary gm-inline-block gm-cursor'
            >
              {i18next.t('配置')}
            </a>
          </Flex>
        )}
      </Panel>
    )
  }
}

export default CommonFunction
