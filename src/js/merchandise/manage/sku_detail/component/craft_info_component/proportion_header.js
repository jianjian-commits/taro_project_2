import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { ToolTip, Flex } from '@gmfe/react'

import skuStore from '../../sku_store'

const ProportionHeader = observer(() => {
  const {
    skuDetail: {
      clean_food_info: { process_unit_status },
    },
  } = skuStore
  return (
    <Flex alignCenter>
      <span>
        {t('单位数量')}
        {!process_unit_status && ( // 开启计量单位则不显示基本单位
          <>
            <br />
            {`(${t('基本单位')})`}
          </>
        )}
      </span>
      {!process_unit_status && (
        <ToolTip
          popup={
            <div className='gm-margin-5'>
              {t(
                '请录入生成1个销售单位当前商品所需的物料数，如1盒果篮，请录入1个篮子，1个包装袋'
              )}
            </div>
          }
        />
      )}
    </Flex>
  )
})

export default ProportionHeader
