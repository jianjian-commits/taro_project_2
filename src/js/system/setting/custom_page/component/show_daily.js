import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Switch, RadioGroup, Radio } from '@gmfe/react'
import { observer } from 'mobx-react'
import store from '../store/diy_store'

import { isCStationAndC } from 'common/service'
import { showDailyInfo, dailySectionName } from '../util'

@observer
class DiyDaily extends React.Component {
  handleChangeDispaly = (e) => {
    store.setDaily(e)
  }

  handleChangeType = (e) => {
    store.setDailType(e)
  }

  renderIntro = () => {
    if (store.daily_selection_type === 1) {
      return <div className='gm-text-desc'>{showDailyInfo()}</div>
    } else if (store.daily_selection_type === 2) {
      return (
        <div className='gm-text-desc'>
          {i18next.t(
            '根据商户历史下单情况，自动推荐展示商户近两周下单频次较高的50个商品；若无常用商品，将随机展示商户绑定报价单中的10个商品',
          )}
        </div>
      )
    }
  }

  render() {
    const { disabled } = this.props
    return (
      <>
        <div className='gm-text-desc gm-margin-bottom-20 gm-padding-top-5'>
          {showDailyInfo()}
        </div>
        <Flex column>
          <Flex>
            <div className='b-diy-setting-title'>{i18next.t('展示状态')}：</div>
            <Switch
              disabled={disabled}
              type='primary'
              checked={store.show_daily_selection}
              on={i18next.t('展示')}
              off={i18next.t('不展示')}
              onChange={this.handleChangeDispaly}
            />
          </Flex>
          <div style={{ margin: '6px 0 0 70px ' }} className='gm-text-desc'>
            {i18next.t(
              /* src:`控制${x}模块是否在商城展现` => tpl:控制${x}模块是否在商城展现 */ 'KEY_223',
              {
                x: dailySectionName(),
              },
            )}
          </div>
          {store.show_daily_selection && !isCStationAndC() && (
            <Flex column style={{ marginTop: '5px' }}>
              <Flex>
                <div className='b-diy-setting-title'>
                  {i18next.t('推荐类型')}：
                </div>
                <RadioGroup
                  inline
                  name='type'
                  style={{ margin: '3px 0 5px' }}
                  onChange={this.handleChangeType}
                  value={store.daily_selection_type}
                >
                  <Radio value={1}>{i18next.t('默认商品')}</Radio>
                  <Radio value={2}>{i18next.t('常用商品')}</Radio>
                </RadioGroup>
              </Flex>
              {this.renderIntro()}
            </Flex>
          )}
        </Flex>
      </>
    )
  }
}

DiyDaily.propTypes = {
  disabled: PropTypes.bool,
}

export default DiyDaily
