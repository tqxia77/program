export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '登录',
      navigationStyle: 'custom',
    })
  : { navigationBarTitleText: '登录' }
