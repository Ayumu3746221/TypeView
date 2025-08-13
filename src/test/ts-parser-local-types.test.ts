import * as assert from "assert";
import * as ts from "typescript";
import { findAnyLocalTypeDefinition } from "../parser/local-type-searcher";

suite("ts-parser Phase 2: Local Type Integration Tests", () => {
  function createSourceFile(code: string): ts.SourceFile {
    return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
  }

  suite("Integration with findAnyLocalTypeDefinition", () => {
    test("should find local interface definition", () => {
      const routeCode = `
interface UserRegistration {
  name: string;
  email: string;
  age?: number;
}

export async function POST(req: Request) {
  const body: UserRegistration = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);
      const result = findAnyLocalTypeDefinition(sourceFile, "UserRegistration");

      assert.ok(result);
      assert.ok(result.includes("interface UserRegistration"));
      assert.ok(result.includes("name: string"));
      assert.ok(result.includes("email: string"));
      assert.ok(result.includes("age?: number"));
    });

    test("should find local type alias definition", () => {
      const routeCode = `
type CreateUserRequest = {
  username: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
  };
};

export async function POST(req: Request) {
  const body: CreateUserRequest = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);
      const result = findAnyLocalTypeDefinition(
        sourceFile,
        "CreateUserRequest"
      );

      assert.ok(result);
      assert.ok(result.includes("type CreateUserRequest"));
      assert.ok(result.includes("username: string"));
      assert.ok(result.includes("profile:"));
      assert.ok(result.includes("firstName: string"));
    });

    test("should handle Zod schema with local definition", () => {
      const routeCode = `
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = UserSchema.parse(await req.json());
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);
      const result = findAnyLocalTypeDefinition(sourceFile, "UserSchema");

      assert.ok(result);
      assert.ok(result.includes("UserSchema"));
      assert.ok(result.includes("z.object"));
      assert.ok(result.includes("z.string()"));
      assert.ok(result.includes("z.number().optional()"));
    });

    test("should return undefined when type not found", () => {
      const routeCode = `
interface SomeOtherType {
  field: string;
}

export async function POST(req: Request) {
  const body: UnknownType = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);
      const result = findAnyLocalTypeDefinition(sourceFile, "UnknownType");

      assert.strictEqual(result, undefined);
    });

    test("should handle JSDoc comments in local types", () => {
      const routeCode = `
/**
 * User registration request payload
 * @example { name: "John", email: "john@example.com" }
 */
interface RegistrationRequest {
  /** User's full name */
  name: string;
  /** User's email address */
  email: string;
}

export async function POST(req: Request) {
  const body: RegistrationRequest = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);
      const result = findAnyLocalTypeDefinition(
        sourceFile,
        "RegistrationRequest"
      );

      assert.ok(result);
      assert.ok(result.includes("User registration request payload"));
      assert.ok(result.includes("User's full name"));
      assert.ok(result.includes("User's email address"));
      assert.ok(result.includes("interface RegistrationRequest"));
    });

    test("should handle complex nested types", () => {
      const routeCode = `
interface RequestMetadata {
  timestamp: number;
  clientId: string;
}

type UserInput = {
  name: string;
  metadata: RequestMetadata;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
};

export async function POST(req: Request) {
  const body: UserInput = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);

      // Test finding the main type
      const userInputResult = findAnyLocalTypeDefinition(
        sourceFile,
        "UserInput"
      );
      assert.ok(userInputResult);
      assert.ok(userInputResult.includes("type UserInput"));
      assert.ok(userInputResult.includes("metadata: RequestMetadata"));
      assert.ok(userInputResult.includes("preferences:"));

      // Test finding the nested interface
      const metadataResult = findAnyLocalTypeDefinition(
        sourceFile,
        "RequestMetadata"
      );
      assert.ok(metadataResult);
      assert.ok(metadataResult.includes("interface RequestMetadata"));
      assert.ok(metadataResult.includes("timestamp: number"));
      assert.ok(metadataResult.includes("clientId: string"));
    });

    test("should handle exported types", () => {
      const routeCode = `
export interface PublicAPI {
  version: string;
  endpoints: string[];
}

export type StatusResponse = {
  status: "ok" | "error";
  message?: string;
};

export async function POST(req: Request) {
  const body: StatusResponse = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);

      const statusResult = findAnyLocalTypeDefinition(
        sourceFile,
        "StatusResponse"
      );
      assert.ok(statusResult);
      assert.ok(statusResult.includes("export type StatusResponse"));
      assert.ok(statusResult.includes('"ok" | "error"'));

      const publicAPIResult = findAnyLocalTypeDefinition(
        sourceFile,
        "PublicAPI"
      );
      assert.ok(publicAPIResult);
      assert.ok(publicAPIResult.includes("export interface PublicAPI"));
      assert.ok(publicAPIResult.includes("version: string"));
    });
  });

  suite("Integration Priority Logic", () => {
    test("should demonstrate import vs local type priority", () => {
      const routeCode = `
// This test demonstrates that when both imported and local types exist,
// our system should prioritize imported types (this is tested in ts-parser.ts)

interface LocalUser {
  localField: string;
}

export async function POST(req: Request) {
  const body: LocalUser = await req.json();
  return Response.json({ success: true });
}`;

      const sourceFile = createSourceFile(routeCode);
      const result = findAnyLocalTypeDefinition(sourceFile, "LocalUser");

      // This confirms the local type can be found
      assert.ok(result);
      assert.ok(result.includes("interface LocalUser"));
      assert.ok(result.includes("localField: string"));
    });
  });
});
