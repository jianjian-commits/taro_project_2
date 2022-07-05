import { t } from 'gm-i18n'
import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, FormItem, PopupContentConfirm, Switch, Tip } from '@gmfe/react'
import Calculator from 'common/components/calculator/calculator'

const EditFormulaSettingContent = ({
  closePopup,
  formula_status,
  formula_info: { formula_text },
  saveData,
}) => {
  const [formulaStatus, setFormulaStatus] = useState(!!formula_status)
  const [formulaText, setFormulaText] = useState(formula_text)

  const handleChangeSwitch = useCallback((status) => {
    setFormulaStatus(status)
  }, [])

  const handleChangeFormula = useCallback((value) => {
    setFormulaText(value)
  }, [])

  const handleSave = useCallback(() => {
    if (formulaStatus && !formulaText) {
      Tip.warning(t('请输入销售单价'))
      return
    }
    saveData &&
      saveData({
        formulaText,
        formulaStatus,
      })
  }, [formulaText, saveData, formulaStatus])

  return (
    <PopupContentConfirm
      type='save'
      title={t('修改定价公式')}
      onCancel={closePopup}
      onSave={handleSave}
    >
      <Form labelWidth='70px' horizontal colWidth='380px'>
        <FormItem label={t('是否开启')}>
          <Switch
            className='gm-cursor'
            checked={formulaStatus}
            on={t('开启')}
            off={t('关闭')}
            onChange={handleChangeSwitch}
          />
          <div className='gm-text-desc gm-margin-top-5'>
            {t('开启时：可用此公式对商品进行智能定价')}
            <br />
            {t('关闭时：定价公式无法使用，且不做更新')}
          </div>
        </FormItem>
        <FormItem label={t('销售单价')} required={formulaStatus}>
          <Calculator
            onChange={handleChangeFormula}
            defaultValue={formula_text}
          />
        </FormItem>
      </Form>
    </PopupContentConfirm>
  )
}

EditFormulaSettingContent.propTypes = {
  closePopup: PropTypes.func,
  formula_status: PropTypes.string,
  formula_info: PropTypes.object,
  saveData: PropTypes.func,
}

export { EditFormulaSettingContent }
