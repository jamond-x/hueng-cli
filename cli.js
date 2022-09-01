#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const ejs = require('ejs');
const ora = require('ora');
const chalk = require('chalk');
const spinner = ora();

const download = require('download-git-repo');

const Templates = {
  'React + React Router + TypeScript + Material UI + Jamstack + Firebase Auth + ESLint + Prettier + Jest + GitHub Actions':
    'kriasoft/react-starter-kit',
  'React 18 + TS + AntD + GitHub Pages + Tailwind + Sass + React Router DOM + ESLint':
    'maifeeulasad/react-pipeline',
  'React 18 + TypeScript + Vite + Redux Toolkit + ESLint + React Router DOM + Axios + React Icons + React Toastify + Express + Mongoose':
    'apicgg/vite-mern-template',
  'React + Vite + TypeScript + ESLint + Prettier': '0x219/template-vite-react',
  ' Vue 3.x + Vite 2.x + quasar 2.x starter': 'fyeeme/vite-quasar',
  'Vue3 + TS + Vite + ElementPlus + Vue-Router4 + Vuex4 + Vue-use + Vue-i18n PC Template':
    'parajs/vue3-pc-template',
  'Vue 3 + Tailwind CSS + vue-router + PNPM + ESlint Airbnb + Stylelint + GitHub pages actions + Netlify':
    'lecoueyl/vue3-template',
  'Vue 3 + TSX + TailwindCSS 2 JIT + PostCSS + Naive UI':
    'Innei/naive-ui-dashboard-template',
  'Background management template based on Vue3 + Ant-Design-Vue + TypeScript':
    'vbenjs/vue-vben-admin',
  'Background management template based on Vue3 + TypeScript + Tailwind CSS + element-plus':
    'xiaoxian521/vue-pure-admin',
};

const Questions = [
  {
    type: 'list',
    name: 'stack',
    message: '技术栈：',
    choices: Object.keys(Templates),
  },
  {
    type: 'input',
    name: 'description',
    message: '项目描述：',
    default: 'an app create by hueng-cli',
  },
  {
    type: 'input',
    name: 'owner',
    message: 'owner：',
  },
  {
    type: 'input',
    name: 'github',
    message: 'github仓库地址：',
  },
];

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

const context = {};

program.command('create').description('创建新项目');
context.name = program.parse(process.argv).args[1] ?? 'hueng-cli-app';

inquirer.prompt(Questions).then((ans) => {
  //创建以项目name命名的文件夹前判断文件夹是否已存在
  fs.exists(path.join(process.cwd(), context.name), (exist) => {
    if (exist) {
      console.log('文件名已存在，请更换项目名称！');
      process.exit();
    }
  });

  // 先创建项目文件夹
  fs.mkdir(path.join(process.cwd(), context.name), (err) => {
    if (err) throw err;
    try {
      // 切换当前进程目录
      process.chdir(path.join(process.cwd(), context.name));
    } catch {
      console.log(chalk.red('❌切换目录失败！'));
    }
  });

  // 需要创建目录且切换目录后才进行相关操作，所以nexttick()
  process.nextTick(() => {
    spinner.start('创建项目模块中...');
    const tmplDir = path.join(__dirname, 'templates');
    // 读取模板文件夹
    fs.readdir(tmplDir, (err, files) => {
      if (err) throw err;
      // copyFile(tmplDir, files, { ...context, ...ans }, process.cwd());
      // spinner.succeed('创建成功！');
      // console.log('');
      // console.log(chalk.bgYellowBright('Enjoy!😎'));
      download(Templates[ans.stack], process.cwd(), (err) => {
        if (err) {
          console.log(err);
          spinner.fail('创建失败！');
          return;
        }
        spinner.succeed('创建成功！');
        console.log('');
        console.log(chalk.bgYellowBright('Enjoy!😎'));
        console.log('');
      });
    });
  });
});

// Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// chmod 755 cli.js 实现修改
