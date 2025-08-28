# Change Log

All notable changes to the "typeview" extension will be documented in this file.

**📖 [日本語版はこちら / Japanese Version](CHANGELOG_ja.md)**

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2025-08-17

### Added

- **🏗️ Extensible Hover Provider Architecture**

  - Complete rewrite with Strategy Pattern and Dependency Injection
  - Modular, testable design with `ExtensibleHoverProvider`
  - Professional logging with VS Code OutputChannel
  - Future-ready architecture for multi-framework support

- **🚀 Multiple HTTP Library Support**

  - Priority-based pattern matching system
  - **fetch API** support (priority 10) - `fetch("/api/...")`
  - **axios** support (priority 8) - `axios.post("/api/...", data)`
  - Extensible matcher system for adding new HTTP libraries

- **🧪 Comprehensive Test Suite**

  - **100+ automated tests** with 100% pass rate
  - Integration tests for real-world scenarios
  - Pattern matcher unit tests
  - Type resolver validation tests
  - Continuous quality assurance

- **📋 Advanced Pattern Detection**
  - Enhanced type annotation detection
  - Improved type assertion support
  - Better Zod schema integration
  - Body pattern matching across HTTP methods

### Enhanced

- **Type Resolution**: Faster and more accurate type detection
- **Error Handling**: Robust error handling with graceful degradation
- **Performance**: Optimized AST parsing and type extraction
- **Code Quality**: ESLint compliance and clean architecture
- **Developer Experience**: Enhanced debugging and logging capabilities

### Technical Improvements

- **Dependency Injection**: Clean separation of concerns
- **Strategy Pattern**: Extensible pattern matching architecture
- **Factory Pattern**: Centralized resolver creation
- **Output Channel**: Professional logging for debugging
- **Type Safety**: Enhanced TypeScript integration throughout

### Documentation

- Comprehensive developer guides (English & Japanese)
- Architecture documentation with UML diagrams
- README optimization for VS Code marketplace
- Pattern usage examples and best practices

### Supported HTTP Libraries & Patterns

1. **fetch API**:

   - `fetch("/api/users", { method: "POST", body: JSON.stringify(data) })`
   - `const response = await fetch("/api/endpoint")`

2. **axios**:

   - `axios.post("/api/users", userData)`
   - `await axios.put("/api/profile", profileData)`

3. **Pattern Types**:
   - Type annotations: `const body: UserType = await req.json()`
   - Type assertions: `const body = await req.json() as UserType`
   - Zod schemas: `const body = UserSchema.parse(await req.json())`
   - Local type definitions and imported types

### Configuration

- Backward compatible with all existing settings
- `typeview.framework`: Backend framework selection
- `typeview.routeDirectories`: API route directories configuration
- Enhanced configuration validation and error reporting

## [0.2.0] - 2025-08-13

### Added

- **🔍 Advanced Pattern Matching System**

  - Strategy pattern-based architecture for extensible code pattern detection
  - Support for multiple TypeScript patterns in a single codebase
  - Automatic pattern detection and prioritization

- **📍 Local Type Definition Support**

  - Detect and display types defined in the same file as API routes
  - Support for local interfaces and type aliases
  - No import required for same-file type definitions

- **⚡ Zod Schema Support**

  - Full support for Zod validation schemas
  - Detect `Schema.parse(await req.json())` patterns
  - Display Zod schema definitions with proper syntax highlighting

- **🏗️ Architecture Improvements**
  - Refactored codebase with Strategy pattern for pattern matchers
  - Separated type extraction logic into reusable components
  - Enhanced AST parsing with dedicated utility functions

### Enhanced

- **Type Assertion Pattern**: Added support for `await req.json() as Type` syntax
- **Import Resolution**: Improved import statement parsing and resolution
- **Error Handling**: Better error handling and graceful fallbacks
- **Code Organization**: Modular architecture with `pattern_matchers/` and `type_extractors/`

### Technical Improvements

- **Comprehensive Testing**: Added 34+ automated tests covering all patterns
- **TypeScript AST Utilities**: Enhanced AST manipulation utilities
- **Performance**: Optimized type search with hierarchical priority (Import > Local)
- **Code Quality**: ESLint compliance and clean code practices

### Supported Patterns

1. **Type Annotation**: `const body: Type = await req.json()`
2. **Type Assertion**: `const body = await req.json() as Type`
3. **Local Interface**: Same-file interface definitions
4. **Local Type Alias**: Same-file type alias definitions
5. **Zod Schemas**: `const body = Schema.parse(await req.json())`

### Documentation

- Updated README with comprehensive pattern examples
- Added architecture documentation (`docs/ARCHITECTURE.md`)
- Enhanced JSDoc comments throughout codebase

### Configuration

- Maintained backward compatibility with existing settings
- `typeview.framework`: Backend framework selection (currently "nextjs-app-router")
- `typeview.routeDirectories`: API route directories configuration

## [0.1.0-pre] - 2025-08-10

### Added

- **Initial Preview Release** 🎉
- Hover type display for `fetch("/api/...")` calls
- Next.js App Router API route support
- TypeScript path alias resolution (`@/` patterns)
- AST-based type extraction from route.ts files
- Support for `const body: Type = await req.json()` pattern
- Workspace configuration via `.vscode/settings.json`

### Features

- **Hover Provider**: Show TypeScript request body types on hover
- **Route Resolution**: Automatically find corresponding route files
- **Type Extraction**: Parse TypeScript AST to extract type information
- **Path Alias Support**: Resolve tsconfig.json path mappings

### Configuration

- `typeview.framework`: Backend framework selection (currently "nextjs-app-router")
- `typeview.routeDirectories`: API route directories configuration

### Limitations

- Only supports Next.js App Router
- Limited to `.ts` and `.tsx` files
- Requires specific code pattern: `const body: Type = await req.json()`

## [Unreleased]

### Planned Features

- Zero Configuration support
- Support for all HTTP methods (GET, PUT, DELETE, etc.)
- Axios and other HTTP libraries support
- Hono and other framework support
- Workspace-wide type searching
- Performance optimizations
- Better error handling and diagnostics
