---
title: VNC+OpenVPN（或Frp） 实现iPhone远程控制（需越狱）
tags: [vnc, ssh, openvpn, frp]
categories: 教程
excerpt: 
---

## 前言
现在一般我们都会有一些旧手机闲置，对于这些旧智能设备我们可以利用起来，本文介绍如何利用越狱iOS设备，从其它设备（PC、MAC、iOS）来进行远程控制，从而实现像远程打卡、远程监控等等。

## 准备
一台越狱iPhone （本文以iOS13.6.1为例）  
一台有公网IP的服务器（本文为阿里云ecs）  
一台安装VNC Viewer 的设备（各平台都有，本文以MAC和iOS为例）

**主要名词解释：**   
**本地设备**：安装VNC Viewer 的本地设备，用于控制远程设备，本文以MAC 电脑和iPhone为例介绍   
**中转服务器**：需要有公网IP，用于端口转发的中继服务器，本文以阿里云ECS为例  
**远程设备**：需要被远程控制的设备，本文是越狱iPhone，系统版本13.6.1

## 步骤
### 中转服务器
对于中转服务器要求比较简单，一是要有公网iP，在任何地方都能够联接，二是需要有正常SSH服务，也就是可以远程SSH联接，大多数的云服务器都满足以上条件（后面介绍用OpenVPN、和Frp的方式中转）

### 远程设备

1. 首先是越狱，安装Cydia，然后在Cydia中添加源：`https://julioverne.github.io`，搜索并安装`screendump`（for iOS13）
2. 打开设置界面，最下面找到screendump，打开并设置一个密码（后面本地设备联接时需要用到）
3. Cydia 添加源：`https://repo.cydiabc.top/`，搜索并安装`NewTerm2`
4. 打开NewTerm，输入`ssh -NTf -R 5900:localhost:5900 username@xx.xx.xx.xx`（username@xx.xx.xx.xx 为中转服务器的用户名和ip地址，5900为VNC的默认端口地址），然后输入密码，关于SSH Tunnel可能参考[这个教程](https://lotabout.me/2019/SSH-Port-Forwarding/)
5. Cydia 中搜索并安装iNoSleep插件，防止在锁屏下断网

### 本地设备
先以MAC为例  
1. 下载[对应版本的VNC Viewer](https://www.realvnc.com/en/connect/download/viewer/)，并安装  
2. 打开系统终端，输入命令`ssh -NTf -L 5900:localhost:5900 username@xx.xx.xx.xx`（username@xx.xx.xx.xx 为中转服务器的用户名和ip地址，5900为VNC的默认端口地址）
3. 打开VNC Viewer，在上面输入框输入`localhost`，如果能联接成功，则再输入远程设备设置的VNC密码，这时候就联接成功了

再来说下iOS，如果是越狱设备的话可以参照上面的教程，安装NewTerm后就可以直接用命令行进行端口转发了，对于未越狱设备：  
1. 在Appstore下载Termius，首先在`Hosts`中添加Host，也就是中转服务器的地址和用户名，然后在`Port Forwarding`中建立一个新的转发，Host为刚刚配置的中转服务器，Port都有5900，Destination为 localhost，保存并联接  
2. 在Termius的设置中打开`Active connection saver`选项，它会在后台每20秒发送一个通知，在收到通知后及时点开通知回到Termius，这是为了防止它被系统在后台杀死，如果被杀死则刚刚联接的Port Forwarding会断
3. 下载并打开VNC Viewer，输入`localhost`并联接，如果能联接成功，则再输入远程设备设置的VNC密码，这时候就联接成功了

通过以上已经基本实现了我们的需求，通过VNC实现远程控制，通过端口转发，建立SSH Tunnel 实现内购穿透，可以实现远程设备连接家里的WIFI，本地设备通过移动网络对远程设备的控制，实现了真正的『远程控制』。

但是以上方法有一个致命的问题，SSH Tunnel 会断，我们用ssh联接的时候会遇到，在一段时间不操作后，ssh联接会自动断，同样SSH Tunnel一样，可能随时会断，下面我们说下解决这个问题的方法。

## 内网穿透
下面我介绍下实现内购穿透，达到『真正远程控制』的三种方式，首先看下怎么实现，最后再做横向对比。

### AutoSSH Tunnel
既然SSH容易断，那我们在远程设备上跑一个脚本，开启一个定时器，每隔一段时间就尝试重新联接不就行了吗，就是这么简单。  

**远程设备：**   
在 Cydia 中搜索并安装 `Automatic SSH`，然后把原来执行的命令开头的SSH，替换为 `autossh -M port_num`，其中的port_num为autossh使用的端口号，完整的命令为：  
`autossh -M xxxx -NTf -R 5900:localhost:5900 username@xx.xx.xx.xx`

另外需要注意的是由于这里使用后台运行（-f），所以登录ssh需要用公钥免密登录，因为在后台执行是不让输入密码的。

具体AutoSSH的搭建教程可以参考：[利用AutoSSH建立SSH隧道，实现内网穿透](https://zhuanlan.zhihu.com/p/112227542)

### Frp
首先是[安装Frp](https://blog.csdn.net/kxwinxp/article/details/88428053)，简单说就是在中转服务器上安装Frps，在远程设备上安装Frpc，也就是需要服务端（Frps）和客户端（Frpc）配套使用，Frps安装没有问题，但是目前Frpc并没有提供iOS端的，有两个方法解决这个问题：

1. 在远程设备的局域网内再建一个服务器，安装Frpc，并把端口映射到同内网中的远程设备。我在家用的软路由，正好自带Frp插件，配置下就好了，比较简单。但是这个方法有个问题是断了WIFI切换到移动网络后，失去了与软路由的联接，这个方法就失效了。
    ![]({{site.url}}/downloads/vnc/frp-openwrt.png) 
2. 虽然Frp作者并没有提供iOS版，但是有源码，可以重新编译，[这里有些相关讨论](https://github.com/fatedier/frp/issues/614)，我编译后放到iphone里面真的可以用，放上我编译后的[产物]({{site.url}}/downloads/vnc/frpc-darwin-arm64)

远程设备的Frp配置完成后，在本地设备直接联接`中转服务器IP地址：Frp映射的远程端口`，就可以联接VNC了。

### OpenVPN
[安装教程](https://www.zhengxk.com/?p=16)  

在中转设备上搭建完VPN服务器后，要使用OpenVPN需要分别在远程设备（越狱iPhone）和本地设备（iPhone或者Mac）上安装客户端，比如，在iphone的Appstore中下载OpenVPN客户端，把相应的证书放到iphone中，就能成功联接了。

远程设备和本地设备成功联接VPN后，记录下VPN分配给远程设备的IP地址（在OpenVPN APP中的联接状态中可以看到），然后在本地设备联接 `VPN分配给远程设备的IP地址：5900`，可以联接VNC服务。

OpenVPN就是把两个本不属于同一个局域网中的设备联接到一个虚拟的局域网内，联接到这个VPN中的所有设备就可以和在局域网中那样互相访问了。

另外还可以[参考这个](https://zh.codepre.com/how-to-8457.html)分配给远程设备静态地址，这样不管远程设备切换到什么网络，OpenVPN给它分享的IP地址都是一样的。

### 对比

- **AutoSSH Tunnel**
+  优点：简单，只需要简单执行几条命令，不需要再自己搭服务
+ 缺点：不稳定，虽然用了AutoSSH会自动联接，但是在我实际使用中发现还是会断的，不适合长时间运行。另外是使用不方便，本地设备想要联接还需要执行命令，比较麻烦

-  **Frp**
    - 优点：服务稳定，安装配置都很简单，使用方便，搭建好后，本地设备直接访问中转服务器的地址和相应端口就好，不需要任何客户端
    - 缺点：如我上面所说，第一个方法需要在局域网内再建一个服务器，增加成本，且断开WIFI后就失效了。第二种方法自己编译较麻烦

- **OpenVPN**
    - 优点：服务稳定，有对应iOS客户端，在远程设备上安装对应APP配置好后就能用，客户端配置和使用都很简单。利用OpenVPN组网后可直接访问所有端口，不需要端口映射
    - 缺点：服务端安装和配置证书等较Frp要麻烦些。另外本地设备要访问远程设备同样需要下载客户端App，并配置联接，每次联接时都要先打开VPN，相较Frp也稍麻烦些

选哪个大家根据自己的需要选择吧，如果临时用的话推荐用AutoSSH Tunnel，使用简单，如果长期运行推荐Frp或者OpenVPN。

## 参考资料
[SSH 端口转发教程](https://lotabout.me/2019/SSH-Port-Forwarding/)  
[SSH Tunnel扫盲(ssh port forwarding端口转发)](https://blog.csdn.net/blade2001/article/details/8877250)  
[利用AutoSSH建立SSH隧道，实现内网穿透](https://zhuanlan.zhihu.com/p/112227542)  

[OPENVPN实现内网穿透访问](https://www.zhengxk.com/?p=16)  
[利用FRP和Openvpn实现内网穿透外网访问](https://i4t.com/4961.html)  
[为OpenVPN客户端分配静态IP地址](https://zh.codepre.com/how-to-8457.html)  

[CentOS下搭建Frp内网穿透服务](https://blog.csdn.net/kxwinxp/article/details/88428053)  
[Frp 文档](https://gofrp.org/docs/)  
[frpc-IOS](https://github.com/FrpcCluster/frpc-IOS)  
[frp github](https://github.com/fatedier/frp)
[解决 iOS 12.4 Killed: 9 的问题](https://iosre.com/t/ios-12-4-killed-9/15633)  
[can frpc be built and run on jailbreak iOS devices?](https://github.com/fatedier/frp/issues/614)  
[交叉编译 Go 语言项目 frp for iOS](https://binac.io/2019/09/03/cross-compile-frp-for-ios/)  
[内网穿透：在公网访问你家的 NAS](https://zhuanlan.zhihu.com/p/57477087)  



















