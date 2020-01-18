---
title: Linux 端口访问不通问题
tags: [Linux]
excerpt:
---

服务器：Centos 7.7 香港阿里云

## 检测端口是否通
可以在[这个网站](http://tool.chinaz.com/port/)输入 IP 和端口进行检测。  
或者在另外一台电脑或者服务器用 telnet 检测：  
```
telnet 47.244.217.106 18288
```
另外，如果你的 IP 地址Ping 不通，那是 IP 被墙或者其它问题，应该在能 Ping 通 IP 的基础上再去看端口不通的问题。

## 防火墙配置
默认情况下防火墙是没有开放端口，需要添加要开放的端口，我的云端服务系统为 CentOS 系统，以它为例。
### Centos 7 使用Firewalld
**从Centos7以后，iptables服务的启动脚本已被忽略。请使用firewalld来取代iptables服务。**由于 firewalld 默认是关闭的，所以首先需要打开 firewalld ，然后开端口，再 reload 下就可以了。  
```
systemctl staus firewalld.service    //查看防火墙状态
systemctl stop  firewalld.service    //关闭防火墙
systemctl start firewalld.service    //开启防火墙

// 指定开放端口 返回success 说明成功了
firewall-cmd --zone=public --add-port=8080/tcp --permanent
// 关闭指定端口
firewall-cmd --zone=public --remove-port=8080/tcp --permanent

// 重新加载防火墙配置
firewall-cmd --reload

// 查看开放了的端口
firewall-cmd --list-ports

```
### Centos 7 以下使用 iptables
```
yum install -y iptables-services // 安装
systemctl start iptables // 启动
iptables -A INPUT -p tcp --dport 80 -j ACCEPT // 允许端口访问
iptables --list // 规则列表
systemctl enable iptables.service
service iptables save // 开机启动
```

## 是否在监听
只在防火墙开端口，没有本地服务监听端口，那这个端口仍然telnet不通的。例如开了443端口，需要修改 nginx 配置监听 443 端口，并且重启 nginx 服务，才能访问通443端口。可以用 netstat 命令查看端口监听状态。  
```
netstat -tulpn | grep 443
```

## 安全配置
很多云主机服务商都有端口访问安全配置，例如阿里云，需要在配置安全组中配置规则才可以：  
![]({{site.url}}/downloads/ports/ali_peizhi.png)  

## 端口被墙
如果你的云主机或者 vps 在海外，并且被拿来搭梯子了或者其它敏感时期，你的端口有可能被墙了，测试方法是在另外一台海外主机上用 telnet 试试通不通，或者配置一个新端口试试能不能通。

**参考：**  
[CentOS 7 开放端口和关闭防火墙](http://16bing.com/2017/08/08/centos-7-open-port/)  
[centos7 开放端口，telnet不通问题等](https://blog.csdn.net/qq_38380025/article/details/100535707)  
[firewalld 与 iptables](https://www.jianshu.com/p/70f7efe3a227)  


