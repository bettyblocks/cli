import {
  CustomTransformerFactory,
  JsxEmit,
  ScriptTarget,
  SourceFile,
  TransformerFactory,
  transpileModule,
} from 'typescript';

import { ComponentDeclaration } from '../declarations';

import defineFunction from './defineFunction';
import triggerEvent from './triggerEvent';
import { ComponentInteraction } from '../../repo';

import { assembleTransformers } from './common';

const PROPS = '__SECRET_PROPS_DO_NOT_USE';
const ID = '__SECRET_ID_DO_NOT_USE';

const { React } = JsxEmit;
const { ES5 } = ScriptTarget;

export const transpile = (
  code: string,
  before: (TransformerFactory<SourceFile> | CustomTransformerFactory)[],
): string => {
  const { diagnostics, outputText } = transpileModule(code, {
    compilerOptions: {
      allowJs: true,
      checkJs: true,
      downlevelIteration: true,
      jsx: React,
      // Requires tslib
      noEmitHelpers: true,
      target: ES5,
    },
    reportDiagnostics: true,
    transformers: {
      before,
    },
  });

  const firstDiagnostic = diagnostics[0];

  const messageText = firstDiagnostic.messageText || '';

  if (messageText) {
    throw new Error(messageText as string);
  }

  return outputText;
};

// @FIXME: This is just to make sure the tests don't break (defineFunction and eventHanlders)
export const doTranspile = (
  code: string,
  sourceInteractions: ComponentInteraction[],
): string =>
  transpile(code, [
    defineFunction(),
    triggerEvent(),
    ...assembleTransformers(sourceInteractions),
  ]);

export const formatCode = (code: string): string =>
  code.startsWith('(function') ? code : `(function () {\n${code}})()`;

export const compose = ({
  jsx,
  styles,
  interactions,
}: ComponentDeclaration): string => {
  return `
  return (function() {
    const styles = ${styles}
    const useStyles = createUseStyles(styles(global));
  
    return ${PROPS} => {
      const { ${ID} } = ${PROPS};
      const [options, setOptions] = React.useState(${PROPS}.options);
      const classes = useStyles({...${PROPS}, options});
  
      const useContext = React.useContext;
      const useCallback = React.useCallback;
      const useEffect = React.useEffect;
      const useState = React.useState;
      const useReducer = React.useReducer;
      const useRef = React.useRef;
  
      const { useParams, useLocation, useHistory } = ReactRouterDOM;
  
      const useRouter = () => {
        const message = [
          'Deprecation warning:',
          'The *useRouter* hook is deprecated and will be removed in the near future.',
          'Please use useParam, useLocation or useHistory.'
        ];
  
        console.warn(message.join(' '));
  
        const history = useHistory();
        const location = useLocation();
        const params = useParams();
  
        return {
          history,
          location,
          params
        }
      };
  
      const {
        children = null,
        index,
        parent = {},
      } = ${PROPS};
  
      const updateOptions = opts => {
        setOptions(options => ({...options, ...opts}));
      };
  
      const updateOption = (name, value) => {
        updateOptions({[name]: value});
      };
  
      const useOptions = opts => {
        return [{...options, ...opts}, updateOptions];
      }
  
  
      const B = {
        ...global,
        defineFunction,
        triggerEvent,
        updateOption,
      };
  
      const globalEventEmitter = B.useGlobalEventEmitter();
      ${interactions}
  
  
      return React.cloneElement(${jsx});
    };
  })()
    `;
};

const compileDeclaration = (declaration: ComponentDeclaration): string => {
  const { name, sourceInteractions } = declaration;
  const code = doTranspile(compose(declaration), sourceInteractions);

  return `var ${name} = ${formatCode(code)}`;
};
