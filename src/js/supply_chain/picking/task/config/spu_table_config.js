import { i18next } from 'gm-i18n'
import { RightSideModal, Popover } from '@gmfe/react'
import React from 'react'
import { is } from '@gm-common/tool'
import PopupDetail from '../components/popup_detail_spu'

const popupGoodsDetail = (id, data) => {
  RightSideModal.render({
    onHide: RightSideModal.hide,
    style: is.phone()
      ? { width: '100vw', overflow: 'auto' }
      : { width: '900px', overflowY: 'scroll' },
    children: <PopupDetail data={data} />,
  })
}

export default [
  {
    Header: i18next.t('商品'),
    accessor: 'sku_name',
    width: 'auto',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
    Cell: ({ original, original: { order_list }, value }) => (
      <a
        onClick={() =>
          popupGoodsDetail(
            order_list?.map((o) => o.order_id),
            original,
          )
        }
      >
        {value}
      </a>
    ),
  },
  {
    Header: i18next.t('分类'),
    width: 'auto',
    accessor: 'category_name_1',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
    Cell: ({ original: { category_name_1, category_name_2, pinlei_name } }) =>
      category_name_1 + '/' + category_name_2 + '/' + pinlei_name,
  },
  {
    Header: i18next.t('建议取货货位'),
    width: 'auto',
    diyEnable: false,
    accessor: 'shelf_names',
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
    Cell: ({ original: { shelf_names = [] } }) => {
      /*
       * 根据建议取货货位，以3条为最大，
       * 超过就hover Popver来显示，然后根据...显示
       */
      return shelf_names.length > 3 ? (
        <Popover
          type='hover'
          showArrow
          top
          offset={shelf_names.length}
          popup={<div className='gm-padding-10'>{shelf_names.join('，')}</div>}
        >
          <div>
            {shelf_names.slice(0, 3).map((item, i) => (
              <div key={item}>{i === 2 ? item + '...' : item}</div>
            ))}
          </div>
        </Popover>
      ) : (
        <>
          {shelf_names.length > 0 ? (
            shelf_names.map((item) => <div key={item}>{item}</div>)
          ) : (
            <div>-</div>
          )}
        </>
      )
    },
  },
  {
    Header: i18next.t('库存（基本单位）'),
    width: 'auto',
    diyEnable: false,
    accessor: 'remain',
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
    Cell: ({ original: { remain, std_unit_name } }) => remain + std_unit_name,
  },
  {
    Header: i18next.t('计划拣货（基本单位）'),
    width: 'auto',
    accessor: 'picking_amount',
    diyEnable: false,
    fixed: 'left',
    diyGroupName: i18next.t('基础字段'),
    Cell: ({ original: { picking_amount, std_unit_name } }) =>
      picking_amount + std_unit_name,
  },
]
