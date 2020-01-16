---
title: V2Ray+TLS+WS+Nginx 搭建教程【2020年最新】
tags: [V2Ray]
excerpt: 
---
本地环境：MacOS 10.15.1   
vps：Centos 7.7 64位 香港阿里云

### 域名申请
首先需要有一个域名，没有的就去申请一个，免费的也可以，我以[namecheap](https://www.namecheap.com/)为例，申请一个域名，它需要 paypal 付款，没有的需要先注册一个(国内的 paypal 好像也可以付款，这里我是用香港 paypal 付的)。域名随便买一个就可以，最便宜的一年8块钱左右。(域名一般是首次购买便宜，但是续费贵，所以购买一年后需要重新买一个新域名)  
![]({{site.url}}/downloads/v2ray+nginx/domain.png)  
购买完成后就可以在`domain list`中看到你买到的域名了：
![]({{site.url}}/downloads/v2ray+nginx/domain_finish.png)  

### cloudflare域名托管+配置DNSSEC
下面内容会涉及两个网站（namecheap、cloudflare）之间的切换，将这两个网站分别在两个窗口打开，方便切换。  

**DNS 配置**  
[cloudflare](https://zh.wikipedia.org/wiki/CloudFlare)提供域名解析服务。首先需要去[cloudflare](https://dash.cloudflare.com/)注册一个账号。将刚刚注册的域名添加进去，添加时选择0付费的就可以。  
![]({{site.url}}/downloads/v2ray+nginx/cloud_domain.png)  
然后添加一个 A记录，注册时`Proxy status`点成灰色就可以，我们只需要它的 DNS解析服务。  
![]({{site.url}}/downloads/v2ray+nginx/cloud_a.png)  
点击`continue`后，在弹出页面里面，把 Nameserver 1 和 Nameserver 2 添加到你的 namecheap 中的 Custom DNS 服务中去。  
![]({{site.url}}/downloads/v2ray+nginx/domain_dns_1.png)  
![]({{site.url}}/downloads/v2ray+nginx/domain_dns_2.png)  
![]({{site.url}}/downloads/v2ray+nginx/domain_dns_3.png)  
![]({{site.url}}/downloads/v2ray+nginx/cloud_dns.png)  
namecheap 中自定义 dns 配置完成后，返回 cloudflare 点击`Done, Check...`，然后就是等待生效。大约10分钟左右就能生效，生效的同时会给你的注册邮箱发送一封邮件，可以不断刷新或者等待邮件通知。  
![]({{site.url}}/downloads/v2ray+nginx/dns_active.png)  
**DNSSEC 配置**  
据说配置DNSSEC[可以防止 DNS 污染](https://www.jdonkey.club/archives/218/)，具体效果如何我也没有测试过，不过它是免费的所以我们就把它也配置一下吧。

回到 cloudflare，选择 DNS，往下滑动就能看到 DNSSEC 了，点击右侧的 ENABLE DNSSEC。  
![]({{site.url}}/downloads/v2ray+nginx/cloud_dnssec.png)  
![]({{site.url}}/downloads/v2ray+nginx/dnssec_enable.png)  
会有一个弹窗，保持这个弹窗，再回到 namecheap，选择`Advanced DNS`，开启 DNSSEC 选项。
![]({{site.url}}/downloads/v2ray+nginx/domain_advance.png)  
![]({{site.url}}/downloads/v2ray+nginx/advance_dns.png)  
下面一栏中对应的`Key Tag`、`	
Digest`、`Digest Type`、`Algorithm`就是对应刚才cloudflare弹窗内容填写的，填写完成后点击确定就可以了，cloudflare弹窗点击`Confirm`。  
![]({{site.url}}/downloads/v2ray+nginx/dnssec_dig.png)  
![]({{site.url}}/downloads/v2ray+nginx/dnssec_confirm.png)  
然后又是等待生效时间，大约10分钟左右，就生效了，如下：  
![]({{site.url}}/downloads/v2ray+nginx/dnssec_success.png)  
到此为止，namecheap 上的东西都配置完了，可以把它关掉了。。。  
### 配置 SSL 证书
我们使用 [FreeSSL](https://freessl.cn/)生成免费的证书，当然收费的证书也可以。最好注册个账号，方便后续操作。  
![]({{site.url}}/downloads/v2ray+nginx/ssl_create.png)  
![]({{site.url}}/downloads/v2ray+nginx/ssl_create_1.png) 
点击创建后会生成TXT 记录值，回到 cloudflare，在 DNS 里面添加一条TXT 记录，其中name 和 content 就是对应刚刚创建的 SSL 中的`TXT 记录`和 `记录值`的：
![]({{site.url}}/downloads/v2ray+nginx/ssl_txt_ssl.png) 
![]({{site.url}}/downloads/v2ray+nginx/ssl_txt.png) 
添加完成后，回到 freessl 点击`配置完成，检测一下`，正常情况下会显示绿色的 匹配：
![]({{site.url}}/downloads/v2ray+nginx/ssl_pipei.png) 
回到 freessl，点击验证，就会出现证书信息了，点击下载文件，解压后得到两个文件，这就是我们需要的证书文件：  
![]({{site.url}}/downloads/v2ray+nginx/ssl_zhengshu.png) 
将这两个文件复制到你的 VPS 上面去：   

```
scp -r /Users/yuchuanfeng/Downloads/ma.lichade89.xyz root@47.244.xxx.xxx:/etc/
```
### nginx 安装
nginx 安装网上有很多教程了，可以去搜下。在这里我只以 CentOS 7.7 为例安装。  

```
sudo yum install nginx // 安装
sudo systemctl enable nginx // 开机启动
sudo systemctl start nginx // 启动
sudo systemctl restart nginx // 停止
// 重新加载，因为一般重新配置之后，不希望重启服务，这时可以使用重新加载。
sudo systemctl reload nginx 
```
修改 nginx 配置文件，修改完成后需要重启 nginx 服务。    
```
server {
    # SSL configuration
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    ssl_certificate /ssl.pem; #你的ssl证书， 如果第一次，可能还需要自签一下，
    ssl_certificate_key /ssl.key; #你的ssl key
 
    root /var/www/html;
 
    # Add index.php to the list if you are using PHP
    index index.html index.htm index.nginx-debian.html;
 
    server_name test.v2ray.com; #你的服务器域名
 
    location /ray { #/ray 路径需要和v2ray服务器端，客户端保持一致
        proxy_redirect off;
        proxy_pass http://127.0.0.1:10000; #此IP地址和端口需要和v2ray服务器保持一致，
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
    }
}
```
在浏览器中打开https + 你的域名(我的是https://ma.lichade89.xyz/)，如果能成功打开，则表示 nginx 配置成功了(注意是 https)。  
![]({{site.url}}/downloads/v2ray+nginx/nginx_success.png) 
如果不能打开，请检查你的配置是否正确，及443端口是否已经打开。 
![]({{site.url}}/downloads/v2ray+nginx/error_1.png) 
如果浏览器报这种安全错误，直接跳过就好。  

### v2ray 安装 && 配置
网上有很多一键脚本了，直接google 搜就行了。  
```
wget https://install.direct/go.sh
sudo bash go.sh
```
编辑v2ray 配置文件 
```
vim /etc/v2ray/config.json
```
```
{
  "log" : {
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "warning"
  },
  "inbound": {
    "port": 9000, //(此端口与nginx配置相关)
    "listen": "127.0.0.1",
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "eb950add-608e-409d-937f-e797324387093z", //你的UUID， 此ID需与客户端保持一致
          "level": 1,
          "alterId": 64 //此ID也需与客户端保持一致
        }
      ]
    },
   "streamSettings":{
      "network": "ws",
      "wsSettings": {
           "path": "/v2ray" //与nginx配置相关
      }
   }
  },
  "outbound": {
    "protocol": "freedom",
    "settings": {}
  },
  "outboundDetour": [
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "blocked"
    }
  ],
  "routing": {
    "strategy": "rules",
    "settings": {
      "rules": [
        {
          "type": "field",
          "ip": [
            "0.0.0.0/8",
            "10.0.0.0/8",
            "100.64.0.0/10",
            "127.0.0.0/8",
            "169.254.0.0/16",
            "172.16.0.0/12",
            "192.0.0.0/24",
            "192.0.2.0/24",
            "192.168.0.0/16",
            "198.18.0.0/15",
            "198.51.100.0/24",
            "203.0.113.0/24",
            "::1/128",
            "fc00::/7",
            "fe80::/10"
          ],
          "outboundTag": "blocked"
        }
      ]
    }
  }
}
```
修改完成后需要重启v2ray:  
```
sudo systemctl  restart v2ray
```
然后根据上面v2ray 服务端信息填写客户端配置，其中要注意的是在混淆里面的路径一定要和 nginx 里面配置 location 一致。  
![]({{site.url}}/downloads/v2ray+nginx/v2ray_peizhi.png) 
![]({{site.url}}/downloads/v2ray+nginx/v2ray_peizhi_1.png)  
如果没有问题的情况下到此是能正常访问 google 了。

### BBR Plus 加速
```
wget --no-check-certificate -O tcp.sh https://github.com/cx9208/Linux-NetSpeed/raw/master/tcp.sh && chmod +x tcp.sh && ./tcp.sh
```
安装过程中需要重启 vps，重启完成后，重新运行一次脚本，开户 BBR Plus  
```
./tcp.sh
```

### 其它问题

**将域名输入到浏览器不能正常打开**  
首先，显示404 not found 或者 nginx 信息页为正常打开，502 等等都是错误的。  
1. 如不能正常打开，先 ping 一下域名是否能正常解析
2. 检查本地443端口是否打开
3. vps 配置是否允许443端口访问（如：阿里云需要手动配置 安全组，加入 443 端口）

**配置完成不能正常翻墙**  
1. v2ray 和 nginx 修改配置后需要重启或者重新 load
2. 检查浏览器是否能正常打开域名
3. 客户端配置是否和服务端一直（UUID、服务器域名、ws 

**参考：**  
[V2Ray+WebSocket+TLS+Nginx配置与使用教程](https://doubibackup.com/v2ray-ws-tls-nginx.html)  
[拒绝DNS劫持和污染~利用Cloudflare免费配置DNSSEC](https://www.jdonkey.club/archives/218/)  
[CentOS 7 下 yum 安装和配置 Nginx](https://qizhanming.com/blog/2018/08/06/how-to-install-nginx-on-centos-7)  
[BBR 加速，四合一脚本](https://ssr.tools/1217)
