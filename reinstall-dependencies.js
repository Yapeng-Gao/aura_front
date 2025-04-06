const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('开始修复依赖问题...');

// 检测操作系统
const isWindows = os.platform() === 'win32';

// 清理node_modules和lock文件
try {
  console.log('清理现有依赖...');
  if (fs.existsSync('node_modules')) {
    if (isWindows) {
      execSync('rmdir /s /q node_modules');
    } else {
      execSync('rm -rf node_modules');
    }
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }
  console.log('清理完成');
} catch (error) {
  console.error('清理依赖时出错:', error);
}

// 更新package.json以确保依赖兼容
try {
  console.log('更新package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = require(packageJsonPath);

  // 修改关键依赖版本
  packageJson.dependencies = {
    ...packageJson.dependencies,
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.72.4",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "@react-navigation/material-top-tabs": "^6.6.3",
    "react-native-gesture-handler": "^2.12.1",
    "react-native-reanimated": "^3.4.2",
    "react-native-screens": "^3.25.0",
    "react-native-safe-area-context": "^4.7.2",
    "react-native-tab-view": "^3.5.2"
  };

  // 写回package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('package.json更新完成');
} catch (error) {
  console.error('更新package.json时出错:', error);
}

// 重新安装依赖
try {
  console.log('安装依赖中...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('依赖安装完成');
} catch (error) {
  console.error('安装依赖时出错:', error);
}

// 安装其他UI依赖
try {
  console.log('安装UI库依赖...');
  execSync('npm install antd@^5.0.0 @ant-design/icons react-router-dom --legacy-peer-deps', { stdio: 'inherit' });
  console.log('UI库依赖安装完成');
} catch (error) {
  console.error('安装UI库依赖时出错:', error);
}

console.log('依赖修复完成!');
console.log('请尝试运行应用，如果仍有问题，您可能需要手动解决版本冲突。'); 