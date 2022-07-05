# 老架构 README


## 目录简要

```js
├── config # 环境代理
├── node_modules # 依赖项
├── src # 右侧打印编辑界面
     ├── css # 全局css
     ├── img # 静态资源文件
     ├── js # 项目所有路径
     ├── locales # 语言
```

## 关于该项目

- 老架构项目地址（https://code.guanmai.cn/front-end/gm_static_stationv2）线上地址（https://station.guanmai.cn/station/new#/home）
- 老架构核心模块主要有（**订单**，**商城**，**采购**，**分拣**，**配送**）。因为老架构使用的用户量是最多的，所以这几个模块出 bug 需要马上解决，否则会有不可估量的后果。以下是每个模块是用的高峰期。
  - 订单：18:00-22:00
  - 商城：18:00-22:00
  - 采购：14:00-22:00
  - 分拣：21:00-07:00
  - 进销存：23:00-09:00
- 总结：以上模块出现 bug 优先解决，并不是其他模块的 bug 就不解决，因为老架构用户量大，所以在其他模块与核心模块都有 bug 时，优先解决核心模块的 bug。**企业微信 BUG 工单群会提供 bug。**

## 启动项目

首先安装[Node.js](https://nodejs.org/)，版本需要在 v10+。 [YARN](https://www.jianshu.com/p/4a225dcacd53)。

> 安装一般来说是不会失败的，如果失败了请检查网络问题。

老架构使用的是 `yarn`，不要使用`npm`！

```js
# 安装依赖
yarn install

# 启动项目
yarn start
```

启动后,测试账号（miaomiao,liuge1)发现一直登录不上去

> 检查当前网络问题，如网络无误，检查/src/config/local.js 代理环境是否有误(切换线上),重新启动。

local.js 具体代码

```js
module.exports = {
  port: 8787,
  proxy: [
    {
      context: [
        '/core',
        '/data_center',
        '/image',
        '/images',
        '/station',
        '/static',
        '/logo',
        '/salemenu',
        '/merchandise',
        '/product',
        '/partner-site',
        '/material',
        '/food_security_report',
        '/home_page',
        '/async_task',
        '/admin',
        '/supplier',
        '/area_dict',
        '/purchase_spec',
        '/task',
        '/process',
        '/gm_account',
        '/message',
        '/stock',
        '/purchase',
        '/coupon',
        '/weight',
        '/sms',
        '/fe',
        '/community',
        '/process',
        '/service_time',
        '/box',
        '/delivery',
        '/station_statistics',
        '/picking',
        '/combine_goods',
      ],
      // target: 'http://station.env-xdmtest.tencent.k8s.guanmai.cn',//test
      target: 'https://station.guanmai.cn/', // xianshang
      // target: 'http://station.env-cjx2.tencent.k8s.guanmai.cn', // jx
      // target: 'https://station.guanmai.cn/station/new/', //huidu
      // target: 'http://station.env-cw.tencent.k8s.guanmai.cn/', // cw
      // target: 'http://station.env-xdmtest.tencent.k8s.guanmai.cn/', // dm
      // target: 'http://station.env-pfltest.tencent.k8s.guanmai.cn/',
      // target: 'http://station.env-cjx2.tencent.k8s.guanmai.cn',
      // target: 'http://station.env-cw1.tencent.k8s.guanmai.cn/',
      // target: 'http://station.env-picking.tencent.k8s.guanmai.cn/', // 史永飞
      changeOrigin: true,
    },
  ],
}
```

## 结尾

> 更多讲解在以下传送门~

[老架构更多开发功能讲解](https://code.guanmai.cn/front-end/gm_static_stationv2/-/wikis/home?view=create)
