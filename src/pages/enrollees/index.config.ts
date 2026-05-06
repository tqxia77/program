export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '报名用户',
      navigationBarBackgroundColor: '#FFFFFF',
      navigationBarTextStyle: 'black'
    })
  : { navigationBarTitleText: '报名用户' }
