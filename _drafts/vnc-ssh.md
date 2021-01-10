---
title: VNC+SSH Tunnel 实现iPhone远程控制（需越狱）
tags: [vnc, ssh]
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
**中转服务器**：通过端口转发搭建SSH Tunnel的中继服务器，本文以阿里云ECS为例  
**远程设备**：需要被远程控制的设备，本文是越狱iPhone，系统版本13.6.1

## 步骤
### 中转服务器
对于中转服务器要求比较简单，一是要有公网iP，在任何地方都能够联接，二是需要有正常SSH服务，也就是可以远程SSH联接，大多数的云服务器都满足以上条件

### 远程设备

1. 首先是越狱，安装Cydia，然后添加源：`https://julioverne.github.io`，搜索并安装`screendump`（for iOS13）
2. 打开设置界面，最下面找到screendump，打开并设置一个密码（后面本地设备联接时需要用到）
3. 添加源：`https://repo.cydiabc.top/`，搜索并安装`NewTerm2`
4. 打开NewTerm，输入`ssh -NTf -R 5900:localhost:5900 username@xx.xx.xx.xx`（username@xx.xx.xx.xx 为中转服务器的用户名和ip地址，5900为VNC的默认端口地址），然后输入密码，关于SSH Tunnel可能参考[这个教程](https://lotabout.me/2019/SSH-Port-Forwarding/)

### 本地设备
先以MAC为例  
1. 下载[对应版本的VNC Viewer](https://www.realvnc.com/en/connect/download/viewer/)，并安装  
2. 打开系统终端，输入命令`ssh -NTf -L 5900:localhost:5900 username@xx.xx.xx.xx`（username@xx.xx.xx.xx 为中转服务器的用户名和ip地址，5900为VNC的默认端口地址）
3. 打开VNC Viewer，在上面输入框输入`localhost`，如果能联接成功，则再输入远程设备设置的VNC密码，这时候就联接成功了

再来说下iOS，如果是越狱设备的话可以参照上面的教程，安装NewTerm后就可以直接用命令行进行端口转发了，对于未越狱设备：  
1. 在Appstore下载Termius，首先在`Hosts`中添加Host，也就是中转服务器的地址和用户名，然后在`Port Forwarding`中建立一个新的转发，Host为刚刚配置的中转服务器，Port都有5900，Destination为 localhost，保存并联接  
2. 在Termius的设置中打开`Active connection saver`选项，它会在后台每20秒发送一个通知，在收到通知后及时点开通知回到Termius，这是为了防止它被系统在后台杀死，如果被杀死则刚刚联接的Port Forwarding会断
3. 下载并打开VNC Viewer，输入`localhost`并联接，如果能联接成功，则再输入远程设备设置的VNC密码，这时候就联接成功了

## 遗留问题
有一个问题是远程设备的SSH Tunnel过一段时间会自动断掉，如果断了就无法进行远程联接些设备了，现在需要通过脚本设置一个定时器，定时重连，后续完成后再补充。

## 参考资料
[SSH 端口转发教程](https://lotabout.me/2019/SSH-Port-Forwarding/)  
[SSH Tunnel扫盲(ssh port forwarding端口转发)](https://blog.csdn.net/blade2001/article/details/8877250)  


















