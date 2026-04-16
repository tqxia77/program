/* eslint-disable @typescript-eslint/no-explicit-any */
const config: any = {
  pages: [
    'pages/index/index',
    'pages/neighborhood/index',
    'pages/profile/index',
    'pages/activity-detail/index',
    'pages/publish/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFBF7',
    navigationBarTitleText: '银龄乐圈',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#FF6B00',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '活动中心',
        iconPath: './assets/tabbar/calendar.png',
        selectedIconPath: './assets/tabbar/calendar-active.png'
      },
      {
        pagePath: 'pages/neighborhood/index',
        text: '邻里圈',
        iconPath: './assets/tabbar/heart.png',
        selectedIconPath: './assets/tabbar/heart-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  }
}

export default typeof definePageConfig === 'function'
  ? definePageConfig(config)
  : config
