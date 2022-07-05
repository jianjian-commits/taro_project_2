import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  FormGroup,
  Button,
  Modal,
  RightSideModal,
  Tip,
} from '@gmfe/react'
import SaleForm from './sale_info'
import SupplyChainForm from './supply_chain_info'
import CraftForm from './craft_info'
import TurnoverForm from './turnover_info'
import UnityModal from './sku_unit'
import TaskList from '../../../../task/task_list'

import { System } from '../../../../common/service'
import globalStore from '../../../../stores/global'
import merchandiseStore from '../../store'
import skuStore from '../sku_store'
import spuStore from '../spu_store'
import Big from 'big.js'
import {
  getSupplierSelected,
  getPsList,
  getSalemenuSelected,
  getPsSelected,
} from '../util'
import { getOptionalMeasurementUnitList } from '../../../util'
import _ from 'lodash'
import { toJS } from 'mobx'

@observer
class SkuDetailFormGroup extends React.Component {
  constructor(props) {
    super(props)
    this.refform1 = React.createRef()
    this.refform2 = React.createRef()
    this.refform3 = React.createRef()
    this.refform4 = React.createRef()
  }

  save = (spu_id, sku_id) => {
    if (sku_id) {
      Modal.hide()
      // 保存传id 同步传ids
      skuStore.updateSku().then((json) => {
        if (skuStore.unity === 0) {
          Tip.success(i18next.t('修改成功'))
          this.afterSave(spu_id)
        } else {
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        }
      })
    } else {
      skuStore.createSku(spu_id).then((json) => {
        if (skuStore.asyncCreate === 0) {
          Tip.success(i18next.t('新增成功'))
          this.afterSave(spu_id)
        } else {
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        }
      })
    }
  }

  afterSave = async (spu_id) => {
    await skuStore.getSkuListDetail(spu_id)
    skuStore.copyNowSkuCardDetail()
  }

  handleSave = (unity) => {
    const { id, name } = spuStore.spuDetail
    const {
      skuDetail: { supplier_id, sku_id, purchase_spec_id, clean_food },
      purchaseSpecList,
    } = skuStore
    const { spuSupplierList } = merchandiseStore
    skuStore.changeUnity(unity)
    // 如果是净菜，则没有供应商和采购规格的下面逻辑了,那直接save,返回了
    if (clean_food) {
      return this.save(id, sku_id)
    }

    const supplierSelected = getSupplierSelected(
      toJS(spuSupplierList),
      supplier_id,
    )
    const psList = getPsList(purchaseSpecList, supplierSelected)
    const psSelected = getPsSelected(psList, purchase_spec_id)
    const { upstream, value } = supplierSelected || {}

    // 新建采购规格
    if (purchase_spec_id === -1) {
      const {
        purchaseSpec,
        ratio,
        std_unit_name,
        unit_name,
      } = skuStore.purchaseSpecInfo
      const price = psSelected ? psSelected.price || 0 : 0
      const newRatio = +purchaseSpec === 1 ? 1 : ratio
      const new_unit_name = +purchaseSpec === 1 ? std_unit_name : unit_name

      const req = {
        spu_id: id,
        price: Number(Big(price).times(100)),
        name: name + '|' + newRatio + std_unit_name + '/' + new_unit_name,
        unit_name: new_unit_name,
        ratio: newRatio,
      }
      skuStore.createPurchaseSpec(req).then((json) => {
        const psId = json.data.purchase_spec_id

        skuStore.getPurchaseSpecList(id, value).then(() => {
          // 设值应该在获取新的值后
          skuStore.changeSkuDetail({
            purchase_spec_id: psId,
          })
          return this.save(id, sku_id)
        })
      })
    } else if (+upstream === 1) {
      return this.save(id, sku_id)
    } else {
      skuStore.getPurchaseSpecList(id, value).then(() => {
        return this.save(id, sku_id)
      })
    }
  }

  handleChangeSalemenu = (selected) => {
    skuStore.changeSkuDetail({
      unity_salemenu_ids: selected,
    })
  }

  render() {
    const { id: spu_id, std_unit_name } = spuStore.spuDetail
    const { salemenuId } = this.props.location.query
    const skuIdInUrl = this.props.location.query.sku_id
    const {
      skuDetail: {
        sku_id,
        salemenu_id,
        salemenu_ids,
        supplier_id,
        purchase_spec_id,
        std_unit_name_forsale,
        clean_food,
      },
      nowSkuCardDetail,
      unitySkuSalemenuList,
      purchaseSpecList,
      activeIndex,
      skuListCard,
    } = skuStore
    const { spuSupplierList, allSalemenuList } = merchandiseStore

    let salemenuSelected
    let cardLength = 0
    if (sku_id || skuIdInUrl) {
      salemenuSelected = getSalemenuSelected(allSalemenuList, salemenu_id)
    }
    if (!sku_id && activeIndex === 0) {
      salemenuSelected = getSalemenuSelected(allSalemenuList, salemenu_ids)
    }
    // 新建的时候传ids 第一个if为url中带skuid
    // activeIndex url带skuid的时候进行新建
    _.map(skuListCard.slice(), () => {
      cardLength++
    })
    // 少于两个card不显示同步
    const supplierSelected = getSupplierSelected(
      toJS(spuSupplierList),
      supplier_id,
    )

    const psList = getPsList(purchaseSpecList, supplierSelected)
    const psSelected = getPsSelected(psList, purchase_spec_id)

    // 选择销售计量单位
    const measurementUnitList = getOptionalMeasurementUnitList(std_unit_name)
    const stdUnitNameForSaleSelected = _.find(
      measurementUnitList,
      (v) => v.value === std_unit_name_forsale,
    )
    let stdUnitNameForSaleRatio = 1
    if (stdUnitNameForSaleSelected)
      stdUnitNameForSaleRatio = stdUnitNameForSaleSelected.ratio

    const feeType = salemenuSelected[0]?.fee_type || ''

    // 净菜站点才有工艺信息
    // 零售没有周转物
    const isCleanFood = globalStore.isCleanFood() && clean_food
    let formRefs = []
    if (System.isB()) {
      if (isCleanFood)
        formRefs = [this.refform1, this.refform2, this.refform3, this.refform4]
      else formRefs = [this.refform1, this.refform2, this.refform4]
    } else {
      if (isCleanFood) formRefs = [this.refform1, this.refform2, this.refform3]
      else formRefs = [this.refform1, this.refform2]
    }

    const p_editSku = globalStore.hasPermission('edit_sku')
    const p_editSupply = globalStore.hasPermission('edit_supplier_sku')

    const handleUnitySku = () => {
      Modal.render({
        children: (
          <UnityModal
            unitySkuSalemenuList={unitySkuSalemenuList}
            onHandleChangeSalemenu={this.handleChangeSalemenu}
            onHandleSave={() => this.handleSave(1)}
            nowSkuCardDetail={nowSkuCardDetail}
            activeIndex={activeIndex}
          />
        ),
        style: {
          width: '500px',
        },
        title: i18next.t('同步至其他报价单'),
        onHide: Modal.hide,
      })
    }

    return (
      <FormGroup
        formRefs={formRefs}
        onSubmitValidated={() => this.handleSave(0)}
        disabled={!(p_editSupply || p_editSku)}
        actions={
          <>
            {sku_id && cardLength >= 2 && System.isB() && (
              <Button
                type='primary'
                plain
                onClick={handleUnitySku}
                className='gm-margin-left-10'
              >
                {i18next.t('保存并同步')}
              </Button>
            )}
          </>
        }
      >
        <FormPanel title={i18next.t('销售信息')}>
          <SaleForm
            ref={this.refform1}
            salemenuSelected={salemenuSelected}
            salemenuId={salemenuId}
            feeType={feeType}
            measurementUnitList={measurementUnitList}
          />
        </FormPanel>
        <FormPanel title={i18next.t('供应链信息')}>
          <SupplyChainForm
            spu_id={spu_id}
            salemenuSelected={salemenuSelected}
            supplierSelected={supplierSelected}
            psSelected={psSelected}
            psList={psList}
            forwardRef={this.refform2}
            feeType={feeType}
            stdUnitNameForSaleRatio={stdUnitNameForSaleRatio}
          />
        </FormPanel>
        {isCleanFood && (
          <FormPanel title={i18next.t('工艺信息')}>
            <CraftForm spu_id={spu_id} forwardRef={this.refform3} />
          </FormPanel>
        )}
        {System.isB() && (
          <FormPanel title={i18next.t('周转物')}>
            <TurnoverForm forwardRef={this.refform4} />
          </FormPanel>
        )}
      </FormGroup>
    )
  }
}

export default SkuDetailFormGroup
