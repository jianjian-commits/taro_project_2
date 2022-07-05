import { t } from 'gm-i18n'
import _ from 'lodash'
const NutritionInfoList = [
  {
    text: t('能量'),
    value: 'energy',
    unit: 'Kcal',
  },
  {
    text: t('碳水化合物'),
    value: 'carbohydrate',
    unit: 'g',
  },
  {
    text: t('蛋白质'),
    value: 'protein',
    unit: 'g',
  },
  {
    text: t('脂肪'),
    value: 'fat',
    unit: 'g',
  },
  {
    text: t('钙'),
    value: 'element_Ca',
    unit: 'mg',
  },
  {
    text: t('磷'),
    value: 'element_P',
    unit: 'mg',
  },
  {
    text: t('钾'),
    value: 'element_K',
    unit: 'mg',
  },
  {
    text: t('钠'),
    value: 'element_Na',
    unit: 'mg',
  },
  {
    text: t('氯'),
    value: 'element_Cl',
    unit: 'mg',
  },
  {
    text: t('镁'),
    value: 'element_Mg',
    unit: 'mg',
  },
  {
    text: t('铁'),
    value: 'element_Fe',
    unit: 'mg',
  },
  {
    text: t('锌'),
    value: 'element_Zn',
    unit: 'mg',
  },
  {
    text: t('硒'),
    value: 'element_Se',
    unit: 'μg',
  },
  {
    text: t('钼'),
    value: 'element_Mo',
    unit: 'μg',
  },
  {
    text: t('铬'),
    value: 'element_Cr',
    unit: 'μg',
  },
  {
    text: t('碘'),
    value: 'element_I',
    unit: 'μg',
  },
  {
    text: t('铜'),
    value: 'element_Cu',
    unit: 'mg',
  },
  {
    text: t('维生素A'),
    value: 'vitamin_A',
    unit: 'μg',
  },
  {
    text: t('维生素D'),
    value: 'vitamin_D',
    unit: 'μg',
  },
  {
    text: t('维生素E'),
    value: 'vitamin_E',
    unit: 'mg',
  },
  {
    text: t('维生素K'),
    value: 'vitamin_K',
    unit: 'μg',
  },
  {
    text: t('维生素B1'),
    value: 'vitamin_B1',
    unit: 'mg',
  },
  {
    text: t('维生素B2'),
    value: 'vitamin_B2',
    unit: 'mg',
  },
  {
    text: t('维生素B6'),
    value: 'vitamin_B6',
    unit: 'mg',
  },
  {
    text: t('维生素B12'),
    value: 'vitamin_B12',
    unit: 'μg',
  },
  {
    text: t('泛酸'),
    value: 'vitamin_B_pa',
    unit: 'mg',
  },
  {
    text: t('叶酸'),
    value: 'vitamin_B_folate',
    unit: 'μg',
  },
  {
    text: t('烟酸'),
    value: 'vitamin_B_niacin',
    unit: 'mg',
  },
  {
    text: t('胆碱'),
    value: 'vitamin_B_choline',
    unit: 'mg',
  },
  {
    text: t('生物素'),
    value: 'vitamin_B_biotin',
    unit: 'mg',
  },
  {
    text: t('维生素C'),
    value: 'vitamin_C',
    unit: 'mg',
  },
  {
    text: t('膳食纤维'),
    value: 'dietary_fiber',
    unit: 'g',
  },
  {
    text: t('水'),
    value: 'water',
    unit: 'g',
  },
]
// 转字典
const NutritionInfo = _.keyBy(NutritionInfoList, 'value')

export { NutritionInfo, NutritionInfoList }
