fn main() {
    let api_key = std::env::var("POSTHOG_API_KEY").unwrap_or_else(|_| "".to_string());
    println!("cargo:rustc-env=POSTHOG_API_KEY={api_key}");
}
