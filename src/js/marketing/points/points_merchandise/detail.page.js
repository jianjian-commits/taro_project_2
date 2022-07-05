import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  QuickPanel,
  Validator,
  Price,
  Uploader,
  InputNumber,
  Switch,
  Tip,
} from '@gmfe/react'
import store from './store'
import { observer } from 'mobx-react'
import { history } from 'common/service'
import globalStore from 'stores/global'

@observer
class PointsMerchandiseDetail extends React.Component {
  constructor(props) {
    super(props)
    this.merchandiseForm = React.createRef()
    this.exchangeForm = React.createRef()
    store.initDetail()
  }

  componentDidMount() {
    // 如果id存在则是详情，如果不存在则是新建
    const id = this.props.location.query.reward_sku_id
    id && store.getDetail(id)
  }

  handleImgUpload = (source, file) => {
    if (file[0].size > 1024 * 1024) {
      Tip.warning(i18next.t('图片不能超过1MB'))
      return false
    }
    store.imgUpload(file[0], source)
  }

  handleSave = () => {
    // 新建
    if (!this.props.location.query.reward_sku_id) {
      store.createPointsMerchandise().then((json) => {
        Tip.success(i18next.t('创建成功'))
        history.replace(
          '/marketing/points/points_merchandise/detail?reward_sku_id=' +
            json.data.reward_sku_id
        )
      })
      return false
    }
    store.updatePointsMerchandise().then(() => {
      Tip.success(i18next.t('保存成功'))
    })
  }

  render() {
    const {
      image,
      sku_name,
      sale_unit,
      sku_desc,
      status,
      sku_cost,
      cost_point,
      once_limit,
      stock_num,
      detail_image,
    } = store.detail
    const isEdit = globalStore.hasPermission('edit_reward_sku')
    return (
      <FormGroup
        disabled={!isEdit}
        formRefs={[this.merchandiseForm, this.exchangeForm]}
        onSubmitValidated={this.handleSave}
      >
        <FormPanel title={i18next.t('商品信息')}>
          <Form
            horizontal
            labelWidth='116px'
            ref={this.merchandiseForm}
            hasButtonInGroup
          >
            <FormItem
              label={i18next.t('积分商品名')}
              required
              validate={Validator.create([], sku_name)}
            >
              <input
                type='text'
                className='form-control'
                value={sku_name}
                style={{ width: '410px' }}
                onChange={(e) =>
                  store.setDetailValue('sku_name', e.target.value)
                }
              />
            </FormItem>
            <FormItem
              required
              validate={Validator.create([], sale_unit)}
              label={i18next.t('规格')}
            >
              <input
                type='text'
                value={sale_unit}
                className='form-control'
                style={{ width: '410px' }}
                onChange={(e) =>
                  store.setDetailValue('sale_unit', e.target.value)
                }
              />
            </FormItem>
            <FormItem label={i18next.t('成本价')}>
              <div className='input-group sku-detail-input-group-width'>
                <InputNumber
                  className='form-control'
                  value={sku_cost}
                  min={0}
                  precision={2}
                  onChange={(value) => store.setDetailValue('sku_cost', value)}
                />
                <div className='input-group-addon'>{Price.getUnit()}</div>
              </div>
            </FormItem>
            <FormItem label={i18next.t('积分商品图片')}>
              <div className='gm-margin-bottom-10'>
                <Uploader
                  onUpload={this.handleImgUpload.bind(this, 'image')}
                  accept='image/*'
                >
                  {image ? (
                    <img
                      style={{
                        cursor: 'pointer',
                        width: '90px',
                        height: '90px',
                      }}
                      src={image}
                    />
                  ) : (
                    <Uploader.DefaultImage />
                  )}
                </Uploader>
              </div>
            </FormItem>
            <FormItem label={i18next.t('描述')}>
              <textarea
                className='form-control gm-margin-bottom-10'
                rows='4'
                placeholder={i18next.t('描述')}
                value={sku_desc || ''}
                style={{ width: '410px' }}
                onChange={(e) =>
                  store.setDetailValue('sku_desc', e.target.value)
                }
              />
            </FormItem>
            <FormItem label={i18next.t('积分商品详情')}>
              <div className='gm-margin-bottom-10'>
                <Uploader
                  onUpload={this.handleImgUpload.bind(this, 'detail')}
                  accept='image/*'
                >
                  {detail_image ? (
                    <img
                      style={{
                        cursor: 'pointer',
                        width: '90px',
                        height: '90px',
                      }}
                      src={detail_image}
                    />
                  ) : (
                    <Uploader.DefaultImage />
                  )}
                </Uploader>
              </div>
              <div className='desc-wrap gm-text-desc gm-text-12 gm-margin-bottom-10'>
                {i18next.t(
                  '图片大小请不要超过1Mb，推荐尺寸宽度为720，支持jpg/png格式'
                )}
              </div>
            </FormItem>
            <FormItem
              className='gm-margin-bottom-15'
              label={i18next.t('兑换状态')}
            >
              <Switch
                type='primary'
                checked={status === 1}
                on={i18next.t('上架')}
                off={i18next.t('下架')}
                onChange={(value) =>
                  store.setDetailValue('status', value ? 1 : 2)
                }
              />
            </FormItem>
          </Form>
        </FormPanel>
        <FormPanel title={i18next.t('兑换信息')}>
          <Form
            horizontal
            labelWidth='116px'
            ref={this.exchangeForm}
            hasButtonInGroup
          >
            <FormItem
              label={i18next.t('活动积分')}
              required
              validate={Validator.create([], cost_point)}
            >
              <InputNumber
                className='form-control'
                value={cost_point}
                min={0}
                precision={0}
                placeholder={i18next.t('输入兑换该商品所需积分值')}
                style={{ width: '410px' }}
                onChange={(value) => store.setDetailValue('cost_point', value)}
              />
            </FormItem>
            <FormItem label={i18next.t('单次兑换')}>
              <InputNumber
                className='form-control'
                value={once_limit}
                min={0}
                precision={0}
                placeholder={i18next.t('输入单笔订单允许兑换该积分商品的数量')}
                style={{ width: '410px' }}
                onChange={(value) => store.setDetailValue('once_limit', value)}
              />
            </FormItem>
            <FormItem
              label={i18next.t('活动库存')}
              required
              validate={Validator.create([], stock_num)}
            >
              <InputNumber
                className='form-control'
                value={stock_num}
                min={0}
                precision={0}
                placeholder={i18next.t('输入积分商品的库存数量')}
                style={{ width: '410px' }}
                onChange={(value) => store.setDetailValue('stock_num', value)}
              />
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default PointsMerchandiseDetail
