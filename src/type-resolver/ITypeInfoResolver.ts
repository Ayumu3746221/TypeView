import { HoverContentSource } from "../hover/IHoverContentGenerator";

/**
 * Interface for resolving type information from API URIs
 */
export interface ITypeInfoResolver {
  /**
   * Resolve type information from API URI
   * @param uri The API URI to resolve type information for
   * @returns Type information or undefined if not found
   */
  resolveTypeInfo(uri: string): Promise<HoverContentSource | undefined>;
}
