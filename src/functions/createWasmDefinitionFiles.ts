import { snakeCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';

const createlibRsFile = (functionDir: string, functionName: string): void => {
  const functionDefName = snakeCase(functionName);
  fs.mkdirpSync(path.join(functionDir, 'src'));
  fs.writeFileSync(
    path.join(functionDir, 'src', 'lib.rs'),
    `use crate::exports::betty_blocks::${functionDefName}::${functionDefName}::{Guest, Output};

wit_bindgen::generate!({ generate_all });

struct Component;

impl Guest for Component {
    fn ${functionDefName}(name: String) -> Result<Output, String> {
        if name == "oops" {
            Err("Ooops. Something went wrong.".to_string())
        } else {
            Ok(Output {
                greet: format!("Hello, {}", name),
            })
        }
    }
}

export! {Component}
    `,
  );
};

const createWorldWitFile = (
  functionDir: string,
  functionName: string,
): void => {
  const lowercasedFunctionName = functionName.toLowerCase();
  fs.mkdirpSync(path.join(functionDir, 'wit'));
  fs.writeFileSync(
    path.join(functionDir, 'wit', 'world.wit'),
    `package betty-blocks:${lowercasedFunctionName}@1.0.0;

interface ${lowercasedFunctionName} {
    record output {
        %greet: string
    }

    ${lowercasedFunctionName}: func(name: string) -> result<output, string>;
}

world main {
    export ${lowercasedFunctionName};
}
    `,
  );
};

const createCargoTomlFile = (
  functionDir: string,
  functionName: string,
): void => {
  const functionDefName = snakeCase(functionName);
  fs.writeFileSync(
    path.join(functionDir, 'Cargo.toml'),
    `[package]
name = "${functionDefName}"
version = "1.0.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
wit-bindgen = "0.42.0"
    `,
  );
};

export { createCargoTomlFile, createlibRsFile, createWorldWitFile };
