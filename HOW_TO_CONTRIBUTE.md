## How to Contribute to Roundware Web Framework

# Setup

```bash
git clone https://github.com/roundware/roundware-web-framework.git
cd roundware-web-framework
npm install
npm test
```

# Workflow

npm test # run test suite
ROUNDWARE_DEBUG=true npm test # send logging statements to STDOUT

npm run devstart && open http://localhost:9000 # Uses webpack to live-reload source code in your browser

npm run cover && open coverage/lcov-report/index.html # checks code coverage and opens a report in the browser
npm run check-coverage # make sure we have 100% unit test coverage; no excuses!

npm run build # see package.json for all the possible builds
```

# How to Release

```bash
npm run docbuild && open doc/index.html # creates jsdoc HTML files in doc/, which powers the project site
export RW_VERSION=0.0.1-alpha.??
npm version $RW_VERSION # also creates a git tag
unset RW_VERSION
git push && push --tags
npm publish --tag alpha
```

> TODO eventually we will move this to travis CI
