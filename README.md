# TypeView

**Show TypeScript API request body types on hover for TypeScript + Monorepo projects**

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Ayumu3746221.typeview?style=flat-square)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/Ayumu3746221.typeview?style=flat-square)

**Languages:** [🇺🇸 English](./README.md) | [🇯🇵 日本語](./README_ja.md)

## 🎬 Demo

![Demo](./demo.gif)

**What you see:** Hover over `fetch("/api/users")` to instantly see the TypeScript request body type definition with source information.

## 🚀 What TypeView Does

TypeView revolutionizes API development by providing **instant type visibility** when you hover over API calls in your frontend code:

- ✨ **Zero Setup Required** - Just hover over `fetch("/api/...")` or `axios.post("/api/...")`
- 🎯 **Intelligent Detection** - Automatically finds corresponding API route files
- 📝 **Rich Type Information** - Shows complete TypeScript interfaces, types, and Zod schemas
- 🔄 **Multiple Pattern Support** - Works with type annotations, assertions, and modern validation libraries
- 📍 **Source Context** - Displays where types are imported from or if they're locally defined

### Perfect for Modern Development

```typescript
// In your React component - just hover over the API path!
const handleSubmit = async (userData: any) => {
  const response = await fetch("/api/users", {
    // 👈 Hover here!
    method: "POST",
    body: JSON.stringify(userData),
  });

  // Also works with axios
  await axios.post("/api/posts", postData); // 👈 And here!
};
```

**TypeView instantly shows:**

```typescript
interface UserCreateInput {
  name: string;
  email: string;
  age?: number;
}
*From: `@/types/user`*
```

## 📦 Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "TypeView"
4. Click Install

Or install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Ayumu3746221.typeview).

## ⚙️ Quick Configuration

Add these settings to your workspace `.vscode/settings.json`:

```json
{
  "typeview.framework": "nextjs-app-router",
  "typeview.routeDirectories": ["app/api"]
}
```

## 💡 Supported Patterns

TypeView's **extensible architecture** automatically detects:

### 📋 API Route Patterns

```typescript
// ✅ Type Annotation
const body: UserType = await req.json();

// ✅ Type Assertion
const body = (await req.json()) as UserType;

// ✅ Zod Schema Validation
const body = UserSchema.parse(await req.json());

// ✅ Local Type Definitions
interface LocalType {
  name: string;
}
```

### 🌐 HTTP Library Support

```typescript
// ✅ Fetch API (Priority: 10)
fetch("/api/users", { method: "POST" });

// ✅ Axios (Priority: 8)
axios.post("/api/users", data);
client.get("/api/posts");

// 🔧 Custom libraries easily added
```

### 📁 Project Structure Support

```
✅ Import Types          ✅ Local Definitions      ✅ Zod Schemas
app/api/users/route.ts   app/api/posts/route.ts    app/api/validate/route.ts
lib/types/user.ts        (types in same file)     (schemas in same file)
```

## 🚧 Current Status

### ✅ Fully Supported

- Next.js App Router API routes
- TypeScript (.ts) and React (.tsx) files
- POST function body type detection
- Import path resolution with tsconfig.json aliases
- Local and imported type definitions
- Zod schema validation patterns

### 🔄 Coming Soon

- All HTTP methods (GET, PUT, DELETE)
- Additional frameworks (Hono, Express, FastAPI)
- More HTTP libraries (Superagent, Got)
- Zero configuration setup
- Enhanced debugging tools

---

## 🏗️ Development & Architecture

### Extensible Design

TypeView features a modern **Strategy Pattern** architecture built for extensibility:

- **🔧 Pattern Matchers**: Easily add support for new HTTP libraries
- **⚙️ Priority System**: Configure execution order for different patterns
- **🧪 Dependency Injection**: Fully testable and maintainable components
- **📊 Professional Logging**: VS Code OutputChannel integration

### Quality Assurance

- ✅ **100 Automated Tests** - Comprehensive coverage ensuring reliability
- 🔒 **TypeScript Safety** - Strict typing throughout the codebase
- 🛡️ **Robust Error Handling** - Graceful degradation on failures
- 📋 **VS Code Compliance** - Full compatibility with extension constraints

See our [Developer Guide](./docs/DEVELOPER_GUIDE.md) for detailed architecture documentation and contribution guidelines.

## 🤝 Contributing

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
