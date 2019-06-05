# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
