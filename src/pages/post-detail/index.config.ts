export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '帖子详情',
      navigationBarBackgroundColor: '#FFFFFF',
      navigationBarTextStyle: 'black'
    })
  : { navigationBarTitleText: '帖子详情' }
