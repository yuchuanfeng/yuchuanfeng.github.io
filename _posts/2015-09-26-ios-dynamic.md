---
title: iOS CoreMotion + UIDynamic简单应用
tags: [ UIDynamic, CoreMotion, iOS]
categories: iOS
excerpt: 
---


CoreMotion 参考: [点击查看](http://www.cocoachina.com/ios/20141103/10111.html)  
UIDynamic 参考: [点击查看](http://www.cnblogs.com/wendingding/p/3893740.html)

最近项目中需要重力感应这方面的东西, 在网上一搜还是能找到不少的, 可是发现只用重力感应根本实现不了想要的效果. 但是其它产品能实现的功能, 我相信它一定能实现, 所以在网上各种找, 可是最终是失败的, 最后只能自己看苹果的文档找思路了. 想要实现的效果如下(在真机上可以重力感应):
   
![]({{site.url}}/downloads/ios-dynamic/dynamic.gif)

  在一开始我认为是用UIDynamic就能实现的, 认为也是非常容易实现的, 最终在模拟器上运行出来的效果也不错, 可是运行到真机上后就发现里面的小球不能跟随手机翻去而到处滚动. 最后想到用CoreMotion实现, 可是CoreMotion又无法做到弹性\初速度这样的事情, 最后我认为应该用这两个结合来完成, 记录如下:
   
### 配置物理仿真
   
```
- (void)addDynamicBehaviour {
    
    self.animator = [[UIDynamicAnimator alloc] initWithReferenceView:self.backView];
    // 重力
    UIGravityBehavior * gravityBehavior = [[UIGravityBehavior alloc] initWithItems:@[self]];
    self.gravityBehavior = gravityBehavior;
    [self.animator addBehavior:gravityBehavior];
    // 碰撞
    UICollisionBehavior *collisionBehavior = [[UICollisionBehavior alloc] initWithItems:@[self]];
    [collisionBehavior setTranslatesReferenceBoundsIntoBoundary:YES];
    collisionBehavior.collisionMode = UICollisionBehaviorModeEverything;
    [self.animator addBehavior:collisionBehavior];
    // 基本配置
    UIDynamicItemBehavior *itemBehavior = [[UIDynamicItemBehavior alloc] initWithItems:@[self]];
    [itemBehavior setElasticity:0.6];
    [itemBehavior addLinearVelocity:self.velocity forItem:self];
    [self.animator addBehavior:itemBehavior];
}
```

### 加速计
```
- (void)startAccelerometer
{
    self.motionManager = [[CMMotionManager alloc] init];
    
    if (self.motionManager.deviceMotionAvailable) {
        self.motionManager.deviceMotionUpdateInterval = marginTime;
        __weak typeof(self) weakSelf = self;
        [self.motionManager startDeviceMotionUpdatesToQueue:[[NSOperationQueue alloc]init] withHandler:^(CMDeviceMotion * _Nullable motion, NSError * _Nullable error) {
            dispatch_async(dispatch_get_main_queue(), ^{
                CMAcceleration acceleration = motion.gravity;
                CGFloat y = acceleration.y;
                if (fabs(y) < 0.15) {
                    y = -0.6;
                }
                weakSelf.gravityBehavior.gravityDirection = CGVectorMake(acceleration.x, -y);
            });
        }];        
    }
}

```

### 小注:
思路就是监听手机的重力加速, 从而识别手机横竖位置等, 再根据位置调整重力行为的重力方向, 就是这么简单~~~~
   
### 另外一定注意:
 因为在`startAccelerometerUpdatesToQueue`方法中传入的队列不是主队列, 所以回调的block也是在子队列中执行的,  而设置重力行为的`gravityDirection`时必须在主队列才行, 所以一定注意在设置`gravityDirection`一定要切换到主线程中. (一开始我没注意, 害我浪费半下午的时间才解了这个bug)

 demo已上传github([点击查看](https://github.com/yuchuanfeng/CFCoreMotionDemo))
