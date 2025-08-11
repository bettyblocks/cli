import { explainSync } from 'jsdoc-api';
import {
  type CommentRange,
  factory,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
  type Node,
  type ObjectLiteralElementLike,
  SyntaxKind,
} from 'typescript';

/**
 * Retrieves the JSDoc-style comments associated with a specific AST node.
 *
 * Based on ts.getJSDocCommentRanges() from the compiler.
 * https://github.com/microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L924
 */
const getJSDocCommentRanges = (node: Node, text: string): CommentRange[] => {
  const commentRanges: CommentRange[] = [];
  const {
    Parameter,
    TypeParameter,
    FunctionExpression,
    ArrowFunction,
    ParenthesizedExpression,
  } = SyntaxKind;
  switch (node.kind) {
    case Parameter:
    case TypeParameter:
    case FunctionExpression:
    case ArrowFunction:
    case ParenthesizedExpression:
      commentRanges.push(...(getTrailingCommentRanges(text, node.pos) ?? []));
      break;
    default:
      break;
  }
  commentRanges.push(...(getLeadingCommentRanges(text, node.pos) ?? []));
  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter(
    (comment) =>
      text.charCodeAt(comment.pos + 1) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 2) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */,
  );
};

export const walkCompilerAstAndFindComments = (
  node: Node,
  foundComments: object[],
): void => {
  // The TypeScript AST doesn't store code comments directly.  If you want to find *every* comment,
  // you would need to rescan the SourceFile tokens similar to how tsutils.forEachComment() works:
  // https://github.com/ajafff/tsutils/blob/v3.0.0/util/util.ts#L453
  //
  // However, for this demo we are modeling a tool that discovers declarations and then analyzes their doc comments,
  // so we only care about TSDoc that would conventionally be associated with an interesting AST node.
  const buffer: string = node.getSourceFile().getFullText(); // don't use getText() here!
  // Only consider nodes that are part of a declaration form.  Without this, we could discover
  // the same comment twice (e.g. for a MethodDeclaration and its PublicKeyword).

  // Find "/** */" style comments associated with this node.
  // Note that this reinvokes the compiler's scanner -- the result is not cached.
  const comments: CommentRange[] = getJSDocCommentRanges(node, buffer);

  comments.forEach((c) => {
    const source = buffer.slice(c.pos, c.end);
    const comment = explainSync({ source });
    const [{ name, params, returns }] = comment;

    const parameters = params.reduce(
      (acc: object, cur: { name: string; type: { names: string[] } }) => ({
        ...acc,
        [cur.name]: cur.type.names,
      }),
      {},
    );

    const returnType = returns.reduce(
      (acc: string[], curr: { type: { names: string[] } }) =>
        acc.concat(curr.type.names),
      [],
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const hasComment = foundComments.some((f: object) => Boolean(f[name]));
    if (!hasComment) {
      foundComments.push({ [name]: { parameters, returnType } });
    }
  });
  return node.forEachChild((child) =>
    walkCompilerAstAndFindComments(child, foundComments),
  );
};

const createParams = (params: object): ObjectLiteralElementLike[] => {
  const {
    createArrayLiteralExpression,
    createStringLiteral,
    createObjectLiteralExpression,
    createPropertyAssignment,
  } = factory;
  return Object.entries(params).map(([key, value]) => {
    const result = Array.isArray(value)
      ? createArrayLiteralExpression(value.map((n) => createStringLiteral(n)))
      : createObjectLiteralExpression(createParams(value));
    return createPropertyAssignment(createStringLiteral(key), result);
  });
};

export const createLiteralObjectExpression = (
  params: object[],
): ObjectLiteralElementLike[] => {
  const {
    createStringLiteral,
    createObjectLiteralExpression,
    createPropertyAssignment,
  } = factory;
  return params.map((param) => {
    const [[key, value]] = Object.entries(param);
    return createPropertyAssignment(
      createStringLiteral(key),
      createObjectLiteralExpression(createParams(value)),
    );
  });
};
