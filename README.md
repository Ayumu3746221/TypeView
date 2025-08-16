# TypeView

**Show TypeScript API request body types on hover for TypeScript + Monorepo projects**

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Ayumu3746221.typeview?style=flat-square)
![Visual Stud## 🤝 Contributing

We welcome contributions! Please check out our [GitHub repository](https://github.com/Ayumu3746221/TypeView) for:

- 🐛 Bug reports
- 💡 Feature requests
- 🔧 Pull requests
- 📖 Documentation improvements

### 🏗️ Development Architecture

TypeView features an **extensible architecture** built with:

- **Strategy Pattern**: Easy addition of new HTTP libraries and frameworks
- **Dependency Injection**: Testable and maintainable component design
- **Priority System**: Configurable execution order for pattern matching
- **Professional Logging**: VS Code OutputChannel integration for debugging

See our [Developer Guide](./docs/DEVELOPER_GUIDE.md) for detailed architecture documentation and contribution guidelines.

### ✅ Quality Assurance

- **100 Automated Tests**: Comprehensive test coverage ensuring reliability
- **VS Code Integration**: Full compatibility with VS Code extension constraints
- **TypeScript Safety**: Strict typing throughout the codebase
- **Error Handling**: Robust error handling with graceful degradationtplace Downloads](https://img.shields.io/visual-studio-marketplace/d/Ayumu3746221.typeview?style=flat-square)

[日本語版 README](./README_ja.md) | [English README](./README.md)

## 🚀 Features

- **Hover Type Display**: Hover over `fetch("/api/...")` calls to see TypeScript request body types
- **Next.js App Router Support**: Works seamlessly with Next.js App Router API routes
- **TypeScript Path Alias Resolution**: Supports `@/` and other path aliases defined in tsconfig.json
- **Multiple Type Definition Patterns**: Automatically detects imported types, local type definitions, and Zod schemas
- **Flexible Type Extraction**: Advanced AST analysis supporting various code patterns

![Demo](./demo.gif)

## 📦 Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "TypeView"
4. Click Install

Or install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Ayumu3746221.typeview).

## ⚙️ Configuration

Add these settings to your workspace `.vscode/settings.json`:

```json
{
  "typeview.framework": "nextjs-app-router",
  "typeview.routeDirectories": ["app/api"]
}
```

### Settings

| Setting                     | Description                                        | Default               |
| --------------------------- | -------------------------------------------------- | --------------------- |
| `typeview.framework`        | Backend framework type                             | `"nextjs-app-router"` |
| `typeview.routeDirectories` | API route directories (relative to workspace root) | `[]`                  |

## 🎯 Usage

1. Configure your workspace settings (see above)
2. Open a TypeScript/TSX file
3. Write code like: `fetch("/api/users")`
4. Hover over the API path to see the request body type definition

## 💡 Supported Patterns

TypeView now features an **extensible pattern matching system** that automatically detects various code patterns:

### 1. Type Annotation Pattern

```typescript
import { UserCreateInput } from "@/types/user";

export async function POST(req: Request) {
  const body: UserCreateInput = await req.json(); // Detects imported types
  return Response.json({ success: true });
}
```

### 2. Type Assertion Pattern

```typescript
export async function POST(req: Request) {
  const body = (await req.json()) as UserCreateInput; // Detects type assertions
  return Response.json({ success: true });
}
```

### 3. Local Type Definition Pattern

```typescript
// Type defined in the same file
interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}

export async function POST(req: Request) {
  const body: CreatePostRequest = await req.json(); // Detects local types
  return Response.json({ success: true });
}
```

### 4. Zod Schema Pattern

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

export async function POST(req: Request) {
  const body = UserSchema.parse(await req.json()); // Detects Zod schemas
  return Response.json({ success: true });
}
```

### 5. HTTP Library Support

TypeView supports multiple HTTP request libraries through **extensible pattern matchers**:

```typescript
// Fetch API (Priority: 10)
fetch("/api/users", { method: "POST" });

// Axios (Priority: 8)
axios.post("/api/users", data);
client.get("/api/posts");

// Custom libraries can be easily added through the extensible architecture
```

### Hover Display Examples

When calling APIs in your components, **TypeView provides rich contextual information**:

```typescript
// In your React component
const handleSubmit = async (userData: any) => {
  const response = await fetch("/api/users", {
    // <- Hover here!
    method: "POST",
    body: JSON.stringify(userData),
  });

  // Also works with axios
  await axios.post("/api/posts", postData); // <- Hover here too!
};
```

**TypeView will display** comprehensive type information with source context:

```typescript
// For imported types
interface UserCreateInput {
  name: string;
  email: string;
  age?: number;
}
*From: `@/types/user`*

// For local definitions
interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}
*(Defined in same file)*

// For Zod schemas with validation rules
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional()
});
*From: `zod`*
```

## 📁 Project Structure

TypeView supports various project structures:

### Pattern 1: Using Imported Types

```
your-project/
├── app/
│   └── api/
│       └── users/
│           └── route.ts        # API route file
├── lib/
│   └── types/
│       └── user.ts             # Type definitions
└── .vscode/
    └── settings.json           # TypeView configuration
```

### Pattern 2: Using Local Type Definitions

```
your-project/
├── app/
│   └── api/
│       └── posts/
│           └── route.ts        # API route + type definitions
└── .vscode/
    └── settings.json           # TypeView configuration
```

### Pattern 3: Using Zod Schemas

```
your-project/
├── app/
│   └── api/
│       └── validate/
│           └── route.ts        # API route + Zod schemas
└── .vscode/
    └── settings.json           # TypeView configuration
```

## ✨ v0.2.0 New Features

- **🏗️ Extensible Architecture**: Complete rewrite using Strategy pattern with dependency injection
- **🔧 Multiple HTTP Libraries**: Support for fetch, axios, and extensible pattern matching system
- **🎯 Advanced Pattern Detection**: Intelligent detection of type annotations, type assertions, and Zod schemas
- **📍 Local Type Definition Support**: Detects and displays types defined in the same file
- **⚡ Professional Logging**: VS Code OutputChannel integration for debugging and monitoring
- **🧪 Comprehensive Testing**: Quality assurance with **100 automated tests** passing
- **🛡️ Error Handling**: Robust error handling with graceful degradation
- **⚙️ Priority System**: Configurable execution order for pattern matchers

## 🚧 Limitations

### Current Limitations

- Only Next.js App Router is supported
- Limited to `.ts` and `.tsx` file extensions
- Only POST functions are supported (GET, PUT, DELETE support coming soon)

### Planned Features

- Zero Configuration support
- Support for all HTTP methods (GET, PUT, DELETE, etc.)
- Additional HTTP request libraries (Superagent, Got, etc.)
- Support for other frameworks like Hono, Express, FastAPI
- Enhanced debugging tools and diagnostics
- Performance optimizations with caching
- Custom pattern matcher development API

## �🤝 Contributing

We welcome contributions! Please check out our [GitHub repository](https://github.com/Ayumu3746221/TypeView) for:

- 🐛 Bug reports
- 💡 Feature requests
- 🔧 Pull requests
- 📖 Documentation improvements

### 🌍 English Documentation Help Needed

**Note**: The primary author is a Japanese developer. We are actively seeking contributors to help improve the English documentation, fix grammatical errors, and make the content more accessible to international users. If you're a native English speaker or have strong English skills, your help would be greatly appreciated!

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙋‍♂️ Support

- 🐛 [Report Issues](https://github.com/Ayumu3746221/TypeView/issues)
- 💬 [Discussions](https://github.com/Ayumu3746221/TypeView/discussions)
- ⭐ Star the project if you find it useful!

---

**Enjoy coding with better type visibility! 🎉**
