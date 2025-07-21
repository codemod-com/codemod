use indicatif::{ProgressBar, ProgressState, ProgressStyle};
use std::sync::Arc;

pub fn create_progress_bar() -> Arc<Box<dyn Fn(u64, u64) + Send + Sync>> {
    let progress_bar = Arc::new(std::sync::Mutex::new(None::<ProgressBar>));
    let progress_bar = Arc::clone(&progress_bar);
    Arc::new(Box::new(move |downloaded: u64, total: u64| {
        let mut pb_guard = progress_bar.lock().unwrap();
        if pb_guard.is_none() && total > 0 {
            let pb = ProgressBar::new(total);
            pb.set_style(
                ProgressStyle::with_template(
                    "{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({eta})"
                )
                .unwrap()
                .with_key("eta", |state: &ProgressState, w: &mut dyn std::fmt::Write| {
                    write!(w, "{:.1}s", state.eta().as_secs_f64()).unwrap()
                })
                .progress_chars("#>-")
            );
            *pb_guard = Some(pb);
        }
        if let Some(ref pb) = *pb_guard {
            pb.set_position(downloaded);
            if downloaded >= total {
                pb.finish_with_message("Downloaded successfully");
            }
        }
    }))
}
