# TypeView Architecture

## Overview

TypeView is a VS Code extension that displays type information for API endpoints in TypeScript projects when hovering over them.

## Overall Processing Flow

```mermaid
graph TD
    A[User hovers over fetch statement] --> B[HoverProvider activated]
    B --> C[Extract API URL using regex]
    C --> D{API URL pattern match?}
    D -->|No| E[Return null]
    D -->|Yes| F[Get framework & routeDirectories from settings]
    F --> G[Get appropriate Resolver from ResolverMap]
    G --> H[Resolver.resolve to identify route file]
    H --> I{Route file exists?}
    I -->|No| E
    I -->|Yes| J[Parse AST with TS parser]
    J --> K[Extract body type from POST function]
    K --> L{Type information found?}
    L -->|No| E
    L -->|Yes| M[Identify type definition source file from importMap]
    M --> N[Resolve absolute path with path resolver]
    N --> O[Extract type text from type definition file]
    O --> P[Create hover content with MarkdownString]
    P --> Q[Display type information to user]
```

## Main Components

### 1. HoverProvider (`src/extension.ts`)
- Entry point
- Integration with VS Code API
- Controls overall processing flow

### 2. RouteResolver (`src/resolvers/`)
- Mapping from API URLs to backend files
- Implements framework-specific routing rules
- Currently supported: Next.js App Router

### 3. TypeScript Parser (`src/parser/ts-parser.ts`)
- TypeScript AST analysis
- Type annotation extraction from POST functions
- Import statement analysis

### 4. PathResolver (`src/utils/path-resolver.ts`)
- tsconfig.json path alias resolution
- Conversion from relative paths to absolute paths

## Data Flow

```mermaid
sequenceDiagram
    participant User as User
    participant VSCode as VS Code
    participant HP as HoverProvider
    participant RR as RouteResolver
    participant TP as TypeParser
    participant PR as PathResolver

    User->>VSCode: Hover over fetch("/api/users")
    VSCode->>HP: Call provideHover()
    HP->>HP: Extract URL using regex
    HP->>RR: resolve("/api/users")
    RR->>RR: Search for route file
    RR-->>HP: route.ts URI
    HP->>TP: findBodyType(routeUri)
    TP->>TP: AST analysis
    TP-->>HP: {typeName, importPath}
    HP->>PR: resolveModulePath()
    PR-->>HP: Type definition file URI
    HP->>TP: extractTypeDefinition()
    TP-->>HP: Type definition text
    HP->>HP: Create MarkdownString
    HP-->>VSCode: Hover object
    VSCode-->>User: Display type information
```

## Configuration and Customization

### Configuration Parameters
- `typeview.framework`: Framework to use
- `typeview.routeDirectories`: API route directories

### Extension Points
1. **New framework support**: Implement `IRouteResolver`
2. **New type patterns**: Extend patterns in `ts-parser.ts`
3. **New path resolver**: Extend `path-resolver.ts`

## Error Handling

Errors at each stage are handled by returning `undefined`, ultimately resulting in no hover display.
This ensures that normal development flow is not interrupted, and type information is displayed only when available.
