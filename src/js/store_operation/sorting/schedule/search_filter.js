import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Box, Form, FormItem, FormButton, Button, Flex } from '@gmfe/react'
import DBActionStorage from 'gm-service/src/action_storage'

import SortingDatePicker from '../sorting_date_picker'
import scheduleStore from './store'
import store from '../store'

import globalStore from '../../../stores/global'
import { judgeIfGoCarousel } from 'common/deal_rank_data'

import SvgNext from '../../../../svg/next.svg'
import OrderTypeSelector from '../../../common/components/order_type_selector'

@observer
class SearchFilter extends React.Component {
  async componentDidMount() {
    await store.getServiceTime().then((serviceTime) => {
      const { time_config_id } = scheduleStore.filter
      const { validateServiceTimeId } = DBActionStorage.helper
      // 校验下 运营周期存在则保存 不存在默认取第一个
      validateServiceTimeId(time_config_id, serviceTime, (val) => {
        scheduleStore.setFilter('time_config_id', val)
      })
    })
    scheduleStore.fetchData()
    scheduleStore.getOrderScheduleData()
    scheduleStore.getMerchandiseScheduleData()
  }

  // 运营周期
  handleChangeTimeConfigId = (time_config_id) => {
    scheduleStore.setFilter('time_config_id', time_config_id)
  }

  // 选择日期
  handleChangeDate = (target_date) => {
    scheduleStore.setFilterDate(target_date)
  }

  handleSearch = () => {
    scheduleStore.fetchData()
    scheduleStore.getOrderScheduleData()
    scheduleStore.getMerchandiseScheduleData()
  }

  handleScreening = () => {
    const {
      time_config_id,
      target_date,
      order_process_type_id,
    } = scheduleStore.storageFilter

    judgeIfGoCarousel(4, {
      pathname: '/supply_chain/sorting/schedule/full_screen',
      query: {
        time_config_id,
        target_date,
        order_process_type_id,
      },
    })
  }

  render() {
    const { serviceTime } = store
    const { target_date, time_config_id, orderType } = scheduleStore.filter
    const canSortingScreen = globalStore.hasPermission('get_sorting_screen')
    const { isCStation } = globalStore.otherInfo

    return (
      <Box hasGap>
        <Flex justifyBetween>
          <Form inline colWidth='220px' onSubmit={this.handleSearch}>
            <FormItem col={2} label={i18next.t('按运营周期')}>
              <SortingDatePicker
                date={target_date}
                serviceTimes={serviceTime}
                timeConfigId={time_config_id}
                onChangeDate={this.handleChangeDate}
                onChangeTimeConfigId={this.handleChangeTimeConfigId}
              />
            </FormItem>
            {!isCStation && (
              <FormItem label={i18next.t('订单类型')}>
                <OrderTypeSelector
                  orderType={orderType}
                  onChange={(value) =>
                    scheduleStore.setFilter('orderType', value)
                  }
                />
              </FormItem>
            )}
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </Form>
          {canSortingScreen ? (
            <Button type='primary' plain onClick={this.handleScreening}>
              {i18next.t('投屏模式')}&nbsp;
              <SvgNext />
            </Button>
          ) : null}
        </Flex>
      </Box>
    )
  }
}

export default SearchFilter
