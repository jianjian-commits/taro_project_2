/*
 * @Description: 绩效规则设置
 */
import React, { useEffect, useRef } from 'react'

import {
  Flex,
  Form,
  FormItem,
  FormGroup,
  FormPanel,
  InputNumberV2,
  Tip,
  LoadingChunk,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'

import CalculateRuleSetting from './components/calculate_rule_setting'

import globalStore from 'stores/global'
import store from './store'
import { isValid } from 'common/util'

function PerformanceRuleSetting(props) {
  const { sorterRules, loading } = store

  const { base_salary, piece_method, piece_rules, weight_rules } = sorterRules

  // 编辑绩效规则设置
  const editSorterPerformanceRule = globalStore.hasPermission(
    'edit_sorter_performance_rule',
  )

  const formRef1 = useRef()
  const formRef2 = useRef()

  useEffect(() => {
    store.getRules()
  }, [])

  function onChange(isPiece, key, value, index) {
    store.changeRow(isPiece, key, value, index)
  }

  function validateForm() {
    if (validateBaseSalary()) {
      store.setRules()
    }
  }

  function validateBaseSalary() {
    // 基本工资不能为空
    if (!isValid(base_salary)) {
      Tip.warning(t('请设置基本工资'))
      return
    }
    if (!validateTable(piece_rules, true) || !validateTable(weight_rules)) {
      return
    }
    return true
  }
  function validateTable(arr, isPiece) {
    const preTitle = isPiece ? '计件' : '计重'
    const preTip = `${preTitle}${'结算规则'}`
    const length = arr.length
    for (let i = 0; i < length; ++i) {
      const { value, min, perf } = arr[i]

      if (!isValid(perf)) {
        Tip.warning(
          t('index_row', {
            VAR1: preTip,
            VAR2: i + 1,
            VAR3: `请填写单位${preTitle}单价`,
          }),
        )
        // "${VAR1}第${VAR2}行${VAR3}"
        return false
      }
      if (length > 1 && i < length - 1) {
        if (!isValid(value)) {
          Tip.warning(
            t('index_row', {
              VAR1: preTip,
              VAR2: i + 1,
              VAR3: `请填写最大${preTitle}数`,
            }),
          )
          return false
        }
        if (value < min) {
          Tip.warning(
            t('index_row', {
              VAR1: preTip,
              VAR2: i + 1,
              VAR3: `最大${preTitle}数不能小于最小${preTitle}数`,
            }),
          )
          return false
        }
      }
    }
    return true
  }

  return (
    <LoadingChunk text={t('拼命加载中...')} loading={loading}>
      <FormGroup
        formRefs={[formRef1, formRef2]}
        onSubmitValidated={validateForm}
        disabled={!editSorterPerformanceRule}
      >
        <FormPanel title={t('基本信息')}>
          <Form ref={formRef1} labelWidth='180px' colWidth='610px'>
            <FormItem label={t('设置基本工资')} required>
              <Flex alignCenter>
                <InputNumberV2
                  className='form-control'
                  style={{ width: 200 }}
                  value={base_salary !== null ? Number(base_salary) : undefined}
                  min={0}
                  max={999999999}
                  precision={2}
                  onChange={(base_salary) =>
                    store.changeSorterRules({ base_salary })
                  }
                  placeholder={t('请输入基本工资')}
                  disabled={!editSorterPerformanceRule}
                />
                <span className='gm-padding-5'>{t('元/日')}</span>
              </Flex>

              <div className='gm-text-desc gm-margin-top-5'>
                {t(
                  '设置分拣工的单日基本工资，以分拣工在当日有分拣操作视为正常上岗',
                )}
              </div>
            </FormItem>
          </Form>
        </FormPanel>
        <CalculateRuleSetting
          isPiece
          formRef={formRef1}
          piece_method={piece_method}
          list={piece_rules.slice()}
          onRadioChange={(piece_method) =>
            store.changeSorterRules({ piece_method })
          }
          onAddRow={() => store.addRow(true)}
          onChange={onChange.bind(null, true)}
          onDeleteRow={store.deleteRow.bind(store, true)}
          disabled={!editSorterPerformanceRule}
        />
        <CalculateRuleSetting
          formRef={formRef2}
          list={weight_rules.slice()}
          onAddRow={() => store.addRow(false)}
          onDeleteRow={store.deleteRow.bind(store, false)}
          onChange={onChange.bind(null, false)}
          disabled={!editSorterPerformanceRule}
        />
      </FormGroup>
    </LoadingChunk>
  )
}

export default observer(PerformanceRuleSetting)
