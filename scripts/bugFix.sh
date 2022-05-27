#/bin/bash

npm run build;
npm pack;
git add .
git commit -m "bug fix";
git push;
cd ../roundware-web-template-glam;
npm i https://github.com/shreyas-jadhav/roundware-web-framework/raw/main/roundware-web-framework-0.12.7.tgz
npm run deploy;
cd ../roundware-web-framework;