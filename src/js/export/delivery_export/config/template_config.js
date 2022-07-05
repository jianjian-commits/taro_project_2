import { border, alignmentLeft, alignment, alignmentRight } from '../../enum'

const font = { bold: true }

export const table_config = {
  table: {
    type: 'table',
    decisiveColumn: true,
    style: {
      border,
      font,
    },
    columns: [
      {
        key: 'number',
        header: '序号',
      },
      {
        key: 'category',
        header: '品类',
      },
      {
        key: 'sku_name',
        header: '商品名',
        style: {
          alignment: {
            ...alignment,
            wrapText: true,
          },
        },
      },
      {
        key: 'spec',
        header: '规格',
      },
      {
        key: 'order_num',
        header: '下单数',
      },
      {
        key: 'real_num',
        header: '出库数',
      },
      {
        key: 'unit_price',
        header: '单价',
      },
      {
        key: 'real_price',
        header: '应付金额',
      },
      {
        key: 'remark',
        header: '备注',
        style: {
          alignment: {
            ...alignment,
            wrapText: true,
          },
        },
      },
    ],
  },
  block: {
    type: 'block',
    block: {
      style: {
        border,
        alignment: alignmentLeft,
        font,
      },
      rows: [
        {
          columns: [
            {
              key: 'subtotal',
            },
            {
              key: 'sum',
            },
          ],
          layout: 'average',
        },
      ],
    },
  },
}

export const delivery_config = {
  colWidth: 12,
  header: {
    title: {
      key: 'title',
      style: {
        border,
        alignment,
        font: {
          size: 16,
          bold: true,
        },
      },
    },
    block: {
      style: {
        border,
        alignment: alignmentLeft,
        font,
      },
      rows: [
        {
          columns: [
            {
              key: 'service_tel',
            },
          ],
          layout: 'all',
          style: {
            border,
            alignment: alignmentRight,
          },
        },
        {
          columns: [
            {
              key: 'order_date',
            },
            {
              key: 'delivery_date',
            },
            {
              key: 'export_date',
            },
          ],
          layout: 'average',
        },
        {
          columns: [
            {
              // 订单编号
              key: 'order_no',
            },
            {
              // 序号
              key: 'serial_number',
            },
            {
              key: 'is_void',
            },
          ],
          layout: 'average',
        },
        {
          columns: [
            {
              // 收货商户
              key: 'rec_merchant',
            },
          ],
          layout: 'all',
        },
        {
          columns: [
            {
              key: 'recever',
            },
            {
              key: 'receiver_phone',
            },
            {
              key: 'is_void',
            },
          ],
          layout: 'average',
        },
        {
          columns: [
            {
              key: 'address',
            },
          ],
          layout: 'all',
        },
      ],
    },
  },
  content: [
    {
      id: 'null_block',
      type: 'block',
      block: { rows: [] },
    },
    {
      id: 'category_table',
      type: 'table',
      style: {
        border,
        alignment,
        font,
      },
      // 需要获取数据之后确定类别table
      columns: [],
    },
    {
      id: 'null_block',
      type: 'block',
      block: { rows: [] },
    },
    {
      id: 'detail_block',
      type: 'block',
      block: {
        style: {
          border,
          alignment: alignmentLeft,
          font,
        },
        rows: [
          {
            columns: [
              {
                // 销售明细
                key: 'sales_detail',
              },
            ],
            layout: 'all',
          },
        ],
      },
    },
    // 需要根据品类确定多少个 table
  ],
  footer: {
    block: {
      style: {
        border,
        alignment: alignmentLeft,
        font,
      },
      rows: [
        {
          columns: [
            {
              key: 'order_price',
            },
            {
              key: 'out_stock_price',
            },
            {
              key: 'abnormal_price',
            },
            {
              key: 'sales_price',
            },
            {
              key: 'freight',
            },
          ],
          layout: 'average',
        },
        {
          columns: [
            {
              key: 'out_stock_signature',
            },
            {
              key: 'delivery_signature',
            },
            {
              key: 'customer_signature',
            },
          ],
          layout: 'average',
        },
      ],
    },
  },
}
