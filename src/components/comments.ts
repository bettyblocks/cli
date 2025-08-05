/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import * as ts from 'typescript';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as jsdoc from 'jsdoc-api';

/**
 * Retrieves the JSDoc-style comments associated with a specific AST node.
 *
 * Based on ts.getJSDocCommentRanges() from the compiler.
 * https://github.com/microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L924
 */
function getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
  const commentRanges: ts.CommentRange[] = [];
  switch (node.kind) {
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.TypeParameter:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.ParenthesizedExpression:
      commentRanges.push(
        ...(ts.getTrailingCommentRanges(text, node.pos) || []),
      );
      break;
    default:
      break;
  }
  commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));
  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter(
    (comment) =>
      text.charCodeAt(comment.pos + 1) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 2) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */,
  );
}
export function walkCompilerAstAndFindComments(
  node: ts.Node,
  foundComments: object[],
): void {
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
  const comments: ts.CommentRange[] = getJSDocCommentRanges(node, buffer);

  comments.forEach((c) => {
    const source = buffer.slice(c.pos, c.end);
    const comment = jsdoc.explainSync({ source });
    const [{ name, params, returns }] = comment;

    const parameters = params.reduce(
      (acc: object, cur: { name: string; type: { names: string[] } }) => ({
        ...acc,
        [cur.name]: cur.type.names,
      }),
      {},
    );

    const returnType = returns.reduce(
      (acc: string[], curr: { type: { names: string[] } }) => {
        return acc.concat(curr.type.names);
      },
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
}

function createParams(params: object): ts.ObjectLiteralElementLike[] {
  return Object.entries(params).map(([key, value]) => {
    const result = Array.isArray(value)
      ? ts.factory.createArrayLiteralExpression(
          value.map((n) => ts.factory.createStringLiteral(n)),
        )
      : ts.factory.createObjectLiteralExpression(createParams(value));
    return ts.factory.createPropertyAssignment(
      ts.factory.createStringLiteral(key),
      result,
    );
  });
}

export function createLiteralObjectExpression(
  params: object[],
): ts.ObjectLiteralElementLike[] {
  return params.map((param) => {
    const [[key, value]] = Object.entries(param);
    return ts.factory.createPropertyAssignment(
      ts.factory.createStringLiteral(key),
      ts.factory.createObjectLiteralExpression(createParams(value)),
    );
  });
}
