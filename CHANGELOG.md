# Change Log

All notable changes to the "typeview" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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
- Type assertion (`as Type`) support
- Zod and other type transformation libraries
- Axios and other HTTP libraries support
- Hono and other framework support
- More flexible code pattern recognition