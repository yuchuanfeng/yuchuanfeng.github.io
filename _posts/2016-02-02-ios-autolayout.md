---
title: iOS AutoLayout中的Content Hugging 和 Content Compression Resistance优先级问题
tags: [ autolayout, iOS]
categories: iOS
excerpt: 
---


关于autolayout的优先级的问题在网上已经有很多资料了，推荐一个：
[Autolayout中关于intrinsic content、相关优先级及其应用](http://www.jianshu.com/p/f83fa37fdd46)

这篇文章详细讲解了在使用storyboard中如何设置Content Hugging 和 Content Compression的优先级，我这里我就说下怎么使用代码设置优先级作为补充。用代码设置布局一般都使用[masonry](https://github.com/SnapKit/Masonry)，所以我就在使用[masonry](https://github.com/SnapKit/Masonry)的基础上写demo。

### 添加两个label
```
    UILabel* leftLabel = [[UILabel alloc] init];
    leftLabel.backgroundColor = [UIColor redColor];
    [self.view addSubview:leftLabel];
    leftLabel.text = @"人做的畜生之事越多，内心越是痛苦。";
    [leftLabel sizeToFit];
    
    UILabel* rightLabel = [[UILabel alloc] init];
    rightLabel.backgroundColor = [UIColor greenColor];
    [self.view addSubview:rightLabel];
    rightLabel.text = @"1234567890";
    [rightLabel sizeToFit];
```

### 设置布局
```
    [leftLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.height.equalTo(@(20));
        make.left.equalTo(self.view).offset(10);
        make.centerY.equalTo(self.view);
        make.right.mas_lessThanOrEqualTo(rightLabel.mas_left);
    }];
    
    [rightLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.height.equalTo(@(20));
        make.left.mas_greaterThanOrEqualTo(leftLabel.mas_right);
        make.right.equalTo(self.view).offset(-10);
        make.centerY.equalTo(leftLabel);
    }];
```

### 运行效果

![]({{site.url}}/downloads/ios-autolayout/auto-01.png)

在默认情况下，我们没有设置各个布局的优先级，那么他就会优先显示左边的label，左边的完全显示后剩余的空间都是右边的label，如果整个空间宽度都不够左边的label的话，那么右边的label没有显示的机会了。

如果我们现在的需求是优先显示右边的label，左边的label内容超出的省略，这时就需要我们调整约束的优先级了。

### 理论

* **约束优先级:** 在Autolayout中每个约束都有一个优先级, 优先级的范围是1 ~ 1000。创建一个约束，默认的优先级是最高的1000
* **Content Hugging Priority:** 该优先级表示一个控件抗被拉伸的优先级。优先级越高，越不容易被拉伸，默认是250。
* **Content Compression Resistance Priority:** 该优先级和上面那个优先级相对应，表示一个控件抗压缩的优先级。优先级越高，越不容易被压缩，默认是750

所以默认情况下两边的label的**Content Hugging**和**Content Compression**优先级都是一样的，为了让右边的label完全显示，那么我们需要增大右边label的抗压缩级，或者减小左边label的抗压缩级，总之是得让右边的抗压缩级大于左边的label，这样才能让右边的label内容优先显示。

UIView中关于Content Hugging 和 Content Compression Resistance的方法有：
```
- (UILayoutPriority)contentHuggingPriorityForAxis:(UILayoutConstraintAxis)axis NS_AVAILABLE_IOS(6_0);
- (void)setContentHuggingPriority:(UILayoutPriority)priority forAxis:(UILayoutConstraintAxis)axis NS_AVAILABLE_IOS(6_0);

- (UILayoutPriority)contentCompressionResistancePriorityForAxis:(UILayoutConstraintAxis)axis NS_AVAILABLE_IOS(6_0);
- (void)setContentCompressionResistancePriority:(UILayoutPriority)priority forAxis:(UILayoutConstraintAxis)axis NS_AVAILABLE_IOS(6_0);
```


在初始化label里面添加代码：
```
[leftLabel setContentCompressionResistancePriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal];
```
或者
```
[rightLabel setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisHorizontal];
```
`UILayoutPriority`类型实际上就是`float`类型，只要设置右边的比左边的大就可以。

**修改后的效果**  
![]({{site.url}}/downloads/ios-autolayout/auto-02.png)

对于多个labe或者button利用类似的方法都可以做到优先显示某一个控件的内容。
