export const BATCH_DELETE_TYPE = {
  删除一级分类: { spanContent: '一级分类', filterType: 'A' },
  删除二级分类: { spanContent: '二级分类', filterType: 'B' },
  删除商品品类: { spanContent: '品类', filterType: 'P' },
}

export const BATCH_DELETE_URL = {
  删除一级分类: '/merchandise/category1/batch_delete',
  删除二级分类: '/merchandise/category2/batch_delete',
  删除商品品类: '/merchandise/pinlei/batch_delete',
}
