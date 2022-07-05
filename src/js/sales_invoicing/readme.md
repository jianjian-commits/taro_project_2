文件结构（进销存）
以路由为主
当前：
* stock_out: 出库管理
    * product: 出库管理：销售出库列表页
        * add: 销售出库：新建出库单
        * detail：销售出库：出库单详情页
        * pre_add: 销售出库：预建单
    
* warehouse: 调拨管理
    * component：模块公共组件
    * store： 模块公共状态管理
    * util: 模块公共工具方法等
    * inventory_transfer_record: 移库记录
    * transfer_inside_warehouse: 仓内移库模块
        * inventory_transfer_list: 仓内移库：仓内移库列表页
        * new_transfer_receipt: 仓内移库：新建移库单
        * transfer-receipt_detail: 仓内移库：移库单详情页

