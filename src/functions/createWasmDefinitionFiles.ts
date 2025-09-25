import fs from 'fs-extra';
import path from 'path';

const createlibRsFile = (
  functionDir: string,
  functionDefName: string,
): void => {
  fs.mkdirpSync(path.join(functionDir, 'src'));
  fs.writeFileSync(
    path.join(functionDir, 'src', 'lib.rs'),
    `
    use crate::exports::betty_blocks::${functionDefName}::${functionDefName}::{Guest, Output};

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
  functionDefName: string,
): void => {
  fs.mkdirpSync(path.join(functionDir, 'wit'));
  fs.writeFileSync(
    path.join(functionDir, 'wit', 'world.wit'),
    `
    package betty-blocks:${functionDefName}@1.0.0;

    interface ${functionDefName} {
        record output {
            %greet: string
        }

        ${functionDefName}: func(name: string) -> result<output, string>;
    }

    world main {
        export ${functionDefName};
    }
    `,
  );
};

const createCargoTomlFile = (
  functionDir: string,
  functionDefName: string,
): void => {
  fs.writeFileSync(
    path.join(functionDir, 'Cargo.toml'),
    `
    [package]
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
