module.exports = {
  title: "hayeslv的笔记", // 网站标题
  description: "总结归纳学习中的知识", // 网站的描述
  base: '/', //  部署时的路径 默认 / ，使用二级地址 /base/
  head: [['link', {rel: 'icon', href: '/public/favicon.ico'}]],// 添加网站图标
  // 主题配置
  themeConfig: {
    // 导航栏配置
    nav: [
      { text: "首页", link: "/" },
      { text: "手写", link: "/手写/promise" },
      { text: "网络", link: "/网络/test", activeMatch: '^/网络/' },
      { 
        text: "HTML/CSS", 
        items: [
          { text: "HTML5", link: "/html/" },
          { text: "CSS", link: "/css/" },
        ] 
      }
    ],
    // 左侧导航栏配置
    sidebar: {
      "/手写/": [
        { 
          text: "js基础", 
          link: "/手写/promise", 
          items: [
            { text: "Promise", link: "/手写/promise" }
          ] 
        }
      ],
      "/网络/": [
        { text: "标题1", link: "/网络/test", items: [] },
        { text: "标题2", items: [ { text: '跨域9法', link: '/网络/跨域9法' } ] }
      ],
      // "/css": [
      //   { text: "跨域9法", link: "/" }
      // ]
    }
  }
}