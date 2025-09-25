use crate::exports::betty_blocks::sayhello::sayhello::{Guest, Output};

wit_bindgen::generate!({ generate_all });

struct SayHello;

impl Guest for SayHello {
    fn sayhello(name: String) -> Result<Output, String> {
        if name == "oops" {
            Err("Ooops. Something went wrong.".to_string())
        } else {
            Ok(Output {
                greet: format!("Hello, {}", name),
            })
        }
    }
}

export! {SayHello}
