// src/test/collectImportStatements.test.ts
import * as assert from "assert";
import * as ts from "typescript";
import { collectImportStatements } from "../utils/ast-utils/collectImportStatements";

suite("collectImportStatements Tests", () => {
  function createSourceFile(code: string): ts.SourceFile {
    return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
  }

  function getFirstImportNode(sourceFile: ts.SourceFile): ts.Node {
    let importNode: ts.Node | undefined;
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node) && !importNode) {
        importNode = node;
      }
    });
    return importNode!;
  }

  test("Named imports - single import", () => {
    const code = `import { UserType } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 1);
    assert.strictEqual(importMap.get("UserType"), "@/lib/types");
  });

  test("Named imports - multiple imports", () => {
    const code = `import { UserType, PostType, CommentType } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 3);
    assert.strictEqual(importMap.get("UserType"), "@/lib/types");
    assert.strictEqual(importMap.get("PostType"), "@/lib/types");
    assert.strictEqual(importMap.get("CommentType"), "@/lib/types");
  });

  test("Default import", () => {
    const code = `import UserType from "@/lib/user";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 1);
    assert.strictEqual(importMap.get("UserType"), "@/lib/user");
  });

  test("Mixed import (default + named)", () => {
    const code = `import DefaultType, { NamedType1, NamedType2 } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 3);
    assert.strictEqual(importMap.get("DefaultType"), "@/lib/types");
    assert.strictEqual(importMap.get("NamedType1"), "@/lib/types");
    assert.strictEqual(importMap.get("NamedType2"), "@/lib/types");
  });

  test("Relative import paths", () => {
    const code = `import { LocalType } from "./local-types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 1);
    assert.strictEqual(importMap.get("LocalType"), "./local-types");
  });

  test("Non-import node - should not affect map", () => {
    const code = `const variable = "test";`;
    const sourceFile = createSourceFile(code);
    const importMap = new Map<string, string>();

    // Get a variable statement instead of import
    let nonImportNode: ts.Node | undefined;
    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isImportDeclaration(node)) {
        nonImportNode = node;
      }
    });

    collectImportStatements(nonImportNode!, sourceFile, importMap);

    assert.strictEqual(importMap.size, 0);
  });

  test("Import without clause - should throw error", () => {
    const code = `import "@/side-effects";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    assert.throws(() => {
      collectImportStatements(importNode, sourceFile, importMap);
    }, /Import statement without import clause found/);
  });

  test("Namespace import - should throw error", () => {
    const code = `import * as Types from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    assert.throws(() => {
      collectImportStatements(importNode, sourceFile, importMap);
    }, /Import statement with unsupported import clause found/);
  });

  test("Update existing map - should not overwrite", () => {
    const code = `import { NewType } from "@/lib/new";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    // Pre-populate map
    importMap.set("ExistingType", "@/lib/existing");

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 2);
    assert.strictEqual(importMap.get("ExistingType"), "@/lib/existing");
    assert.strictEqual(importMap.get("NewType"), "@/lib/new");
  });

  // 既存のテストケースの後に追加

  test("Named imports with aliases", () => {
    const code = `import { UserType as User, PostType as Post } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 2);
    assert.strictEqual(importMap.get("User"), "@/lib/types");
    assert.strictEqual(importMap.get("Post"), "@/lib/types");
  });

  test("Mixed import with aliases", () => {
    const code = `import DefaultType, { NamedType as Aliased, RegularType } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 3);
    assert.strictEqual(importMap.get("DefaultType"), "@/lib/types");
    assert.strictEqual(importMap.get("Aliased"), "@/lib/types");
    assert.strictEqual(importMap.get("RegularType"), "@/lib/types");
  });

  test("Multi-line import - standard formatting", () => {
    const code = `import {
      UserType,
      PostType,
      CommentType
    } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 3);
    assert.strictEqual(importMap.get("UserType"), "@/lib/types");
    assert.strictEqual(importMap.get("PostType"), "@/lib/types");
    assert.strictEqual(importMap.get("CommentType"), "@/lib/types");
  });

  test("Multi-line import with aliases", () => {
    const code = `import {
      UserType as User,
      PostType as Post,
      CommentType
    } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 3);
    assert.strictEqual(importMap.get("User"), "@/lib/types");
    assert.strictEqual(importMap.get("Post"), "@/lib/types");
    assert.strictEqual(importMap.get("CommentType"), "@/lib/types");
  });

  test("Multi-line mixed import", () => {
    const code = `import DefaultType, {
      NamedType1 as Alias1,
      NamedType2,
      NamedType3 as Alias3
    } from "@/lib/types";`;
    const sourceFile = createSourceFile(code);
    const importNode = getFirstImportNode(sourceFile);
    const importMap = new Map<string, string>();

    collectImportStatements(importNode, sourceFile, importMap);

    assert.strictEqual(importMap.size, 4);
    assert.strictEqual(importMap.get("DefaultType"), "@/lib/types");
    assert.strictEqual(importMap.get("Alias1"), "@/lib/types");
    assert.strictEqual(importMap.get("NamedType2"), "@/lib/types");
    assert.strictEqual(importMap.get("Alias3"), "@/lib/types");
  });
});
