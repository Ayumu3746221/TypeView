import * as assert from "assert";
import * as ts from "typescript";
import {
  findLocalTypeDefinition,
  findLocalTypeAlias,
  findLocalInterface,
  findAnyLocalTypeDefinition,
} from "../parser/local-type-searcher";

suite("Local Type Searcher Tests", () => {
  function createSourceFile(code: string): ts.SourceFile {
    return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
  }

  suite("findLocalInterface", () => {
    test("should find interface in same file", () => {
      const code = `
interface UserType {
  name: string;
  email: string;
}

export async function POST(req: Request) {
  const body: UserType = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findLocalInterface(sourceFile, "UserType");

      assert.ok(result);
      assert.ok(result.includes("interface UserType"));
      assert.ok(result.includes("name: string"));
      assert.ok(result.includes("email: string"));
    });

    test("should return undefined when interface not found", () => {
      const code = `
export async function POST(req: Request) {
  const body: ExternalType = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findLocalInterface(sourceFile, "UserType");

      assert.strictEqual(result, undefined);
    });
  });

  suite("findLocalTypeAlias", () => {
    test("should find type alias in same file", () => {
      const code = `
type CreateUserRequest = {
  name: string;
  age?: number;
};

export async function POST(req: Request) {
  const body: CreateUserRequest = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findLocalTypeAlias(sourceFile, "CreateUserRequest");

      assert.ok(result);
      assert.ok(result.includes("type CreateUserRequest"));
      assert.ok(result.includes("name: string"));
      assert.ok(result.includes("age?: number"));
    });

    test("should find union type alias", () => {
      const code = `
type Status = "pending" | "approved" | "rejected";

export async function POST(req: Request) {
  const body: { status: Status } = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findLocalTypeAlias(sourceFile, "Status");

      assert.ok(result);
      assert.ok(result.includes("type Status"));
      assert.ok(result.includes('"pending"'));
      assert.ok(result.includes('"approved"'));
      assert.ok(result.includes('"rejected"'));
    });
  });

  suite("findAnyLocalTypeDefinition", () => {
    test("should find interface using comprehensive search", () => {
      const code = `
interface UserType {
  id: number;
  name: string;
}

export async function POST(req: Request) {
  const body: UserType = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findAnyLocalTypeDefinition(sourceFile, "UserType");

      assert.ok(result);
      assert.ok(result.includes("interface UserType"));
    });

    test("should find type alias using comprehensive search", () => {
      const code = `
type ApiResponse<T> = {
  data: T;
  success: boolean;
};

export async function POST(req: Request) {
  const body: ApiResponse<string> = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findAnyLocalTypeDefinition(sourceFile, "ApiResponse");

      assert.ok(result);
      assert.ok(result.includes("type ApiResponse"));
    });

    test("should return undefined when type not found", () => {
      const code = `
export async function POST(req: Request) {
  const body: ExternalType = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findAnyLocalTypeDefinition(sourceFile, "ExternalType");

      assert.strictEqual(result, undefined);
    });

    test("should handle nested type definitions", () => {
      const code = `
namespace API {
  export interface UserRequest {
    username: string;
    password: string;
  }
}

export async function POST(req: Request) {
  const body: API.UserRequest = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findAnyLocalTypeDefinition(sourceFile, "UserRequest");

      assert.ok(result);
      assert.ok(result.includes("interface UserRequest"));
    });

    test("should handle exported type definitions", () => {
      const code = `
export interface PublicUserType {
  id: string;
  displayName: string;
}

type PrivateUserType = {
  id: string;
  internalId: number;
}

export async function POST(req: Request) {
  const body: PublicUserType = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const publicResult = findAnyLocalTypeDefinition(
        sourceFile,
        "PublicUserType"
      );
      const privateResult = findAnyLocalTypeDefinition(
        sourceFile,
        "PrivateUserType"
      );

      assert.ok(publicResult);
      assert.ok(publicResult.includes("export interface PublicUserType"));

      assert.ok(privateResult);
      assert.ok(privateResult.includes("type PrivateUserType"));
    });
  });

  suite("Edge cases", () => {
    test("should handle comments in type definitions", () => {
      const code = `
/**
 * User registration request
 */
interface RegisterRequest {
  // User's email address
  email: string;
  /* Password must be at least 8 characters */
  password: string;
}

export async function POST(req: Request) {
  const body: RegisterRequest = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findAnyLocalTypeDefinition(sourceFile, "RegisterRequest");

      assert.ok(result);
      assert.ok(result.includes("User registration request"));
      assert.ok(result.includes("email: string"));
      assert.ok(result.includes("password: string"));
    });

    test("should handle generic type definitions", () => {
      const code = `
interface ApiRequest<T> {
  data: T;
  timestamp: number;
}

export async function POST(req: Request) {
  const body: ApiRequest<string> = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(code);
      const result = findAnyLocalTypeDefinition(sourceFile, "ApiRequest");

      assert.ok(result);
      assert.ok(result.includes("interface ApiRequest<T>"));
      assert.ok(result.includes("data: T"));
    });
  });
});
