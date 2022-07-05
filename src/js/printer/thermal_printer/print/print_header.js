import React from 'react'
import { t } from 'gm-i18n'
import DashedLine from './components/dashed_line'
import FieldBlock from './components/field_block'
import PropTypes from 'prop-types'
import moment from 'moment'
import { price } from '../util'

PrintHeader.propTypes = {
  data: PropTypes.object.isRequired,
}

function PrintHeader({ data }) {
  return (
    <div>
      <div className='gm-text-bold gm-text-16 text-center'>{data.resname}</div>
      <FieldBlock
        left={t('流转单号')}
        right={data.id}
        className='gm-text-bold gm-text-16 text-center'
      />
      <FieldBlock
        left={t('序号')}
        right={`${data.sort_id} ${data.child_sort_id}`}
        className='gm-text-bold gm-text-16 text-center'
      />
      {data.remark && (
        <FieldBlock
          left={t('订单备注')}
          right={data.remark}
          className='gm-text-bold gm-text-16 text-center'
        />
      )}
      <FieldBlock
        left={t('下单')}
        right={moment(data.date_time).format('YYYY-MM-DD')}
      />
      <FieldBlock
        left={t('配送')}
        right={`${moment(data.receive_begin_time).format(
          'MM-DD HH:mm:ss'
        )} ~ ${moment(data.receive_end_time).format('MM-DD HH:mm:ss')}`}
      />

      <DashedLine />
      {data.distributor_name && (
        <FieldBlock left={t('社区店名称')} right={data.distributor_name} />
      )}
      {data.distributor_phone && (
        <FieldBlock left={t('团长电话')} right={data.distributor_phone} />
      )}
      {data.distributor_address && (
        <FieldBlock left={t('团长地址')} right={data.distributor_address} />
      )}
      <FieldBlock left={t('收货人')} right={data.receiver_name} />
      <FieldBlock left={t('联系电话')} right={data.receiver_phone} />
      <FieldBlock left={t('所在地区')} right={data.city} />
      <FieldBlock left={t('收货地址')} right={data.address} />

      <DashedLine className='gm-margin-tb-10' />
      <FieldBlock left={t('下单金额')} right={price(data.total_price)} />
      <FieldBlock left={t('出库金额')} right={price(data.real_price)} />
      <FieldBlock left={t('运费金额')} right={price(data.freight)} />
      <FieldBlock left={t('应付金额')} right={price(data.total_pay)} />

      <DashedLine className='gm-margin-tb-10' />
    </div>
  )
}

export default PrintHeader
