// println! macros will be matched by pattern!
// click diff tab to see rewrite and import addition.

fn main() {
    println!("Starting application");

    let user_id = 42;
    println!("User ID: {}", user_id);

    if let Some(config) = load_config() {
        println!("Config loaded: {:?}", config);
    } else {
        println!("Failed to load config");
    }

    // This is a comment with println!("not matched")
    let debug_msg = "println!(\"also not matched\")";

    match process_data() {
        Ok(result) => {
            println!("Processing completed successfully: {:?}", result);
        }
        Err(e) => {
            println!("Error processing data: {}", e);
        }
    }
}

fn load_config() -> Option<String> {
    Some("config".to_string())
}

fn process_data() -> Result<String, String> {
    Ok("data".to_string())
}
