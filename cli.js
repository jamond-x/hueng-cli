#!/usr/bin/env node

// Node CLI 应用入口文件必须要有这样的文件头
// 如果是 Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755？
// 通过 chmod 755 cli.js 实现修改

const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const ejs = require('ejs');

/**
 * 复制模板文件
 * @param {string} sourceDir 源模板路径
 * @param {string} files 当前文件夹下的文件或文件夹名
 * @param {Record<string, string>} context 终端输入的数据对象
 * @param {string} newPath 模板将复制到这个路径
 */
const copyFile = (sourceDir, files, context, newPath) => {
  files.forEach((file) => {
    const sourceFilePath = path.join(sourceDir, file);
    const destPath = path.join(newPath, file);

    fs.stat(sourceFilePath, (err, stat) => {
      if (err) {
        console.log({ err });
      }
      if (stat?.isFile()) {
        ejs.renderFile(sourceFilePath, context, (err, content) => {
          fs.writeFileSync(destPath, content);
        });
        // 为文件夹，进行递归处理
      } else if (stat?.isDirectory()) {
        fs.exists(destPath, (exists) => {
          if (!exists) {
            fs.mkdir(destPath, { recursive: false }, (err) => {
              if (err) throw err;
              fs.readdir(sourceFilePath, (err, files) => {
                if (err) throw err;
                copyFile(sourceFilePath, files, context, destPath);
              });
            });
          }
        });
      }
    });
  });
};

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: '项目名称：',
    },
  ])
  .then((ans) => {
    //创建以项目name命名的文件夹前判断文件夹是否已存在
    fs.exists(path.join(process.cwd(), ans?.name), (exist) => {
      if (exist) {
        console.log('文件名已存在，请更换项目名称！');
        process.exit();
      }
    });

    // 先创建项目文件夹
    fs.mkdir(path.join(process.cwd(), ans?.name), (err) => {
      if (err) throw err;
      console.log('已创建项目根目录');
      try {
        // 切换当前进程目录
        process.chdir(path.join(process.cwd(), ans?.name));
      } catch {
        console.log('切换目录失败！');
      }
    });

    // 需要创建目录且切换目录后才进行相关操作，所以nexttick()
    process.nextTick(() => {
      const tmplDir = path.join(__dirname, 'templates');
      // 读取模板文件夹
      fs.readdir(tmplDir, (err, files) => {
        if (err) throw err;
        copyFile(tmplDir, files, ans, process.cwd());
      });
    });
  });
