import { t } from 'gm-i18n'
import React from 'react'
import { Flex, Modal, Storage, Tip, Button } from '@gmfe/react'

import SvgSetting from 'svg/setting.svg'
import { Request } from '@gm-common/request'
import SortModal from './components/sort_modal'
import Panel from 'common/components/report/panel'
import Bulletin from 'common/components/report/bulletin'
import { bulletinConfig } from './util'
import { TableXUtil } from '@gmfe/table-x'
import SvgNext from 'svg/next.svg'
import PropTypes from 'prop-types'
import { initOrderType } from 'common/enum'
import { getOrderTypeId } from 'common/deal_order_process'
import OrderTypeSelector from 'common/components/order_type_selector'
import { judgeIfGoCarousel } from 'common/deal_rank_data'

import globalStore from 'stores/global'

class OperatingBulletin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      core: Storage.get('operating_bulletin') || [
        'order_num',
        'place_order_money',
        'customer_price',
        'new_customer_num',
      ],
      infos: '',
      updateTime: '',
      orderType: initOrderType,
    }
  }

  fetchData(orderType) {
    let query = {}
    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      query = {
        ...query,
        order_process_type_id,
      }
    }

    return Request('/home_page/data_analyse/lasted_orders_count_new')
      .data(query)
      .get()
      .then((json) => {
        const { today, yesterday, last_sycn_time } = json.data
        const infos = this.doTransform(today, yesterday)
        this.setState({ infos, orderType, updateTime: last_sycn_time })
      })
  }

  componentDidMount() {
    this.fetchData(this.state.orderType)
  }

  handleConfig = (infos) => {
    Modal.render({
      title: t('运营简报'),
      size: 'lg',
      children: (
        <SortModal
          infos={infos}
          onConfirm={this.handleSort}
          core={this.state.core}
        />
      ),
      onHide: Modal.hide,
    })
  }

  handleSort = (core) => {
    this.setState({ core })
    Storage.set('operating_bulletin', core)
    Tip.success('保存成功')
  }

  handleOrderTypeChange = (orderType) => {
    this.fetchData(orderType)
  }

  doTransform = (today, yesterday) => {
    const ret = {}
    for (const key in today) {
      ret[key] = {
        tAcount: bulletinConfig(key, today[key]).tAcount,
        tName: bulletinConfig(key).tName,
        color: bulletinConfig(key).color,
        tLink: bulletinConfig(key).tLink,
        yLink: bulletinConfig(key).yLink,
      }
    }
    for (const key in yesterday) {
      ret[key] = {
        ...ret[key],
        yAcount: bulletinConfig(key, null, yesterday[key]).yAcount,
        yName: bulletinConfig(key).yName,
        tLink: bulletinConfig(key).tLink,
        yLink: bulletinConfig(key).yLink,
      }
    }
    return ret
  }

  handleFullScreen = () => {
    judgeIfGoCarousel(1, '/home/old/full_screen')
  }

  render() {
    const { infos, core, updateTime, orderType } = this.state
    const { isCStation } = globalStore.otherInfo

    return (
      <Panel
        title={
          <>
            <span className='gm-margin-right-15'>{t('运营简报')}</span>
            {updateTime && (
              <span className='gm-text-desc'>
                {t('更新时间：') + updateTime}
              </span>
            )}
          </>
        }
        right={
          <Flex alignCenter style={{ paddingBottom: 4 }}>
            {!isCStation && (
              <OrderTypeSelector
                className='gm-margin-right-10'
                style={{ width: '60px' }}
                orderType={orderType}
                onChange={this.handleOrderTypeChange}
              />
            )}
            {!this.props.isForeign && (
              <Button onClick={this.handleFullScreen}>
                {t('投屏模式')}&nbsp;
                <SvgNext />
              </Button>
            )}
            <TableXUtil.OperationIconTip tip={t('自定义设置')}>
              <span>
                <SvgSetting
                  className='gm-cursor gm-text-14 icon-setting gm-margin-left-10'
                  onClick={this.handleConfig.bind(this, infos)}
                />
              </span>
            </TableXUtil.OperationIconTip>
          </Flex>
        }
      >
        <Flex style={{ height: '146px' }} className='gm-text-white'>
          {core.map((key, index) => {
            return (
              infos && (
                <Bulletin
                  className={`gm-margin-10 b-home-bulletin-${index}`}
                  key={key}
                  flip
                  options={infos[key]}
                />
              )
            )
          })}
        </Flex>
      </Panel>
    )
  }
}
OperatingBulletin.propTypes = {
  isForeign: PropTypes.bool.isRequired,
}

export default OperatingBulletin
