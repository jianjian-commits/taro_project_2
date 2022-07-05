import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import store from '../store'
import { t } from 'gm-i18n'
import { Flex, InputNumberV2 } from '@gmfe/react'
import { TableX } from '@gmfe/table-x'

@observer
class BatchEditModal extends Component {
  handleInputBlur = (index) => {
    const { amount } = store.batch_edit_list[index]
    // 失焦时若为0则改变为0.01
    if (amount === 0) {
      store.setBatchEditListItem({ amount: 0.01 }, index)
    }
  }

  render() {
    const { batch_edit_list } = store

    return (
      <>
        <p>
          {t('已过滤无库存商品，请填写')}
          {batch_edit_list.length}
          {t('个任务的领料数：')}
        </p>
        <TableX
          data={batch_edit_list.slice()}
          columns={[
            {
              Header: t('商品名'),
              accessor: 'ingredient_name',
              Cell: (cellProps) => {
                const {
                  ingredient_name,
                  ingredient_id,
                } = cellProps.row.original
                return `${ingredient_name}(${ingredient_id})`
              },
            },
            {
              Header: t('当前库存'),
              accessor: 'total_remain',
              Cell: (cellProps) => {
                const { total_remain, std_unit_name } = cellProps.row.original
                return total_remain + std_unit_name
              },
            },
            {
              Header: t('领料数'),
              accessor: 'amount',
              Cell: (cellProps) => {
                return (
                  <Observer>
                    {() => {
                      const {
                        amount,
                        std_unit_name,
                        total_remain,
                      } = cellProps.row.original
                      return (
                        <Flex alignCenter>
                          <InputNumberV2
                            className='form-control'
                            onChange={(val) =>
                              store.setBatchEditListItem(
                                { amount: val },
                                cellProps.row.index
                              )
                            }
                            value={amount}
                            onBlur={this.handleInputBlur.bind(
                              this,
                              cellProps.row.index
                            )}
                            max={total_remain}
                          />
                          <div>{std_unit_name}</div>
                        </Flex>
                      )
                    }}
                  </Observer>
                )
              },
            },
          ]}
        />

        <div style={{ color: 'red' }}>
          <div className='gm-margin-bottom-5'>{t('说明')}:</div>
          <ol className='gm-padding-left-15'>
            <li className='gm-padding-0 gm-margin-bottom-10'>
              {t(
                '批量领料时，领取数默认等于需求数，大于库存数时默认等于库存数，可修改；'
              )}
            </li>
            <li className='gm-padding-0 gm-margin-bottom-10'>
              {t(
                '按批次入库时间顺序选择批次，若某一批次的库存数不足时，则顺延至下一批次补足剩余数量，如需修改，确定后可在列表中修改领取数。'
              )}
            </li>
          </ol>
        </div>
      </>
    )
  }
}

BatchEditModal.propTypes = {
  selected: PropTypes.array,
}

export default BatchEditModal
