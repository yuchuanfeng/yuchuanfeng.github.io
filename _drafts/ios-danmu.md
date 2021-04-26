---
title: iOS 实现类似擦玻璃效果的一种方法
tags: [ iOS]
categories: iOS
excerpt: 
---
![]({{site.url}}/downloads/ios-layer/layer.webp)

首先谈下写这个demo的灵感来源（扯谈），是无意在github上看到[这个东西](https://github.com/moqod/ios-scratch-n-see)（以下简称大神），感觉有意思就拿下来看看，结果看了好几遍也没完全看懂，再结合自己之前学的东西感觉不用这么复杂也能实现同样的效果，于是乎就开始动手了。

### 大体思路

动手前先想了下思路，就是利用`母鸡哥讲的涂鸦` + `设置layer的mask`的方式，这样做可以说是非常简单了。然后就用了半下午的时间写完了，效果基本和大神写得那个一样，而且对比了下代码量，我写得真是简单明了呀，用了不到大神代码量一半的代码就完成了同样的功能，心情愉悦。然后就想开开心心的把代码上传github，上传之前心里总感觉不太对，这么简单就能实现，大神为什么还要写得那么麻烦，而且还用到了很多c和c++的东西。然后我又跑了大神的应用看了看cpu利用率（我用5s跑的），大约最高保持在百分这十几，感觉有点高但也可以，再跑我自己写得，令我大吃了一惊，随便划几下就百分之40+了，这么个小东西耗这么多cpu那这也太low了，怎么还好意思上传到github上呢。。。

### bug测试及解

经过测试，发现是母鸡哥讲的涂鸦有性能问题，虽然代码简单，思路清晰，但是随着触摸屏幕的点不断增加，整个绘制复杂度也是呈指数上升，导致的结果就是耗cpu非常严重。所以关于绘制图片我不得不再想其它的方法实现。但是我冥想了一天时间也没有找到好的方法降低绘制的复杂度（除了大神的那个方法），当然最后的解决方法也非常简单了，没错，就是copy大神的方法😂。下面着重介绍下大神的解决涂鸦cpu消耗问题方法(这里是重点)：
* 图形上下文：不再用layer的默认的图形上下文了（也就是在`drawRect`方法里面用`UIGraphicsGetCurrentContext()`获取的），而是自己创建一个全局的bitmap上下文
```objc
    self.imageContext = CGBitmapContextCreate(0, frame.size.width, frame.size.height, 8, frame.size.width * 4, self.colorSpace, kCGImageAlphaPremultipliedLast);
    CGContextSetStrokeColorWithColor(self.imageContext,[UIColor redColor].CGColor);
    CGContextSetFillColorWithColor(self.imageContext, [UIColor redColor].CGColor);
    CGContextTranslateCTM(self.imageContext, 0.0f, self.bounds.size.height);
    CGContextScaleCTM(self.imageContext, 1.0f, -1.0f);
```
* 在触摸屏幕的时候（`touchesBegan`、`touchesMoved`等方法），根据触摸的位置，每两个点之间连线，绘制到上面建立的图形上下文当中，这样就是随着触摸屏幕，随着往图形上下文绘制，不会把之前已经绘制的再重新添加绘制，解决了性能消耗过高的问题。

```objc
#pragma mark - touch
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    UITouch* touch = [touches anyObject];   
    [self reCreateImageWithTouchDict:@{@"touch":touch, @"lineWidth":@(touch.majorRadius)}];
}

- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event
{
    UITouch* touch = [touches anyObject];    
    [self reCreateImageWithTouchDict:@{@"touch":touch, @"lineWidth":@(touch.majorRadius)}];
}

- (UIImage *)reCreateImageWithTouchDict:(NSDictionary *)touchDict{
    UITouch* touch = touchDict[@"touch"];
    CGFloat lineWidth = [touchDict[@"lineWidth"] floatValue] * 0.5;
    if (lineWidth < 1.0) {
        lineWidth = 10;
    }  
    if (touch) {   
        CGPoint point = [touch locationInView:touch.view];
        if (touch.phase == UITouchPhaseBegan) {
            CGRect rect = CGRectMake(point.x - lineWidth, point.y - lineWidth, lineWidth*2, lineWidth*2);
            CGContextAddEllipseInRect(self.imageContext, rect);
            CGContextFillPath(self.imageContext);
            [self.points removeAllObjects];
            [self.points addObject:[NSValue valueWithCGPoint:point]];   
        }else if (touch.phase == UITouchPhaseMoved){
            [self.points addObject:[NSValue valueWithCGPoint:point]];
            if (self.points.count > 2) {
                CGContextSetLineCap(self.imageContext, kCGLineCapRound);
                CGContextSetLineWidth(self.imageContext, 2 * lineWidth);
                do{
                    CGPoint point0 = [(NSValue *)self.points[0] CGPointValue];
                    CGPoint point1 = [(NSValue *)self.points[1] CGPointValue];
                    CGContextMoveToPoint(self.imageContext, point0.x, point0.y);
                    CGContextAddLineToPoint(self.imageContext, point1.x, point1.y);
                    [self.points removeObjectAtIndex:0];
                }while (self.points.count > 2);       
            }
        }        
        CGContextStrokePath(self.imageContext);
    }  
    CGImageRef cgImage = CGBitmapContextCreateImage(self.imageContext);
    UIImage *image = [UIImage imageWithCGImage:cgImage];
    CGImageRelease(cgImage);
    return image;
}
```

### 最后实现

最后设置mask就非常简单了，设置我们将要显示的图片（那张清晰的）的layer的mask为上面通过绘制生成的image的layer，这样只有绘制过的位置才能看到将要显示的图片，功能就完成了😀，我感觉利用这个小技巧可以做很多有趣的东西（类似刮奖等）
```objc
    CALayer *mask = [CALayer layer];
    mask.contents = (id)image.CGImage;
    mask.anchorPoint = CGPointZero;
    mask.frame = self.bounds;
    self.imageView.layer.mask = mask;
    self.imageView.layer.masksToBounds = YES;
```

### 最后

别忘记释放相关内存
```objc
- (void)dealloc{
    if (_imageContext != NULL) {
        CFRelease(_imageContext);
    }
    
    if (_colorSpace != NULL) {
        CFRelease(_colorSpace);
    }
}
```

最后的最后 奉上[demo地址](https://github.com/yuchuanfeng/CFScratchViewDemo)
有错误的地方欢迎评论指正
