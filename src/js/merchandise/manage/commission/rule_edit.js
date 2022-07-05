import React from 'react'
import store from './store'
import { observer } from 'mobx-react'
import {
  Button,
  Flex,
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  Loading,
  Modal,
  Switch,
  Tip,
  Validator,
} from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import Transfer from './components/transfer'
import Position from 'common/components/position'
import TableRight from '../../../marketing/manage/market_tag/components/list_detail_table_right'
import AddProductModal from './components/add_product_modal'
import goodStore from './components/goods_store'
import MarketTagListEdit from './components/market_tag_list_edit'
import { history } from 'common/service'
import globalStore from 'stores/global'
import _ from 'lodash'

@observer
class RuleEdit extends React.Component {
  refForm = React.createRef()
  refList = React.createRef()
  id = this.props.location.query.id || null // 规则详情有id,新增规则没有id

  handleSubmit = async () => {
    const canEdit = globalStore.hasPermission('edit_commission_rule')
    if (!canEdit) {
      Tip.info('没有编辑权限')
      return
    }

    const {
      ruleName,
      ruleStatus,
      rightSales,
      updateEmployeeRule,
      createEmployeeRule,
    } = store
    const saveData = this.id ? updateEmployeeRule : createEmployeeRule

    await saveData({
      id: this.id, // 规则详情有id,新增规则没有id
      name: ruleName.trim(),
      status: ruleStatus,
      employee_ids: JSON.stringify(rightSales.map(({ value }) => value)),
      skus_detail: JSON.stringify(
        goodStore.skus
          .map(({ percentage, id }) => ({
            sku_id: id,
            percentage: Number(percentage),
          }))
          .filter((o) => o.sku_id),
      ),
    })
    Tip.success(t('更新成功'))

    if (this.id) {
      // 详情页重新拉数据
      store.getSales()
      const data = await store.getDetail(this.id)
      goodStore.initData(data.skus_detail)
    } else {
      // 新增返回到上一页
      history.go(-1)
    }
  }

  handleCancel = () => {
    history.push('/merchandise/manage/commission')
  }

  handleAddProduct = () => {
    Modal.render({
      title: i18next.t('批量添加'),
      children: <AddProductModal />,
      style: {
        width: '1062px',
      },
      onHide: Modal.hide,
    })
  }

  render() {
    const { ruleName, handleChange, ruleStatus, searchIndex, isLoading } = store
    const { skus, label_2_list, isCreate } = goodStore

    if (isLoading) {
      return <Loading />
    }

    return (
      <FormGroup
        formRefs={[this.refForm]}
        onSubmitValidated={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <FormPanel title={i18next.t('基本信息')}>
          <Form ref={this.refForm} labelWidth='180px' colWidth='800px'>
            <FormItem
              label={i18next.t('规则名称')}
              required
              validate={Validator.create([], _.trim(ruleName))}
            >
              <input
                maxLength={30}
                style={{ width: '300px' }}
                className='gm-margin-left-10'
                placeholder={i18next.t('请输入规则名称')}
                type='text'
                value={ruleName}
                onChange={(e) => handleChange(e.target.value, 'ruleName')}
              />
            </FormItem>
            <FormItem label={i18next.t('选择销售经理')} required>
              <Transfer />
              <div
                className='gm-text-desc gm-margin-top-5'
                style={{ fontSize: '12px' }}
              >
                {t(
                  '选择销售经理后生成的订单才使用此分佣规则，选择销售经理前生成的订单不计入分佣',
                )}
              </div>
            </FormItem>
            <FormItem label={i18next.t('状态')} required>
              <Switch
                type='primary'
                checked={ruleStatus === 1}
                on={i18next.t('有效')}
                off={i18next.t('无效')}
                onChange={(v) => handleChange(v ? 1 : 0, 'ruleStatus')}
              />
              <div
                className='gm-text-desc gm-margin-top-5'
                style={{ fontSize: '12px' }}
              >
                {t(
                  '商品分佣金额计算使用的分佣比例，是下单时刻“有效”分佣规则中的分佣比例',
                )}
              </div>
            </FormItem>
          </Form>
        </FormPanel>
        <FormPanel
          showBorder={false}
          style={{ position: 'relative' }}
          title={i18next.t('选择商品')}
          left={
            <Flex
              nowrap
              className='gm-margin-left-20'
              style={{
                position: 'absolute',
                top: 4,
              }}
            >
              <Button
                type='primary'
                className='btn'
                onClick={this.handleAddProduct}
              >
                {`${i18next.t('批量添加')}${
                  skus.length === 0 ? '' : `(${skus.length})`
                }`}
              </Button>
              <Position
                className='gm-margin-left-20'
                list={skus.slice()}
                tableRef={this.refList}
                filterText={['name']}
                onHighlight={(i) => handleChange(i, 'searchIndex')}
                placeholder={i18next.t('请输入商品名称')}
              />
            </Flex>
          }
          right={<TableRight />}
        />
        <MarketTagListEdit
          refList={this.refList}
          searchIndex={searchIndex}
          labelList={label_2_list}
          isCreate={isCreate}
        />
      </FormGroup>
    )
  }
}

export default RuleEdit
