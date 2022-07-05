import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  FormPanel,
  Form,
  FormItem,
  FormButton,
  Button,
  Switch,
  Checkbox,
  Flex,
  Tip,
} from '@gmfe/react'
import store from './store'
import globalStore from 'stores/global'

const TurnoverSetting = () => {
  const {
    turnoverData: {
      is_turnover_sync,
      is_turnover_deposit,
      turnover_driver_modify,
      turnover_driver_return,
      turnover_driver_loan,
    },
  } = store

  const {
    turnoverInfo: {
      is_turnover_sync: _sync,
      is_turnover_deposit: _deposit,
      turnover_driver_modify: _modify,
      turnover_driver_return: _return,
      turnover_driver_loan: _loan,
    },
  } = globalStore

  const editTurnover = !globalStore.hasPermission('modify_turnover_setting')
  const handleChangedData = (name, value) => {
    store.changeDataItem('turnover', name, value)
  }

  const handleSave = () => {
    store.postSetting('turnover').then(() => {
      Tip.success(t('保存成功'))
      window.location.reload()
    })
  }

  useEffect(() => {
    store.initData('turnover', {
      is_turnover_sync: _sync,
      is_turnover_deposit: _deposit,
      turnover_driver_modify: _modify,
      turnover_driver_return: _return,
      turnover_driver_loan: _loan,
    })
    // eslint-disabled-next-line react-hooks/exhaustive-deps
  }, [globalStore.turnoverInfo])

  return (
    <FormPanel title={t('周转物设置')}>
      <Form onSubmit={handleSave} labelWidth='130px' colWidth='1125px'>
        <FormItem label={t('周转物下单关联')}>
          <Switch
            on={t('开启')}
            off={t('关闭')}
            checked={!!is_turnover_sync}
            disabled={editTurnover}
            onChange={handleChangedData.bind(this, 'is_turnover_sync')}
          />
          <p className='gm-text-desc gm-margin-top-5'>
            {t(
              '开启后，如商品关联周转物，在商城端、业务平台和云管家小程序下单后，系统会关联周转物借出记录生成，分拣员或司机端可看到由订单而来的周转物信息，并进行清点核对，确定实际周转物信信息（种类、数量）后确定借出',
            )}
          </p>
        </FormItem>
        {/* 开启周转物关联才可以编辑押金 */}
        {!!is_turnover_sync && (
          <FormItem label={t('周转物押金')}>
            <Flex alignCenter>
              <Switch
                on={t('开启')}
                off={t('关闭')}
                checked={!!is_turnover_deposit}
                disabled={editTurnover}
                onChange={handleChangedData.bind(this, 'is_turnover_deposit')}
              />
              <span>{t('（仅对先款后货商户，在商城端下单时有效）')}</span>
            </Flex>

            <p className='gm-text-desc gm-margin-top-5'>
              {t(
                '开启后，先款客户在商城端下单时如订单中存在周转物，系统会一并将周转物货值作为押金计入订单金额中，随商户下单时一并收取。',
              )}
            </p>
            <Flex>
              <p className='gm-text-desc'>{t('注：')}</p>
              <Flex column>
                <span className='gm-text-desc'>
                  {t(
                    '1、押金随下单确定，出库时周转物清点的数量如有变动，不再重新计算押金；',
                  )}
                </span>
                <span className='gm-text-desc'>
                  {t(
                    '2、后续编辑订单添加商品（商城合单、改单、后台加商品）导致多出的周转物押金，会以差额的形式要求客户在商城端支付结清',
                  )}
                </span>
              </Flex>
            </Flex>
            <p className='gm-text-desc gm-margin-top-5'>
              {t(
                '押金退还：由商户在商城端自行发起，发起后由司机到现场清点货物并取回后，后台财务审核通过，押金原路退回至商户',
              )}
            </p>
          </FormItem>
        )}
        <FormItem label={t('司机修改周转物借还')}>
          <Switch
            on={t('开启')}
            off={t('关闭')}
            checked={!!turnover_driver_modify}
            disabled={editTurnover}
            onChange={handleChangedData.bind(this, 'turnover_driver_modify')}
          />
          <p className='gm-text-desc gm-margin-top-5'>
            {t(
              '该功能可控制司机是否有权对周转物进行借出/归还改动。如关闭，则司机仅可：1、参与周转物由分拣员确定的借出数量的复核，不可改动；2、参与周转物商家申请的归还数量的清点，不可改动',
            )}
          </p>
          {!!turnover_driver_modify && (
            <>
              <Flex>
                <Checkbox
                  checked={!!turnover_driver_return}
                  disabled={editTurnover}
                  onChange={(value) =>
                    handleChangedData(
                      'turnover_driver_return',
                      value.currentTarget.checked,
                    )
                  }
                />
                <span>{t('司机可修改归还周转物的种类和数量')}</span>
              </Flex>
              <Flex className='gm-margin-top-5'>
                <Checkbox
                  checked={!!turnover_driver_loan}
                  disabled={editTurnover}
                  onChange={(value) =>
                    handleChangedData(
                      'turnover_driver_loan',
                      value.currentTarget.checked,
                    )
                  }
                />
                <span>{t('司机可修改借出周转物的种类和数量')}</span>
              </Flex>
            </>
          )}
        </FormItem>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('保存')}
          </Button>
        </FormButton>
      </Form>
    </FormPanel>
  )
}

export default observer(TurnoverSetting)
