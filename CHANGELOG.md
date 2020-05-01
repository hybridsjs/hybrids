# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.1.8](https://github.com/hybridsjs/hybrids/compare/v4.1.7...v4.1.8) (2020-05-01)


### Bug Fixes

* **cache:** deps should be always restored ([7f62207](https://github.com/hybridsjs/hybrids/commit/7f62207d67dc40bfc8c577613863faa4340b74aa))
* **html:** remove circular dependencies ([adda038](https://github.com/hybridsjs/hybrids/commit/adda0383e8c8f5f5c1979cb56e5d4ec7be5b847a))

### [4.1.7](https://github.com/hybridsjs/hybrids/compare/v4.1.6...v4.1.7) (2020-03-31)


### Bug Fixes

* **cache:** restore deep deps for observed keys ([ee85006](https://github.com/hybridsjs/hybrids/commit/ee85006725dab9c092ed262506bb739094553c77))

### [4.1.6](https://github.com/hybridsjs/hybrids/compare/v4.1.5...v4.1.6) (2020-03-05)


### Bug Fixes

* **node:** do not transpile es2015+ code for the node environment ([#100](https://github.com/hybridsjs/hybrids/issues/100)) ([047b6df](https://github.com/hybridsjs/hybrids/commit/047b6dfad3a6fcf09395a7a375cc070a101acc43))

### [4.1.5](https://github.com/hybridsjs/hybrids/compare/v4.1.3...v4.1.5) (2020-02-26)


### Bug Fixes

* **cache:** add guard for accessing entry contexts property ([#96](https://github.com/hybridsjs/hybrids/issues/96)) ([e6444b0](https://github.com/hybridsjs/hybrids/commit/e6444b04b66ce2c1e979e101f63ad29a31146f89))
* **cache:** ensure contexts are set in the observe setup ([df9a823](https://github.com/hybridsjs/hybrids/commit/df9a823cf63c7acc5ce22d485b0e6db85c99502d))
* **html:** broken property names in template with all whitespace characters ([#97](https://github.com/hybridsjs/hybrids/issues/97)) ([14c415f](https://github.com/hybridsjs/hybrids/commit/14c415fc882dd329b3be6c6670e4b60d8d601576))

### [4.1.4](https://github.com/hybridsjs/hybrids/compare/v4.1.3...v4.1.4) (2020-02-24)


### Bug Fixes

* **cache:** add guard for accessing entry contexts property ([#96](https://github.com/hybridsjs/hybrids/issues/96)) ([4b8a916](https://github.com/hybridsjs/hybrids/commit/4b8a9161bc9c6f2c20a025573ea67a7c7f5603eb))

### [4.1.3](https://github.com/hybridsjs/hybrids/compare/v4.1.2...v4.1.3) (2020-01-31)


### Bug Fixes

* **property:** correct attribute value for other than booleans ([49a9eb1](https://github.com/hybridsjs/hybrids/commit/49a9eb1947af98cd9213c96b06118149aac92391))

### [4.1.2](https://github.com/hybridsjs/hybrids/compare/v4.1.1...v4.1.2) (2020-01-28)


### Bug Fixes

* **cache:** optmize context clean up for observed property ([39baaa8](https://github.com/hybridsjs/hybrids/commit/39baaa8fb66ca769e0d50e2928595e59eacf8050))
* **html:** fix replacing event listener callback ([c64f4fd](https://github.com/hybridsjs/hybrids/commit/c64f4fddc3b2384e758f0c6dbc15928e7e2c3462))
* **types:** dispatch first argument ([fb76ece](https://github.com/hybridsjs/hybrids/commit/fb76ece2d87828a8df96383f43c6819b4927e38e))

### [4.1.1](https://github.com/hybridsjs/hybrids/compare/v4.1.0...v4.1.1) (2020-01-17)


### Bug Fixes

* **render:** allow update before schedule; render call should return target ([#87](https://github.com/hybridsjs/hybrids/issues/87)) ([905b7af](https://github.com/hybridsjs/hybrids/commit/905b7afaeb797b6b24e59dafd442f686a8304bd7))
* **types:** missing dispatch, minor template fixes, docs update ([de328c1](https://github.com/hybridsjs/hybrids/commit/de328c1356207372a13227e503134dbd3c41b4a4))

## [4.1.0](https://github.com/hybridsjs/hybrids/compare/v4.0.4...v4.1.0) (2020-01-14)


### Features

* TypeScript definitions ([e70f7d1](https://github.com/hybridsjs/hybrids/commit/e70f7d1dd4eb87c1b712d3fb96430dce700588d2))

### [4.0.4](https://github.com/hybridsjs/hybrids/compare/v4.0.3...v4.0.4) (2020-01-08)


### Bug Fixes

* **html:** properly walk parent nodes for ShadyDOM polyfill ([9e52b2f](https://github.com/hybridsjs/hybrids/commit/9e52b2f4373aeb4408a097cd63df4b0782862733))

### [4.0.3](https://github.com/hybridsjs/hybrids/compare/v4.0.2...v4.0.3) (2019-11-12)


### Bug Fixes

* **cache:** avoid memory leak in contexts for complex elements structure ([8dc72df](https://github.com/hybridsjs/hybrids/commit/8dc72df9cf8cf036385c2ea285a8df0c443ae5f9))
* **property:** fixing error message ([#54](https://github.com/hybridsjs/hybrids/issues/54)) ([92f7939](https://github.com/hybridsjs/hybrids/commit/92f7939204f36c911953c7140486d4c0a92fbf2c))

### [4.0.2](https://github.com/hybridsjs/hybrids/compare/v4.0.1...v4.0.2) (2019-06-05)


### Bug Fixes

* **html:** nested custom elements in template break indexing parts ([4c2ee3f](https://github.com/hybridsjs/hybrids/commit/4c2ee3f))



### [4.0.1](https://github.com/hybridsjs/hybrids/compare/v4.0.0...v4.0.1) (2019-06-04)


### Bug Fixes

* **define:** hmr in development mode only uses connect/disconnect callbacks ([d74685e](https://github.com/hybridsjs/hybrids/commit/d74685e))
* **html:** clear last arguments when template changes ([d117ba8](https://github.com/hybridsjs/hybrids/commit/d117ba8))



## [4.0.0](https://github.com/hybridsjs/hybrids/compare/v3.0.2...v4.0.0) (2019-05-29)


### Features

* **define:** change detection refactor ([#51](https://github.com/hybridsjs/hybrids/issues/51)) ([d8f7365](https://github.com/hybridsjs/hybrids/commit/d8f7365))
* **define:** exclude objects without descriptor methods from translation process ([0a3e279](https://github.com/hybridsjs/hybrids/commit/0a3e279))


### BREAKING CHANGES

* **define:** Change detection mechanism no longer dispatches `@invalidate` DOM event. For side effects use the `observe()` method from the property descriptor. Read more in descriptors section of the documentation.
* **define:** Objects without descriptor methods are no longer translated to property factory. You have to explicitly use `property({...})` as the descriptor value. However, translation for array instances works as before (it always translates them to property factory). Read more in translation section of the documentation.



### [3.0.2](https://github.com/hybridsjs/hybrids/compare/v3.0.1...v3.0.2) (2019-05-17)


### Bug Fixes

* **render:** minor performance refactor fixes ([85b7b46](https://github.com/hybridsjs/hybrids/commit/85b7b46))



### [3.0.1](https://github.com/hybridsjs/hybrids/compare/v3.0.0...v3.0.1) (2019-05-16)


### Bug Fixes

* **cache:** minor performance refactor ([c2c42f5](https://github.com/hybridsjs/hybrids/commit/c2c42f5))
* **html:** minor performance refactor ([07d0d28](https://github.com/hybridsjs/hybrids/commit/07d0d28))
* **render:** clear startTime fix & missing test ([c48711d](https://github.com/hybridsjs/hybrids/commit/c48711d))
* **render:** update sheduler refactor for performance boost ([0ed17e4](https://github.com/hybridsjs/hybrids/commit/0ed17e4))
* **utils:** memonize camelToDash result ([18fa15c](https://github.com/hybridsjs/hybrids/commit/18fa15c))



# [3.0.0](https://github.com/hybridsjs/hybrids/compare/v2.0.2...v3.0.0) (2019-05-09)


### Features

* **html:** set helper for event callbacks ([993c52b](https://github.com/hybridsjs/hybrids/commit/993c52b))
* **shim:** Remove `shim.js` in favor of @webcomponents/webcomponentsjs bundle ([8c9b89b](https://github.com/hybridsjs/hybrids/commit/8c9b89b))


### BREAKING CHANGES

* **shim:** `hybrids/shim` entry is no longer available. For older browsers support use `@webcomponents/webcomponentsjs` package.



## [2.0.2](https://github.com/hybridsjs/hybrids/compare/v2.0.1...v2.0.2) (2019-03-05)


### Bug Fixes

* **html:** clear array items cache when value changes ([f32fe1a](https://github.com/hybridsjs/hybrids/commit/f32fe1a))



## [2.0.1](https://github.com/hybridsjs/hybrids/compare/v2.0.0...v2.0.1) (2019-03-04)


### Bug Fixes

* **html:** allows property expressions inside of table elements ([92ce234](https://github.com/hybridsjs/hybrids/commit/92ce234))
* **test:** edge and ie broken test fixes for the newest shadydom version ([9cc7ad7](https://github.com/hybridsjs/hybrids/commit/9cc7ad7))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/hybridsjs/hybrids/compare/v1.5.0...v2.0.0) (2019-01-08)


### Bug Fixes

* **define:** Translate only objects without get, set and connect keys ([661dd32](https://github.com/hybridsjs/hybrids/commit/661dd32))
* **errors:** simpler error messages ([17b83e7](https://github.com/hybridsjs/hybrids/commit/17b83e7))
* **html:** add styles formatting and list separator ([3331ee7](https://github.com/hybridsjs/hybrids/commit/3331ee7))
* **utils:** Support acronyms in pascalToDash fn. ([85b7c17](https://github.com/hybridsjs/hybrids/commit/85b7c17))


### Features

* **html:** add style helper ([a3c552a](https://github.com/hybridsjs/hybrids/commit/a3c552a))
* process.env fallback object for browsers usage ([f840606](https://github.com/hybridsjs/hybrids/commit/f840606))


### BREAKING CHANGES

* **define:** Property as an object with `connect` key will not translate to `property(value)`.



<a name="1.5.0"></a>
# [1.5.0](https://github.com/hybridsjs/hybrids/compare/v1.4.2...v1.5.0) (2018-12-07)


### Bug Fixes

* **property:** remove unused default argument ([312664e](https://github.com/hybridsjs/hybrids/commit/312664e))


### Features

* **html:** template engine refactor ([50eb13d](https://github.com/hybridsjs/hybrids/commit/50eb13d))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/hybridsjs/hybrids/compare/v1.4.1...v1.4.2) (2018-11-01)


### Bug Fixes

* **utils:** use window object instead of global proposal ([#17](https://github.com/hybridsjs/hybrids/issues/17)) ([84d1942](https://github.com/hybridsjs/hybrids/commit/84d1942))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/hybridsjs/hybrids/compare/v1.4.0...v1.4.1) (2018-10-04)


### Bug Fixes

* **children:** trigger invalidate host if one of children changes ([33e9412](https://github.com/hybridsjs/hybrids/commit/33e9412))
* **define:** remove element class bridge thanks to babel v7 ([c0d6c9a](https://github.com/hybridsjs/hybrids/commit/c0d6c9a))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/hybridsjs/hybrids/compare/v1.3.1...v1.4.0) (2018-09-25)


### Features

* **render:** add options object for shadowRoot control ([#14](https://github.com/hybridsjs/hybrids/issues/14)) ([d56f028](https://github.com/hybridsjs/hybrids/commit/d56f028)), closes [#13](https://github.com/hybridsjs/hybrids/issues/13)



<a name="1.3.1"></a>
## [1.3.1](https://github.com/hybridsjs/hybrids/compare/v1.3.0...v1.3.1) (2018-08-29)


### Bug Fixes

* **cache:** ensure calculation of deep dependency state ([0f96ced](https://github.com/hybridsjs/hybrids/commit/0f96ced))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/hybridsjs/hybrids/compare/v1.2.1...v1.3.0) (2018-08-28)


### Bug Fixes

* **cache:** stringify target with tag name in error messages ([7b3752a](https://github.com/hybridsjs/hybrids/commit/7b3752a))
* **cache:** update cache only when value getter changes ([990f00d](https://github.com/hybridsjs/hybrids/commit/990f00d))
* **html:** upfront remove unused parts when update array expression ([aa6c8de](https://github.com/hybridsjs/hybrids/commit/aa6c8de))


### Features

* **define:** define with two modes for support of a map of elements ([12984a0](https://github.com/hybridsjs/hybrids/commit/12984a0))
* **html:** throws for missing element defintions in dev environment ([4067ff5](https://github.com/hybridsjs/hybrids/commit/4067ff5))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/hybridsjs/hybrids/compare/v1.2.0...v1.2.1) (2018-08-13)


### Bug Fixes

* **hmr:** sync render and html define helper for better HMR support ([66250d4](https://github.com/hybridsjs/hybrids/commit/66250d4))
* **html:** consistent order of attribute expressions during compilation ([d391839](https://github.com/hybridsjs/hybrids/commit/d391839))
* **parent:** call check function only if hybrids are defined ([b6527aa](https://github.com/hybridsjs/hybrids/commit/b6527aa))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/hybridsjs/hybrids/compare/v1.1.4...v1.2.0) (2018-07-18)


### Bug Fixes

* **html:** svg element expressions always set attribute value ([6000823](https://github.com/hybridsjs/hybrids/commit/6000823))


### Features

* **children:** function as an argument for complex conditions ([5583f01](https://github.com/hybridsjs/hybrids/commit/5583f01))
* **parent:** function as an argument for complex conditions ([bd942f4](https://github.com/hybridsjs/hybrids/commit/bd942f4))



<a name="1.1.4"></a>
## [1.1.4](https://github.com/hybridsjs/hybrids/compare/v1.1.3...v1.1.4) (2018-06-12)


### Bug Fixes

* **define:** translate to render factory only if render key is a function ([120a5ae](https://github.com/hybridsjs/hybrids/commit/120a5ae))
* **html:** allow non-unique keys for array items with efficient re-order ([db2f9aa](https://github.com/hybridsjs/hybrids/commit/db2f9aa))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/hybridsjs/hybrids/compare/v1.1.2...v1.1.3) (2018-06-07)


### Bug Fixes

* **html:** ensure unique template id, exclude comments walking nodes ([609c884](https://github.com/hybridsjs/hybrids/commit/609c884))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/hybridsjs/hybrids/compare/v1.1.1...v1.1.2) (2018-06-06)


### Bug Fixes

* **cache:** prevent multiple get call after invalidate ([c193107](https://github.com/hybridsjs/hybrids/commit/c193107))
* **html:** Support for external custom elements with shadow dom set in constructor ([fd16d8a](https://github.com/hybridsjs/hybrids/commit/fd16d8a))
* **property:** freeze only not null object values for IE11 support ([cd378f7](https://github.com/hybridsjs/hybrids/commit/cd378f7))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/hybridsjs/hybrids/compare/v1.1.0...v1.1.1) (2018-05-30)


### Bug Fixes

* **cache:** invalidate should increase state for related values ([a9f29ea](https://github.com/hybridsjs/hybrids/commit/a9f29ea))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/hybridsjs/hybrids/compare/v1.0.4...v1.1.0) (2018-05-26)


### Bug Fixes

* **children:** dynamic added child should properly re-render element ([74a1009](https://github.com/hybridsjs/hybrids/commit/74a1009))


### Features

* **dispatch:** return host.dispatchEvent() result ([#4](https://github.com/hybridsjs/hybrids/issues/4)) ([474dc10](https://github.com/hybridsjs/hybrids/commit/474dc10))
* **shim:** include required web api polyfills for IE11 directly in shim ([89f2d60](https://github.com/hybridsjs/hybrids/commit/89f2d60))



<a name="1.0.4"></a>
## [1.0.4](https://github.com/hybridsjs/hybrids/compare/v1.0.3...v1.0.4) (2018-05-24)


### Bug Fixes

* **deps:** Use npm version of shims to support StackBlitz ([9899247](https://github.com/hybridsjs/hybrids/commit/9899247))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/hybridsjs/hybrids/compare/v1.0.2...v1.0.3) (2018-05-24)


### Bug Fixes

* **children:** defer children invalidation to not cache value too early ([5d4d72f](https://github.com/hybridsjs/hybrids/commit/5d4d72f))
* **render:** ShadyDOM slotted elements invalidation event dispatch ([9af285c](https://github.com/hybridsjs/hybrids/commit/9af285c))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/hybridsjs/hybrids/compare/v1.0.1...v1.0.2) (2018-05-22)


### Bug Fixes

* **cache:** clear previous value only if flag is set ([856e5c8](https://github.com/hybridsjs/hybrids/commit/856e5c8))
* **css:** use ShadyCSS api to support css custom properties in IE11 ([b2062c8](https://github.com/hybridsjs/hybrids/commit/b2062c8))
* **html:** expressions in table family elements ([87f7a55](https://github.com/hybridsjs/hybrids/commit/87f7a55))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/hybridsjs/hybrids/compare/v1.0.0...v1.0.1) (2018-05-18)


### Bug Fixes

* **hmr:** catch render errors and clear state for module replacement ([#3](https://github.com/hybridsjs/hybrids/issues/3)) ([168340c](https://github.com/hybridsjs/hybrids/commit/168340c))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/hybridsjs/hybrids/compare/v0.10.0...v1.0.0) (2018-05-14)
