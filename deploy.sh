#!/usr/bin/env sh

# 發生錯誤時終止腳本
set -e

# 顯示提示訊息
echo "開始建置專案..."

# 建置專案
npm run build

# 顯示提示訊息
echo "建置完成，準備部署..."

# 進入建置後的資料夾
cd dist

# 初始化一個新的 git 儲存庫
git init
git add -A
git commit -m 'deploy: 自動化部署'

# 顯示提示訊息
echo "正在推送到 GitHub Pages..."

# 推送到遠端的 gh-pages 分支
# 使用 HEAD:gh-pages 可以確保推送的是當前分支，避免 main/master 的混淆
git push -f https://github.com/raellen/vue-booking.git HEAD:gh-pages

# 顯示提示訊息
echo "部署成功！"

# 返回上一層目錄
cd -
