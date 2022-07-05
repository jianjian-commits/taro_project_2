import { i18next, t } from 'gm-i18n'
import React from 'react'
import {
  FormGroup,
  Form,
  FormItem,
  Loading,
  Flex,
  Dialog,
  Radio,
  RadioGroup,
  Validator,
  FormPanel,
  Button,
} from '@gmfe/react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { history } from '../../../../common/service'
import smartMenusStore from './store'
import SuperSkuTransfer from 'common/components/super_sku_transfer'
import globalStore from '../../../../stores/global'
import template_img from '../../../../../img/smart_menu_template.png'

@observer
class SmartMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showTemplate: false,
      sku_type: 1, // 1 普通商品 2 组合商品
    }
    this.refform = React.createRef()
  }

  componentDidMount() {
    smartMenusStore.getSkuList()
    smartMenusStore.getCombineSkuList()
    const { query } = this.props.location
    if (query.type !== 'create') {
      const id = query.type.split('=')[1]
      smartMenusStore.getSmartMenuDetail(id)
    }
  }

  handleCancel = () => {
    smartMenusStore.changeViewType('')
    history.push({
      pathname: '/merchandise/manage/list/smart_menu',
    })
  }

  handleUpload = () => {
    const { smartMenuDetail, viewType } = smartMenusStore
    const { name, id, selectedSkuValue } = smartMenuDetail

    if (viewType === 'create') {
      smartMenusStore.createSmartMenu(name, selectedSkuValue)
    }
    if (viewType === 'edit') {
      smartMenusStore.editSmartMenu(id, name, selectedSkuValue)
    }

    history.push({
      pathname: '/merchandise/manage/list/smart_menu',
    })
  }

  handleDelete = () => {
    const { smartMenuDetail } = smartMenusStore
    const { id } = smartMenuDetail

    Dialog.confirm({
      children: i18next.t('是否删除该菜单?'),
      title: i18next.t('确认删除'),
    }).then(() => {
      smartMenusStore.delSmartMenu(id)
      history.push({
        pathname: '/merchandise/manage/list/smart_menu',
      })
    })
  }

  handleMenuNameChange = (e) => {
    smartMenusStore.changeSmartMenuDetail('name', e.target.value)
  }

  handleCheckPrint = () => {
    const isShow = !this.state.showTemplate
    this.setState({
      showTemplate: isShow,
    })
  }

  handleTransfer = (selected) => {
    smartMenusStore.setSkuList(selected)
  }

  render() {
    const canEditMenu = globalStore.hasPermission('edit_smart_menu')
    const canDelMenu = globalStore.hasPermission('delete_smart_menu')

    const {
      viewType,
      skuList,
      combineSkuList,
      skuListLoading,
      smartMenuDetail: { name, selectedSkuValue },
    } = smartMenusStore

    return (
      <FormGroup
        onSubmitValidated={this.handleUpload}
        onCancel={this.handleCancel}
        formRefs={[this.refform]}
      >
        <FormPanel
          title={i18next.t('基本信息')}
          right={
            viewType === 'edit' && canDelMenu ? (
              <Button type='primary' plain onClick={this.handleDelete}>
                {i18next.t('删除')}
              </Button>
            ) : null
          }
        >
          <Form labelWidth='151px' colWidth='419px' ref={this.refform}>
            <FormItem
              label={i18next.t('智能菜单名称')}
              required
              validate={Validator.create([], name)}
            >
              <input
                maxLength={20}
                placeholder={i18next.t('请输入识别单名称（20个字以内）')}
                type='text'
                value={name}
                onChange={this.handleMenuNameChange}
                disabled={!canEditMenu}
              />
            </FormItem>
            <FormItem label={i18next.t('选择商品')}>
              <RadioGroup
                inline
                value={this.state.sku_type}
                name='sku_type'
                onChange={(sku_type) => this.setState({ sku_type })}
              >
                <Radio value={1} key={1}>
                  {t('普通商品')}
                </Radio>
                <Radio value={2} key={2}>
                  {t('组合商品')}
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label=''>
              {skuListLoading ? (
                <Loading />
              ) : (
                <SuperSkuTransfer
                  skuList={toJS(skuList)}
                  combineSkuList={toJS(combineSkuList)}
                  onSelect={this.handleTransfer}
                  selectedValues={selectedSkuValue.slice()}
                  skuType={this.state.sku_type}
                />
              )}
            </FormItem>
            <FormItem label={i18next.t('模板预览')}>
              <div style={{ marginTop: '6px' }}>
                <a href='javascript:;' onClick={this.handleCheckPrint}>
                  {i18next.t('点击查看')}
                </a>
              </div>
            </FormItem>
            {this.state.showTemplate && (
              <FormItem label=''>
                <Flex justifyCenter>
                  <img
                    src={template_img}
                    style={{ width: '800px', height: '270px' }}
                  />
                </Flex>
              </FormItem>
            )}
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default SmartMenu
