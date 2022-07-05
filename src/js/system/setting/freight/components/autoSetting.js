import React from 'react'
import { t } from 'gm-i18n'
import { observer, inject } from 'mobx-react'
import { FormItem, InputNumberV2, Flex, Price, Popover } from '@gmfe/react'

import FreightExample from 'img/freight_example.png'

const AutoSetting = observer(({ store, type = 'delivery_freight' }) => {
  const { changeDimensionAndWay, templateData } = store
  const {
    amount_auto_section: {
      base_charge,
      origin_fee,
      increase_fee,
      addition_fee,
      free_fee,
    },
  } = templateData[type]

  return (
    <>
      <FormItem label={t('起收下单金额')} required>
        <Flex alignCenter>
          <InputNumberV2
            className='form-control'
            value={base_charge}
            min={0}
            max={999999999}
            precision={2}
            onChange={(value) =>
              changeDimensionAndWay(type, 'amount_auto_section', {
                base_charge: value,
              })
            }
            style={{ width: '100px', height: '30px' }}
          />
          <span>&nbsp;{Price.getUnit()}</span>
        </Flex>
      </FormItem>
      <FormItem label={t('初始运费')} required>
        <Flex alignCenter>
          <InputNumberV2
            className='form-control'
            value={origin_fee}
            min={0}
            max={999999999}
            precision={2}
            onChange={(value) =>
              changeDimensionAndWay(type, 'amount_auto_section', {
                origin_fee: value,
              })
            }
            style={{ width: '100px', height: '30px' }}
          />
          <span>&nbsp;{Price.getUnit()}</span>
        </Flex>
      </FormItem>
      <FormItem label={t('订单下单金额每满')} required>
        <Flex alignCenter>
          <InputNumberV2
            className='form-control'
            value={increase_fee}
            min={0}
            max={999999999}
            precision={2}
            onChange={(value) =>
              changeDimensionAndWay(type, 'amount_auto_section', {
                increase_fee: value,
              })
            }
            style={{ width: '100px', height: '30px' }}
          />
          <span>&nbsp;{Price.getUnit()}，&nbsp;加收</span>
          <InputNumberV2
            className='form-control'
            value={addition_fee}
            min={0}
            max={999999999}
            precision={2}
            onChange={(value) =>
              changeDimensionAndWay(type, 'amount_auto_section', {
                addition_fee: value,
              })
            }
            style={{ width: '100px', height: '30px' }}
          />
          <span>&nbsp;{Price.getUnit()}运费</span>
        </Flex>
      </FormItem>
      <FormItem label={t('满额免运费')}>
        <Flex alignCenter>
          <span> {t('下单金额超过（包含）')}</span>
          <InputNumberV2
            className='form-control'
            value={free_fee}
            min={0}
            max={999999999}
            precision={2}
            placeholder={t('选填')}
            onChange={(value) =>
              changeDimensionAndWay(type, 'amount_auto_section', {
                free_fee: value,
              })
            }
            style={{ width: '100px', height: '30px' }}
          />
          <span>
            &nbsp;{Price.getUnit()}&nbsp;
            {t('免收运费(无需满额免运费，则无需填写)')}
          </span>
        </Flex>
        <Popover
          type='hover'
          showArrow
          left
          popup={<img src={FreightExample} />}
        >
          <span className='btn btn-sm btn-link'>
            {t('自动设置价格区间与运费说明')}
          </span>
        </Popover>
      </FormItem>
    </>
  )
})

export default inject('store')(AutoSetting)
