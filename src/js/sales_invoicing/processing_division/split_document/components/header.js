import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { storeContext } from './details_component'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import SplitPlanSelect from './split_plan_select'
import HeaderItem from './header_item'
import { SPLIT_SHEET_STATUS } from 'common/enum'
import SplitTimeItem from './split_time_item'
import ButtonGroup from './button_group'
import ToSplitCountCell from './to_split_count_cell'
import GainCountItem from './gain_count_item'
import SplitLossItem from './split_loss_item'

const Header = () => {
  const { sheet_no, splitPlan, status, operator } = useContext(storeContext)

  return (
    <ReceiptHeaderDetail
      HeaderAction={<ButtonGroup />}
      contentLabelWidth={90}
      contentCol={4}
      customeContentColWidth={[440, 440, 440, 440]}
      HeaderInfo={[
        { label: t('分割单号'), item: <HeaderItem value={sheet_no} isId /> },
        { label: t('分割方案'), item: <SplitPlanSelect /> },
      ]}
      ContentInfo={[
        {
          label: t('待分割品'),
          item: (
            <HeaderItem
              value={splitPlan}
              renderer={(value) => value.source_spu_name}
            />
          ),
        },
        { label: t('待分割品消耗量'), item: <ToSplitCountCell /> },
        {
          label: t('获得品总量'),
          item: <GainCountItem />,
        },
        { label: t('分割损耗'), item: <SplitLossItem /> },
        {
          label: t('状态'),
          item: <HeaderItem value={SPLIT_SHEET_STATUS[status]} />,
        },
        { label: t('分割时间'), item: <SplitTimeItem /> },
        { label: t('操作人'), item: <HeaderItem value={operator} /> },
      ]}
    />
  )
}

export default observer(Header)
