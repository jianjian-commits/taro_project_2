import { i18next } from 'gm-i18n'
import { orderState } from 'common/filter'
import { RightSideModal, ToolTip } from '@gmfe/react'
import React from 'react'
import { is } from '@gm-common/tool'
import PopupDetail from '../components/popup_detail_order'

const popupGoodsDetail = (id) => {
  RightSideModal.render({
    onHide: RightSideModal.hide,
    style: is.phone()
      ? { width: '100vw', overflow: 'auto' }
      : { width: '900px', overflowY: 'scroll' },
    children: <PopupDetail orderID={id} />,
  })
}

export default [
  {
    Header: i18next.t('订单号'),
    accessor: 'order_id',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
    Cell: ({ value }) => <a onClick={() => popupGoodsDetail(value)}>{value}</a>,
  },
  {
    Header: (
      <div>
        <span>{i18next.t('拣货商品数')}</span>
        &nbsp;
        <ToolTip
          popup={
            <div className='gm-padding-10'>
              {i18next.t('拣货商品数为该订单中「非临采」商品种类数')}
            </div>
          }
        />
      </div>
    ),
    diyItemText: i18next.t('拣货商品数'),
    accessor: 'need_picking_num',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
  },
  {
    Header: i18next.t('商户名'),
    accessor: 'address_name',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
  },
  {
    Header: i18next.t('线路'),
    accessor: 'route_name',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
  },
  {
    Header: i18next.t('分拣序号'),
    accessor: 'sort_num',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
  },
  {
    Header: i18next.t('订单状态'),
    accessor: 'order_status',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
    Cell: ({ value }) => orderState(value),
  },
  {
    Header: i18next.t('分拣备注'),
    accessor: 'sort_remark',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
  },
]
