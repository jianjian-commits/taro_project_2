// 暂时应用于移动端，后续废弃
class OrderBaseOld {
  constructor() {
    this.initState = {
      orderDetail: {
        viewType: 'view', // view:查看; edit:编辑; create:新建; batch:批量
        customers: [],
        customersNoMore: false,
        customer: null,
        details: [],
        serviceTimes: [],
        currentTime: '',
        freight: {}, // 运费规则
        freightFromDatabase: 0, // 数据库记录的运费
        serviceTimesLoading: false,
        time_config_info: null,
        repair: false, // 是否为补录订单
        msg: '',
        remark: '',
        last_remark: '', // 上一次订单的备注
        category_sort_type: null,
        isRanking: false,
        detailsBeforeRank: null,
        version: '', // 版本，用于判断多人编辑同一单据
      },
      searchSkus: {
        list: [],
        loading: false,
      },
      orderBatch: {
        task_id: null,
        file_name: '',
        details: [],
      },
      commonSkus: {
        // 常用商品列表
        search_text: '',
        list: [],
      },
    }
  }
}

export default OrderBaseOld
