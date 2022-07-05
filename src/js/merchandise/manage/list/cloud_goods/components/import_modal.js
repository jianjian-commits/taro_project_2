import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Switch,
  MultipleFilterSelect,
  Form,
  FormItem,
  FormButton,
  Modal,
  RightSideModal,
  Validator,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'

import store from '../store'
import globalStore from '../../../../../stores/global'
import CategoryFilter from '../../../../../common/components/category_filter_hoc/single'
import TaskList from '../../../../../task/task_list'
import PropType from 'prop-types'

@observer
class ImportModal extends React.Component {
  componentDidMount() {
    store.fetchSaleMenuList()
    if (this.props.retail) {
      store.saleMenuSelect([{ id: globalStore.c_salemenu_id }])
    }
  }

  componentWillUnmount() {
    store.confirmCategoryClear()
    store.saleMenuClear()
  }

  handlePinLeiSwitchChange = () => {
    const {
      filter: { createPinLeiChecked },
    } = store

    store.setFilter('createPinLeiChecked', !createPinLeiChecked)
  }

  handleFenLeiSwitchChange = () => {
    const {
      filter: { createFenLeiChecked },
    } = store

    store.setFilter('createFenLeiChecked', !createFenLeiChecked)
  }

  handleSkuSwitchChange = () => {
    const {
      filter: { createSkuChecked },
    } = store

    store.setFilter('createSkuChecked', !createSkuChecked)
  }

  handleSelectSaleMenu = (selected) => {
    store.saleMenuSelect(selected)
  }

  handleCategoryFilterChange = (selected) => {
    store.setFilter('confirmCategory', selected)
  }

  handleSubmit = () => {
    Modal.hide()

    store.importByTemplate().then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        opacityMask: true,
        noCloseBtn: true,
        style: {
          width: '300px',
        },
      })
    })
  }

  handleHideModal = () => {
    Modal.hide()
  }

  validateCategory = (value) => {
    const { createPinLeiChecked } = store.filter

    if (
      !value.category1 ||
      !value.category2 ||
      (!createPinLeiChecked && !value.pinlei)
    ) {
      return i18next.t('请选择导入的商品分类')
    }
  }

  validateSaleMenu = (value) => {
    const { createSkuChecked } = store.filter

    if (createSkuChecked && value.length === 0) {
      return i18next.t('请选择商品规格所在报价单')
    }
  }

  render() {
    const {
      filter: {
        createFenLeiChecked,
        createPinLeiChecked,
        createSkuChecked,
        confirmCategory,
        sale_menu_selected,
      },
      spuList: { isSelectAllPage, selected, pagination },
      saleMenuList,
    } = store
    const currentSelectedLength = isSelectAllPage
      ? pagination.count
      : selected.length

    return (
      <Form
        onSubmitValidated={this.handleSubmit}
        disabledCol
        horizontal
        labelWidth='155px'
      >
        <FormItem label={i18next.t('已选择商品数')}>
          <div className='gm-padding-top-5'>{currentSelectedLength}</div>
        </FormItem>
        <FormItem label={i18next.t('是否自动创建分类')} col={3}>
          <Flex column className='gm-padding-top-5'>
            <div>
              <Switch
                checked={createFenLeiChecked}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={this.handleFenLeiSwitchChange}
              />
            </div>
            <div className='gm-padding-top-5 gm-text-desc'>
              {i18next.t('将云商品所属分类信息自动创建至本地商品分类下')}
            </div>
          </Flex>
        </FormItem>
        {!createFenLeiChecked && (
          <>
            <FormItem label={i18next.t('是否自动创建品类')} col={3}>
              <Flex column className='gm-padding-top-5'>
                <div>
                  <Switch
                    checked={createPinLeiChecked}
                    on={i18next.t('开启')}
                    off={i18next.t('关闭')}
                    onChange={this.handlePinLeiSwitchChange}
                  />
                </div>
                <div className='gm-padding-top-5 gm-text-desc'>
                  {i18next.t(
                    '开启后，将云商品所属品类自动创建至本地商品品类下'
                  )}
                </div>
              </Flex>
            </FormItem>
            <FormItem
              required
              validate={Validator.create(
                [],
                confirmCategory,
                this.validateCategory
              )}
              label={i18next.t('选择导入的商品分类')}
            >
              <Flex column>
                <div>
                  <CategoryFilter
                    disablePinLei={createPinLeiChecked}
                    selected={confirmCategory}
                    onChange={this.handleCategoryFilterChange}
                  />
                </div>
                <div className='gm-padding-top-5 gm-text-desc'>
                  {i18next.t('将云商品库商品创建至所选商品分类下')}
                </div>
              </Flex>
            </FormItem>
          </>
        )}
        <FormItem label={i18next.t('是否自动创建商品规格')} col={3}>
          <Flex column className='gm-padding-top-5'>
            <div>
              <Switch
                checked={createSkuChecked}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={this.handleSkuSwitchChange}
              />
            </div>
            <Flex column className='gm-padding-top-5 gm-text-desc'>
              <span>{i18next.t('开启后')}</span>
              <span>{i18next.t('1.根据云商品信息自动创建商品规格')}</span>
              <span>
                {i18next.t(
                  '2.根据云商品信息匹配系统已有采购规格，若无匹配则创建新的采购规格'
                )}
              </span>
              <span>
                {i18next.t(
                  '3.创建销售商品规格时为sku自动匹配默认供应商，若无匹配则创建商品规格失败'
                )}
              </span>
            </Flex>
          </Flex>
        </FormItem>
        {!this.props.retail && (
          <FormItem
            required
            validate={Validator.create(
              [],
              sale_menu_selected.slice(),
              this.validateSaleMenu
            )}
            label={i18next.t('选择商品规格所在报价单')}
            style={{ display: createSkuChecked ? 'flex' : 'none' }}
          >
            <Flex column className='gm-padding-bottom-10'>
              <div style={{ width: '300px' }}>
                <MultipleFilterSelect
                  disableSearch
                  id='sale_menu'
                  list={saleMenuList.slice()}
                  selected={sale_menu_selected.slice()}
                  onSelect={this.handleSelectSaleMenu}
                  placeholder={i18next.t('请选择报价单')}
                />
              </div>
              <div className='gm-padding-top-5 gm-text-desc'>
                <span>{i18next.t('将以上商品自动创建在所选报价单中')}</span>
              </div>
            </Flex>
          </FormItem>
        )}

        <Flex style={{ flexDirection: 'row-reverse' }}>
          <FormButton>
            <Button
              className='gm-margin-right-10'
              onClick={this.handleHideModal}
            >
              {i18next.t('取消')}
            </Button>
            <Button type='primary' htmlType='submit'>
              {i18next.t('确定')}
            </Button>
          </FormButton>
        </Flex>
      </Form>
    )
  }
}

ImportModal.propTypes = {
  retail: PropType.bool,
}

export default ImportModal
