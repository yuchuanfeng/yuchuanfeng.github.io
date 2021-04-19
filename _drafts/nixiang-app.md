---
title: 逆向某 App 记录
tags: [ ios 逆向, iOS]
categories: iOS
excerpt: 
---

## 目标
逆向某 App，抓取网络数据，并解密返回的内容

## 非越狱调试

要逆向某 App 首先要尝试下静态分析，那在这之前呢，需要先拿到无壳的二进制文件，由于我手上没有越狱机，无法直接砸壳，且砸壳也麻烦，直接去网上下载无壳的最省劲，由于 mac 版的 PP 助手已经无法在最新 mac 系统上运行了，无法通过它下载到砸壳后的 app 了，不过有个更方便的网站：[自动砸壳平台](http://www.dumpapp.com/)，我试了下，的确能下，不过不是最新版本的，更新不是很及时。

接下来就是 [class-dump](https://github.com/nygard/class-dump) 加 ida 分析了  
`class-dump --arch arm64 -H -A -S -o headers xxx.app/xxx`

搜索`decrypt`关键字有十几个结果，要想确认哪一个，使用 methodtrace 打印下更直接，下面开始动态调试。

[安装强大的 MokeyDev](https://github.com/AloneMonkey/MonkeyDev/wiki/%E5%AE%89%E8%A3%85)，新建 MonkeyApp 进行[非越狱集成](https://github.com/AloneMonkey/MonkeyDev/wiki/%E5%AE%89%E8%A3%85)，这个很简单，和正向开发差别不大，直接运行。

果然没那么简单，直接崩在`exit`方法上，再看打印台：
```
detectionResult (检测应用从第三方渠道发布)
detectionResult (检测到应用重签名)
detectionResult (检测设备可能存在恶意屏蔽越狱的行为)
detectionResult (检测到逆向分析中常用的动态库)
detectionResult (检测到Frida/Cycript代码注入)
detectionResult (检测到调试器)
detectionResult (检测到反反调试)
```
我看到了开发者赤裸裸的挑衅。然后我一阵操作后，没有进展，始终绕不过检测，无法正常运行。无奈下想要尝试下最新版本，看看有没有突破口。

## 越狱调试

###  越狱&环境配置
想要拿到最新版无壳应用，就得自己砸壳，需要一部越狱手机，我使用[unc0ver](https://unc0ver.dev/)越狱，重签名我用的是[ios-app-signer](https://github.com/DanTheMan827/ios-app-signer)，安装应用可以直接用Xcode，我用的是iFunBox。

越狱完成后，直接通过cydia安装 OpenSSH，并[设置SSH免密登录](https://www.jianshu.com/p/cf8ee7b6e9e6)。

打开cydia添加源：`https://build.frida.re`，并在搜索中下载安装frida

[配置 DebugServer]( https://www.jianshu.com/p/8d42d71fb9e1)

mac 安装 `usbmuxd`:
```
brew install usbmuxd
```
以上是越狱开发环境的基本配置

### 砸壳
使用[frida-ios-dump](https://github.com/AloneMonkey/frida-ios-dump)砸壳，可参考[这个教程](https://www.jianshu.com/p/cf0cc11de197)

另外，我逆向的这个 app 有越狱检测，在越狱手机上启动后会 crash，但是我用frida-ios-dump动态砸壳也成功了。如果遇到启动就 crash，使用这个方法砸壳失败的，可以使用[xia0LLDB](https://github.com/4ch12dy/xia0LLDB)，在应用启动时`load`方法调用前砸壳，可以参考[如何优雅的在LLDB里dumpdecrypted](https://iosre.com/t/lldb-dumpdecrypted/16581)

### 绕过检测
在越狱机上开发，可以不使用 MonkeyApp，而是用`Logos Tweak
`，集成了`CydiaSubstrate`，可以使用`MSHookMessageEx`和`MSHookFunction`来Hook OC函数和**指定地址**，功能更强大。

启动新版本一样崩溃，不过和之前老版本不同的是，这次崩在一个数组越界上，这让我首先想到的是如果 hold 住这个崩溃，是不是就能正常运行了？防这种数组越界的 crash 在大多数项目中都有，可以直接把代码拖过来用，再次启动发现真的不崩了！

新的问题是，虽然不崩溃，但是一些核心功能还是用不了，且每次启动 crash 类型不一样，有时候会出现死循环，不知道是不是故意做的防护。总之，这种方法没有真正越过检测。通过之前的 log，可以看出，该应用做了各种防护，如果一个一个去破，显然得费很大力气，且对于我这种刚入门者来说基本不可能，因此，需要看下有没有统一的入口，把统一入口 hook 掉就一次性把所有检测都过了。

先从 log 入手，在 ida 里面搜索`检测到Frida/Cycript代码注入`，定位到`-[AppDelegate detectionResult:]`方法，通过ida查看及实际 hook，证明此方法只是打印 log，是检测的下游，继续往上找，看下哪里调用该方法。最后定位到是在`-[AppDelegate application:didFinishLaunchingWithOptions:]`中调用的一个无符号函数`sub_10000743C`，将些函数 hook 掉后，就能成功启动，且无任何提示弹窗和 log，也可以正常使用所有功能，证明这就是所有检测的入口。

成功绕过检测非常重要，下面就可以正常进行动态调试了。

具体 hook 无符号函数可以参考：[实战：干掉高德地图7.2.0版iOS客户端的反动态调试保护](https://iosre.com/t/7-2-0-ios/770)

### 动态调试
首先使用[OCMethodTrace](https://github.com/omxcodec/OCMethodTrace)，打印所有可疑类的调用，然后再结合断点调试及 ida 静态分析，把整体加解密的方法调用流程还原出来了，再根据 ida，把汇编翻译成伪代码，再根据伪代码及流程开发调试，这其中非常繁琐，可以说是一个很强的体力活。

另外，我本打算还原出他们加解密的算法，可无奈能力有限，再加上他们还对加解密方法做了逻辑混淆，很多都是对内存的操作，最后放弃了还原加解密方法，而是退而求其次，直接调用他们的方法。

## 总结
上面总结的过程挺简单的，看起来一天可能就能搞定，并且最后也没有完全成功。但是实际情况是，我前后花了大半个月的时间，每天抽一个小时左右处理该问题，可以说是耗费很大的精力。

逆向就是如此，从结果来看就是很简单的，但是实际是过程可能很曲折和漫长。我们想象一下，如何才能在一个封闭且装满各种颜色的小球的盒子外面，定位到你想要找的那个球的确切位置呢？我们会使用各种方式和工具，但由于我们始终无法看到，只能一点一点摸索，且最后能否找到也无法确定。但是如果打开盒子，就会很容易看到，就在那一个角落。



## 参考链接： 
[MonkeyDev](https://github.com/AloneMonkey/MonkeyDev/wiki/%E9%9D%9E%E8%B6%8A%E7%8B%B1App%E9%9B%86%E6%88%90)  
[frida-ios-dump](https://github.com/AloneMonkey/frida-ios-dump)  
[iOS 恢复调用栈(适配iOS14)](https://iosre.com/t/ios-ios14/19332)  
[xia0LLDB](https://github.com/4ch12dy/xia0LLDB)  
[逆向中获取 Block 的参数和返回值](https://iosre.com/t/block/6779)  
[mitmproxy透明代理抓包](https://zhuanlan.zhihu.com/p/108207578)  
[黑科技：把第三方 iOS 应用转成动态库](http://blog.imjun.net/posts/convert-iOS-app-to-dynamic-library/)  
[app2dylib](https://github.com/tobefuturer/app2dylib)  
[实战：干掉高德地图7.2.0版iOS客户端的反动态调试保护](https://iosre.com/t/7-2-0-ios/770)  
[iOS逆向, 基础工具之LLDB和debugserver]( https://www.jianshu.com/p/8d42d71fb9e1)  
[如何使用Theos对iOS应用程序进行注入](https://www.4hou.com/posts/DJKA)  

















