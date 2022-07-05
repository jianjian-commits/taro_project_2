import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import RecommendPlanHeader from '../components/recommend_plan_header'
import PanelLabel from 'common/components/panel_label'
import { t } from 'gm-i18n'
import { Button, Flex, Tip, DatePicker, Affix, Modal, Box } from '@gmfe/react'
import RecommendTable from './components/recommend_table'
import ReplaceProductModal from './components/replace_product_modal'
import { WithBreadCrumbs, history } from 'common/service'

const TimeSelect = observer(() => {
  const { plan_start_time, plan_finish_time } = store.recommendPlanData

  const handleStartDateChange = (value) => {
    store.changeRecommendPlanDataItem('plan_start_time', value)
  }

  const handleCompleteDateChange = (value) => {
    store.changeRecommendPlanDataItem('plan_finish_time', value)
  }
  return (
    <Flex className='gm-margin-tb-20'>
      <Flex row alignCenter>
        <span className='gm-margin-right-10'>{t('计划开始时间')}</span>

        <DatePicker
          date={plan_start_time}
          placeholder={t('请选择日期')}
          onChange={handleStartDateChange}
          max={plan_finish_time}
        />
      </Flex>
      <Flex row alignCenter className='gm-margin-left-20'>
        <span className='gm-margin-right-10'>{t('计划完成时间')}</span>

        <DatePicker
          date={plan_finish_time}
          placeholder={t('请选择日期')}
          onChange={handleCompleteDateChange}
          min={plan_start_time}
        />
      </Flex>
    </Flex>
  )
})

const OperationButton = observer(() => {
  const handleCancel = () => {
    history.push('/supply_chain/process/plan/create')
  }

  const handleBack = () => {
    history.push('/supply_chain/process/plan/create/recommend_setting')
  }

  const verifyData = () => {
    const { recommendSelected } = store

    return recommendSelected.length > 0
  }

  const doAddProduct = (isCover) => {
    store.addProduct(isCover)
    handleHide()
    history.push('/supply_chain/process/plan/create')
  }

  const handleHide = () => {
    Modal.hide()
  }

  const handleAddProduct = () => {
    if (verifyData()) {
      // 筛选已经添加的重复商品
      store.verifyAndSameProduct()

      // 若有重复商品则提示是否覆盖
      if (store.waitForReplaceProductData.length > 0) {
        Modal.render({
          children: (
            <ReplaceProductModal
              onCancel={handleHide}
              onCover={() => doAddProduct(true)}
              onNotCover={() => doAddProduct(false)}
            />
          ),
          title: t('提醒'),
          onHide: Modal.hide,
        })
      } else {
        // 没有相同商品，默认覆盖，因为数据为空，所以不影响
        doAddProduct(true)
      }
    } else {
      Tip.warning(t('请选择生产商品'))
    }
  }

  return (
    <Affix bottom={0}>
      <Flex
        justifyCenter
        alignCenter
        style={{ width: '100%', height: '50px', background: 'white' }}
        className='gm-margin-top-20'
      >
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button
          type='primary'
          plain
          onClick={handleBack}
          className='gm-margin-left-10'
        >
          {t('返回上一步')}
        </Button>
        <Button
          type='primary'
          onClick={handleAddProduct}
          className='gm-margin-left-10'
        >
          {t('添加商品')}
        </Button>
      </Flex>
    </Affix>
  )
})

const RecommendAlgorithmSetting = observer(() => {
  const { recommendProcessPlanList } = store

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('智能推荐列表')]} />
      <Box hasGap>
        <RecommendPlanHeader activeStep={2} />
        <PanelLabel title={t('预生产计划信息')} className='gm-margin-top-20' />
        <TimeSelect />
        <PanelLabel
          title={t('推荐生产商品列表：') + recommendProcessPlanList.length}
          className='gm-margin-top-20'
        />
        <RecommendTable />

        <OperationButton />
      </Box>
    </>
  )
})

export default RecommendAlgorithmSetting
