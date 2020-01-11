---
published: false
---

今天给大家带来最简单的，利用 github pages 来搭建自己的个人博客的教程，其中利用github pages搭建博客为静态博客，不需要后台服务，完全免费，服务稳定，可定制性强，发布博客简单。
### 安装 git
git 是一种版本管理系统，不了解的可以参考[这篇文章](http://blog.a0z.me/2014/05/21/GitBeginning/)。  
在你的电脑的终端里面输入 `git --version`，如果能正常显示版本号，则你的电脑已经安装上了 git，否则，则需要你安装 git，可以参考[这个网址](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)，里面有在各个系统上的安装方法。
```
git version 2.21.0 (Apple Git-122.2)
```
**安装 github 客户端（可选）**
安装 github 客户端是为了更方便的管理git 分支与更新和上传文档，如果你习惯在终端操作或者安装了其它的 git 工具（如 Sourcetree 等）可以不安装 github 的桌面工具。  
[下载地址](https://desktop.github.com/)  
下载速度比较慢，需要耐心等待，也可以挂梯子或者去网上找国内的网盘资源。

### 注册账号&创建仓库
首先需要需要一个 github 账号，没有的话需要去[这里](https://github.com/login)注册一个，注册完成后登录账号。

在[github主页](https://github.com/)点击左上角的 New 按钮创建代码仓库。  
![new]({{site.url}} /downloads/github-pages-blog/new.png)  
![new]({{site.url}} /downloads/github-pages-blog/cangku.png)  
注意，这里的`Repository name`就是你创建博客地址的域名的一部分，比如我填写的是`chuanfengblog`，我的域名应该就是`https://yuchuanfeng.github.io/chuanfengblog/`，所以这里的`Repository name`不要随便填写，另外要选择`public`，不然别人无法访问你的博客。

创建完成后点击最右边的 `setting`，一直拉到最下面的`GitHub Pages`，点击`Choose a theme`，在上面选择一个喜欢的主题，点击主题，下边就是主题的预览，然后点击`Select theme`，在新的页面中直接点击`Commit changes`。

![new]({{site.url}} /downloads/github-pages-blog/github_setting.png)  
![new]({{site.url}} /downloads/github-pages-blog/github_none.png)  
![new]({{site.url}} /downloads/github-pages-blog/github_theme.png)  

这样，一个最简单的博客仓库就建立完成了，非常简单。再次在仓库页面，点击`Setting` 拉到最下面，在`Your site is published at`后面的就是你博客的主页，把它复制到地址栏，点击回车，就可以看到你的博客主页了，当然，里面的内容都是默认生成的一些内容。  
![new]({{site.url}} /downloads/github-pages-blog/github_url.png)  
![new]({{site.url}} /downloads/github-pages-blog/github_home.png)  

### 书写和上传文章
**1. 在线编辑**
github提供在线编辑和添加文档功能，可以在网页上直接写文章，name 中填写文档名字（如 new-post.md）。
![]({{site.url}} /downloads/github-pages-blog/create-new.png)  
![]({{site.url}} /downloads/github-pages-blog/add-new.png)  
在线编辑也提供预览功能，写完后直接点击`Commit new file` 就创建成功了。然后需要修改`index.md`文件，将刚刚新建的文档名字写入链接中。（这里的 index.md 就是我们博客的主页，也就是所有文章的目录）
![new]({{site.url}} /downloads/github-pages-blog/index.png)  
修改完成commit 后需要等待一会儿（大约1~3分钟）再刷新博客首页，才能看到最新修改的内容。点击链接，就能看到我们新写的那篇文章了~
![]({{site.url}} /downloads/github-pages-blog/first-blog.png)  
![]({{site.url}} /downloads/github-pages-blog/first-content.png)  

**1. 本地编辑&上传**
打开 github desktop（或者用其它工具或终端 clone），登录你的 github 账号，把你创建的博客仓库 clone 到本地.
![]({{site.url}} /downloads/github-pages-blog/git-clone.png)  
![]({{site.url}} /downloads/github-pages-blog/git-clone-local.png)  
在对应本地目录下新建一个文档，然后文档编辑，我们可以在文章里面插入图片，将本地图片放入当前文档目录或者当前子目录下，然后就可以直接在文档中引用了。
文章书写完成后，同样需要在index.md中把新写的文档写入链接中。  
![]({{site.url}} /downloads/github-pages-blog/post-2.png)  
![]({{site.url}} /downloads/github-pages-blog/post-2-index.png)  
所有内容编辑完成后，我们需要将本地的修改推送到 github 上去，打开 github desktop，把本地修改 push 上去。  
![]({{site.url}} /downloads/github-pages-blog/post-push.png)  
![]({{site.url}} /downloads/github-pages-blog/post-push-remote.png)  
过一会儿再次刷新我们的主页，新的内容就出现了。
![]({{site.url}} /downloads/github-pages-blog/post-2-finish.png)  

到这里，一个最简单的博客就搭建完成了，可以看出，整个过程非常的简单，无论是创建还是新建和上传文档，本地也不需要配置复杂的环境，只需要安装 git 工具就可以了，甚至这都不需要，直接可以在网页上编辑和预览。我认为它可以满足一个初级使用者的需求，如果你不需要个性化的主题，不需要其它功能，那它就足够了，简单又实用。  

## 自定义主题
当然上述的博客不能满足所有人的需求，比如有些人想更换个个性的背景图片，想要个二次元的挂件，还能一进来就能播放背景音乐等等一些个性化（装 B）的配置，还有一些其它功能它不具备，比如评论功能、访问数据记录、搜索等等。想要实现上述功能，需要定制自己的主题，它需要了解更多的知识，配置更多的本地环境。我不是学前端的，我也不太懂相关的知识，所以下面的内容不会实现上述的所有功能，我在网上下载了一个**jekyll主题**，并添加了gitalk评论功能和标签功能。

### 本地环境配置
配置本地环境的目的是，当你修改一些主题的配置或者书写一篇新的文章后，需要在本地预览效果，不然每次修改完一个地方后都需要推送到 github，然后过一会儿才刷新查看，那样效率就太低了。所以说本地环境虽然理论上可以不安装，但是一般还是要安装的。  
安装 JekyII 请参考[这里](http://jekyllcn.com/docs/installation/)， 有 mac os 和 windows 的教程。
```
$ gem install jekyll
```
验证安装成功  
```
$ jekyll --version
/System/Library/Frameworks/Ruby.framework/Versions/2.6/usr/lib/ruby/2.6.0/universal-darwin19/rbconfig.rb:229: warning: Insecure world writable dir /Users/yuchuanfeng/Documents in PATH, mode 040707
jekyll 4.0.0
```
### 主题的选择和配置
在[这个网站](http://jekyllthemes.org/)上面有海量的主题可供预览和下载，其中我选择了[texture](https://github.com/thelehhman/texture)，在它原有主题的基础上，添加了gitalk 评论和标签的功能，我 fork 的地址在[这里](https://github.com/yuchuanfeng/texture)，配置其它主题的过程都是一样的。  
在[这里](https://github.com/yuchuanfeng/texture)下载并解压。回到你原先 clone 的博客仓库目录下，删除除了隐藏文件（以.开头的文件）外的其它文件，并把刚才解压出来的所有文件复制到当前目录下。  
![]({{site.url}} /downloads/github-pages-blog/texture-down.png)  
![]({{site.url}} /downloads/github-pages-blog/texture-remove.png)  
![]({{site.url}} /downloads/github-pages-blog/texture-copy.png)  
然后在终端切换到博客目录，输入`bundle exec jekyll serve`启动本地服务，然后在浏览器中输入`http://127.0.0.1:4000/`就可以看到博客主页了，是不是很简单。  
![]({{site.url}} /downloads/github-pages-blog/texture-serve.png)  
![]({{site.url}} /downloads/github-pages-blog/texture-home.png)  

### gitalk评论配置
由于直接下载的是我的配置，所以你下载后评论功能肯定不能直接用的，需要替换成你的，修改配置也很简单。  
打开[这个链接](https://github.com/settings/applications/new)，填写相关信息，要求如下：
```
Application name //应用名称，随便填
Homepage URL //填自己的博客地址，也就是 github setting 里面的GitHub Pages 下面的地址， 如我的是： https://yuchuanfeng.github.io/chuanfengblog/
Application description //应用描述，描述一下，无要求
Authorization callback URL // 同Homepage URL 一样
```
注册完成后，你就得到对应的Client ID和Client Secret，然后打开本地博客目录下的`_config.yml`文件，打到对应的`gitment:`，修改对应信息。  
```
gitment:
    repo: chuanfengblog //  github 上博客仓库的名字
    client_id: 7752255c8acd06888fc8  // Client ID
    client_secret: 349ff524a9d3dfcc25f032ac51303c15451b4405 // Client Secret

```  
![]({{site.url}} /downloads/github-pages-blog/gitalk-id.png)  
由于在本地是无法测试 gitalk 功能的，所以在修改完成后，需要将本地所有的修改全部推送到 github 上去，方法与上面推送文章的一样。
