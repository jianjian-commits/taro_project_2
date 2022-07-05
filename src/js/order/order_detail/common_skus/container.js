import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { Flex } from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'

import { isStation, getReceiveTime } from '../../util'
import { convertNumber2Sid } from 'common/filter'
import orderStore from '../../store'
import store from './store'

@observer
class CommonSkuMsg extends React.Component {
  render() {
    const { orderDetail } = orderStore
    const { list } = store
    const { customer, time_config_info, viewType, repair } = orderDetail
    const hasCustomer = !_.isEmpty(customer)

    let receive_time = '-'
    if (hasCustomer) {
      if (viewType === 'view' || (repair && viewType === 'edit')) {
        receive_time =
          customer.receive_begin_time + '~' + customer.receive_end_time
      } else {
        const { receive_begin_time, receive_end_time } = getReceiveTime(
          orderDetail
        )
        receive_time = receive_begin_time + '~' + receive_end_time
      }
    }

    return (
      <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
        <div>
          <strong
            className='gm-padding-left-5 gm-text-14'
            style={{ borderLeft: '3px solid rgb(54, 173, 58)' }}
          >
            {i18next.t('常用商品列表')}（{list.length}）
          </strong>
        </div>
        <Flex wrap className='gm-padding-top-15'>
          <span className='gm-margin-right-15'>
            {i18next.t('商户')}：
            {hasCustomer ? (
              <span>
                {`${customer.extender.resname}/${
                  isStation(customer.address_id)
                    ? customer.address_id
                    : convertNumber2Sid(customer.address_id)
                }`}
              </span>
            ) : (
              '-'
            )}
          </span>
          <span className='gm-margin-right-15'>
            {i18next.t('运营时间')}：
            {(time_config_info && time_config_info.name) || '-'}
          </span>
          <span className='gm-margin-right-15'>
            {i18next.t('收货时间')}：{receive_time}
          </span>
        </Flex>
      </div>
    )
  }
}

const Container = observer((props) => {
  const { search_text } = store
  useEffect(() => {
    store.getCommonSkuList()
  }, [])

  const handleSearchInputChange = (e) => {
    store.getCommonSkuList(e.target.value)
  }

  const handleSearchInputClear = (e) => {
    e.preventDefault()
    store.getCommonSkuList('')
  }

  return (
    <div>
      <CommonSkuMsg />
      <div className='gm-padding-tb-10 gm-padding-lr-20'>
        <p className='gm-text-desc'>
          {i18next.t('注：仅显示近两周下单频次较高的前100个商品')}
        </p>

        <div className='input-prepend input-group' style={{ width: '100%' }}>
          <span className='input-group-addon'>
            <i className='xfont xfont-search' />
          </span>
          <input
            onChange={handleSearchInputChange}
            className='form-control'
            value={search_text}
            placeholder={i18next.t(
              '输入商品ID、自定义编码或商品名，以添加商品'
            )}
            type='text'
          />
          {search_text === '' ? null : (
            <span className='input-group-btn'>
              <button onClick={handleSearchInputClear} className='btn'>
                <i className='glyphicon glyphicon-remove' />
              </button>
            </span>
          )}
        </div>
        {props.children}
      </div>
    </div>
  )
})

export default Container
