const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkgDir = path.dirname(require.resolve('expo-modules-core/package.json'));
const pkgJson = path.join(pkgDir, 'package.json');
const buildDir = path.join(pkgDir, 'build');
const outFile = path.join(buildDir, 'index.js');

if (fs.existsSync(outFile)) {
  console.log('expo-modules-core already patched');
  process.exit(0);
}

console.log('Building expo-modules-core...');
execSync(
  `npx esbuild "${path.join(pkgDir, 'src/index.ts')}" --bundle --platform=node --outfile="${outFile}" "--external:@expo/*" "--external:react-native"`,
  { stdio: 'inherit' },
);

const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
pkg.main = 'build/index.js';
fs.writeFileSync(pkgJson, JSON.stringify(pkg, null, 2) + '\n');

console.log('expo-modules-core patched successfully');
