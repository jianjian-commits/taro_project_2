import React from 'react'
import { Button } from '@gmfe/react'
import InitUserPurchase from './guide/init_user_purchase'
import InitUserDriver from './guide/init_user_driver'
import { changeDomainName } from '../../common/service'
import Tab from './components/tab'

const Four = () => {
  return (
    <Tab
      data={[
        {
          title: '1. 用户管理',
          video: 'https://image.document.guanmai.cn/video/user_management.mov',
          desc: (
            <div>
              用户即使用系统的人员，系统支持多人员操作，并且可以针对不同人员职责设定角色权限
              <br />
              信息平台用户管理可管理所有用户，业务平台用户管理可管理业务平台的用户
            </div>
          ),
          buttons: [
            <Button
              key={0}
              type='primary'
              onClick={() => {
                window.open(
                  changeDomainName('station', 'manage') +
                    '/gm_account/#/user_manage/service/role?guide_type=InitUserMa'
                )
              }}
            >
              信息平台用户管理
            </Button>,
            <Button
              key={1}
              type='primary'
              onClick={() => {
                window.open(
                  changeDomainName('station', 'station') +
                    '/gm_account/#/user_manage/service/role?guide_type=InitUserStation'
                )
              }}
            >
              业务平台用户管理
            </Button>,
          ],
        },
        {
          title: '2. APP账号设置',
          video: 'https://image.document.guanmai.cn/video/app_account.mov',
          desc:
            '系统提供多个辅助 APP 工具，主要有司机APP、采购APP、供应商APP，APP账号需单独设置',
          buttons: [
            <InitUserDriver.GoToButton key={0} type='primary'>
              司机账号
            </InitUserDriver.GoToButton>,
            <InitUserPurchase.GoToButton key={1}>
              采购员账号
            </InitUserPurchase.GoToButton>,
            <Button
              key={2}
              type='primary'
              onClick={() => {
                window.open(
                  changeDomainName('station', 'manage') +
                    '/gm_account/#/user_manage/service/user/user_detail?guide_type=InitUserSupplier'
                )
              }}
            >
              供应商账号
            </Button>,
          ],
        },
        {
          title: '3. 运费模板设置',
          video: 'https://image.document.guanmai.cn/video/freight.mov',
          desc: '运费模板设置',
          buttons: [
            <Button
              key={0}
              type='primary'
              onClick={() => {
                window.open('#/system/setting/freight')
              }}
            >
              前往运费模板
            </Button>,
          ],
        },
        {
          title: '4. 系统打印模板设置',
          video: 'https://image.document.guanmai.cn/video/print.mov',
          desc:
            '系统提供多种单据自定义设置，包括配送模板、采购模板、入库模板、出库模板、结款模板、分拣标签模板、导入订单模板',
          buttons: [
            <Button
              key={0}
              type='primary'
              onClick={() => {
                window.open('#/system/setting/distribute_templete')
              }}
            >
              前往系统模板
            </Button>,
          ],
        },
      ]}
    />
  )
}

export default Four
