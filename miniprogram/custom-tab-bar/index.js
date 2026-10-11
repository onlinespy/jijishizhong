Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/dashboard/index',
        text: '首页',
        icon: '/assets/tabbar/home.png',
        activeIcon: '/assets/tabbar/home-active.png'
      },
      {
        pagePath: '/pages/records/index',
        text: '记录',
        icon: '/assets/tabbar/records.png',
        activeIcon: '/assets/tabbar/records-active.png'
      },
      {
        pagePath: '/pages/articles/index',
        text: '科普',
        icon: '/assets/tabbar/articles.png',
        activeIcon: '/assets/tabbar/articles-active.png'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        icon: '/assets/tabbar/profile.png',
        activeIcon: '/assets/tabbar/profile-active.png'
      }
    ]
  },

  methods: {
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index)
      const path = event.currentTarget.dataset.path
      if (index === this.data.selected) {
        return
      }
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})
