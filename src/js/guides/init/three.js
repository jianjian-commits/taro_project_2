import React from 'react'
import { Button } from '@gmfe/react'
import InitServiceTime from './guide/init_service_time'
import InitSupplier from './guide/init_supplier'
import InitManageSale from './guide/init_manage_sale'
import InitBatchManageSale from './guide/init_batch_manage_sale'
import InitPurchaseSpec from './guide/init_purchase_spec'
import InitShopRegister from './guide/init_shop_register'
import { changeDomainName } from '../../common/service'
import Tab from './components/tab'

const Three = () => {
  return (
    <Tab
      data={[
        {
          label: '运营时间及供应商',
        },
        {
          title: '1. 运营时间设置',
          video: 'https://image.document.guanmai.cn/video/service_time.mov',
          desc:
            '运营时间设置可控制前端商城允许下单时间、商户可选择的收货时间以及业务流程中所涉及的配送时间',
          buttons: [
            <InitServiceTime.GoToButton key={0}>
              前往运营时间
            </InitServiceTime.GoToButton>,
          ],
        },
        {
          title: '2. 供应商设置',
          video: 'https://image.document.guanmai.cn/video/supplier.mov',
          desc:
            '供应商为上游的提供者，建立销售商品之前需要先新建供应商，并设置好供应商的商品分类',
          buttons: [
            <InitSupplier.GoToButton key={0}>
              前往供应商
            </InitSupplier.GoToButton>,
          ],
        },
        {
          label: '报价单及商品',
        },
        {
          title: '3. 报价单设置',
          video: 'https://image.document.guanmai.cn/video/price_sheet.mov',
          desc: (
            <div>
              面向商户的销售商品列表，可建立多个不同的报价单以供不同商户查看
              <br />
              商户仅能查看自身所绑定的报价单中的销售商品
            </div>
          ),
          buttons: [
            <InitManageSale.GoToButton key={0}>
              前往报价单
            </InitManageSale.GoToButton>,
          ],
        },
        {
          title: '4. 销售规格设置',
          video: 'https://image.document.guanmai.cn/video/sale.mov',
          desc: (
            <div>
              新建报价单后，需要将销售商品新建到报价单中，商户绑了报价单之后就可以在商城看到这个报价单的商品
              <br />
              新建销售商品主要有 3 种方式：页面批量新建、表格批量新建、单个新建
            </div>
          ),
          buttons: [
            <InitBatchManageSale.GoToButton key={0}>
              前往报价单
            </InitBatchManageSale.GoToButton>,
          ],
        },
        {
          title: '5. 采购规格设置',
          video: 'https://image.document.guanmai.cn/video/purchase.mov',
          desc: '设置商品的采购规格',
          buttons: [
            <InitPurchaseSpec.GoToButton key={0}>
              前往采购规格
            </InitPurchaseSpec.GoToButton>,
          ],
        },
        {
          label: '商城与商户',
        },
        {
          title: '6. 商城个性化设置',
          video: 'https://image.document.guanmai.cn/video/shop_operation.mov',
          desc: (
            <div>
              可对商城相关功能进行基础设置，包括商城品牌厅，商城积分功能等
              <br />
              可对商城首页面进行配置即店铺装修，包括首页轮播图，广告图等
            </div>
          ),
          buttons: [
            <InitShopRegister.GoToButton key={0}>
              {' '}
              前往店铺运营
            </InitShopRegister.GoToButton>,
          ],
        },
        {
          title: '7. 商户设置',
          video:
            'https://image.document.guanmai.cn/video/merchant_management.mov',
          desc: '系统提供后台主动新建商户与微信商城注册两种方式新建商户',
          buttons: [
            <Button
              key={0}
              type='primary'
              onClick={() => {
                const toMaUrl = changeDomainName('station', 'manage')
                window.open(
                  toMaUrl +
                    '/#/customer_manage/customer/manage?guide_type=InitCustomer'
                )
              }}
            >
              前往商户管理
            </Button>,
            <Button
              key={1}
              type='primary'
              onClick={() => {
                const toMaUrl = changeDomainName('station', 'manage')
                window.open(
                  toMaUrl +
                    '/#/customer_manage/customer/invitation_code?guide_type=InitInvitation'
                )
              }}
            >
              商城注册邀请
            </Button>,
          ],
        },
      ]}
    />
  )
}

export default Three
