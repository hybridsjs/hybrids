# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [8.2.23](https://github.com/hybridsjs/hybrids/compare/v8.2.22...v8.2.23) (2024-05-06)


### Bug Fixes

* **cli:** extract placeholder index in ternary operator ([3d514d4](https://github.com/hybridsjs/hybrids/commit/3d514d4de03d0f0c95ef6e1868227b07d3b090f8))
* **store:** store pointer for model placeholder ([4d42296](https://github.com/hybridsjs/hybrids/commit/4d42296196723d62a7e17662b951ec8d4f5da529))

### [8.2.22](https://github.com/hybridsjs/hybrids/compare/v8.2.21...v8.2.22) (2024-04-23)

### [8.2.21](https://github.com/hybridsjs/hybrids/compare/v8.2.20...v8.2.21) (2024-04-19)


### Bug Fixes

* **define:** Nullish value resolves to empty string ([9932b99](https://github.com/hybridsjs/hybrids/commit/9932b99ad8aa626c18fed71e95d9585c4c0bc248))
* **store:** Error message for type error in storage set method ([dbff629](https://github.com/hybridsjs/hybrids/commit/dbff62902451681c6d5e7cf14d2181df9f2e473f))
* **store:** Memory-based storage returns `null` for non-existing instance ([d224450](https://github.com/hybridsjs/hybrids/commit/d224450315089f477ca9ad83f6c888c852516e44))

### [8.2.20](https://github.com/hybridsjs/hybrids/compare/v8.2.19...v8.2.20) (2024-04-16)


### Bug Fixes

* **define:** value reflects attribute in observe callback ([07b9334](https://github.com/hybridsjs/hybrids/commit/07b93340a0a02dbed28349e13c3d1b33476205bd))
* **html:** add fallback for camel-cased property name ([bdd8716](https://github.com/hybridsjs/hybrids/commit/bdd8716951d6ba64fe7b27e78ab769a8c3fa4908))
* **perf:** optimize loops in definition and template engine ([4bf7e86](https://github.com/hybridsjs/hybrids/commit/4bf7e866f2e9ab4ababe3da2b3807e3f957a2e15))

### [8.2.19](https://github.com/hybridsjs/hybrids/compare/v8.2.18...v8.2.19) (2024-04-15)


### Bug Fixes

* **store:** pass through record id as it is ([a5d9165](https://github.com/hybridsjs/hybrids/commit/a5d9165285351975aed8da446e1134fefb743c2b))
* **store:** stringify id of list model items ([11f7625](https://github.com/hybridsjs/hybrids/commit/11f7625dd8fd91188f48d3dfc45ed6f58033af33))

### [8.2.18](https://github.com/hybridsjs/hybrids/compare/v8.2.17...v8.2.18) (2024-04-10)


### Bug Fixes

* **store:** Pass id directly to the store.get method without type change ([da30368](https://github.com/hybridsjs/hybrids/commit/da30368fc35192b2393c522ca4acb5fe1efe9f46))

### [8.2.17](https://github.com/hybridsjs/hybrids/compare/v8.2.16...v8.2.17) (2024-04-09)


### Bug Fixes

* **cache:** move initial value from attribute to the element constructor ([4e111dd](https://github.com/hybridsjs/hybrids/commit/4e111dd2d511b70f7a11d53b0ba0f049a5e9d7c6))
* **types:** ModelValue may be listing ([#250](https://github.com/hybridsjs/hybrids/issues/250)) ([f24627f](https://github.com/hybridsjs/hybrids/commit/f24627ff3dbc4353f42282fa5274653a40f15290))

### [8.2.16](https://github.com/hybridsjs/hybrids/compare/v8.2.15...v8.2.16) (2024-04-05)


### Bug Fixes

* **router:** navigate when browser triggers the popstate event ([eaa1bc6](https://github.com/hybridsjs/hybrids/commit/eaa1bc6b155648665170e186ce4885425e1b209e))

### [8.2.15](https://github.com/hybridsjs/hybrids/compare/v8.2.14...v8.2.15) (2024-04-03)


### Bug Fixes

* **router:** multiple dialogs navigation minor fixes ([b792c0f](https://github.com/hybridsjs/hybrids/commit/b792c0fe521d3ee910106cf7edde9040fa144f23))
* **router:** prevent loop of focus events on multiple dialogs ([b78e7c4](https://github.com/hybridsjs/hybrids/commit/b78e7c40cba6517298ef8a61c6b1b59aa133666e))
* **store:** clear model with loose set to `true` ([dda4f91](https://github.com/hybridsjs/hybrids/commit/dda4f91b5ef263c7dcfd0005f6e0d9c70f899901))
* **types:** Strict store types ([#246](https://github.com/hybridsjs/hybrids/issues/246)) ([9aba4be](https://github.com/hybridsjs/hybrids/commit/9aba4befb184c530e5536934b03b0ca07e6ce974))

### [8.2.14](https://github.com/hybridsjs/hybrids/compare/v8.2.13...v8.2.14) (2024-03-21)


### Bug Fixes

* **types:** id result function should be a ModelIdentifier ([32afb12](https://github.com/hybridsjs/hybrids/commit/32afb124d117cd6d1e44b16a034079b63e8c0c68))

### [8.2.13](https://github.com/hybridsjs/hybrids/compare/v8.2.12...v8.2.13) (2024-03-21)


### Bug Fixes

* **store:** store factory function id should be always a string value ([faec4c6](https://github.com/hybridsjs/hybrids/commit/faec4c67cc255b60a705cd86c2ed8ef0f4703e3b))
* **store:** store factory with overloaded definitions ([3a90d6b](https://github.com/hybridsjs/hybrids/commit/3a90d6b52aa22d82a12a7954d256f910a5f5db39))
* **types:** Add missing array indicator to result of the children factory function ([f29902f](https://github.com/hybridsjs/hybrids/commit/f29902f042995f1aa76f9d7cc5cf28e9e4a915a1))
* **types:** Add missing result `undefined` type to store factory when `id` option is used ([daac11f](https://github.com/hybridsjs/hybrids/commit/daac11fd1e7ccdcc5b931abb6b5caf171805eff8))
* **types:** Update generic of type `Model<M>` ([#243](https://github.com/hybridsjs/hybrids/issues/243)) ([7d5cf8f](https://github.com/hybridsjs/hybrids/commit/7d5cf8ff7218dc733f7ecd1e7acb6dd0f0fbc1ee))

### [8.2.12](https://github.com/hybridsjs/hybrids/compare/v8.2.11...v8.2.12) (2024-03-20)


### Bug Fixes

* **store:** resolve number 0 to correct model identifier ([bbf280b](https://github.com/hybridsjs/hybrids/commit/bbf280b788061f43467a63c923aa48d555f17771))

### [8.2.11](https://github.com/hybridsjs/hybrids/compare/v8.2.10...v8.2.11) (2024-03-08)


### Bug Fixes

* **store:** resolve to the current state of singleton model for draft mode ([64b4474](https://github.com/hybridsjs/hybrids/commit/64b44747ca0385d633363c59bc6fe6283eec69a9))

### [8.2.10](https://github.com/hybridsjs/hybrids/compare/v8.2.9...v8.2.10) (2024-01-10)


### Bug Fixes

* **cache:** Clear deps and context when get value from cache ([#230](https://github.com/hybridsjs/hybrids/issues/230)) ([ec6f8b1](https://github.com/hybridsjs/hybrids/commit/ec6f8b1379dc71031805a2e3046691b0cd7f43d5))

### [8.2.9](https://github.com/hybridsjs/hybrids/compare/v8.2.8...v8.2.9) (2023-12-19)


### Bug Fixes

* **router:** add view to the stack of all parents ([f0cbe51](https://github.com/hybridsjs/hybrids/commit/f0cbe51a9d0d919f68ef30d365981292aaf58f51))

### [8.2.8](https://github.com/hybridsjs/hybrids/compare/v8.2.7...v8.2.8) (2023-12-07)


### Bug Fixes

* **cache:** clean up not reachable removal of deps ([c1cb4f7](https://github.com/hybridsjs/hybrids/commit/c1cb4f7075a1dfe421bd161f89b7e5b8f0c52219))
* **store:** Use id from the current draft when id is falsy ([a52bf00](https://github.com/hybridsjs/hybrids/commit/a52bf0083984ead69c64b828420ec247116a4e5f))

### [8.2.7](https://github.com/hybridsjs/hybrids/compare/v8.2.6...v8.2.7) (2023-12-04)


### Bug Fixes

* **store:** unique instance of the draft without an id for each component ([#222](https://github.com/hybridsjs/hybrids/issues/222)) ([a06a266](https://github.com/hybridsjs/hybrids/commit/a06a266f55adc61e3cc27c1aa58f23da3111a10e))

### [8.2.6](https://github.com/hybridsjs/hybrids/compare/v8.2.5...v8.2.6) (2023-11-28)


### Bug Fixes

* **html:** add support for multiple class names as string ([a6f52ba](https://github.com/hybridsjs/hybrids/commit/a6f52baf96a57adbaaf5679e71b9afadd4507fa9))

### [8.2.5](https://github.com/hybridsjs/hybrids/compare/v8.2.4...v8.2.5) (2023-10-16)


### Bug Fixes

* **cache:** use array instance instead of set iterator ([c06c178](https://github.com/hybridsjs/hybrids/commit/c06c178539c5b3e280acabb1be6030f2f0b75062))
* **store:** add id to listing type placeholder ([cc0c9d9](https://github.com/hybridsjs/hybrids/commit/cc0c9d9963a50905343c2fb615804ee9a32df594))

### [8.2.4](https://github.com/hybridsjs/hybrids/compare/v8.2.3...v8.2.4) (2023-09-15)


### Bug Fixes

* **layout:** make zero specificity for root styles with shadowRoot ([16d7b2d](https://github.com/hybridsjs/hybrids/commit/16d7b2d2afe02f4f72ad0e018c138b9c9664480f))

### [8.2.3](https://github.com/hybridsjs/hybrids/compare/v8.2.2...v8.2.3) (2023-09-13)


### Bug Fixes

* **html:** table elements with attribute expressions ([#212](https://github.com/hybridsjs/hybrids/issues/212)) ([ed333a5](https://github.com/hybridsjs/hybrids/commit/ed333a5ffe7e5241fc36a2725e488ff2d20ae277))
* **store:** Return instead of throw when clear unused model definition ([1e4be86](https://github.com/hybridsjs/hybrids/commit/1e4be8667d86933c79d70990220966263390535b))

### [8.2.2](https://github.com/hybridsjs/hybrids/compare/v8.2.1...v8.2.2) (2023-07-11)


### Bug Fixes

* **store:** add test for clear case & update docs ([d1fd7f1](https://github.com/hybridsjs/hybrids/commit/d1fd7f14891c375ab873c3909861102007598da2))
* **store:** Unavailable localStorage for offline caching ([8287593](https://github.com/hybridsjs/hybrids/commit/82875933ac15c3cd61ac616a17e78a3283741384))
* **store:** use GC for `store.clear()` when clearValue is set ([b7aea14](https://github.com/hybridsjs/hybrids/commit/b7aea14f0f752b24d7fcc7b8cd1ac220cc62b893))

### [8.2.1](https://github.com/hybridsjs/hybrids/compare/v8.2.0...v8.2.1) (2023-06-14)


### Bug Fixes

* **define:** minor performance refactoring ([53464b1](https://github.com/hybridsjs/hybrids/commit/53464b11d2ba9148dde8278c2d933e3cddb4ee1c))
* replace global helper with `globalThis` ([3976121](https://github.com/hybridsjs/hybrids/commit/39761213c1e693868bab4939784a92ce01367a5c))
* **types:** update package.json exports to include types ([#208](https://github.com/hybridsjs/hybrids/issues/208)) ([d9afc8b](https://github.com/hybridsjs/hybrids/commit/d9afc8b5e51513053d03c13b630f63ce7e2e0dd8))

## [8.2.0](https://github.com/hybridsjs/hybrids/compare/v8.1.15...v8.2.0) (2023-05-18)


### Features

* **html:** Add support for Transition API and `use` helper method ([8cb25c3](https://github.com/hybridsjs/hybrids/commit/8cb25c35b946ceb8bd7893de98903bee6362a467))
* **layout:** Layout engine as a stable feature ([e55756b](https://github.com/hybridsjs/hybrids/commit/e55756bf926871f1d46a28145dd109cec783aeb3))
* **mount:** Mount component definition to existing DOM element ([3dc58ab](https://github.com/hybridsjs/hybrids/commit/3dc58abd621c6f9bd860d4418bf5a9b586b7d553))
* **router:** Add transition option ([a04c32e](https://github.com/hybridsjs/hybrids/commit/a04c32e26ec3bf7f83e721045e85948cdcc559cd))


### Bug Fixes

* **cache:** run observe callback synchronously on startup ([f34fca8](https://github.com/hybridsjs/hybrids/commit/f34fca815254b5068fe28b40ad81f8aac7eda62c))
* **cli:** extract - better path support in description ([ea49577](https://github.com/hybridsjs/hybrids/commit/ea49577f3a1792a98e2e75067cf2b0667df5edbf))
* **define:** Reflect back primitive values for value defined as undefined ([333d989](https://github.com/hybridsjs/hybrids/commit/333d989d3107a0a6257c0a6d0b3ba21a9b030e4b))
* **html:** prevent setup styles for template update ([8439def](https://github.com/hybridsjs/hybrids/commit/8439def9dee147f00490375a114c59bfe8ced7b6))
* **layout:** add generic values special rule ([8ce6326](https://github.com/hybridsjs/hybrids/commit/8ce6326c67e5b45f58db753ee0dfd990e11a431d))
* **layout:** use layout engine only if attribute is present ([a366878](https://github.com/hybridsjs/hybrids/commit/a366878e45412855a721dd8e7fa1bbaf9c3f68d7))

### [8.1.15](https://github.com/hybridsjs/hybrids/compare/v8.1.14...v8.1.15) (2023-04-13)


### Bug Fixes

* **html:** refactor styles injection in adoptedStyleSheets ([04d1fa9](https://github.com/hybridsjs/hybrids/commit/04d1fa96aff31e13fa57175d4b5c80e2cc8f7179))

### [8.1.14](https://github.com/hybridsjs/hybrids/compare/v8.1.13...v8.1.14) (2023-03-10)


### Bug Fixes

* **layout:** insert rules before  hidden selector ([8173d42](https://github.com/hybridsjs/hybrids/commit/8173d4249d870efc9fc466982bc9b8c2c8a09020))

### [8.1.13](https://github.com/hybridsjs/hybrids/compare/v8.1.12...v8.1.13) (2023-01-16)


### Bug Fixes

* **router:** better support for restoring scroll position on iOS ([8c50fba](https://github.com/hybridsjs/hybrids/commit/8c50fba2f6025c8f1cad40373a707c5a9cafadc1))

### [8.1.12](https://github.com/hybridsjs/hybrids/compare/v8.1.11...v8.1.12) (2022-12-23)


### Bug Fixes

* **layout:** layout flag in html.resolve() helper method ([77d990d](https://github.com/hybridsjs/hybrids/commit/77d990dd1266045533941d68ba66f57717adecac))
* **layout:** set lowest specificity for content templates ([3ef6311](https://github.com/hybridsjs/hybrids/commit/3ef6311b8c1fcd6c5ff8863a4c0d7797a9ca2236))

### [8.1.11](https://github.com/hybridsjs/hybrids/compare/v8.1.10...v8.1.11) (2022-12-20)


### Features

* **define:** define.from() method for bundlers ([8239bc0](https://github.com/hybridsjs/hybrids/commit/8239bc06db01717519fa95b1623bc124aa50b6e0))


### Bug Fixes

* **html:** clear out duplicated helper methods from svg namespace ([a980819](https://github.com/hybridsjs/hybrids/commit/a9808197338492eb9320e71c560983a93c492788))
* **layout:** move box-sizing to the size rules ([9e8b7ae](https://github.com/hybridsjs/hybrids/commit/9e8b7aec6c35f6d96564f7574f7070e69895069f))

### [8.1.10](https://github.com/hybridsjs/hybrids/compare/v8.1.9...v8.1.10) (2022-12-07)


### Bug Fixes

* **layout:** Add padding rule with box-sizing for display types ([9b31b87](https://github.com/hybridsjs/hybrids/commit/9b31b87b50633b5db91424a11da7694f74fe0dd2))
* **layout:** support for multiline attribute value ([a88f101](https://github.com/hybridsjs/hybrids/commit/a88f1011ba7489d452bd1af121c59c531e033e84))
* **router:** delay restore focus when navigate (safari) ([d6ba541](https://github.com/hybridsjs/hybrids/commit/d6ba5419aab3a4d4b00951e355faf6f3acc67cf1))

### [8.1.9](https://github.com/hybridsjs/hybrids/compare/v8.1.8...v8.1.9) (2022-11-17)


### Bug Fixes

* **cache:** setting circular dep of the context should not trigger dispatch ([#203](https://github.com/hybridsjs/hybrids/issues/203)) ([33f4a6c](https://github.com/hybridsjs/hybrids/commit/33f4a6c19266ecddaf94fbd027733c0c0b003721))
* **define:** run observe method after all connect callbacks ([f8c7b0b](https://github.com/hybridsjs/hybrids/commit/f8c7b0b7c75a8af3500aec45bdc31b9e0043e943))
* **html:** more strict table mode for template signature ([631c164](https://github.com/hybridsjs/hybrids/commit/631c16487f7a426080e4dc981f83fe193073f1dc))
* **layout:** update flexbox defaults for overflow scroll ([80350a9](https://github.com/hybridsjs/hybrids/commit/80350a978f484619b67ae487c0759d3217c4e33a))
* **localize:** Whitespace for the key should match cli tool ([a4c5889](https://github.com/hybridsjs/hybrids/commit/a4c588919c61f187970123a62fbad2e5ae9bd855))

### [8.1.8](https://github.com/hybridsjs/hybrids/compare/v8.1.7...v8.1.8) (2022-11-16)


### Bug Fixes

* **html:** correct signature creation for form family elements ([#201](https://github.com/hybridsjs/hybrids/issues/201)) ([3767f60](https://github.com/hybridsjs/hybrids/commit/3767f60d5f7185ca4f833082711b445c6d6abe88))

### [8.1.7](https://github.com/hybridsjs/hybrids/compare/v8.1.6...v8.1.7) (2022-11-10)


### Bug Fixes

* **layout:** support contents display type ([a7dba08](https://github.com/hybridsjs/hybrids/commit/a7dba08642789fc1858bc6d07003f5afd73e1247))
* **layout:** use layout engine in nested templates in array items ([67f3a76](https://github.com/hybridsjs/hybrids/commit/67f3a76ae601b9e75c9cf75ea7ee42303679e751))

### [8.1.6](https://github.com/hybridsjs/hybrids/compare/v8.1.5...v8.1.6) (2022-10-31)


### Bug Fixes

* **cache:** remove suspend feature ([30ac94e](https://github.com/hybridsjs/hybrids/commit/30ac94e91b9c2c9fb6276320d83e0d344c77ae0b))
* **define:** defer connect & disconnect callbacks ([cd964a5](https://github.com/hybridsjs/hybrids/commit/cd964a5374e757c7f00af900b9ff33f87b5e81ef))
* refactor forEach to for-of  in core sources ([c2e71c0](https://github.com/hybridsjs/hybrids/commit/c2e71c0708b27de2966f111224ae520175167f97))
* refactor reduce to for-of in core sources ([7918737](https://github.com/hybridsjs/hybrids/commit/7918737a73365ec7b5551e57b9ccc7db016caa2c))
* **router:** clean up dev code ([e16e35f](https://github.com/hybridsjs/hybrids/commit/e16e35fce8caf0e87a54c74a8c7dc15e094897df))
* **router:** clear history state when root router disconnects ([2f73e81](https://github.com/hybridsjs/hybrids/commit/2f73e81f8c43411b16f2e5cd5fa0326cc61e0856))
* **store:** listing model stringifies to its id ([82da9a1](https://github.com/hybridsjs/hybrids/commit/82da9a113b5238762a1cd5255d939c053c08979a))
* **store:** prototype should not contain enumerable properties ([8b16963](https://github.com/hybridsjs/hybrids/commit/8b1696328fd39371bd88983ce2fbe817f18d618b))

### [8.1.5](https://github.com/hybridsjs/hybrids/compare/v8.1.4...v8.1.5) (2022-09-27)


### Bug Fixes

* **layout:** support negative dimensions ([6b6c01c](https://github.com/hybridsjs/hybrids/commit/6b6c01c739e2c74ad9de2c6f7f3f8dfe65ef815a))
* **router:** focus trap and scroll clearing for dialogs ([db8a80a](https://github.com/hybridsjs/hybrids/commit/db8a80a8dd373be983a94d308b34ea9c5bf1ec07))

### [8.1.4](https://github.com/hybridsjs/hybrids/compare/v8.1.3...v8.1.4) (2022-09-21)


### Bug Fixes

* **layout:** inset rule with an argument ([43d922f](https://github.com/hybridsjs/hybrids/commit/43d922fa0a6efe25e8ec75a46664a8e417d4fb5b))
* **layout:** use textContent for style element fallback ([e915942](https://github.com/hybridsjs/hybrids/commit/e9159423f73dfbc1a5d46affb3b368223ce6c2b0))
* **store:** offline list model should contain id ([d1201ef](https://github.com/hybridsjs/hybrids/commit/d1201ef40253225d34d5109b92195379858a1b0d))

### [8.1.3](https://github.com/hybridsjs/hybrids/compare/v8.1.2...v8.1.3) (2022-09-16)


### Bug Fixes

* **store:** empty nested array with primitive values ([8df84d2](https://github.com/hybridsjs/hybrids/commit/8df84d215e1d680342796bb075ef406bfffbd9ee))
* **store:** resolve with support for using model definition ([95aa812](https://github.com/hybridsjs/hybrids/commit/95aa812b80f6c90fa14c5a4f0017b30fd37bbd3e))

### [8.1.2](https://github.com/hybridsjs/hybrids/compare/v8.1.1...v8.1.2) (2022-09-14)


### Bug Fixes

* **router:** clear state params if they equal defaults ([2bc0ed4](https://github.com/hybridsjs/hybrids/commit/2bc0ed4820959ccbf795a72c5762fae19d143639))
* **store:** factory for listing model without id should return a list ([1b168aa](https://github.com/hybridsjs/hybrids/commit/1b168aa5eaf1ff33d04fae7894f1fa87996d3a4f))

### [8.1.1](https://github.com/hybridsjs/hybrids/compare/v8.1.0...v8.1.1) (2022-08-26)


### Bug Fixes

* **layout:** add combined size rule for width and height ([43ec3b3](https://github.com/hybridsjs/hybrids/commit/43ec3b36bf3abd9dc15bc5993e7211f13673472a))
* **layout:** remove `flex-shrink` from flexbox main rules ([2efe206](https://github.com/hybridsjs/hybrids/commit/2efe206c5d75a0adf148301b98bf0b5c40aefa26))

## [8.1.0](https://github.com/hybridsjs/hybrids/compare/v8.0.10...v8.1.0) (2022-08-26)


### Features

* **layout:** Add support for layout engine ([#194](https://github.com/hybridsjs/hybrids/issues/194)) ([fe6e424](https://github.com/hybridsjs/hybrids/commit/fe6e424a63a036593ba4f8a35a1c7429fc350ba4))


### Bug Fixes

* **store:** clear nested internal object by null value ([1310f47](https://github.com/hybridsjs/hybrids/commit/1310f47dc99f18f75171c08cd924ec8948edead7))
* **store:** improved error message for value with validation ([3ce6da9](https://github.com/hybridsjs/hybrids/commit/3ce6da9d00d61849e82f88845520ac4cbbbf942f))

### [8.0.10](https://github.com/hybridsjs/hybrids/compare/v8.0.9...v8.0.10) (2022-07-15)


### Bug Fixes

* **html:** apend style element in nested templates ([f8135f6](https://github.com/hybridsjs/hybrids/commit/f8135f6001a72ee4f1ae03c2a4b4bfff67f9865b))
* **localize:** clean up whitespace inside of the text ([84ef932](https://github.com/hybridsjs/hybrids/commit/84ef932bd13d07b997c0b6bab574ffd2019c139a))
* **localize:** detect is localize enabled, reordered expressions in message ([7b5db37](https://github.com/hybridsjs/hybrids/commit/7b5db372ee999faafab9e8f9eb8c63436c0fc963))
* **localize:** simplify exclude strings regexp ([eb39de8](https://github.com/hybridsjs/hybrids/commit/eb39de826929f43ed4ed0260672384887a3de4fe))

### [8.0.9](https://github.com/hybridsjs/hybrids/compare/v8.0.8...v8.0.9) (2022-07-08)


### Bug Fixes

* **html:** remove styles from templates ids with better caching ([c252636](https://github.com/hybridsjs/hybrids/commit/c2526364062de7d5821d1d2154157e0e70c4061b))
* **store:** get singleton model before update to not overwrite properties with default values ([2844e91](https://github.com/hybridsjs/hybrids/commit/2844e9108db27c5837db7e3464bbe6a0c15d2bce))

### [8.0.8](https://github.com/hybridsjs/hybrids/compare/v8.0.7...v8.0.8) (2022-06-30)


### Bug Fixes

* **router:** navigate back state offset related to history method ([6806e44](https://github.com/hybridsjs/hybrids/commit/6806e44e99505446f6a25622bc32ac6267dd7adc))

### [8.0.7](https://github.com/hybridsjs/hybrids/compare/v8.0.6...v8.0.7) (2022-06-28)


### Bug Fixes

* **localize:** expressions in msg html and svg methods ([1dbc279](https://github.com/hybridsjs/hybrids/commit/1dbc2796fb78fbe33cb5b66ba456e47c5e428a65))

### [8.0.6](https://github.com/hybridsjs/hybrids/compare/v8.0.5...v8.0.6) (2022-06-27)


### Bug Fixes

* **router:** prevent using unstable `history.state` when navigate back ([a2cb3a9](https://github.com/hybridsjs/hybrids/commit/a2cb3a908d8b0732619d07954751defb16a386f3))

### [8.0.5](https://github.com/hybridsjs/hybrids/compare/v8.0.4...v8.0.5) (2022-06-20)


### Bug Fixes

* **router:** support parameter in first part of the URL ([7a86cbc](https://github.com/hybridsjs/hybrids/commit/7a86cbcb8ce27f9378209cf8e87b5548e5020400))
* **store:** add client-side validation for boolean values ([e473689](https://github.com/hybridsjs/hybrids/commit/e473689c3b263fc9939c324bbe4c048cc5312574))
* **store:** prevent iterating over the previous model props ([f5a5673](https://github.com/hybridsjs/hybrids/commit/f5a567338ab6eadbf69d5e5e94329afff2b158b4))

### [8.0.4](https://github.com/hybridsjs/hybrids/compare/v8.0.3...v8.0.4) (2022-05-16)


### Bug Fixes

* **cli:** add espace character for chrome.i18n message ([81431dd](https://github.com/hybridsjs/hybrids/commit/81431ddf2527aa6e6815508f309fc9bcb999ab33))

### [8.0.3](https://github.com/hybridsjs/hybrids/compare/v8.0.2...v8.0.3) (2022-05-06)


### Bug Fixes

* **cli:** follow the symlinks in extractor command ([12b6201](https://github.com/hybridsjs/hybrids/commit/12b62011367c4afb46b37c22db9cb544f6fad5aa))
* **localize:** add options to support chrome.i18n custom translate function ([7127c9d](https://github.com/hybridsjs/hybrids/commit/7127c9dc356d60ce133eca74c000acaec37aca31))
* **localize:** support service workers context ([6a9e890](https://github.com/hybridsjs/hybrids/commit/6a9e890676b68a35636052c2470a98a456678f72))

### [8.0.2](https://github.com/hybridsjs/hybrids/compare/v8.0.1...v8.0.2) (2022-05-06)


### Bug Fixes

* **types:** Allow setting property as undefined for complex types ([b7dd680](https://github.com/hybridsjs/hybrids/commit/b7dd6805679e5a54185a1d10bac667b3d31adc94))

### [8.0.1](https://github.com/hybridsjs/hybrids/compare/v8.0.0...v8.0.1) (2022-05-04)


### Bug Fixes

* **cli:** multiline comments and regexp skip reorder ([08d3412](https://github.com/hybridsjs/hybrids/commit/08d3412b7c187298501df606b00064401e7fbc10))
* **localize:** remove circural dependncies in files ([3d7353a](https://github.com/hybridsjs/hybrids/commit/3d7353aed52d8c520e1fc4998a5155cc66e5b54d))

## [8.0.0](https://github.com/hybridsjs/hybrids/compare/v7.1.0...v8.0.0) (2022-04-28)


### ⚠ BREAKING CHANGES

* **html:** Legacy Edge and other browsers which does not support Shadow DOM are no longer supported

### Features

* **localize:** Add support for localization process ([828e3c9](https://github.com/hybridsjs/hybrids/commit/828e3c989e4c7acefedb3a79f6ccf839124a25f5))


### Bug Fixes

* **html:** Drop support for the Shadow DOM polyfill ([961922b](https://github.com/hybridsjs/hybrids/commit/961922b1ca6f08cd87e2b6c8801a8aa45f71a4e5))

## [7.1.0](https://github.com/hybridsjs/hybrids/compare/v7.0.6...v7.1.0) (2022-04-19)


### Features

* **store:** observe callback for calling side-effect ([a925d30](https://github.com/hybridsjs/hybrids/commit/a925d30ee56478fe3d2fbefa4aba6344a719ceda))

### [7.0.6](https://github.com/hybridsjs/hybrids/compare/v7.0.5...v7.0.6) (2022-04-15)


### Bug Fixes

* **parent/child:** Add host argument to parent and child factories. ([#188](https://github.com/hybridsjs/hybrids/issues/188)) ([3d0dc3a](https://github.com/hybridsjs/hybrids/commit/3d0dc3ac23b49a5b7936580a06e69acf1f39c2f8))
* **store:** clear should invalidate models with cache set to true ([55ca7fa](https://github.com/hybridsjs/hybrids/commit/55ca7fa0283d6f33f6057008085852547646605f))

### [7.0.5](https://github.com/hybridsjs/hybrids/compare/v7.0.4...v7.0.5) (2022-02-03)


### Bug Fixes

* **store:** support using store in service workers ([a23bfd9](https://github.com/hybridsjs/hybrids/commit/a23bfd907ca6297f26d7658b421bfaed10cabe85))

### [7.0.4](https://github.com/hybridsjs/hybrids/compare/v7.0.3...v7.0.4) (2021-12-31)


### Bug Fixes

* **define:** omit setting attribute on connect when not reuqired ([8565822](https://github.com/hybridsjs/hybrids/commit/8565822462d581ff78a36796012e5a42e8d5f369))
* **html:** warning message for not defined elements in the template ([b000b23](https://github.com/hybridsjs/hybrids/commit/b000b23e95c201f2e6ea284f2b7b030b3655dbec))

### [7.0.3](https://github.com/hybridsjs/hybrids/compare/v7.0.2...v7.0.3) (2021-12-17)


### Bug Fixes

* **router:** restore scroll restoration when navigate ([9a6e46b](https://github.com/hybridsjs/hybrids/commit/9a6e46b423ce62bba7c73e5830352d6ceeb916a5))

### [7.0.2](https://github.com/hybridsjs/hybrids/compare/v7.0.1...v7.0.2) (2021-12-16)


### Bug Fixes

* **router:** add manual scroll restoration ([490cbee](https://github.com/hybridsjs/hybrids/commit/490cbee4761f5316e8abf40512b3b2c23fea2a33))

### [7.0.1](https://github.com/hybridsjs/hybrids/compare/v7.0.0...v7.0.1) (2021-12-16)


### Bug Fixes

* **define:** reflect back properties only for primitives ([398d92c](https://github.com/hybridsjs/hybrids/commit/398d92cbb1e459f24f40a165135f291e670ab205))
* **router:** scroll to top on push navigation on iOS ([8a99f68](https://github.com/hybridsjs/hybrids/commit/8a99f6863accefc5fca4dc1abe6aee3b6c53c795))

## [7.0.0](https://github.com/hybridsjs/hybrids/compare/v6.1.0...v7.0.0) (2021-12-08)

### ⚠ BREAKING CHANGES

This major release comes with several breaking changes, which may affect your code. Follow the instructions from the [Migration Guide](/migration.md) section in the documentation.

### Features

* **router:** add debug mode ([991e46b](https://github.com/hybridsjs/hybrids/commit/991e46bbc5de1b22d6197efaa2c8f0607e256ecb))
* simplify component structure by multiple refactors ([#179](https://github.com/hybridsjs/hybrids/issues/179)) ([6b7b412](https://github.com/hybridsjs/hybrids/commit/6b7b41219dc2bf03980ad3ff5648615ed9e45453))
* **router:** router factory ([#136](https://github.com/hybridsjs/hybrids/issues/136)) ([f6bcb24](https://github.com/hybridsjs/hybrids/commit/f6bcb241ff9d3298ef1e76d88f34e574f955b71c))


### Bug Fixes

* **cache:** don't clear cached values when clean context ([f0cd683](https://github.com/hybridsjs/hybrids/commit/f0cd683c369eaa726f66a569aaca9f083ca91a53))
* **define:** add attr check in condition for perf. improv. ([7f969bf](https://github.com/hybridsjs/hybrids/commit/7f969bfe522a01df4911deaf1ac55fd87f8cae15))
* **define:** add strict mapping for array of strings ([28a4d5a](https://github.com/hybridsjs/hybrids/commit/28a4d5a49bfcae2d4822c1b25ff73ab2bb1ec79a))
* **define:** remove suppor for undefined value ([6664c5b](https://github.com/hybridsjs/hybrids/commit/6664c5bfbf0640b13869a31ddd0e0550e1ef7621))
* **define:** revert support for undefined value ([892c1ab](https://github.com/hybridsjs/hybrids/commit/892c1ab8cd971d25a183bec5f54b1f4fa7927b2c))
* **define:** simplify values and use get/set methods for computed properties ([5452a9f](https://github.com/hybridsjs/hybrids/commit/5452a9fd61bbe970ca8abff82ae9b1acbf2c3a52))
* **html:** clean unused condition for node resolver ([740395b](https://github.com/hybridsjs/hybrids/commit/740395b924829cbd460f96e813ea4a0657348b39))
* **router:** apply all params in url for nested entries ([6793d09](https://github.com/hybridsjs/hybrids/commit/6793d092e09cb8477020024f27b8fef21a271a70))
* **router:** avoid setting undefined in history state, clearer debug message ([f3bf387](https://github.com/hybridsjs/hybrids/commit/f3bf387c0b082b5d5cc0c7a2f6be5f08cb0d05ec))
* **router:** collapsed debug, clear hash from url, update not defaults ([d067560](https://github.com/hybridsjs/hybrids/commit/d06756037774c13e8f80c7bd4785285431291798))
* **router:** debug method with value, cleaner debug logs ([a98b16a](https://github.com/hybridsjs/hybrids/commit/a98b16a9b513179df568f7e98d3060c875aaaa4e))
* **router:** delay the scroll restoration for the render process ([cecab42](https://github.com/hybridsjs/hybrids/commit/cecab42763e06ce23d37028a0e973dbe6ff46f88))
* **router:** observe writable props and update entry state ([4a49192](https://github.com/hybridsjs/hybrids/commit/4a49192eaf36abc5da9c044b12272d245488f5d8))
* **router:** refactor matching browser url function ([438c74c](https://github.com/hybridsjs/hybrids/commit/438c74c5c58c9daf3d12cc3042c0ac5ba5d1e0a1))
* **router:** resolve event  returns passed promise ([cda672d](https://github.com/hybridsjs/hybrids/commit/cda672db72bfbd1fef68b035925fe96f098cbc90))
* **router:** update url and state only when needed ([ddded3b](https://github.com/hybridsjs/hybrids/commit/ddded3b69c3de9b6cec44a27ea7f5a2128a748df))
* **router:** use full url as a default option value ([47d302d](https://github.com/hybridsjs/hybrids/commit/47d302d7e83ab826e1c10659b17eccd22df7f78e))
* **router:** use hash from url only when view id is detected ([1755736](https://github.com/hybridsjs/hybrids/commit/1755736fa740fc7646e581ffcb2d1f2a5f30f7a4))
* **store:** correct prototype for mapping state of the model in store factory ([a7eb601](https://github.com/hybridsjs/hybrids/commit/a7eb601f96098280632d9a21c90682d0365bfb5b))
* **store:** detect circular references in offline serialization ([6902784](https://github.com/hybridsjs/hybrids/commit/69027849bc69b9bde0fc99d95bad7fb20110705e))
* **store:** factory with id resolving to undefined, draft models without id ([83bcc1d](https://github.com/hybridsjs/hybrids/commit/83bcc1da60847e6ab443287c1fd4e783de2c47c2))
* **store:** freeze default export ([1f555d1](https://github.com/hybridsjs/hybrids/commit/1f555d15665ea41c6ab983ee764c172e61d53883))
* **store:** make factory writable only for enumerables with `id` option ([c220efc](https://github.com/hybridsjs/hybrids/commit/c220efc358f25ce834a6801f7c4e5f92b7b32c64))
* **store:** merge nested model data when it is updated ([cc3c735](https://github.com/hybridsjs/hybrids/commit/cc3c735450c5ae9eee6257a7e52092aa1c107228))
* **store:** remove support for shorter options syntax ([ee6ff70](https://github.com/hybridsjs/hybrids/commit/ee6ff7024e44aa2c5b450a4ca87a5786162673cc))
* **store:** return null for enumerables without id ([82b0c9a](https://github.com/hybridsjs/hybrids/commit/82b0c9a146e86be1372e1dc96162cef63bca75c2))
* **store:** show only nested error if the property is set ([f9ddd5c](https://github.com/hybridsjs/hybrids/commit/f9ddd5cefb1a06f5662734386876d45710e0f944))
* **store:** use attribute fallback for enumerables in factory without options ([c06b0ba](https://github.com/hybridsjs/hybrids/commit/c06b0bab11ed5639256df26ff5bde60be005ded9))
* **store:** use cache layer for computed property to ensure correct value when related model has changed ([1524161](https://github.com/hybridsjs/hybrids/commit/1524161f592a34bebfb6702ea0bd195746c3325c))
* **store:** use correctly the value from singleton draft model ([11ff0e1](https://github.com/hybridsjs/hybrids/commit/11ff0e131c59d5a676fbaa389c2fc1b30837076f))
* **store:** use predefined error message over the result of validate function ([0ecf6da](https://github.com/hybridsjs/hybrids/commit/0ecf6da344e7a56c85083b2666789f42c8f2b95b))
* **store:** use saparate space for drafts, clear models with id ([de18b0e](https://github.com/hybridsjs/hybrids/commit/de18b0e24f99149f13ba6726989040a67def185c))
* **store:** use undefined over the null value for factory ([9f58c99](https://github.com/hybridsjs/hybrids/commit/9f58c991ba8e1e3ecb0d6047293335febfcc9d40))
* **types:** add missing function resolver for stack option ([d199d94](https://github.com/hybridsjs/hybrids/commit/d199d941c5cec6f543728f2f26ba5e36c218eb81))
* **types:** Rename Hybrids type to Component ([cf15619](https://github.com/hybridsjs/hybrids/commit/cf1561935f5faedd12c3b443be1e2eb8d60558a3))
* **types:** store storage result with optional fields and id references ([de96721](https://github.com/hybridsjs/hybrids/commit/de967218e58156394c9fd10df48ca26051f2ddd6))
* **types:** update types according to redefine refactor ([a2f4921](https://github.com/hybridsjs/hybrids/commit/a2f4921bdb265a610d481a0737a0501d2b4e1559))

## [6.1.0](https://github.com/hybridsjs/hybrids/compare/v6.0.0...v6.1.0) (2021-08-30)


### Features

* **store:** offline mode for external storages ([#175](https://github.com/hybridsjs/hybrids/issues/175)) ([345821b](https://github.com/hybridsjs/hybrids/commit/345821b966d785092eed0125bba12610b93148c5))


### Bug Fixes

* **define:** omit tag property when HMR updates definitions ([74bcc63](https://github.com/hybridsjs/hybrids/commit/74bcc634c4d0ea372b2a1d22eb8f6c5970f7c4bf))
* **store:** a number for offline mode removes cached values after the threshold ([16f036a](https://github.com/hybridsjs/hybrids/commit/16f036aa5cc21afa1df2bc90e98ff9a84f303cb8))
* **store:** clear values for empty result for offline cache ([a1071b4](https://github.com/hybridsjs/hybrids/commit/a1071b4503b7eba521a87b9ad84fcd02799e33d2))
* **store:** don't throw for async setup offline key ([fd23eaf](https://github.com/hybridsjs/hybrids/commit/fd23eaf1ca1f157ac9f58d6c9216e30046be0ce4))
* **store:** move offline threshold check to model definition ([edb22e4](https://github.com/hybridsjs/hybrids/commit/edb22e4730c50d528f07fb77baff067bb4ea3ff3))
* **store:** prevent from lower offline values in nested models ([1147732](https://github.com/hybridsjs/hybrids/commit/1147732948cb1def6aaa59583f531cb0897450d5))
* **store:** throw error for default get action ([1b011a1](https://github.com/hybridsjs/hybrids/commit/1b011a1ac8cdd3cdc5558d4eab573330de7ca1fa))

## [6.0.0](https://github.com/hybridsjs/hybrids/compare/v5.4.0...v6.0.0) (2021-07-17)


### ⚠ BREAKING CHANGES

* **store:** From now, for external storage, the result of the list action will not invalidate when the model instance is changed. The items within the list are still updated, but deletion or creating a model instance won't update the list unless you set the storage `loose` option to `true`.
  
  However, the default value change only applies to listing enumerable models with external storage, which can be changed by the user. For most of the cases, you should ok, without additional change in the code.
* **define:** Passing a map of components to the `define()` function is no longer supported. Object argument will be interpreted as a tagged component definition. A preferred way to refactor old code is to extend the definition of the component with the `tag` property, and pass definitions to the `define()` function as a list of arguments. If your definition contains `tag` property with another purpose, you can still use the `define(tagName, descriptors)` version.

  From:
  ```js
  const MyElement = { ... };
  const MyOtherElement = { ... };

  define({ MyElement, MyOtherElement });
  ```
  
  To:

  ```js
  const MyElement = { tag: "my-element", .. };
  const MyOtherElement = { tag: "my-other-element", ... };

  define(MyElement, MyOtherElement);
  ```

### Features

* **define:** replace call for a map of components to tagged component definitions ([#170](https://github.com/hybridsjs/hybrids/issues/170)) ([5bffc98](https://github.com/hybridsjs/hybrids/commit/5bffc9841e112713c20196e7508479981eae8bb4))


### Bug Fixes

* **property:** add missing support for observe method ([1cfd983](https://github.com/hybridsjs/hybrids/commit/1cfd9834ab0a1ec8556263ec387c4182ab563f3b))
* **store:** set loose option default value to false ([#172](https://github.com/hybridsjs/hybrids/issues/172)) ([ae7e1c5](https://github.com/hybridsjs/hybrids/commit/ae7e1c5a65d8e8860fd4598ffb7e5ad83d2167f8))

## [5.4.0](https://github.com/hybridsjs/hybrids/compare/v5.3.3...v5.4.0) (2021-06-23)


### Features

* **store:** loose option in the store storage for listing enumerables ([883c720](https://github.com/hybridsjs/hybrids/commit/883c7209714b8757564d9567c07c970f922850f0))


### Bug Fixes

* **cache:** clean deep suspended contexts ([0d08645](https://github.com/hybridsjs/hybrids/commit/0d08645f28b9ea68e1ac4759ef4b1206306d1d56))
* **store:** disable global invalidate for draft models ([50e31bb](https://github.com/hybridsjs/hybrids/commit/50e31bbb988a81477cf9765805882e89f6805681))
* **store:** force fetching model when clear with option se to false ([43e55ec](https://github.com/hybridsjs/hybrids/commit/43e55ecb7fe18f9aa90e5e7b7c35c1f625e5573c))
* **store:** keep error state when model updates ([93b5838](https://github.com/hybridsjs/hybrids/commit/93b5838037c487d519ab77b49261fe3c4c4c45fd))
* **types:** overload store methods for listing enumerables ([794e6fb](https://github.com/hybridsjs/hybrids/commit/794e6fb359bb8828927fb7811a2b44f9fc70e114))
* **types:** proper connect host key value ([63f9648](https://github.com/hybridsjs/hybrids/commit/63f9648058f26d35fea72d6de911e61cce2319dd))
* **types:** store id option as a function ([7f1893d](https://github.com/hybridsjs/hybrids/commit/7f1893d62d4a66a30c921c44be0e1a05edfd67a0))
* **types:** use declare module instead of namespace for better import support ([a45477c](https://github.com/hybridsjs/hybrids/commit/a45477c99607494941cef7a88622526357e60ec5))

### [5.3.3](https://github.com/hybridsjs/hybrids/compare/v5.3.2...v5.3.3) (2021-06-02)


### Bug Fixes

* **cache:** add force option to invalidate callback ([#167](https://github.com/hybridsjs/hybrids/issues/167)) ([91d6ea8](https://github.com/hybridsjs/hybrids/commit/91d6ea82e8963bd4118c3d2b57ad8e84c0cbef64))
* **cache:** clean contexts on get and set ([26854cb](https://github.com/hybridsjs/hybrids/commit/26854cb3bba2e6fd2c4a654f8c3ed60fe6b10947))
* **cache:** unresolve deep contexts of suspened target ([b4bb898](https://github.com/hybridsjs/hybrids/commit/b4bb89873bdbf6731358a10f6d6f1d069d7d624b))
* **store:** computed property saves value in-place ([1a7ab52](https://github.com/hybridsjs/hybrids/commit/1a7ab52395e8a86b60bd0660fec4456534135b6e))

### [5.3.2](https://github.com/hybridsjs/hybrids/compare/v5.3.1...v5.3.2) (2021-05-28)


### Bug Fixes

* **cache:** avoid recaluclation when deps did not change ([fa3544e](https://github.com/hybridsjs/hybrids/commit/fa3544ec8c0631146033a86cc38fb061486553e6))
* **cache:** clear entries references with greater precision ([159ae44](https://github.com/hybridsjs/hybrids/commit/159ae44ec993761ff21f37d59df54356677a1865))
* **cache:** memonize last value of the property for reconnected elements ([9fb45ec](https://github.com/hybridsjs/hybrids/commit/9fb45ecb324688fe631837673b51a3a1d4458707))
* **cache:** optimize performance of context control ([d18d855](https://github.com/hybridsjs/hybrids/commit/d18d85511c1c2ac62a469e02f888edf6db4a7f26))
* **html:** replace elements only if does not equal to last value ([4160352](https://github.com/hybridsjs/hybrids/commit/416035250289f14f6959c94288b80689e214d92d))
* **store:** support a list of models in ready & promise guards ([9c295d4](https://github.com/hybridsjs/hybrids/commit/9c295d41ff8e9364f292c265601e52024e0c29e9))
* **types:** better result type of define function ([50160c2](https://github.com/hybridsjs/hybrids/commit/50160c2491d5eeeee8a0bb67c20401bba7f41387))
* **types:** render & content type for direct factory usage ([0ed5156](https://github.com/hybridsjs/hybrids/commit/0ed5156a2990eced8d5016c20c2aabb0aeff797d))

### [5.3.1](https://github.com/hybridsjs/hybrids/compare/v5.3.0...v5.3.1) (2021-05-16)


### Bug Fixes

* **html:** html.set uses detail.value for general element support ([7e0c397](https://github.com/hybridsjs/hybrids/commit/7e0c3976d96e1f2b8afa651cf602801858e6e61a))
* **property:** reflect zero number type in attribute ([8b98c72](https://github.com/hybridsjs/hybrids/commit/8b98c7277338f2a3966ed1f0c8f9f36c3139d5be))
* **types:** clear & strict major types ([9fb97f7](https://github.com/hybridsjs/hybrids/commit/9fb97f7ce72f770104703dd199c07496b61aa9de))

## [5.3.0](https://github.com/hybridsjs/hybrids/compare/v5.2.2...v5.3.0) (2021-05-14)


### Features

* **html:** extend resolve helper support to all content values ([0ede2e8](https://github.com/hybridsjs/hybrids/commit/0ede2e8bdbc4794c86a32a372e507910c65b065e))
* **property:** sync attribute value for primitive types ([4337203](https://github.com/hybridsjs/hybrids/commit/43372033d25ddec29401867d043de4148c4826ed))
* **store:** writable factory for enumerables with undefined id ([c62d5df](https://github.com/hybridsjs/hybrids/commit/c62d5dfca41dee9e5c128b19a1fc2a1eae397a09))


### Bug Fixes

* **define:** keep lastValue for HMR update ([bdff4c0](https://github.com/hybridsjs/hybrids/commit/bdff4c0672504bad43a219397677604d2ba48ea6))
* **html:** avoid get property before set, memoize property type ([bb863c7](https://github.com/hybridsjs/hybrids/commit/bb863c76cbb8d957fa4060aa63902344d3de2011))
* **html:** use property where possible for combined expressions ([baf5ead](https://github.com/hybridsjs/hybrids/commit/baf5ead02cfea10f2dae6fa9af56299b359d0d63))
* **render:** optimize performance of shadowRoot generation ([564d875](https://github.com/hybridsjs/hybrids/commit/564d87562ebf4086eff6c4d00173a6a0c47d9202))
* **store:** clear lastValue for draft mode ([c155fed](https://github.com/hybridsjs/hybrids/commit/c155fedcd47f4908d371731d74dc36d03efc7713))

### [5.2.2](https://github.com/hybridsjs/hybrids/compare/v5.2.1...v5.2.2) (2021-04-09)


### Bug Fixes

* **html:** check text node twice, as it can be splitted in the compile process ([#153](https://github.com/hybridsjs/hybrids/issues/153)) ([cec63c8](https://github.com/hybridsjs/hybrids/commit/cec63c84f7491ad50438466b7d8b9b9ba83865c8))

### [5.2.1](https://github.com/hybridsjs/hybrids/compare/v5.2.0...v5.2.1) (2021-04-09)


### Bug Fixes

* **html:** remove missing element check, clean code ([#153](https://github.com/hybridsjs/hybrids/issues/153)) ([79614c9](https://github.com/hybridsjs/hybrids/commit/79614c9508f8f846db23f6eca03229479b929877))
* **types:** property values & property factory ([43b9102](https://github.com/hybridsjs/hybrids/commit/43b910245c2840c40ba54303134341e4c872730b))

## [5.2.0](https://github.com/hybridsjs/hybrids/compare/v5.1.0...v5.2.0) (2021-04-06)


### Features

* **store:** adds ref method for self reference and import cycles ([93e451e](https://github.com/hybridsjs/hybrids/commit/93e451e2de28dc10aaa687148e46a8d9f32de3f3))
* **store:** sync method for server side updates ([9de6140](https://github.com/hybridsjs/hybrids/commit/9de61404778bdac37ae6aa63be8475a74d1e0e77))


### Bug Fixes

* **npm:** use recommended exports and main fields ([e2605e7](https://github.com/hybridsjs/hybrids/commit/e2605e7fff5e467825aa304db3b035f1a6a4e656))
* **store:** invlidate listing when nested list model updates ([05ffae6](https://github.com/hybridsjs/hybrids/commit/05ffae6649753fbfa93c95c1300aadc9e40b723d))
* **types:** allow optional property in model definition ([0f3c660](https://github.com/hybridsjs/hybrids/commit/0f3c660224ad28299f0f25a8e7067f65d1d7c901))
* **types:** clean storage definition ([9bbffdc](https://github.com/hybridsjs/hybrids/commit/9bbffdcc8eb993a3fbbb891fb22069e1561e2e91))

## [5.1.0](https://github.com/hybridsjs/hybrids/compare/v5.0.2...v5.1.0) (2021-03-26)


### Features

* **html:** add css helper method for tagged template literals support ([8a3ac0d](https://github.com/hybridsjs/hybrids/commit/8a3ac0d41662d67ae4ad0f295de916180e9202d8))
* **store:** resolve method for simplier access to pending instances ([38b40e2](https://github.com/hybridsjs/hybrids/commit/38b40e284c2b24b804e0a5a173ce9d3786af1378))


### Bug Fixes

* **store:** schedule set method in pending state ([00fb0f5](https://github.com/hybridsjs/hybrids/commit/00fb0f5d4645c2048e411ad073a1d46a7c0c38c0))
* **types:** store model fixes, descriptor type update with key mapping ([53acb31](https://github.com/hybridsjs/hybrids/commit/53acb3114d079d2d9516549476e04b2dcbcb536b))
* **types:** support nested partial values ([a810884](https://github.com/hybridsjs/hybrids/commit/a81088425e8ce0fabe16fc27a56ed2563bfdfe74))

### [5.0.2](https://github.com/hybridsjs/hybrids/compare/v5.0.1...v5.0.2) (2021-03-14)


### Bug Fixes

* **store:** allow updating the last stale instance ([2603bc0](https://github.com/hybridsjs/hybrids/commit/2603bc094ba34d81bfab75cccae19204982f8c6d))

### [5.0.1](https://github.com/hybridsjs/hybrids/compare/v5.0.0...v5.0.1) (2021-03-12)


### Bug Fixes

* **cache:** use target of entry in suspend condition ([86ddd19](https://github.com/hybridsjs/hybrids/commit/86ddd1987cb7fc2d30c179287c96887df7bbba79))
* **types:** reflect removal of custructor support in define function ([d6742d6](https://github.com/hybridsjs/hybrids/commit/d6742d679fd9125f32045c06d6269c8abc0d18a1))
* **typescript:** content type, optional id in store ([e03a63b](https://github.com/hybridsjs/hybrids/commit/e03a63bc72602f8dd3f21a40e953e68009378f36))

## [5.0.0](https://github.com/hybridsjs/hybrids/compare/v4.3.4...v5.0.0) (2021-03-09)


### ⚠ BREAKING CHANGES

* **define:** `define()` no longer supports defining external custom elements with a custructor parameter. Use `customElements.define()` API directly.
* **define:** `content` property set as a function must be wrapped to work as before:
  ```js
  const MyElement = {
    // from
    content: () => { ... },
    // to
    content: {
      get: () => { ... },
    },
  };
  ```
* `/esm` and `/lib` paths are no longer generated - use `/src` with ES2015+ syntax
* `/dist` path is no longer generated - use [unpkg.com/hybrids](https://unpkg.com/hybrids) in module scripts for direct usage
* `process.env.NODE_ENV` is removed from the source code - no more prod/dev modes

### Features

* **define:** content property translates to render factory with Shadow DOM turned off ([90c0f8c](https://github.com/hybridsjs/hybrids/commit/90c0f8c462985d7f3d9cfab5fd4079629482eb0f))
* **define:** remove constructor support in define method ([d91eec7](https://github.com/hybridsjs/hybrids/commit/d91eec78910347864123b76532eae0a794838b64))
* **html:** support for nodes in expressions ([636872a](https://github.com/hybridsjs/hybrids/commit/636872a04a14a5418b8c7f5b130b788542106156))
* Drop support for IE11 ([5cf1e3f](https://github.com/hybridsjs/hybrids/commit/5cf1e3fb4fa3b38750a6d12659e22a9954b6e402))


### Bug Fixes

* **cache:** simplified resolving algorhythm with suspense feature ([f9ed988](https://github.com/hybridsjs/hybrids/commit/f9ed9885d14fe708ba9ea6b7f06a526cc9406097))
* **html:** remove template instance from the shadowRoot ([fb056cb](https://github.com/hybridsjs/hybrids/commit/fb056cbe02a851e74303bdda8c81ba47effa32e1))
* **store:** invalidate list type when nested model is fetched ([18d3ad7](https://github.com/hybridsjs/hybrids/commit/18d3ad73fac4780b4f89e28276c274340ab91d05))
* **store:** rewrite id from model to draft on submit ([81d833f](https://github.com/hybridsjs/hybrids/commit/81d833f861653894079433f8849b79c337e13222))
* **typescript:** simplified types ([2b4f65f](https://github.com/hybridsjs/hybrids/commit/2b4f65f59ffa4e0e377d757aa4206ea9212abcd3))

### [4.3.4](https://github.com/hybridsjs/hybrids/compare/v4.3.3...v4.3.4) (2021-01-14)


### Bug Fixes

* **html:** allow multiple browser autocomplete for store models ([baca71a](https://github.com/hybridsjs/hybrids/commit/baca71a196b99973593c1592cbe6aeb78094166b))
* **store:** create mode for singletons in draft mode, placeholders connected to configs ([d69b63e](https://github.com/hybridsjs/hybrids/commit/d69b63e365e98d3b3d0b0a85e28683f985f729d5))

### [4.3.3](https://github.com/hybridsjs/hybrids/compare/v4.3.2...v4.3.3) (2020-10-26)


### Bug Fixes

* **store:** dont rewrite id for list type in async storage ([2196fe9](https://github.com/hybridsjs/hybrids/commit/2196fe925869de670cf78a71d8bfa76f7564a52f))

### [4.3.2](https://github.com/hybridsjs/hybrids/compare/v4.3.1...v4.3.2) (2020-10-26)


### Bug Fixes

* **store:** don't rewrite id for list type ([bee7d1c](https://github.com/hybridsjs/hybrids/commit/bee7d1c397ebc3993269a676f38a6abe5df76fc7))

### [4.3.1](https://github.com/hybridsjs/hybrids/compare/v4.3.0...v4.3.1) (2020-09-14)


### Bug Fixes

* mark no side effects for better tree-shaking ([4397aa6](https://github.com/hybridsjs/hybrids/commit/4397aa66af508b7526ad9791ce8d5124b36e6f87))
* **store:** clear error message for not found case ([4ad5ce3](https://github.com/hybridsjs/hybrids/commit/4ad5ce3930f8753b6234f3a5e7f2dcd1e63d3b80))

## [4.3.0](https://github.com/hybridsjs/hybrids/compare/v4.2.1...v4.3.0) (2020-08-06)


### Features

* **define:** Hybrid constructor without definition in the registry ([c73b5af](https://github.com/hybridsjs/hybrids/commit/c73b5afdfd5f8a0f2d7376596494cbb14de34d66))
* **store:** global state management ([#85](https://github.com/hybridsjs/hybrids/issues/85)) ([f27fc8a](https://github.com/hybridsjs/hybrids/commit/f27fc8ab67afbc09d283965782179097f2e38998))


### Bug Fixes

* **html:** print logs in dev environment for expression errors ([a75f415](https://github.com/hybridsjs/hybrids/commit/a75f4153e988ebbd444a5a5a1c7f7a3959c08c30))
* **html:** proper placeholder resolve in case of an error ([8f1019c](https://github.com/hybridsjs/hybrids/commit/8f1019c2da87576c5c7c8ba4c375bc1292fcce94))

### [4.2.1](https://github.com/hybridsjs/hybrids/compare/v4.2.0...v4.2.1) (2020-05-31)


### Bug Fixes

* **cache:** removes unnecessary set protection guard ([#116](https://github.com/hybridsjs/hybrids/issues/116)) ([72ae0ce](https://github.com/hybridsjs/hybrids/commit/72ae0ce46f6e83a67509685393bb6472c8bf410c))

## [4.2.0](https://github.com/hybridsjs/hybrids/compare/v4.1.9...v4.2.0) (2020-05-26)


### Features

* **html:** adds support for constructable stylesheets ([#112](https://github.com/hybridsjs/hybrids/issues/112)) ([80ad928](https://github.com/hybridsjs/hybrids/commit/80ad928699aa2c8d532365f071c909f57505116f))

### [4.1.9](https://github.com/hybridsjs/hybrids/compare/v4.1.8...v4.1.9) (2020-05-09)


### Bug Fixes

* **define:** rewire own props values after upgrade ([#115](https://github.com/hybridsjs/hybrids/issues/115)) ([e849849](https://github.com/hybridsjs/hybrids/commit/e84984939bd5b58f017f619f8cc544b150ffc3f9))

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
