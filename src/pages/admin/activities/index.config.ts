export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '活动管理' })
  : { navigationBarTitleText: '活动管理' }
