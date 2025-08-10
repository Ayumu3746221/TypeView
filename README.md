# TypeView

**Show TypeScript API request body types on hover for TypeScript + Monorepo projects**

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Ayumu3746221.typeview?style=flat-square)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/Ayumu3746221.typeview?style=flat-square)

[日本語版README](./README_ja.md) | [English README](./README.md)

## 🚀 Features

- **Hover Type Display**: Hover over `fetch("/api/...")` calls to see TypeScript request body types
- **Next.js App Router Support**: Works seamlessly with Next.js App Router API routes
- **TypeScript Path Alias Resolution**: Supports `@/` and other path aliases defined in tsconfig.json

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

| Setting | Description | Default |
|---------|-------------|---------|
| `typeview.framework` | Backend framework type | `"nextjs-app-router"` |
| `typeview.routeDirectories` | API route directories (relative to workspace root) | `[]` |

## 🎯 Usage

1. Configure your workspace settings (see above)
2. Open a TypeScript/TSX file
3. Write code like: `fetch("/api/users")`
4. Hover over the API path to see the request body type definition

### Example

```typescript
// In your component
const handleSubmit = async (userData: UserCreateInput) => {
  const response = await fetch("/api/users", {  // <- Hover here!
    method: "POST",
    body: JSON.stringify(userData)
  });
};
```

When you hover over `"/api/users"`, you'll see:

```typescript
interface UserCreateInput {
  name: string;
  email: string;
  age?: number;
}
```

## 📁 Project Structure

Your project should follow this structure:

```
your-project/
├── app/
│   └── api/
│       └── users/
│           └── route.ts        # API route file
├── lib/
│   └── types/
│       └── UserCreateInput.ts  # Type definitions
└── .vscode/
    └── settings.json           # TypeView configuration
```

### API Route Example (`app/api/users/route.ts`)

```typescript
import { UserCreateInput } from '@/lib/types/UserCreateInput';

export async function POST(req: Request) {
  const body: UserCreateInput = await req.json();  // <- TypeView detects this pattern
  
  // Your API logic here
  return Response.json({ success: true });
}
```

## 🚧 Preview Version Notice

This is a **preview version** of TypeView. We're actively seeking feedback to improve the extension.

### Known Limitations

- Currently supports only `const body: Type = await req.json()` pattern
- Only Next.js App Router is supported
- Limited to `.ts` and `.tsx` file extensions

### Planned Features

- Zero Configuration support
- Support for type assertions (`as Type`)
- Support for server-side type transformation libraries like Zod
- Support for HTTP request libraries other than fetch (e.g., Axios)
- Support for other frameworks like Hono
- More flexible code pattern recognition
- Better error handling and diagnostics

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