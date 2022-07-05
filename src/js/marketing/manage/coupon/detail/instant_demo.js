import { t } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from './store'
import moment from 'moment'

import titleImg from 'img/coupon_title.png'
import CouponDemo from './components/coupon_demo'
import CouponDesc from './components/coupon_description'
import { getCouponLabel } from '../util'

@observer
class CouponInstantDemo extends React.Component {
  render() {
    const {
      basicInfo: {
        name,
        category_id_1_list,
        description,
        validity_day,
        min_total_price,
        price_value,
        time_type,
        valid_time_start,
        valid_time_end,
      },
      categoryOneList,
      rule: { audience_type },
    } = store

    const day = +validity_day ? validity_day - 1 : 0

    let expiring_time
    if (time_type === 1) {
      expiring_time =
        moment(new Date()).add(day, 'd').format('YYYY-MM-DD') + t('到期')
    } else if (time_type === 2) {
      expiring_time =
        valid_time_start && valid_time_end
          ? moment(valid_time_start).format('YYYY.MM.DD') +
            '~' +
            moment(valid_time_end).format('YYYY.MM.DD')
          : ''
    }

    const cateSelectedName = _.map(category_id_1_list, (item) => {
      return _.find(categoryOneList, (v) => item === v.value)
    })

    return (
      <div
        className='gm-border gm-margin-top-15'
        style={{ width: '375px', height: '500px', overflow: 'hidden' }}
      >
        <div>
          <img src={titleImg} alt={t('优惠券')} style={{ width: '375px' }} />
        </div>
        <div className='text-center gm-padding-tb-10 gm-text-desc'>
          {t('你共有')}
          <span className='b-color-active'> X </span>
          {t('个可使用的优惠券')}
          <div className='gm-inline-block gm-padding-lr-5'>
            <i className='xfont xfont-question-circle-o gm-text-12' />
          </div>
        </div>
        <div
          className='gm-padding-lr-10 gm-padding-top-10'
          style={{ height: '100%', backgroundColor: 'white' }}
        >
          <div>
            <CouponDemo
              hasUseInfo
              useInfo={
                <CouponDesc
                  data={{ description, category_name_list: cateSelectedName }}
                />
              }
              currency={Price.getCurrency()}
              discount={price_value}
              totalInfo={t(
                /* src:`满${d.min_total_price}元可用` => tpl:满${num}可用 */ 'coupon_list_use_min_limit',
                {
                  num: min_total_price + Price.getUnit(),
                },
              )}
              dateInfo={expiring_time}
              title={name}
              label={getCouponLabel({ category_id_1_list, audience_type })}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default CouponInstantDemo
