import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import {
  Flex,
  Form,
  FormItem,
  Switch,
  Select,
  Option,
  Checkbox,
  Dialog,
  Modal,
  Tip,
  RightSideModal,
  FormGroup,
  FormPanel,
  FormBlock,
  ToolTip,
  Button,
} from '@gmfe/react'
import Position from 'common/components/position'
import { sortFilter, createPromotionUrl, verifyValue } from './utils'
import { history, System, isCStationAndC } from 'common/service'
import Url from 'common/components/url'
import DropperSelect from './components/dropper_select'
import RightSide from './components/right_side'
import PromotionSkus from './components/promotion_skus'
import FailureSkuModal from './components/failure_sku_modal'
import MarketTagListEdit from './components/market_tag_list_edit'
import TableRight from './components/list_detail_table_right'
import AddProductModal from './components/add_product_modal'
import { tagDetailStore } from './stores'
import globalStore from 'stores/global'

import tagMarkerDomeImg from 'img/tag_marker_demo.png'

const stores = tagDetailStore

@observer
class MarketDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search_index: -1,
    }

    this.clipboard = null
    this.refform1 = React.createRef()
    this.refform2 = React.createRef()
    this.refList = React.createRef()
  }

  UNSAFE_componentWillMount() {
    const detailId = this.props.location.query.id
    if (detailId) {
      stores.getDetailById(detailId)
    }
    stores.getSkuList()
    stores.getIconsList()
    stores.clearSkuTreeData()
  }

  componentWillUnmount() {
    stores.clearDetail()
  }

  handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'name') {
      const temp = value && value.trim()
      if (temp.length > 50) {
        Tip.warning(i18next.t('活动名称不能超过50个字符!'))
        return
      }
    } else if (name === 'sort') {
      const temp = value && value.trim()
      if (temp && !sortFilter(temp)) {
        return
      }
    } else if (name === 'label_1_name') {
      const temp = value && value.trim()
      if (temp.length > 20) {
        Tip.warning(i18next.t('一级标签名字不能超过20个字符!'))
        return
      }
    }
    stores.setInputDetail(name, value)
  }

  handleSwitchChange = (value) => {
    stores.setInputDetail('active', value)
  }

  handleSelectChange(name, value) {
    stores.setInputDetail(name, value)
  }

  handleTagCheckbox = (e) => {
    const checked = e.target.checked

    stores.setInputDetail('enable_label_2', checked)
  }

  handleRightSide = (e) => {
    e.preventDefault()
    RightSideModal.render({
      children: (
        <Flex column>
          <div className='gm-inline-block'>
            <div className='gm-text-red gm-padding-5 gm-padding-left-10'>
              {i18next.t('注：删除二级标签，将移除该二级标签下的活动商品')}
              <Button
                type='primary'
                className='pull-right'
                onClick={this.handleRightSideSave}
              >
                {i18next.t('确定')}
              </Button>
            </div>
          </div>
          <RightSide />
        </Flex>
      ),
      title: i18next.t('二级标签设置'),
      onHide: this.handleRightSideHide,
      opacityMask: true,
      style: {
        width: '600px',
      },
    })
  }

  handleRightSideSave = () => {
    stores
      .syncForSecondTag(true)
      .then((filterValuesList) => {
        stores.deleteSkuByLabel2(filterValuesList)
        RightSideModal.hide()
      })
      .catch((err) => {
        Tip.danger(err)
      })
  }

  handleRightSideHide = () => {
    stores.syncForSecondTag(false)
    RightSideModal.hide()
  }

  handleByManual() {
    Modal.hide()
  }

  handleByAutomation() {
    tagDetailStore.removeErrorSkus()
    Modal.hide()
  }

  handleErrorSkus() {
    Modal.render({
      children: (
        <FailureSkuModal
          onManual={this.handleByManual}
          onAutomation={this.handleByAutomation}
        />
      ),
      title: i18next.t('以下商品已在同类型有效限购活动中，请重新选择商品'),
      onHide: Modal.hide,
    })
  }

  handleUpdateDetail = () => {
    const isCheckedLabel3 = stores.enable_label_2
    const showMethod = stores.show_method
    const pic = stores.pic

    if (showMethod) {
      if (!stores.name || !stores.label_1_name) {
        Tip.warning(i18next.t('请填写完整！'))
        return
      }
      if (isCheckedLabel3 && stores.isEmptyLabel2()) {
        Tip.danger(i18next.t('若开启二级标签则必须设置二级标签！'))
        return
      }
      if (isCheckedLabel3 && stores.isEmptySkuLabel2()) {
        Tip.danger(i18next.t('存在未设置二级标签的sku！'))
        return
      }
      if (!pic.url) {
        Tip.danger(i18next.t('必须上传图片！'))
        return
      }
    }

    const postDetail = stores.getDetail()
    if (toJS(postDetail.skus) && toJS(postDetail.skus).length === 0) {
      Tip.danger(i18next.t('未选择商品！'))
      return
    }
    if (!_.every(postDetail.skus.slice(), 'id')) {
      Tip.danger(i18next.t('未补全商品！'))
      const index = _.findIndex(postDetail.skus.slice(), (i) => !i.id)
      this.refList.current.scrollToItem(index, 'start')
      return
    }

    const detailId = this.props.location.query.id

    stores
      .detailUpdatePost(
        Object.assign(postDetail, {
          id: detailId,
        }),
      )
      .then((json) => {
        if (stores.type === 2 && json.code === 1) {
          this.handleErrorSkus()
        } else {
          Tip.success(i18next.t('更新成功!'))
          history.push(System.getUrl('/marketing/manage/market_tag'))
        }
      })
  }

  handleCreateDetail = () => {
    const isCheckedLabel3 = stores.enable_label_2
    const showMethod = stores.show_method
    const pic = stores.pic

    if (showMethod) {
      if (!stores.name || !stores.label_1_name) {
        Tip.warning(i18next.t('请填写完整！'))
        return
      }
      if (isCheckedLabel3 && stores.isEmptyLabel2()) {
        Tip.danger(i18next.t('若开启二级标签则必须设置二级标签！'))
        return
      }
      if (isCheckedLabel3 && stores.isEmptySkuLabel2()) {
        Tip.danger(i18next.t('存在未设置二级标签的sku！'))
        return
      }
      if (!pic.url) {
        Tip.danger(i18next.t('必须上传图片！'))
        return
      }
    } else {
      if (!stores.name) {
        Tip.warning(i18next.t('请填写完整！'))
        return
      }
    }

    const postDetail = stores.getDetail()
    if (toJS(postDetail.skus) && toJS(postDetail.skus).length === 0) {
      Tip.danger(i18next.t('未选择商品！'))
      return
    }
    if (!_.every(postDetail.skus.slice(), 'id')) {
      Tip.danger(i18next.t('未补全商品！'))
      const index = _.findIndex(postDetail.skus.slice(), (i) => !i.id)
      this.refList.current.scrollToItem(index, 'start')
      return
    }
    stores.detailCreatePost(postDetail).then((json) => {
      if (stores.type === 2 && json.code === 1) {
        this.handleErrorSkus()
      } else {
        Tip.success(i18next.t('新建成功!'))
        history.push(System.getUrl('/marketing/manage/market_tag'))
      }
    })
  }

  handleCancel = () => {
    history.push(System.getUrl('/marketing/manage/market_tag'))
  }

  deleteItem = () => {
    const id = this.props.location.query.id
    const name = stores.name

    Dialog.confirm({
      title: i18next.t('KEY51', {
        VAR1: name,
      }) /* src:`删除活动：${name}` => tpl:删除活动：${VAR1} */,
      size: 'sm',
      children: <div>{i18next.t('是否删除该活动?')}</div>,
      onOK: () => {
        stores.deleteItem(id).then(() => {
          history.push(System.getUrl('/marketing/manage/market_tag'))
        })
      },
    })
  }

  handleShowSample = () => {
    Modal.render({
      style: {
        width: '420px',
      },
      children: (
        <img
          style={{ width: '380px' }}
          src={tagMarkerDomeImg}
          alt={i18next.t('示例图')}
        />
      ),
      onHide: Modal.hide,
    })
  }

  handleAddProduct = (e) => {
    Modal.render({
      title: i18next.t('批量添加'),
      children: <AddProductModal />,
      style: {
        width: '1062px',
      },
      onHide: Modal.hide,
    })
  }

  handleHighlight = (index) => {
    this.setState({ search_index: index })
  }

  render() {
    const {
      name,
      active,
      show_method,
      sort,
      type,
      label_1_name,
      enable_label_2,
      restPurSkus,
      cms_key,
      skus,
    } = stores
    const label_2 = toJS(stores.label_2)

    const isCreate = !this.props.location.query.id
    // 二级标签
    const label2IsOk = enable_label_2 && label_2[0] && label_2[0].name
    const label_2_list = label2IsOk ? label_2 : []

    const hasDeletePermission = globalStore.hasPermission('delete_promotion')
    const promotionUrl = createPromotionUrl(
      this.props.location.query.id,
      cms_key,
    )
    return (
      <FormGroup
        formRefs={[this.refform1, this.refform2]}
        disabled={type === 2 ? verifyValue(restPurSkus) : false}
        onCancel={this.handleCancel}
        onSubmit={isCreate ? this.handleCreateDetail : this.handleUpdateDetail}
      >
        <FormPanel
          title={i18next.t('基本信息')}
          right={
            !hasDeletePermission || isCreate ? null : (
              <Button onClick={this.deleteItem}>{i18next.t('删除')}</Button>
            )
          }
        >
          <Form ref={this.refform1} labelWidth='180px' colWidth='410px'>
            <FormBlock col={2}>
              <FormItem label={i18next.t('活动名称')} required>
                <input
                  type='text'
                  name='name'
                  value={name}
                  placeholder={i18next.t('请输入活动名称')}
                  onChange={this.handleInputChange}
                />
              </FormItem>
              <FormItem label={i18next.t('活动状态')} required>
                <Switch
                  type='primary'
                  checked={!!active}
                  on={i18next.t('有效')}
                  off={i18next.t('无效')}
                  onChange={this.handleSwitchChange}
                />
              </FormItem>
              {System.isB() && (
                <FormItem
                  label={i18next.t('活动类型')}
                  required
                  toolTip={
                    type === 2 ? (
                      <div className='gm-padding-5'>
                        {i18next.t(
                          '优惠价仅对商城下单有效，station手工下单默认采用商品原价或锁价，但会扣减商品的限购数量',
                        )}
                      </div>
                    ) : null
                  }
                >
                  <Select
                    disabled={!_.isEmpty(this.props.location.query.id)}
                    value={type}
                    onChange={this.handleSelectChange.bind(this, 'type')}
                  >
                    <Option value={2}>{i18next.t('限购')}</Option>
                    <Option value={1}>{i18next.t('默认')}</Option>
                  </Select>
                </FormItem>
              )}
              {isCreate ? (
                <FormItem label={i18next.t('固定URL')}>
                  <span className='gm-inline-block gm-padding-tb-5'>-</span>
                </FormItem>
              ) : (
                <FormItem label={i18next.t('固定URL')}>
                  <Flex
                    style={{ width: '580px', marginTop: '6px' }}
                    alignCenter
                  >
                    <Url
                      target='_brank'
                      href={promotionUrl}
                      toolTip={
                        <div className='gm-padding-5'>
                          {isCStationAndC()
                            ? i18next.t(
                                '固定URL可用于广告位推广，通过广告位链接跳转至相应营销活动',
                              )
                            : i18next.t(
                                '固定URL可用于外部推广，通过链接跳转至相应营销活动',
                              )}
                        </div>
                      }
                    />
                  </Flex>
                </FormItem>
              )}
            </FormBlock>
            {type === 2 ? (
              <FormItem label={i18next.t('活动规则')} required colWidth='600px'>
                <Flex style={{ marginTop: '6px' }}>
                  <div>
                    <div>
                      {i18next.t(
                        '设置限购数量，在限购数量内享受优惠价，超过限购数量恢复原价。',
                      )}
                    </div>
                    <div>
                      {i18next.t(
                        '此优惠在每个运营周期内每个商户只能享受一次。',
                      )}
                    </div>
                  </div>
                  <ToolTip
                    popup={
                      <div className='gm-padding-5'>
                        <div>
                          {i18next.t(
                            '当商品设置阶梯定价时，限购不生效，且商城不展示限购。',
                          )}
                        </div>
                        <div>
                          {i18next.t(
                            '当锁价价格小于等于限购活动价时，商城将展示锁价价格，按锁价规则计算金额。',
                          )}
                        </div>
                        <div>
                          {i18next.t(
                            '参与限购活动的时价商品仍按时价规则计算。',
                          )}
                        </div>
                        <div>
                          {i18next.t(
                            '在订单列表修改限购商品的下单数，会更新商品的限购数量，但价格不会更新，需确认价格后手动修改。',
                          )}
                        </div>
                      </div>
                    }
                  />
                </Flex>
              </FormItem>
            ) : null}
          </Form>
        </FormPanel>
        <FormPanel title={i18next.t('展示信息')}>
          <Form ref={this.refform2} labelWidth='180px' colWidth='410px'>
            <FormBlock col={2}>
              <FormItem
                label={i18next.t('展示类型')}
                required
                toolTip={
                  <div className='gm-padding-5'>
                    {i18next.t(
                      '营销活动的展示形式，"首页分类"表示菜单入口展示、"无"表示商城无入口',
                    )}
                  </div>
                }
              >
                <Select
                  value={show_method}
                  onChange={this.handleSelectChange.bind(this, 'show_method')}
                >
                  <Option value={1}>{i18next.t('首页分类')}</Option>
                  <Option value={0}>{i18next.t('无')}</Option>
                </Select>
              </FormItem>
              {show_method ? (
                <FormItem
                  label={i18next.t('位置排序')}
                  toolTip={
                    <div className='gm-padding-5'>
                      {i18next.t('按数字顺序排序，例如：1表示排列在最前')}
                    </div>
                  }
                >
                  <input
                    className='form-control'
                    type='text'
                    name='sort'
                    value={sort}
                    onChange={this.handleInputChange}
                  />
                </FormItem>
              ) : null}
              {show_method ? (
                <FormItem
                  label={i18next.t('一级标签')}
                  required
                  toolTip={
                    <div className='gm-padding-5'>
                      {i18next.t('商城中展示的一级标签名称，即活动入口名称')}
                    </div>
                  }
                >
                  <input
                    className='form-control'
                    type='text'
                    name='label_1_name'
                    value={label_1_name}
                    onChange={this.handleInputChange}
                  />
                </FormItem>
              ) : null}
              {show_method ? (
                <FormItem label={i18next.t('二级标签')}>
                  <Flex className='gm-inline-block gm-checkbox-group checkbox'>
                    <Checkbox
                      name='enable_label_2'
                      checked={!!enable_label_2}
                      onChange={this.handleTagCheckbox}
                    >
                      {i18next.t('开启二级标签')}
                    </Checkbox>
                  </Flex>
                  {enable_label_2 ? (
                    <a
                      className='gm-inline-block gm-margin-left-10 gm-cursor'
                      style={{ textDecoration: 'underline' }}
                      onClick={this.handleRightSide}
                    >
                      {i18next.t('点此设置')}
                    </a>
                  ) : null}
                </FormItem>
              ) : null}
            </FormBlock>
            {show_method ? (
              <FormItem label={i18next.t('活动图片')} required>
                <DropperSelect />
                <Flex className='gm-margin-top-5'>
                  <a
                    className='gm-cursor'
                    style={{
                      verticalAlign: 'top',
                    }}
                    onClick={this.handleShowSample}
                  >
                    {i18next.t('查看示例图')}
                  </a>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='gm-cursor gm-border-left gm-margin-left-5 gm-padding-left-5'
                    style={{
                      verticalAlign: 'top',
                    }}
                    href='//js.guanmai.cn/static_storage/files/gm_icon_std.rar'
                  >
                    {i18next.t('查看图标标准')}
                  </a>
                </Flex>
              </FormItem>
            ) : null}
          </Form>
        </FormPanel>
        <FormPanel
          showBorder={false}
          style={{ position: 'relative' }}
          title={
            <span>
              {i18next.t('商品总数')}:{' '}
              <span className='gm-text-primary gm-text-bold'>
                {type === 1 ? skus.length : restPurSkus.length}
              </span>
            </span>
          }
          left={
            type === 1 ? (
              <Flex
                nowrap
                className='gm-margin-left-10'
                style={{
                  position: 'absolute',
                  top: 4,
                }}
              >
                <div className='gm-border-left gm-text-bold gm-margin-right-10 gm-margin-tb-5' />
                <Button
                  type='primary'
                  className='btn'
                  onClick={this.handleAddProduct}
                >
                  {i18next.t('批量添加')}
                </Button>
                <Position
                  className='gm-margin-left-20'
                  list={skus.slice()}
                  tableRef={this.refList}
                  onHighlight={this.handleHighlight}
                  placeholder={i18next.t('请输入商品名称')}
                  filterText={['name']}
                />
              </Flex>
            ) : null
          }
          right={type === 1 ? <TableRight /> : null}
        >
          {type === 2 && (
            <PromotionSkus
              isCheckedLabel2={enable_label_2}
              labelList={label_2_list}
            />
          )}
        </FormPanel>
        {type === 1 && (
          <MarketTagListEdit
            refList={this.refList}
            searchIndex={this.state.search_index}
            labelList={label_2_list}
            isCreate={isCreate}
          />
        )}
      </FormGroup>
    )
  }
}

export default MarketDetail
