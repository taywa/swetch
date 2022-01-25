# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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