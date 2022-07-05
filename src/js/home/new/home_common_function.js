import { t } from 'gm-i18n'
import React, { useMemo, useState } from 'react'
import {
  Flex,
  Form,
  FormButton,
  CheckboxGroup,
  Checkbox,
  Modal,
  Tip,
  Button,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import store from './cf_store'
import Panel from 'common/components/dashboard/panel'

const ComputedCheckbox = ({ item, selected, onChange, subs, bold }) => {
  // 三级路由确定一个模块，原本的方式不适用
  const isChecked = useMemo(
    () =>
      _.filter(selected, (v) => subs.includes(v)).length === subs.length &&
      !!subs.length,
    [selected, subs],
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
  const [selected, setSelected] = useState(store.configList.slice())

  const subOne = (item) => {
    return _.reduce(
      item.sub,
      (pre, two) => [...pre, ..._.map(two.sub, (three) => three.link)],
      [],
    )
  }
  const subTwo = (item) => {
    return _.map(item.sub, (v) => v.link)
  }

  const handleSubmit = () => {
    store.postConfigList(selected).then(() => {
      store.fetchConfigList()
      Tip.success(t('保存成功'))
    })
    Modal.hide()
  }

  const handleSelected = (selected) => {
    setSelected([...selected])
  }

  return (
    <Form onSubmit={handleSubmit} className='gm-text-12'>
      <div>
        {_.map(store.navConfig, (one, i) => (
          <div key={`${i}${one.link}`}>
            <ComputedCheckbox
              item={one}
              subs={subOne(one)}
              selected={selected}
              onChange={handleSelected}
            />
            {_.map(one.sub, (two, i) => (
              <div key={`${i}${two.link}`}>
                <Flex alignStart className='gm-margin-tb-10 gm-margin-left-20'>
                  <ComputedCheckbox
                    bold
                    item={two}
                    subs={subTwo(two)}
                    selected={selected}
                    onChange={handleSelected}
                  />
                  <CheckboxGroup
                    inline
                    name={two.link}
                    value={selected}
                    onChange={handleSelected}
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
          {t('保存')}
        </Button>
      </FormButton>
    </Form>
  )
})

@observer
class CommonFunction extends React.Component {
  tipRef = React.createRef()

  componentDidMount() {
    store.fetchConfigList()
  }

  handleConfig = () => {
    Modal.render({
      title: t('配置快捷入口'),
      children: <Modify />,
      size: 'lg',
      onHide: Modal.hide,
    })
  }

  render() {
    const { className } = this.props
    return (
      <Panel
        className={classNames(
          'b-home-commmon-function gm-flex-flex',
          className,
        )}
        title={t('快捷入口')}
        right={
          <span
            className='gm-text-12 gm-text-primary gm-cursor'
            onClick={this.handleConfig}
          >
            {t('自定义设置')}
          </span>
        }
      >
        {store.configList.length ? (
          <Flex
            wrap
            alignContentStart
            className='gm-overflow'
            style={{ maxHeight: '200px' }}
          >
            {_.map(store.configList, (link) => (
              <a
                key={link}
                href={'#' + link}
                target='_blank'
                rel='noopener noreferrer'
                className='function-item-new'
              >
                {store.allConfigMap[link]}
              </a>
            ))}
          </Flex>
        ) : (
          <Flex justifyCenter alignCenter className='gm-text-desc'>
            {t('当前无快捷入口,请先进行')}&nbsp;
            <a
              onClick={this.handleConfig}
              className='gm-text-primary gm-inline-block gm-cursor'
            >
              {t('配置')}
            </a>
          </Flex>
        )}
      </Panel>
    )
  }
}

CommonFunction.propTypes = {
  className: PropTypes.string,
}

export default CommonFunction
