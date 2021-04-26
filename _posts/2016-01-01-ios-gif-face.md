---
title: iOS gif动态图片、动态表情图文混排 网络图片图文混排
tags: [ gif, iOS]
categories: iOS
excerpt: 
---
效果如下：

![]({{site.url}}/downloads/ios-gif-face/gif-face.webp)



关于图文混排大家应该都非常熟悉了， iOS7之前是用CoreText实现， 用CoreText比较麻烦， 所以一般都用封装好的第三方来实现图文混排。苹果在iOS7新加`NSTextAttachment`这个类， 使在文本中添加图片非常简单，所以现在来实现文本与变通图片的混排比较简单了。但是到目前`NSTextAttachment`还不支持gif图片，我认为苹果应该是不建议在文本中加入动态图片， 因为显示太多的动态图片无论是对于性能还是内存消耗都比较多，从性能和用户体验考虑还是应该少用或者不用动态图片。

前几天在网上找了下动态表情的图文混排， 但是基本上没有找到成功实现gif图片图文混排的demo或者第三方， 但是QQ还有其它一些应用都已经实现了这个功能， 所以这个功能是一定能实现的，只是现在做这个需求还不是很多吧。网上找不到只能自己看文档来实现，但是苹果没有直接提供可以支持动态图片与文字混排的类或者方法，只是自己再想思路。最后也是实现了功能， 不过对于性能优化还没有太多考虑，希望各位兄弟能给我看看怎么优化下性能。

### 大体思路：
- 利用正则匹配出图片名字，并将其用`NSTextAttachment`对象进行替换，并设置`NSTextAttachment`的`bounds`（这里的`NSTextAttachment`对象作用是占位和标记）
- 设置`TextView`或者Label的`attributedText`，然后遍历`attributedText`找出刚才添加进去的`NSTextAttachment`，并在相应的`NSTextAttachment`上面添加相应的动态图片，搞定。。。

-----
**2018.07.13 更新 ：**  
- 图文混排支持网络图片，传入图片URL即可显示（需要依赖`SDWebImage`）
- 显示控件支持UILabel

**2017.02.15 更新 ：**  
评论中有兄弟说在cell中使用会有问题，今天我写了个在tableView中使用的demo，具体请参考下面链接。

demo地址： [点击查看](https://github.com/yuchuanfeng/CFGifEmotionDemo)
