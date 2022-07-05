import React, { useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxTable,
  Flex,
  ToolTip,
  FunctionSet,
  Dialog,
  Price,
} from '@gmfe/react'
import { TableUtil, Table } from '@gmfe/table'
import { ManagePagination } from '@gmfe/business'
import qs from 'query-string'
import Big from 'big.js'
import QRCode from 'qrcode.react'

import TableTotalText from 'common/components/table_total_text'
import ListImg from '../../../component/list_img'
import globalStore from 'stores/global'
import FloatTip from 'common/components/float_tip'
import { quotationStore as store } from '../../store'

const { SortHeader } = TableUtil

const QuotationList = observer(() => {
  const refPagination = useRef()

  useEffect(() => {
    store.setQuotationDoFirstRequest(refPagination.current.apiDoFirstRequest)
    return () => store.initQuotation()
  }, [])

  const handleSort = (name) => {
    Promise.resolve(store.sortQuotation(name)).then(() => {
      store.doQuotationFirstRequest()
    })
  }

  const handlePageChange = (page) => {
    return store.getQuotationList(page)
  }

  const handleShare = () => {
    if (!store.canSearchQuotation) {
      Dialog.alert({
        title: t('提示'),
        children: <p className='text-center'>{t('请选择报价单')}</p>,
        size: 'sm',
      })
      return
    }
    store.getShareInfo().then((json) => {
      const { salemenu } = store.quotation_filter
      const url = `${window.location.origin}/more/?__trace_group_id=${globalStore.groupId}/#/salemenu?share_id=${json.data.id}`
      Dialog.dialog({
        title: t('报价单分享'),
        children: (
          <Flex justifyCenter alignCenter>
            <Flex column>
              <Flex className='gm-margin-10'>
                <div>{t('二维码展示')}：</div>
                <div>{salemenu?.name}</div>
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

  const handlePrint = () => {
    const { end_time, start_time, salemenu_id } = store.quotationFilter
    const params = {
      start_time: start_time,
      end_time: end_time,
      salemenu_id,
    }
    window.open(
      `#/merchandise/manage/quotation_record/print?${qs.stringify(params)}`,
    )
  }

  const { list, pagination, sort_by, sort_direction } = store.quotation

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: t('商品总数'),
                content: pagination.count,
              },
            ]}
          />
        </BoxTable.Info>
      }
      action={
        <FunctionSet
          right
          data={[
            {
              text: t('分享历史报价'),
              onClick: handleShare,
              show: globalStore.hasPermission('get_sku_snapshot_list_share'),
            },
            {
              text: t('打印历史报价'),
              onClick: handlePrint,
              show: globalStore.hasPermission('print_sku_snapshot_list'),
            },
          ].filter((v) => v)}
        />
      }
    >
      <ManagePagination
        onRequest={handlePageChange}
        ref={refPagination}
        id='pagination_in_quotation_quotation_record_list'
      >
        <Table
          data={list.slice()}
          columns={[
            {
              Header: (
                <Flex alignCenter>
                  {t('商品图片')}
                  <ToolTip
                    popup={
                      <div className='gm-padding-5' style={{ width: '150px' }}>
                        {t(
                          '规格图片未设置则显示商品图片，规格和商品都无图时不显示图片',
                        )}
                      </div>
                    }
                  />
                </Flex>
              ),
              accessor: 'image',
              Cell: (data) => (
                <ListImg
                  imgSrc={data.original.sku_image || data.original.spu_image}
                />
              ),
            },
            {
              Header: (
                <SortHeader
                  onClick={handleSort.bind(this, 'spu')}
                  type={sort_by === 'spu' ? sort_direction : null}
                >
                  {t('商品名')}
                </SortHeader>
              ),
              accessor: 'spu_id',
              Cell: (data) => (
                <>
                  <div style={{ marginRight: '2px' }}>
                    {data.original.spu_name}
                  </div>
                  <div>{data.original.spu_id}</div>
                </>
              ),
            },
            {
              Header: (
                <SortHeader
                  onClick={handleSort.bind(this, 'sku')}
                  type={sort_by === 'sku' ? sort_direction : null}
                >
                  {t('规格名')}
                </SortHeader>
              ),
              id: 'sku_id',
              Cell: (data) => (
                <>
                  <div style={{ marginRight: '2px' }}>
                    {data.original.sku_name}
                  </div>
                  <FloatTip
                    skuId={data.original.sku_id}
                    tip={data.original.outer_id}
                    showCustomer={globalStore.otherInfo.showSkuOuterId}
                  />
                </>
              ),
            },
            {
              Header: (
                <SortHeader
                  onClick={handleSort.bind(this, 'category1')}
                  type={sort_by === 'category1' ? sort_direction : null}
                >
                  {t('分类')}
                </SortHeader>
              ),
              id: 'category_name_1',
              accessor: (d) =>
                d.category_name_1 +
                '/' +
                d.category_name_2 +
                '/' +
                d.pinlei_name,
            },
            {
              Header: t('报价单'),
              accessor: 'salemeun_name',
            },
            {
              Header: t('销售单价'),
              id: 'std_sale_price_forsale',
              accessor: (origin) => {
                const {
                  latest_std_sale_price_forsale,
                  latest_std_unit_name_forsale,
                  latest_fee_type,
                } = origin
                return latest_std_sale_price_forsale
                  ? `${Big(latest_std_sale_price_forsale)
                      .div(100)
                      .toFixed(2)}${Price.getUnit(
                      latest_fee_type,
                    )}/${latest_std_unit_name_forsale}`
                  : '-'
              },
            },
            {
              Header: t('销售规格'),
              id: 'sale_ratio',
              accessor: (origin) => {
                const {
                  sale_ratio,
                  sku_id,
                  latest_sale_unit_name,
                  latest_std_unit_name_forsale,
                } = origin
                return sku_id
                  ? `${sale_ratio}${latest_std_unit_name_forsale}/${latest_sale_unit_name}`
                  : '-'
              },
            },
            {
              Header: t('销售价'),
              id: 'latest_sale_price',
              accessor: (origin) => {
                const {
                  latest_sale_price,
                  latest_fee_type,
                  latest_sale_unit_name,
                  is_price_timing,
                } = origin
                const price = latest_sale_price
                  ? `${Big(latest_sale_price)
                      .div(100)
                      .toFixed(2)}${Price.getUnit(
                      latest_fee_type,
                    )}/${latest_sale_unit_name}`
                  : '-'

                return is_price_timing ? t('时价') : price
              },
            },
          ]}
        />
      </ManagePagination>
    </BoxTable>
  )
})

export default QuotationList
