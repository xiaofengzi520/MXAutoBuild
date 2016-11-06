# MXAutoBuild
一个使用node写的iOS自动打包的脚本,并可以选择上传到蒲公英
### appbuild.js

```
Usage: appbuild.js [options] 

Options:
  -Relese,  
  -Debug(Default),

Examples:
  appbuild -Release name.xcworksapce or appbuild -Release name.xcodeproj;
  
```

脚本中有几个全局变量，是蒲公英账号的apikey和userkey,如果不设置,就需要自己每次输入, 包括:

```
var pgyApiKey = '****************';
var pgyUserKey = "****************";

```
自动上传到app store,之后会慢慢跟上.使用前请自己在工程中配置上证书,本脚本暂时不修改项目的任何设置.编译完的文件会自动存放在项目跟目录下的build文件夹中,成功打包之后,会放在用户桌面文件夹的appbuild文件夹内.
