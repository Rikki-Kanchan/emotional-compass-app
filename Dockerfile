# Node.jsの公式イメージを使用 (LTS-Alpine版)
FROM node:20-alpine

# アプリのコードを置くためのディレクトリを作成
WORKDIR /app

# 最初にpackage.jsonとyarn.lockをコピー
# これにより、依存関係が変わらない限りキャッシュが利用され、ビルドが高速化する
COPY package.json yarn.lock* ./

# 依存関係をインストール
RUN yarn install

# プロジェクトの残りのファイルをコピー
COPY . .

# Viteが使用するポートを公開
EXPOSE 5173

# コンテナ起動時に実行するコマンド
CMD ["yarn", "dev", "--host"]