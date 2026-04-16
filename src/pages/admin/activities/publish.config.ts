export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '发布活动' })
  : { navigationBarTitleText: '发布活动' }
