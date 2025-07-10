# @journeyapps/pdf-reports

## 3.0.0

### Major Changes

- 3d02e75: Removed dependency on `node-fetch` and bumped `node` version to 22 to match CloudCode `1.15`. The package now makes use of the native `fetch` implementation of node (Introduced in node 18, stable in node 21) and as such may not be compatible with CloudCode versions < 1.15
