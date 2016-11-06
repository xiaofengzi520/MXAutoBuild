#!/usr/bin/env node

/**
 * Created by mouxiao on 2016/11/4.
 */

var pgyApiKey = '';
var pgyUserKey = "";
var fs = require('fs');
var child = require('child_process');
var exec = child.exec;
var os=require('os');
var readline = require('readline');

var argvsArr = process.argv;
argvsArr.shift();
argvsArr.shift();
var buildingModel = "Release";
if (argvsArr.length == 1){
    buildingModel = "Debug";
}else if(argvsArr.length == 2){
    buildingModel = argvsArr[0].replace('-','');
}else if(argvsArr.length == 0){
    console.log("Please fill in the compiled file path...");
    return;
}else{
    console.log('Please check the fill in the parameters:appbuilding [-model] projectName')
    return;
}


if (buildingModel === 'Debug'){
    console.log("Ready to building Debug app...")
    readyToBuildingAppWithModel(buildingModel);
}else if (buildingModel === 'Release'){
    console.log("Ready to building Release app...");
    readyToBuildingAppWithModel(buildingModel);
}else {
    console.log("Parameter error,please write 'Release' or 'Debug' ");
}

function  readyToBuildingAppWithModel(model){
    var configuration = '-configuration' +' ' +  model
    var filePath = argvsArr.pop();
    console.log('building project:' + filePath);
    var fileArr = filePath.split('.');
    if (fileArr.length <=1 ){
        console.log("Please enter the correct filename, suffix for .xcodeproj or .xcworkspace");
        return;
    }
    var suffix = fileArr.pop();
    var scheme = null;
    var compilationModel = null;
    var dataPath = null;
    var schemeArr = filePath.split('/');
    var schemeLast = schemeArr.pop();
    dataPath = schemeArr.join('/');
    if (suffix === 'xcodeproj'){
        compilationModel = '-project'
    }else if (suffix === 'xcworkspace'){
        compilationModel = '-workspace'
        scheme = schemeLast.split('.')[0];
    }
    if (suffix == null){
        console.log("Please enter the correct filename, suffix for .xcodeproj or .xcworkspace");
        return;
    }
    var folder_exists = fs.existsSync(filePath);
    if (folder_exists){
        var cmd = 'xcodebuild' +' ' + compilationModel +' ' + filePath + ' ' + configuration;
        if (scheme != null){
            cmd = cmd + ' ' + '-scheme' + ' ' + scheme + ' ' + '-derivedDataPath' + ' ' + dataPath;
        }
        console.log('building....wait a moment..');
        exec(cmd,  {
            maxBuffer: 5000 * 1024*10000
        },function(err,stdout,stderr){
            console.log(err);
            if (err){
                console.log('compilation error:'+stderr);
            }else{
                console.log(stdout);
                var appPath = dataPath+'/build';
                if (scheme != null){
                    appPath = appPath + '/Products';
                }else {
                    scheme = schemeLast.split('.')[0];
                }
                appPath = appPath + '/' + model + '-iphoneos' +'/' + scheme;
                console.log( 'app path:' + appPath);
                packagingIpa(appPath, scheme);
            }
        })
    }else {
        console.log("File does not exist...");
    }

}

function packagingIpa(appPath, name){
    var folder_exists = fs.existsSync(appPath + '.app');
    if  (folder_exists){
        var homedir=os.homedir();
        console.log(homedir);
        folder_exists = fs.existsSync(homedir +  '/Desktop/appbuild');
        if (folder_exists == false){
            fs.mkdir(homedir + '/Desktop/appbuild', function (err) {
                if (err){
                    console.log('Failed to create the directory....');
                    console.log(err);
                }else {
                    packing();
                }
            })
        }else {
           packing();
        }
        function  packing(){
            var cmd = 'xcrun -sdk iphoneos PackageApplication -v' + ' ' + appPath + '.app' + ' -o ' + '~/Desktop/appbuild/' + name + '.ipa';
            console.log('Are packaged...')
            exec(cmd,  {
                maxBuffer: 5000 * 1024*10000
            },function(err,stdout,stderr){
                console.log(err);
                if (err){
                    console.log('packaged error:'+stderr);
                }else{
                    console.log(stdout);
                    console.log('*******Success******')
                    console.log('the ipa file path:'+ homedir + '/Desktop/' + name + '.ipa');
                    uploadApp(homedir + '/Desktop/appbuild/' + name + '.ipa');
                }
            })
        }

    }else {
        console.log("Compile the file cannot be found,Please check the xcode Settings....");
    }
}

function uploadApp(filePath){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Please select a file upload(0:No, 1:pgy, 2:app store(default:0)):', function(answer){
          if (answer.length == 0 || answer == 0){
              console.log('Packaging complete.......');
              console.log('*******thank use********');
              rl.close();
          }else if (answer == 1){
              console.log('Ready to upload pgy:.........');
              uploadTopyg(filePath, rl);
          }else if (answer == 2){
              console.log('Ready to upload app store:.........');
          }else {
              console.log('Input error, pack to end');
              console.log('*******thank use********');
              rl.close();
          }
    });
}

function  uploadTopyg(filePath, rl){

    rl.question('Please enter the pgy API key:', function(answer){
        var apiKey = answer;
        if (answer.length == 0){
            apiKey = pgyApiKey;
        }

        rl.question('Please enter the pgy user key:', function(answer) {
            var userKey = answer;
            if (answer.length == 0){
                userKey = pgyUserKey;
            }
            var cmd = 'curl -F "file=@' + filePath +'" ' + '-F "uKey=' + userKey + '"' + ' -F "_api_key='+apiKey+'" https://www.pgyer.com/apiv1/app/upload';
            console.log(cmd);
            console.log("On the cross and the required time is longer, please be patient");
            exec(cmd,  {
                maxBuffer: 5000 * 1024*10000
            },function(err,stdout,stderr){
                if (err){
                    console.log('upload error:'+stderr);
                }else{
                    console.log(stdout);
                    console.log('*******Success******')
                    console.log('*******thank use********');
                }
            })
            rl.close();
        })

    });
}

function  uploadToAppStore(filePath, rl){
    console.log('****Are in development, thank you for your use*****');
}
