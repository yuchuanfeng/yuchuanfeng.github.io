---
title: iOS 对网络图片进行黑白化处理
tags: [ image, iOS]
categories: iOS
excerpt: 
---
先上图片处理的前后效果对比:  
处理前:![]({{site.url}}/downloads/ios-image-gray/image-gray.webp)

处理后:
![]({{site.url}}/downloads/ios-image-gray/image-gray1.webp)

最近项目需要,图片显示两种状态, 一种是原版彩色的, 另外一种就是黑白的, 可是对于这两种状态我们的服务器端只给我们提供了一套彩色的图片, 我们前端需要根据状态自己处理图片, 于是我就请教了百度, 找到了下面这个方法:
```
- (UIImage*)grayscale:(UIImage*)anImage type:(int)type {
    
    CGImageRef imageRef = anImage.CGImage;
    
    size_t width  = CGImageGetWidth(imageRef);
    size_t height = CGImageGetHeight(imageRef);
    
    size_t bitsPerComponent = CGImageGetBitsPerComponent(imageRef);
    size_t bitsPerPixel = CGImageGetBitsPerPixel(imageRef);
    
    size_t bytesPerRow = CGImageGetBytesPerRow(imageRef);
    
    CGColorSpaceRef colorSpace = CGImageGetColorSpace(imageRef);
    
    CGBitmapInfo bitmapInfo = CGImageGetBitmapInfo(imageRef);
    
    
    bool shouldInterpolate = CGImageGetShouldInterpolate(imageRef);
    
    CGColorRenderingIntent intent = CGImageGetRenderingIntent(imageRef);
    
    CGDataProviderRef dataProvider = CGImageGetDataProvider(imageRef);
    
    CFDataRef data = CGDataProviderCopyData(dataProvider);
    
    UInt8 *buffer = (UInt8*)CFDataGetBytePtr(data);
    
    NSUInteger  x, y;
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            UInt8 *tmp;
            tmp = buffer + y * bytesPerRow + x * 4;
            
            UInt8 red,green,blue;
            red = *(tmp + 0);
            green = *(tmp + 1);
            blue = *(tmp + 2);
            
            UInt8 brightness;
            switch (type) {
                case 1:
                    brightness = (77 * red + 28 * green + 151 * blue) / 256;
                    *(tmp + 0) = brightness;
                    *(tmp + 1) = brightness;
                    *(tmp + 2) = brightness;
                    break;
                case 2:
                    *(tmp + 0) = red;
                    *(tmp + 1) = green * 0.7;
                    *(tmp + 2) = blue * 0.4;
                    break;
                case 3:
                    *(tmp + 0) = 255 - red;
                    *(tmp + 1) = 255 - green;
                    *(tmp + 2) = 255 - blue;
                    break;
                default:
                    *(tmp + 0) = red;
                    *(tmp + 1) = green;
                    *(tmp + 2) = blue;
                    break;
            }
        }
    }
    
    
    CFDataRef effectedData = CFDataCreate(NULL, buffer, CFDataGetLength(data));
    
    CGDataProviderRef effectedDataProvider = CGDataProviderCreateWithCFData(effectedData);
    
    CGImageRef effectedCgImage = CGImageCreate(
                                               width, height,
                                               bitsPerComponent, bitsPerPixel, bytesPerRow,
                                               colorSpace, bitmapInfo, effectedDataProvider,
                                               NULL, shouldInterpolate, intent);
    
    UIImage *effectedImage = [[UIImage alloc] initWithCGImage:effectedCgImage];
    
    CGImageRelease(effectedCgImage);
    
    CFRelease(effectedDataProvider);
    
    CFRelease(effectedData);
    
    CFRelease(data);
    
    return effectedImage;
    
}
```
然后我就写了个demo, 用本地图片做了下, 的确好使, 不愧是大神写的, 虽然看不懂, 但是会用就行了, 于是就照搬到我们的项目中去了, 一般事情发展到这里就应该完美结束了, 可是这却是麻烦来临前的平静, 然后在工程中运行时就出现了下面的错误:
![]({{site.url}}/downloads/ios-image-gray/image-gray2.webp)

访问了坏内存, 如果对于OC来说如果出现这样的问题还能找到些思路, 可是对于C语言对待这样的问题就一头雾水了, 不知道什么地方导致的问题, 所以在当时这个bug使我不知所措呀, 不知道从什么地方下手. 后来经过我重复测试, 得到下面规律:

1. 对本地图片处理不会出现这个问题 
2. 对于网络图片都是应用安装(安装模拟器或者真机)后, 第一次运行到该地方时才会出现这个问题, 之后再怎么处理这个图片都不会有问题了.

#### 问题定位:
 最后我把问题点定位在了 图片缓存 上面, 我是通过 SDWebImage 来做图片下载和缓存的, 通过查看代码发现, SDWebImage 在下载完成后作的图片缓存是异步的, 也就是在第一次下载图片的时候, 本地是没有缓存的, 而且处理的图片是在内存里面的, 然后处理图片的时候出现了坏内存访问. 而在第二次处理的时候之前一次已经将图片缓存到本地了, 所以就没有问题了. 虽然我也不知道为什么这个处理方法对没有缓存到本地的图片处理会出现坏内存访问, 不过最终把问题定位到这个地方了. 

#### 解决方案: 
在SDWebImage下载完图片后, 先检查本地有没有存在该图片, 如果没有, 则先把下载下来的图片同步缓存到本地, 然后再从本地取得图片进行处理.问题解决!

#### 代码如下: 
```
    [[SDWebImageManager sharedManager] downloadImageWithURL:imageUrl options:SDWebImageRetryFailed progress:nil completed:^(UIImage *image, NSError *error, SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
        
        NSString* key = [[SDWebImageManager sharedManager] cacheKeyForURL:imageURL];
        BOOL result = [[SDImageCache sharedImageCache] diskImageExistsWithKey:key];
        NSString* imagePath = [[SDImageCache sharedImageCache] defaultCachePathForKey:key];
        NSData* newData = [NSData dataWithContentsOfFile:imagePath];
        if (!result || !newData) {
            NSData* imageData = [image sd_imageData];
            NSFileManager* _fileManager = [NSFileManager defaultManager];
            if (imageData) {
                [_fileManager removeItemAtPath:imagePath error:nil];
                [_fileManager createFileAtPath:imagePath contents:imageData attributes:nil];
            }
        }
        newData = [NSData dataWithContentsOfFile:imagePath];
        UIImage* grayImage = nil;
        if (type == 0) {
            grayImage = [UIImage imageWithData:newData];
        }else{
            UIImage* newImage = [UIImage imageWithData:newData];
            
            grayImage = [newImage grayscaleWithType:type];
        }
       self.imageView.image = grayImage;
    }];
```
