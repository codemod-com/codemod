use console::style;
use indicatif::{MultiProgress, ProgressBar, ProgressState, ProgressStyle};
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::time::Instant;

type ProgressBarFn = Box<dyn Fn() -> Pin<Box<dyn Future<Output = ()> + Send>> + Send + Sync>;
type StepProgressBar = Arc<
    Box<
        dyn Fn(String, String, u64, u64, ProgressBarFn) -> Pin<Box<dyn Future<Output = ()> + Send>>
            + Send
            + Sync,
    >,
>;

pub fn download_progress_bar() -> Arc<Box<dyn Fn(u64, u64) + Send + Sync>> {
    let progress_bar = Arc::new(Mutex::new(None::<ProgressBar>));
    let progress_bar_clone = Arc::clone(&progress_bar);

    Arc::new(Box::new(move |downloaded: u64, total: u64| {
        let mut pb_guard = progress_bar_clone.lock().unwrap();
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

pub fn step_by_step_progress_bar() -> StepProgressBar {
    let started = Instant::now();
    let spinner_style = ProgressStyle::with_template("{prefix:.bold.dim} {spinner} {wide_msg}")
        .unwrap()
        .tick_chars("⠁⠂⠄⡀⢀⠠⠐⠈ ");

    let m = Arc::new(MultiProgress::new());
    let bars = Arc::new(Mutex::new(HashMap::new()));

    Arc::new(Box::new(
        move |id: String, current_file: String, count: u64, index: u64, task_fn: ProgressBarFn| {
            let bars = Arc::clone(&bars);
            let m = Arc::clone(&m);
            let started = started;
            let id_clone = id.clone();
            let spinner_style = spinner_style.clone();
            Box::pin(async move {
                // Use atomic check-and-insert to prevent race condition
                let _pb_created = {
                    let mut bars_lock = bars.lock().unwrap();
                    if !bars_lock.contains_key(&id_clone) {
                        let pb = m.add(ProgressBar::new(count));
                        pb.set_prefix(id_clone.clone());
                        pb.set_style(spinner_style);
                        bars_lock.insert(id_clone.clone(), (pb, count));
                        true
                    } else {
                        false
                    }
                };

                let (maybe_pb, total_count) = {
                    let mut bars_lock = bars.lock().unwrap();
                    match bars_lock.get_mut(&id_clone) {
                        Some((pb, count)) => (Some(pb.clone()), *count),
                        None => (None, 0),
                    }
                };

                if let Some(pb) = maybe_pb {
                    pb.set_message(format!(
                        "scanning [{index}/{total_count}] {}",
                        style(current_file.clone()).green()
                    ));

                    let _ = task_fn().await;

                    pb.inc(1);

                    // Only finish and remove when all tasks for this ID are complete
                    let should_finish = {
                        let bars_lock = bars.lock().unwrap();
                        if let Some((pb_ref, _)) = bars_lock.get(&id_clone) {
                            let current_pos = pb_ref.position();
                            current_pos >= total_count
                        } else {
                            false
                        }
                    };

                    if should_finish {
                        pb.finish_with_message("✅ finished");
                        bars.lock().unwrap().remove(&id_clone);

                        // Only print "Done" when ALL progress bars are finished
                        if bars.lock().unwrap().is_empty() {
                            let seconds = started.elapsed().as_millis() as f64 / 1000.0;
                            println!("✨ Done in {seconds:.3}s");
                        }
                    }
                }
            })
        },
    ))
}
