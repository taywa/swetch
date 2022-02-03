# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2022-02-03

### Added

- Server option for ignoring headers
- Server option for customizing data serialization
- Server option for customizing responses
- Server now adds Date, Expires and Age headers with current request date when responding

### Changed

- JSON data is now formatted with 2 spaces by default
- Date, Expires, Age and Content-Encoding headers are now removed before saving

## [3.0.0] - 2022-01-31

### Changed

- Changed file extensions of dist modules to reflect their syntax
- Renamed dist directories to reflect file extensions
- Removed module type from package

## [2.0.2] - 2022-01-31

### Fixed

- Missing dist

## [2.0.1] - 2022-01-31

### Fixed

- Missing babel core dev dependency

## [2.0.0] - 2022-01-31

### Added

- Transpiled esm and cjs modules

### Removed

- Main entry point

## [1.2.5] - 2022-01-28

### Fixed

- Internal error on simultaneous empty data and empty errors

## [1.2.4] - 2022-01-28

### Fixed

- Internal error on server errors

## [1.2.3] - 2022-01-28

### Fixed

- Server decoding file data twice

## [1.2.2] - 2022-01-27

### Fixed

- Swetch & Axios interceptor ignoring origin option

## [1.2.1] - 2022-01-27

### Fixed

- Syntax error in Axios interceptor

## [1.2.0] - 2022-01-27

### Added

- Origin property to swetch config (allows specifying fixed host for relative requests)

### Fixed

- Server always using request header origin

## [1.1.2] - 2022-01-27

### Fixed

- Some requests never resolving

## [1.1.1] - 2022-01-25

### Fixed

- Binary (npx)

### Removed

- `swetch` script

## [1.1.0] - 2022-01-25

### Added

- Start & exec scripts
- Log output with server info when running
- Verbose errors when missing resource or init

### Changed

- Log output now shows shorter hashes
- Errors are now responded as application/json

### Fixed

- Passing nullish values in config overriding defaults

## [1.0.0] - 2022-01-25

### Added

- First versions of
  - Swetch
  - Swetch server
  - Axios Interceptor