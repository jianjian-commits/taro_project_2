import React, { useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import globalStore from 'stores/global'
import { useLocation } from 'react-router-dom'
import Big from 'big.js'
import {
  BoxTable,
  Price,
  Flex,
  Switch,
  MoreSelect,
  Button,
  Tip,
  ToolTip,
  Loading,
  Modal,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import { Table, TableUtil } from '@gmfe/table'
import _ from 'lodash'
import { history } from 'common/service'
import qs from 'query-string'
import SvgWarning from 'svg/warning-circle-o.svg'
import store from './store'
import { showTaskPanel } from '../../../../../task/task_list'

const {
  EditButton,
  OperationCell,
  EditContentInputNumber,
  // OperationDelete,
} = TableUtil

const List = () => {
  const { list, loading } = store
  const {
    query: { id, name, template_id, salemenuType },
  } = useLocation()

  useEffect(() => {
    globalStore.setBreadcrumbs([name])
    return () => store.init()
  }, [])

  useEffect(() => {
    const unRecognizedSpus = list.filter((item) => item.code === 2)
    unRecognizedSpus?.length &&
      Tip.info(
        t(
          `有${unRecognizedSpus.length}条商品未识别SPU信息，可全部保存后再单独处理`,
        ),
      )
  }, [])

  const handleSaveAll = () => {
    store.batchSubmitAll(id, template_id).then((json) => {
      if (json.code === 0) {
        Modal.warning({
          children: t('数据处理中,请在任务栏查看进度！'),
          title: t('提示'),
          onOk() {
            history.push(
              `/merchandise/manage/sale/sale_list?${qs.stringify({
                id,
                salemenuType,
                name,
              })}`,
            )
            showTaskPanel(null, { tabKey: 1 })
          },
        })
      }
      return json
    })
  }

  const handleSaveOne = (index) => {
    store.batchSubmitOne(id, index).then((json) => {
      if (json?.code === 0) {
        Tip.success('保存成功')
        store.list.splice(index, 1)
      } else {
        Tip.danger('保存失败')
      }
      return null
    })
  }

  const handleDelete = (index) => {
    store.deleteListItem(index)
  }

  // 刷新跳回报价单详情
  if (!list.length) {
    history.push(
      `/merchandise/manage/sale/sale_list?${qs.stringify({
        id,
        salemenuType,
        name,
      })}`,
    )
    return null
  }

  if (loading) {
    return (
      <Flex justifyCenter style={{ paddingTop: '100px' }}>
        <Loading text={t('加载中...')} />
      </Flex>
    )
  }

  return (
    <BoxTable
      info={<BoxTable.Info>{t('待提交商品列表')}</BoxTable.Info>}
      action={
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handleSaveAll}
        >
          {t('全部保存')}
        </Button>
      }
    >
      <Table
        loading={loading}
        data={list.slice()}
        columns={[
          {
            Header: t('序号'),
            width: 60,
            accessor: 'index',
            Cell: ({ index }) => index + 1,
          },
          {
            Header: t('商品名'),
            accessor: 'spu_id',
            width: 200,
            Cell: ({ original, index }) => {
              const spuList =
                _.map(original.spus, (item) => {
                  return {
                    text: `${item.spu_name}(${item.spu_id})`,
                    value: item.spu_id,
                  }
                }) || []
              return (
                <Observer>
                  {() => (
                    <>
                      <MoreSelect
                        data={spuList}
                        // selected={original.spu_id || original.spus[0]?.spu_id}
                        selected={original.spu_info}
                        onSelect={(selected) => {
                          console.log(selected)
                          store.updateListItem(index, 'spu_info', selected)
                        }}
                        renderListFilterType='pinyin'
                        placeholder={t('请选择商品')}
                      />
                      {original.code === 1 && (
                        <Flex className='gm-text-red gm-margin-top-10'>
                          <SvgWarning className='gm-margin-lr-5' />
                          <span>{t('商品未完全识别')}</span>
                        </Flex>
                      )}
                      {original.code === 2 && (
                        <Flex className='gm-text-red gm-margin-top-10'>
                          <SvgWarning className='gm-margin-lr-5' />
                          <span>{t('未找到SPU信息')}</span>
                        </Flex>
                      )}
                    </>
                  )}
                </Observer>
              )
            },
          },
          {
            Header: t('分类'),
            id: 'category_name_1',
            Cell: ({ original, index }) => {
              return (
                <Observer>
                  {() => {
                    const spu =
                      original.spu_info &&
                      _.find(
                        original.spus,
                        (it) => it.spu_id === original.spu_info.value,
                      )
                    console.warn('spu', spu, original.spus, original.spu_id)
                    const showClassName = spu
                      ? `${spu.category_name_1}/${spu.category_name_2}/${spu.spu_name}`
                      : '-'
                    return showClassName
                  }}
                </Observer>
              )
            },
          },
          {
            Header: t('规格名'),
            accessor: 'sku_name',
          },
          {
            Header: t('基本单位'),
            accessor: 'std_unit_name',
            Cell: ({ original, index }) => {
              return (
                <Observer>
                  {() => {
                    const spu =
                      original.spu_info &&
                      _.find(
                        original.spus,
                        (it) => it.spu_id === original.spu_info.value,
                      )
                    return spu?.std_unit_name || '-'
                  }}
                </Observer>
              )
            },
          },
          {
            Header: t('销售单价'),
            accessor: 'std_sale_price_forsale',
            Cell: ({ original, index }) => {
              return (
                <Observer>
                  {() => {
                    if (original.code === 2) return '-'
                    const spu =
                      original.spu_info &&
                      _.find(
                        original.spus,
                        (it) => it.spu_id === original.spu_info.value,
                      )
                    return (
                      <Flex>
                        <div style={{ marginRight: '2px' }}>
                          {+Big(original.std_sale_price_forsale).div(100) +
                            Price.getUnit(original.fee_type) +
                            '/' +
                            (spu?.std_unit_name || '-')}
                        </div>
                        <EditButton
                          popupRender={(closePopup) => (
                            <EditContentInputNumber
                              closePopup={closePopup}
                              initialVal={
                                +Big(original.std_sale_price_forsale).div(100)
                              }
                              onSave={(value) => {
                                store.updateListItem(
                                  index,
                                  'std_sale_price_forsale',
                                  +Big(value || 0).times(100),
                                )
                                store.updateListItem(
                                  index,
                                  'sale_price',
                                  +Big(value || 0)
                                    .times(100)
                                    .times(original.sale_ratio),
                                )
                              }}
                            />
                          )}
                        />
                      </Flex>
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: t('销售规格'),
            id: 'sale_ratio',
            Cell: ({ original, index }) => {
              if (original.code === 2) return '-'
              return (
                <Observer>
                  {() => {
                    const spu =
                      original.spu_info &&
                      _.find(
                        original.spus,
                        (it) => it.spu_id === original.spu_info.value,
                      )
                    return (
                      <Flex>
                        <div style={{ marginRight: '2px' }}>
                          {original.sale_ratio +
                            (spu?.std_unit_name || '-') +
                            '/' +
                            (original.sale_unit_name ||
                              spu?.std_unit_name ||
                              '-')}
                        </div>
                      </Flex>
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: t('销售价'),
            accessor: 'sale_price',
            Cell: ({ original, index }) => {
              if (original.code === 2) return '-'
              const spu =
                original.spu_info &&
                _.find(
                  original.spus,
                  (it) => it.spu_id === original.spu_info.value,
                )
              return (
                <Observer>
                  {() => (
                    <Flex>
                      <span style={{ marginRight: '2px' }}>
                        {+Big(original.sale_price).div(100) +
                          Price.getUnit(original.fee_type) +
                          '/' +
                          (original.sale_unit_name ||
                            spu?.std_unit_name ||
                            '-')}
                      </span>
                      <EditButton
                        popupRender={(closePopup) => (
                          <EditContentInputNumber
                            closePopup={closePopup}
                            initialVal={+Big(original.sale_price).div(100)}
                            onSave={(value) => {
                              store.updateListItem(
                                index,
                                'sale_price',
                                +Big(value || 0).times(100),
                              )
                              store.updateListItem(
                                index,
                                'std_sale_price_forsale',
                                +Big(value || 0)
                                  .times(100)
                                  .div(original.sale_ratio),
                              )
                            }}
                          />
                        )}
                      />
                    </Flex>
                  )}
                </Observer>
              )
            },
          },
          {
            Header: t('销售状态'),
            accessor: 'state',
            Cell: ({ original, index }) => (
              <Observer>
                {() => (
                  <Switch
                    type='primary'
                    checked={original.state}
                    on={t('上架')}
                    off={t('下架')}
                    onChange={(value) => {
                      store.updateListItem(index, 'state', value)
                    }}
                  />
                )}
              </Observer>
            ),
          },
          {
            Header: t('库存'),
            Cell: ({ original, index }) => (
              <Observer>
                {() => {
                  switch (original.stock_type) {
                    case 0:
                      return '不设置库存'
                    case 1:
                      return '限制库存'
                    case 2:
                      return original.stocks
                  }
                }}
              </Observer>
            ),
          },
          {
            width: 140,
            Header: TableUtil.OperationHeader,
            Cell: ({ original, index }) => (
              <OperationCell>
                <ToolTip
                  showArrow
                  popup={<div style={{ padding: '8px' }}>{t('保存商品')}</div>}
                >
                  <a
                    className='gm-text-primary gm-cursor gm-margin-right-10'
                    onClick={() => handleSaveOne(index)}
                  >
                    {t('保存')}
                  </a>
                </ToolTip>

                <ToolTip
                  showArrow
                  popup={<div style={{ padding: '8px' }}>{t('删除商品')}</div>}
                >
                  <a
                    className='gm-text-primary gm-cursor'
                    onClick={() => handleDelete(index)}
                  >
                    {t('删除')}
                  </a>
                </ToolTip>

                {/* <OperationDelete
                  title={t('警告')}
                  onClick={() => handleDelete(index)}
                >
                  {t('确认删除吗')}
                </OperationDelete> */}
              </OperationCell>
            ),
          },
        ]}
      />
    </BoxTable>
  )
}

List.propTypes = {
  original: PropTypes.object,
  index: PropTypes.number,
}
export default observer(List)
