import { i18next } from 'gm-i18n'
import dazhong from '../../../../../img/shop_template_dazhong.jpg'
import jingpin from '../../../../../img/shop_template_jingpin.jpg'

const templates = [
  {
    title: i18next.t('大众风模板'),
    image: dazhong,
    config: {
      banners: [
        {
          name: '//img.guanmai.cn/station_pic/4b06fcd35cf8ff1d.jpeg',
          id: '4b06fcd35cf8ff1d.jpeg',
          url: '',
        },
      ],
      tabSize: 'medium',
      modules: [
        {
          category: 'sku_groups',
          title: '',
          promotion_id: '',
          error: { name: '', sku: '' },
          show_type: 'tiled',
          skus: [
            {
              img_url: '',
              name: i18next.t('商品名称'),
              desc: i18next.t('商品描述'),
            },
            {
              img_url: '',
              name: i18next.t('商品名称'),
              desc: i18next.t('商品描述'),
            },
          ],
        },
        {
          category: 'ad',
          type: 1,
          error: { msg: '' },
          ad_imgs_with_url: [
            {
              img_id: '4c156b89141d1746.jpeg',
              img_url: '//img.guanmai.cn/station_pic/4c156b89141d1746.jpeg',
              url: '',
            },
          ],
        },
        {
          category: 'ad',
          type: 3,
          error: { msg: '' },
          ad_imgs_with_url: [
            {
              img_id: '230e8f9db736b9be.png',
              img_url: '//img.guanmai.cn/station_pic/230e8f9db736b9be.png',
              url: '',
            },
            {
              img_id: 'ad070349c78cb9db.png',
              img_url: '//img.guanmai.cn/station_pic/ad070349c78cb9db.png',
              url: '',
            },
            {
              img_id: '156a848ed11305b0.png',
              img_url: '//img.guanmai.cn/station_pic/156a848ed11305b0.png',
              url: '',
            },
          ],
        },
        {
          category: 'ad',
          type: 1,
          error: { msg: '' },
          ad_imgs_with_url: [
            {
              img_id: '6551fc77c78d13fb.jpeg',
              img_url: '//img.guanmai.cn/station_pic/6551fc77c78d13fb.jpeg',
              url: '',
            },
          ],
        },
      ],
      show_daily_selection: true,
      daily_selection_type: 1,
    },
  },
  {
    title: i18next.t('精品风模板'),
    image: jingpin,
    config: {
      banners: [
        {
          name: '//img.guanmai.cn/station_pic/ec3825ef681506a0.jpeg',
          id: 'ec3825ef681506a0.jpeg',
          url: '',
        },
      ],
      tabSize: 'medium',
      modules: [
        {
          category: 'sku_groups',
          title: '',
          promotion_id: '',
          error: { name: '', sku: '' },
          show_type: 'tiled',
          skus: [
            {
              img_url: '',
              name: i18next.t('商品名称'),
              desc: i18next.t('商品描述'),
            },
            {
              img_url: '',
              name: i18next.t('商品名称'),
              desc: i18next.t('商品描述'),
            },
          ],
        },
        {
          category: 'ad',
          type: 1,
          error: { msg: '' },
          ad_imgs_with_url: [
            {
              img_url: '//img.guanmai.cn/station_pic/68217ad769780654.png',
              url: '',
              img_id: '68217ad769780654.png',
            },
            { img_url: '', url: '', img_id: '' },
            { img_url: '', url: '', img_id: '' },
          ],
        },
        {
          category: 'ad',
          type: 3,
          error: { msg: '' },
          ad_imgs_with_url: [
            {
              img_url: '//img.guanmai.cn/station_pic/d17c322a6cfd2ef7.png',
              url: '',
              img_id: 'd17c322a6cfd2ef7.png',
            },
            {
              img_url: '//img.guanmai.cn/station_pic/bdd94a20f4dd2ab0.png',
              url: '',
              img_id: 'bdd94a20f4dd2ab0.png',
            },
            {
              img_url: '//img.guanmai.cn/station_pic/2f04e9fb2f6f212c.png',
              url: '',
              img_id: '2f04e9fb2f6f212c.png',
            },
          ],
        },
        {
          category: 'ad',
          type: 1,
          error: { msg: '' },
          ad_imgs_with_url: [
            {
              img_url: '//img.guanmai.cn/station_pic/20729d6b10a736f2.png',
              url: '',
              img_id: '20729d6b10a736f2.png',
            },
            { img_url: '', url: '', img_id: '' },
            { img_url: '', url: '', img_id: '' },
          ],
        },
      ],
      show_daily_selection: true,
      daily_selection_type: 1,
    },
  },
]

export default templates
