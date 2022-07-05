import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { FormPanel, Flex, Button, Tip, Modal, Affix, Dialog } from '@gmfe/react'

import { isCStationAndC } from 'common/service'
import { dailySectionName, diyShopInfo } from './util'
import store from './store/diy_store'
import DiyBanner from './component/banner'
import AdsLayer from './component/ads/ads_layer'
import DiyAds from './component/ads'
import TemplateShower from './component/template_shower'
import DiyMerchandise from './component/merchandise'
import MerchandiseTitle from './component/merchandise/title'
import ModuleTitle from './component/module_title'
import Merchandise from './component/merchandise/merchandise'
import DiyTabList from './component/tab_list'
import TabList from './component/tab_list/tab_list'
import SelectModuleList from './component/select_module'
import SelectModule from './component/select_module/select_module_item'
import DiyDaily from './component/show_daily'
import SliderLess from './component/slideLess'
import ModuleDescribe from './component/module_describe'
import { moduleType, adLayoutType, displayWidth } from './component/enum'
import { isNumber } from '../../../common/util.js'
import globalStore from '../../../stores/global.js'
import header from 'img/diy_header.png'
import footer from 'img/diy_footer.jpg'
import ad_default_1 from 'img/ad_default_1.png'
import ad_default_2 from 'img/ad_default_2.png'
import ad_default_3 from 'img/ad_default_3.png'
import ad_default_3_1 from 'img/ad_default_3_1.png'

const getAdDefaultImage = (index, type) => {
  if (index === 0) {
    if (type === adLayoutType.one) {
      return ad_default_1
    } else if (type === adLayoutType.two) {
      return ad_default_2
    } else if (type === adLayoutType.three) {
      return ad_default_3
    }
  } else {
    if (type === adLayoutType.three) return ad_default_3_1
    return ad_default_2
  }
}

@observer
class DiyShop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gap: 0,
    }
  }

  componentDidMount() {
    store.getCustomized().then((data) => {
      // 如果存在错误，会返回对应索引
      if (isNumber(data)) {
        SelectModuleList.externalSetActive(data)
      }
    })
  }

  handleSave = () => {
    // 再拉一次promotion校验
    return store.getPromotionList().then(() => {
      const errorIndex = store.checkModules()
      if (errorIndex === -1) {
        store.submit().then((json) => {
          store.getCustomized().then(() => {
            Tip.success(i18next.t('保存成功'))
            SelectModuleList.externalSetActive(0)
          })
        })
      } else {
        Tip.warning(i18next.t('保存失败'))
        SelectModuleList.externalSetActive(errorIndex)
      }
    })
  }

  setGap = (gap) => {
    this.setState({ gap })
  }

  handleSelectTemplate = () => {
    Modal.render({
      title: i18next.t('选择模板'),
      children: <TemplateShower />,
      onHide: Modal.hide,
    })
  }

  handleToggleShopVersion = (version) => {
    store.toggleShopVersion(version).then(() => {
      store.getCustomized().then(() => {
        Tip.success(i18next.t('保存成功'))
        SelectModuleList.externalSetActive(0)
      })
    })
  }

  handleCancel = () => {
    Dialog.confirm({
      title: i18next.t('取消'),
      children: <div>{i18next.t('确认放弃此次修改吗?')}</div>,
    }).then(() => {
      store.getCustomized().then(() => {
        SelectModuleList.externalSetActive(0)
      })
    })
  }

  handleGetConfig = () => {
    console.log(store.getCurrentConfig())
    console.log(JSON.stringify(store.getCurrentConfig()))
  }

  render() {
    const { gap } = this.state
    const key = store.data.key ? store.data.key : 'gm'
    const cshop_key = store.data.cshop_cms_key ? store.data.cshop_cms_key : 'gm'
    const cms_key = isCStationAndC() ? cshop_key : key
    const isGm =
      !globalStore.hasPermission('edit_shop_setting') || cms_key === 'gm'

    return (
      <div>
        <div
          style={{
            marginTop: 10,
            paddingLeft: 20,
            height: 36,
            lineHeight: '36px',
            background: '#e8f0ff',
          }}
        >
          {diyShopInfo()}
        </div>
        <FormPanel
          title={i18next.t('店铺装修')}
          right={
            <Flex>
              {!!globalStore.otherInfo.isBshopNewUI && !isCStationAndC() && (
                <Button
                  type='link'
                  style={{
                    margin: '4px 0',
                  }}
                  disabled={isGm}
                  onClick={() =>
                    this.handleToggleShopVersion(!store.show_v2_ui)
                  }
                >
                  {store.show_v2_ui
                    ? i18next.t('切换至旧版')
                    : i18next.t('切换至新版')}
                </Button>
              )}
              <Button
                type='primary'
                style={{
                  margin: '4px 0',
                }}
                disabled={isGm}
                onClick={this.handleSelectTemplate}
              >
                {i18next.t('选择模板')}
              </Button>
            </Flex>
          }
        >
          <div
            className='gm-border'
            style={{
              width: displayWidth,
              margin: '10px 520px 70px 10px',
              paddingBottom: gap,
            }}
          >
            <div className='gm-margin-bottom-20'>
              <img
                style={{ maxWidth: '100%' }}
                src={header}
                onClick={this.handleGetConfig}
              />
            </div>
            <SelectModuleList
              sortSkip={store.sortSkip}
              list={store.modules}
              setGap={this.setGap}
              disabled={isGm}
              onChange={store.operateModules}
            >
              <SelectModule
                immovable
                name={i18next.t('首页轮播图')}
                left={
                  <SliderLess
                    delay={3000}
                    width={displayWidth}
                    size={store.banners.length}
                    renderItem={(i) => (
                      <img
                        style={{ maxWidth: '100%' }}
                        src={store.banners[i].name}
                      />
                    )}
                  />
                }
                right={<DiyBanner />}
              />
              <SelectModule
                immovable
                name={i18next.t('标签位')}
                left={
                  store.show_v2_ui ? (
                    <div className='gm-padding-lr-15'>
                      <TabList
                        style={{
                          width: '100%',
                          padding: '10px 5px',
                          borderRadius: '10px',
                        }}
                        labels={store.labels}
                        size={store.tabSize}
                      />
                    </div>
                  ) : (
                    <TabList
                      style={{
                        width: '100%',
                        padding: '10px 5px',
                      }}
                      labels={store.labels}
                      size={store.tabSize}
                    />
                  )
                }
                right={<DiyTabList disabled={isGm} />}
              />
              {store.modules.map((m, i) => {
                if (m.category === moduleType.ad) {
                  return (
                    <SelectModule
                      key={i + moduleType.ad}
                      name={i18next.t('广告位')}
                      left={
                        <div
                          style={{
                            width: displayWidth,
                            minHeight: adLayoutType.three === m.type ? 160 : 80,
                          }}
                        >
                          <AdsLayer
                            type={m.type}
                            display
                            old={!store.show_v2_ui}
                            renderItem={(index) => {
                              const imgs = m.ad_imgs_with_url[index]
                              return (
                                imgs && (
                                  <div className='b-diy-ad-display-img-wrap'>
                                    <img
                                      src={
                                        imgs.img_url ||
                                        getAdDefaultImage(index, m.type)
                                      }
                                    />
                                  </div>
                                )
                              )
                            }}
                          />
                        </div>
                      }
                      right={<DiyAds sortIndex={i} disabled={isGm} />}
                    />
                  )
                }
                if (m.category === moduleType.sku) {
                  return (
                    <SelectModule
                      key={i + moduleType.sku}
                      name={i18next.t('商品组')}
                      left={
                        <>
                          {!isCStationAndC() ? (
                            <MerchandiseTitle text={m.title} oldTitle={!store.show_v2_ui}/>
                          ) : (
                            <ModuleTitle
                              style={{ padding: '10px 0 10px 0px' }}
                              isCStationAndC={isCStationAndC()}
                              text={m.title}
                            />
                          )}

                          <Merchandise
                            type={m.show_type}
                            skus={m.skus.slice(0, 2)}
                            old={!store.show_v2_ui}
                          />
                        </>
                      }
                      right={<DiyMerchandise sortIndex={i} disabled={isGm} />}
                    />
                  )
                }
                // 优惠券
                if (m.category === moduleType.coupon) {
                  return (
                    <SelectModule
                      isNeedAdd={false}
                      isNeedDelete={false}
                      name={i18next.t('优惠券')}
                      left={
                        <Flex alignCenter className='b-diy-daily-section'>
                          <ModuleTitle text={i18next.t('优惠券')} />
                        </Flex>
                      }
                      right={<ModuleDescribe type='coupon' />}
                    />
                  )
                }
                // 限时抢购
                if (m.category === moduleType.flashSale) {
                  return (
                    <SelectModule
                      isNeedAdd={false}
                      isNeedDelete={false}
                      name={i18next.t('限时抢购')}
                      left={
                        <Flex alignCenter className='b-diy-daily-section'>
                          <ModuleTitle text={i18next.t('限时抢购')} />
                        </Flex>
                      }
                      right={<ModuleDescribe type='flashSale' />}
                    />
                  )
                }
              })}
              <SelectModule
                immovable
                name={dailySectionName()}
                left={
                  <>
                    <div className='b-diy-daily-section'>
                      {!isCStationAndC() ? (
                        <MerchandiseTitle
                          labels={store.labels}
                          text={dailySectionName()}
                          multipleTitle={!!store.show_v2_ui}
                          oldTitle={!store.show_v2_ui}
                        />
                      ) : (
                        <Flex alignCenter>
                          <ModuleTitle text={dailySectionName()} />
                        </Flex>
                      )}
                      {store.show_v2_ui ? (
                        <Merchandise type='tiled' skus={[0, 1]} />
                      ) : null}
                      {store.show_daily_selection ? (
                        ''
                      ) : (
                        <div className='b-diy-daily-section-disable' />
                      )}
                    </div>
                  </>
                }
                right={<DiyDaily disabled={isGm} />}
              />
            </SelectModuleList>
            <img style={{ maxWidth: '100%' }} src={footer} />
          </div>
        </FormPanel>
        <Affix bottom={0}>
          <div className='gm-form-group-sticky-box'>
            <Flex justifyCenter>
              <Button disabled={isGm} onClick={this.handleCancel}>
                {i18next.t('取消')}
              </Button>
              <div className='gm-gap-10' />
              <Button type='primary' disabled={isGm} onClick={this.handleSave}>
                {i18next.t('保存')}
              </Button>
            </Flex>
          </div>
        </Affix>
      </div>
    )
  }
}

export default DiyShop
