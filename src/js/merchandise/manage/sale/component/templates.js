import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import QRCode from 'qrcode.react'
import store from '../sale_card_store'
import globalStore from '../../../../stores/global'
import { Flex, Tip, Modal, RightSideModal, Dialog } from '@gmfe/react'
import { SaleCard, CardRow } from './sale_card'
import DeleteSaleMenuModal from './delete_sale_menu_modal'
import TaskList from '../../../../task/task_list'
import qs from 'query-string'
import _ from 'lodash'
import { history } from 'common/service'
import { groupByWithIndex } from 'common/util'
import styled from 'styled-components'
import moment from 'moment'
import openPrintModal from './pre_print_modal'

const PriceDate = styled.span`
  color: ${(props) => (props.isOverdue ? 'red' : 'inherit')};
`

const PriceDateContent = observer(({ data }) => {
  const { price_start_time, price_end_time, is_overdue } = data

  const date =
    price_start_time && price_end_time
      ? moment(price_start_time).format('YYYY-MM-DD') +
        '~' +
        moment(price_end_time).format('YYYY-MM-DD')
      : '-'

  return (
    <PriceDate isOverdue={is_overdue}>
      {date}
      {is_overdue && i18next.t('（已逾期）')}
    </PriceDate>
  )
})

@observer
class CardTemplates extends React.Component {
  handleButtonClick = (type, id, name) => {
    window.open(
      '#/merchandise/manage/sale/sale_list?' +
        qs.stringify({ id, salemenuType: type, name }),
    )
  }

  handleSettingClick = (id) => {
    history.push({
      pathname: '/merchandise/manage/sale/menu',
      query: {
        viewType: 'update',
        salemenu_id: id,
      },
    })
  }

  handleDelete = (salemenu) => {
    // 默认报价单不允许删除
    if (salemenu.id === store.defaultSaleMenu.default_salemenu_id) {
      Tip.warning(i18next.t('默认报价单不允许删除！'))
      return
    }

    Modal.render({
      style: { width: '400px' },
      title: i18next.t('删除报价单'),
      children: (
        <DeleteSaleMenuModal
          salemenu={salemenu}
          onSuccess={() => {
            Modal.hide()
            RightSideModal.render({
              children: <TaskList tabKey={1} />,
              onHide: RightSideModal.hide,
              style: {
                width: '300px',
              },
            })
          }}
          onCancel={() => {
            Modal.hide()
          }}
        />
      ),
      onHide: () => {
        Modal.hide()
      },
    })
  }

  handleShareSalemenu = (id, name) => {
    store.getSalemenuShareId(id).then((json) => {
      const url = `${window.location.origin}/more/?__trace_group_id=${globalStore.groupId}/#/salemenu?share_id=${json.data.id}`
      Dialog.dialog({
        title: i18next.t('报价单分享'),
        children: (
          <Flex justifyCenter alignCenter>
            <Flex column>
              <Flex className='gm-margin-10'>
                <div>{i18next.t('二维码展示')}：</div>
                <div>{name}</div>
              </Flex>
              <Flex column justifyCenter alignCenter>
                <div className='gm-padding-10 gm-bg' style={{ width: '270px' }}>
                  <QRCode id='shareQrcode' size={250} value={url} />
                </div>
              </Flex>
            </Flex>
          </Flex>
        ),
        OKBtn: false,
        size: 'md',
      })
    })
  }

  handlePrintSalemenu = (salemenu_id) => {
    openPrintModal({
      salemenu_id,
      target_url: '#/system/setting/distribute_templete/salemenus_printer',
    })
  }

  handleToImageSalemenu = (salemenu_id) => {
    openPrintModal({
      salemenu_id,
      target_url: '#/merchandise/manage/sale/printer_to_img',
    })
  }

  addEmptyContent = (cards) => {
    const result = []
    if (cards && cards.length !== 0 && cards.length % 4 !== 0) {
      const addLength = 4 - (cards.length % 4)
      for (let i = 0; i < addLength; i++) {
        result.push(
          <Flex
            flex
            className='gm-padding-right-20 gm-padding-bottom-20'
            key={`empty${i}`}
          />,
        )
      }
    }
    return result
  }

  render() {
    const p_deleteSalemenu = globalStore.hasPermission('delete_salemenu')
    const p_editSalemenu = globalStore.hasPermission('edit_salemenu')
    // 希捷说把分享还有打印的权限全部放开，图片不加权限，权限代码我暂时没删
    const p_getPrintSalemenu =
      true || globalStore.hasPermission('get_print_salemenu')
    const p_getShareSalemenu =
      true || globalStore.hasPermission('get_share_salemenu')
    const p_getSalemenuImage = true

    const templates = _.map(store.cardList, (v) => {
      // 有删除权限 && 不是代售单
      const enableDelete = p_deleteSalemenu && v.type !== 2
      return (
        <Flex
          flex
          className='menu-card-module gm-padding-right-20 gm-padding-bottom-20'
          key={`saleCard${v.id}`}
        >
          <SaleCard
            title={v.name}
            id={v.id}
            disabled={!v.is_active}
            labels={[
              +v.is_active ? i18next.t('已激活') : i18next.t('未激活'),
              +v.type === 2 ? i18next.t('代售单') : '',
            ].filter((_) => _)}
            onClick={this.handleButtonClick.bind(this, v.type)}
            onSettingClick={this.handleSettingClick}
            onDelete={this.handleDelete.bind(this, v)}
            onShare={this.handleShareSalemenu.bind(this, v.id, v.name)}
            onPrint={this.handlePrintSalemenu}
            onImage={this.handleToImageSalemenu}
            menuPermission={{
              edit: p_editSalemenu,
              delete: enableDelete,
              print: p_getPrintSalemenu,
              share: p_getShareSalemenu,
              image: p_getSalemenuImage,
            }}
          >
            <CardRow name={i18next.t('报价单ID')} content={v.id} />
            <CardRow
              name={i18next.t('报价单简称（对外）')}
              content={v.supplier_name}
            />
            <CardRow name={i18next.t('在售商品数')} content={v.sku_num} />
            <CardRow
              name={i18next.t('运营时间设置')}
              content={v.time_config_name}
            />
            <CardRow
              name={i18next.t('定价周期')}
              content={<PriceDateContent data={v} />}
            />
            <CardRow name={i18next.t('描述')} content={v.desc || '-'} />
          </SaleCard>
        </Flex>
      )
    })

    const emptyTemplates = this.addEmptyContent(store.cardList)

    if (emptyTemplates.length > 0) {
      templates.push(emptyTemplates)
    }

    return (
      <Flex
        column
        className='gm-padding-left-20 gm-padding-top-20 b-cards-border'
      >
        {store.cardList.length === 0 ? (
          <div className='gm-text-helper gm-margin-15'>
            {i18next.t('当前无相关报价单数据，请重新搜索')}
          </div>
        ) : (
          _.map(
            groupByWithIndex(templates, (value, i) => parseInt(i / 4, 10)),
            (value, i) => {
              return (
                <Flex flex={1} key={i}>
                  {value}
                </Flex>
              )
            },
          )
        )}
      </Flex>
    )
  }
}
export default CardTemplates
