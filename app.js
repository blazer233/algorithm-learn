const shell = require("shelljs");
const basePath = "/codeFiles/wordCould";
const nowPath = "/codeFiles/算法";
const controlGit = () => {
  //判定git命令是否可用
  if (!shell.which("git")) {
    //向命令行打印git命令不可用的提示信息
    shell.echo("Sorry, this script requires git");
    //退出当前进程
    shell.exit(1);
  }
  shell.cd(basePath);
  shell.exec(`git pull`);
  shell.exec("git add .");
  shell.exec(`git commit -m "testtest`);
  shell.exec(`git pull`);
  shell.exec("git push");
  shell.cd(nowPath);
};
controlGit();
