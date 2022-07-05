import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import ProcessPlanAlgorithmForm from 'common/components/process_plan_algorithm_form'
import store from '../store'
import RecommendPlanHeader from '../components/recommend_plan_header'
import PanelLabel from 'common/components/panel_label'
import { t } from 'gm-i18n'
import { Button, Flex, Tip, Box } from '@gmfe/react'
import RecommendLoading from './components/recommend_loading'
import { Prompt } from 'react-router-dom'
import { isValid } from 'common/util'
import { WithBreadCrumbs, history } from 'common/service'

const FormulaText = () => {
  return (
    <div
      style={{
        background: '#ffefe5',
        height: '60px',
        lineHeight: '60px',
        textAlign: 'center',
      }}
      className='gm-text-18 gm-margin-top-10'
    >
      {t('建议计划生产数 = 日均下单数 x 调整比例 x 预计备货天数')}
    </div>
  )
}

const Explanation = () => {
  return (
    <div className='gm-margin-top-20'>
      <span>
        {t(
          '公式说明：基于填写的近xx日均下单数乘以调整比例，再乘以预计备货天数计算得出在当前备货天数下的建议计划生产数；'
        )}
      </span>
      <br />
      <span>
        {t(
          '示例：如选择近3天的A商品的日均下单数为100斤，调整比例为80%，预计备5天的货，则计算出来的建议计划生产数为100*80%*5=400斤。'
        )}
      </span>
    </div>
  )
}

const OperationButton = observer(() => {
  const handleCancel = () => {
    history.push('/supply_chain/process/plan/create')
  }

  const verifyData = () => {
    let canSubmit = true
    const {
      query_order_type,
      query_order_days,
      adjust_ratio,
      stock_up_days,
      stock_up_type,
    } = store.algorithmFilterData

    // 日均下单数手动填写天数时，需要校验是否填写天数
    const verifyQueryOrder =
      query_order_type === 1 && !isValid(query_order_days)
    // 预计备货天数手动填写天数时，需要校验是否填写天数
    const verifyStockUp = stock_up_type === 1 && !isValid(stock_up_days)
    const verifyRatio = !isValid(adjust_ratio)

    if (verifyQueryOrder || verifyStockUp || verifyRatio) {
      Tip.warning(t('请填写完整信息'))
      canSubmit = false
    }

    return canSubmit
  }

  const handleRunCompute = () => {
    if (verifyData()) {
      // 执行运算
      return store.postStartCompute().then((json) => {
        store.setRecommendLoading(true)
        const task_url = json.data.task_url

        const getRecommendResultTimer = setInterval(() => {
          store
            .getRecommendResult(task_url)
            .then((json) => {
              // 设置进度
              store.setLoadingProgress(json.data.progress)

              if (json.data.progress === 100) {
                // 清除轮询
                clearInterval(getRecommendResultTimer)
                // 清除loading状态
                store.setRecommendLoading(false)
                // 设置推荐结果
                store.setRecommendResult(
                  json.data.result.business_data.data_list
                )
                // 跳转到结果页面
                history.push(
                  '/supply_chain/process/plan/create/recommend_product'
                )
              }
            })
            .catch((err) => {
              console.error('recommend error', err)
              // 清除轮询
              clearInterval(getRecommendResultTimer)
              // 清除loading状态
              store.setRecommendLoading(false)
            })
        }, 2000)
      })
    }
  }

  return (
    <Flex justifyCenter>
      <Button onClick={handleCancel}>{t('取消')}</Button>
      <Button
        type='primary'
        className='gm-margin-left-20'
        onClick={handleRunCompute}
      >
        {t('执行运算')}
      </Button>
    </Flex>
  )
})

const RecommendAlgorithmSetting = observer(() => {
  const { algorithmFilterData, recommendLoading } = store

  useEffect(() => {
    const beforeLeave = (e) => {
      e.preventDefault()
      e.returnValue = t('离开当前页后，所编辑的数据将不可恢复')
    }

    window.addEventListener('beforeunload', beforeLeave)

    return () => {
      window.removeEventListener('beforeunload', beforeLeave)
    }
  }, [])

  const handleChangeAlgorithmSetting = (name, value) => {
    store.changeAlgorithmSetting(name, value)
  }

  const promptMessage = (location) => {
    const toPathName = location.pathname
    return toPathName === '/supply_chain/process/plan/create/recommend_product'
      ? true
      : t('运算方案执行中，是否放弃执行')
  }

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('智能推荐')]} />
      <Box hasGap>
        <Prompt when={recommendLoading} message={promptMessage} />
        {/* 运算执行进度条遮罩 */}
        {recommendLoading && <RecommendLoading />}

        <RecommendPlanHeader activeStep={1} />
        <PanelLabel title={t('算法说明')} className='gm-margin-top-20' />
        <FormulaText />
        <Explanation />
        <PanelLabel title={t('算法配置')} className='gm-margin-top-20' />
        <ProcessPlanAlgorithmForm
          className='gm-margin-top-20'
          data={{ ...algorithmFilterData }}
          onChange={handleChangeAlgorithmSetting}
          showProductShowType
        />
        <OperationButton />
      </Box>
    </>
  )
})

export default RecommendAlgorithmSetting
