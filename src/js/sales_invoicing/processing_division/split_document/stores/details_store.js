import { action, observable } from 'mobx'
import { CreateStore } from './create_store'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { SPLIT_SHEET_STATUS } from 'common/enum'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { doExportV2 } from 'gm-excel'

export default new (class DetailsStore extends CreateStore {
  @observable id

  @action fetchDetails = (id) => {
    Request('/stock/split/sheet/detail')
      .data({ id })
      .get()
      .then(({ data }) => {
        const {
          sheet_no,
          operator,
          split_time,
          status,
          id,
          source_spu: { quantity, std_unit_name, spu_id, spu_name },
          gain_spus,
          plan_id,
          plan_name,
          is_frozen,
        } = data
        this.sheet_no = sheet_no
        this.operator = operator
        this.splitTime = new Date(split_time)
        this.status = status
        this.id = id
        this.is_frozen = is_frozen
        this.stdUnitName = std_unit_name
        this.sourceQuantity = +Big(quantity).toFixed(2)
        this.gainSpus = gain_spus.map((item) => {
          const {
            in_stock_price,
            real_quantity,
            remain_quantity,
            split_ratio,
            ...rest
          } = item
          return {
            ...rest,
            in_stock_price: +Big(in_stock_price).toFixed(2),
            real_quantity: +Big(real_quantity).toFixed(2),
            remain_quantity: +Big(remain_quantity).toFixed(2),
            split_ratio: +Big(split_ratio).toFixed(2),
          }
        })
        this.splitPlan = {
          value: plan_id,
          text: plan_name,
          id: plan_id,
          name: plan_name,
          source_spu_id: spu_id,
          source_spu_name: spu_name,
        }
      })
  }

  @observable viewType = 'details'

  handleGetSheetDatas() {
    const header = {
      type: 'block',
      id: 'header',
      columns: [
        { header_0_0: t('分割单') },
        {
          header_1_0: t('单号'),
          header_1_1: this.sheet_no,
          header_1_2: t('创建时间'),
          header_1_3: moment(this.splitTime).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          header_2_0: t('分割损耗'),
          header_2_1: `${Big(this.sourceQuantity)
            .minus(this.gainCount)
            .toFixed(2)}${this.stdUnitName}`,
        },
        {
          header_3_0: t('状态'),
          header_3_1: SPLIT_SHEET_STATUS[this.status],
          header_3_2: t('操作人'),
          header_3_3: this.operator,
        },
      ],
    }

    const toSplitMsg = {
      type: 'block',
      id: 'table1',
      columns: [
        { table1_0_0: t('待分割品信息') },
        {
          table1_1_0: t('序号'),
          table1_1_1: t('待分割品ID'),
          table1_1_2: t('待分割品名称'),
          table1_1_3: t('单位'),
          table1_1_4: t('消耗量'),
        },
        {
          table1_2_0: 1,
          table1_2_1: this.splitPlan.source_spu_id,
          table1_2_2: this.splitPlan.source_spu_name,
          table1_2_3: this.stdUnitName,
          table1_2_4: this.sourceQuantity,
        },
      ],
    }

    const gainSpuMsg = {
      type: 'table',
      id: 'table2',
      columns: this.gainSpus.map((item, index) => {
        const {
          in_stock_price,
          real_quantity,
          remain_quantity,
          split_ratio,
          ...rest
        } = item
        return {
          ...rest,
          index,
          in_stock_price: Big(in_stock_price).toFixed(2),
          real_quantity: Big(real_quantity).toFixed(2),
          remain_quantity: Big(remain_quantity).toFixed(2),
        }
      }),
    }

    const data = [
      header,
      toSplitMsg,
      { type: 'block', id: 'title', columns: [{ title_0_0: t('获得品信息') }] },
      gainSpuMsg,
      {
        type: 'block',
        id: 'footer',
        columns: [
          {
            footer_0_0: t('合计'),
            footer_0_1: '',
            footer_0_2: (() => {
              let count = 0
              this.gainSpus.forEach((value) => {
                count = Big(value.real_quantity).plus(count)
              })
              return count.toFixed(2)
            })(),
          },
        ],
      },
    ]

    return [data]
  }

  handleGetConfig() {
    const header = {
      type: 'block',
      id: 'header',
      block: {
        style: {
          border: { top: true, right: true, bottom: true, left: true },
          alignment: { horizontal: 'center', vertical: 'middle' },
        },
        rows: [
          {
            layout: 'all',
            style: { font: { size: 24, bold: true } },
            columns: [{ key: 'header_0_0' }],
          },
          {
            layout: 'average',
            columns: [
              { key: 'header_1_0' },
              { key: 'header_1_1' },
              { key: 'header_1_2' },
              { key: 'header_1_3' },
            ],
          },
          {
            layout: 'inOrder',
            columns: [
              { key: 'header_2_0', order: 1 },
              { key: 'header_2_1', order: 3 },
            ],
          },
          {
            layout: 'average',
            columns: [
              { key: 'header_3_0' },
              { key: 'header_3_1' },
              { key: 'header_3_2' },
              { key: 'header_3_3' },
            ],
          },
        ],
      },
    }

    const toSplitMsg = {
      type: 'block',
      id: 'table1',
      block: {
        style: {
          border: { top: true, right: true, bottom: true, left: true },
          alignment: { vertical: 'middle', horizontal: 'center' },
        },
        rows: [
          {
            layout: 'all',
            style: {
              font: { size: 14, bold: true },
            },
            columns: [{ key: 'table1_0_0' }],
          },
          {
            layout: 'average',
            columns: [
              { key: 'table1_1_0' },
              { key: 'table1_1_1' },
              { key: 'table1_1_2' },
              { key: 'table1_1_3' },
              { key: 'table1_1_4' },
            ],
          },
          {
            layout: 'average',
            columns: [
              { key: 'table1_2_0' },
              { key: 'table1_2_1' },
              { key: 'table1_2_2' },
              { key: 'table1_2_3' },
              { key: 'table1_2_4' },
            ],
          },
        ],
      },
    }
    const gainSpu = {
      type: 'table',
      id: 'table2',
      style: {
        border: { left: true, right: true, top: true, bottom: true },
      },
      columns: [
        { key: 'index', header: t('序号') },
        { key: 'spu_id', header: t('获得品ID') },
        { key: 'spu_name', header: t('获得品名称') },
        { key: 'std_unit_name', header: t('单位') },
        { key: 'real_quantity', header: t('实际获得量') },
      ],
    }

    return [
      { type: 'style', rowHeight: 40, colWidth: 40 },
      header,
      toSplitMsg,
      {
        type: 'block',
        id: 'title',
        block: {
          style: {
            border: { top: true, right: true, bottom: true, left: true },
            alignment: { vertical: 'middle', horizontal: 'center' },
            font: { size: 14, bold: true },
          },
          rows: [{ layout: 'all', columns: [{ key: 'title_0_0' }] }],
        },
      },
      gainSpu,
      {
        type: 'block',
        id: 'footer',
        block: {
          style: {
            border: { top: true, right: true, bottom: true, left: true },
            alignment: { vertical: 'middle', horizontal: 'center' },
          },
          rows: [
            {
              layout: 'inOrder',
              columns: [
                { key: 'footer_0_0', order: 1 },
                { key: 'footer_0_1', order: 3 },
                { key: 'footer_0_2', order: 1 },
              ],
            },
          ],
        },
      },
    ]
  }

  handleExport = () => {
    const sheets = [
      {
        config: this.handleGetConfig(),
        sheetDatas: this.handleGetSheetDatas(),
      },
    ]
    doExportV2(sheets, {
      fileName: t('split_excel_name', {
        id: this.sheet_no,
        date: moment(new Date()).format('YYYY-MM-DD'),
      }),
      sheetOptions: [{ sheetName: this.sheet_no }],
    })
  }

  handleUpdate = (params) => {
    return Request('/stock/split/sheet/update').data(params).post()
  }

  handleDelete = () => {
    return Request('/stock/split/sheet/delete')
      .code([1, 4, 10, 20])
      .data({ id: this.id })
      .post()
  }
})()
