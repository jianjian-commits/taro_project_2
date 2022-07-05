import React from 'react'
import {
  SheetAction,
  Sheet,
  SheetColumn,
  RightSideModal,
  Price,
  Button,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { i18next } from 'gm-i18n'
import classNames from 'classnames'
import TaskList from '../../../task/task_list'
import { history } from '../../../common/service'
import { isPositiveFloat } from '../../../common/util'
import { observer, Observer } from 'mobx-react'
import store from './store'

@observer
class QuotationBatchImport extends React.Component {
  handleDelete(index) {
    store.deleteQuotationItem(index)
  }

  handleTextChange(index, field, e) {
    const value = e.target.value
    store.setQuotationList(index, field, value)
  }

  handleSubmit = () => {
    store.submit()

    history.replace('/supply_chain/purchase/information?tab=get_pur_spec')
    RightSideModal.render({
      children: <TaskList tabKey={1} />,
      onHide: RightSideModal.hide,
      opacityMask: true,
      noCloseBtn: true,
      style: {
        width: '300px',
      },
    })
  }

  render() {
    const { quotationImportList, canNotSubmit } = store
    const list = quotationImportList.slice()

    // 数据量大,用Sheet渲染更快
    return (
      <div style={{ overflow: 'auto' }}>
        <QuickPanel title={i18next.t('待导入询价列表')} icon='bill'>
          <Sheet enableEmptyTip list={list}>
            <SheetColumn field='spu_id' name={i18next.t('商品ID')} />
            <SheetColumn field='spu_name' name={i18next.t('商品名称')} />
            <SheetColumn field='spec_id' name={i18next.t('采购规格ID')} />
            <SheetColumn field='spec_name' name={i18next.t('规格名称')} />
            <SheetColumn field='fenlei' name={i18next.t('所属分类')} />
            <SheetColumn field='purchase_spec' name={i18next.t('采购规格')} />
            <SheetColumn field='customer_id' name={i18next.t('供应商编号')} />
            <SheetColumn
              field='settle_supplier_name'
              name={i18next.t('供应商名称')}
            />
            <SheetColumn
              field='std_unit_price'
              name={i18next.t('询价(基本单位)')}
            >
              {(val, index) => (
                <Observer>
                  {() => {
                    const { std_unit_price, std_unit = '-' } = list[index]
                    const isWarning = !isPositiveFloat(std_unit_price)
                    return (
                      <div>
                        <input
                          value={std_unit_price}
                          style={{ width: '100px' }}
                          className={classNames({ 'b-bg-warning': isWarning })}
                          title={
                            isWarning
                              ? i18next.t('询价价格须为正数，最多两位小数')
                              : undefined
                          }
                          onChange={this.handleTextChange.bind(
                            this,
                            index,
                            'std_unit_price',
                          )}
                        />
                        {Price.getUnit() + '/' + std_unit}
                      </div>
                    )
                  }}
                </Observer>
              )}
            </SheetColumn>
            <SheetColumn field='origin_place' name={i18next.t('产地')}>
              {(val, index) => (
                <Observer>
                  {() => (
                    <input
                      type='text'
                      value={list[index].origin_place}
                      style={{ width: '100px' }}
                      onChange={this.handleTextChange.bind(
                        this,
                        index,
                        'origin_place',
                      )}
                    />
                  )}
                </Observer>
              )}
            </SheetColumn>
            <SheetColumn field='remark' name={i18next.t('描述')}>
              {(val, index) => (
                <Observer>
                  {() => (
                    <input
                      type='text'
                      value={list[index].remark}
                      style={{ width: '100px' }}
                      onChange={this.handleTextChange.bind(
                        this,
                        index,
                        'remark',
                      )}
                    />
                  )}
                </Observer>
              )}
            </SheetColumn>
            <SheetAction>
              {(item, index) => (
                <i
                  className='xfont xfont-delete gm-cursor'
                  onClick={this.handleDelete.bind(this, index)}
                />
              )}
            </SheetAction>
          </Sheet>
          <div className='gm-margin-top-10'>
            <Button
              onClick={() => {
                history.replace(
                  '/supply_chain/purchase/information?tab=get_pur_spec',
                )
              }}
            >
              {i18next.t('取消')}
            </Button>
            <div className='gm-gap-10' />
            <Button
              type='primary'
              onClick={this.handleSubmit}
              disabled={canNotSubmit}
            >
              {i18next.t('保存')}
            </Button>
          </div>
        </QuickPanel>
        <div style={{ height: '20px', width: '100%' }} />
      </div>
    )
  }
}

export default QuotationBatchImport
