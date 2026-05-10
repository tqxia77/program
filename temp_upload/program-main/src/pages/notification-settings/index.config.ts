export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '通知设置',
      navigationBarBackgroundColor: '#FFFFFF',
      navigationBarTextStyle: 'black'
    })
  : { navigationBarTitleText: '通知设置' }
