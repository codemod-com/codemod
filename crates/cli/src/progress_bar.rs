use console::style;
use indicatif::{MultiProgress, ProgressBar, ProgressState, ProgressStyle};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Instant;

pub type ProgressCallback =
    Arc<dyn Fn(&str, &str, &str, Option<&u64>, &u64) + Send + Sync + 'static>;

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

pub enum ActionType {
    SetText,
    Next,
}

pub struct MultiProgressProgressBarCallback {
    pub id: String,
    pub current_file: String,
    pub count: Option<u64>,
    pub index: u64,
    pub action_type: ActionType,
}

pub type MultiProgressProgressBar =
    Arc<Box<dyn Fn(MultiProgressProgressBarCallback) + Send + Sync + 'static>>;

pub fn progress_bar_for_multi_progress() -> (MultiProgressProgressBar, Instant) {
    let started = Instant::now();
    let spinner_style = ProgressStyle::with_template("{prefix:.bold.dim} {spinner} {wide_msg}")
        .unwrap()
        .tick_chars("⠁⠂⠄⡀⢀⠠⠐⠈ ");

    let m = Arc::new(MultiProgress::new());
    let bars = Arc::new(Mutex::new(HashMap::new()));

    // Enable auto-refresh for the MultiProgress
    m.set_draw_target(indicatif::ProgressDrawTarget::stderr());

    (
        Arc::new(Box::new(
            move |properties: MultiProgressProgressBarCallback| {
                let bars = Arc::clone(&bars);
                let m = Arc::clone(&m);
                let id_clone = properties.id.clone();
                let spinner_style = spinner_style.clone();
                // Use atomic check-and-insert to prevent race condition
                let _pb_created = {
                    let mut bars_lock = bars.lock().unwrap();
                    if !bars_lock.contains_key(&id_clone) {
                        let pb = m.add(ProgressBar::new(properties.count.unwrap_or(0)));
                        pb.set_prefix(id_clone.clone());
                        pb.set_style(spinner_style);
                        bars_lock.insert(id_clone.clone(), (pb, properties.count));
                        true
                    } else {
                        false
                    }
                };

                let (maybe_pb, total_count) = {
                    let mut bars_lock = bars.lock().unwrap();
                    match bars_lock.get_mut(&id_clone) {
                        Some((pb, count)) => (Some(pb.clone()), *count),
                        None => (None, None),
                    }
                };

                if let Some(pb) = maybe_pb {
                    match properties.action_type {
                        ActionType::SetText => {
                            pb.set_message(format!(
                                "scanning [{}/{}] {}",
                                properties.index,
                                if properties.count.is_some() {
                                    properties.count.unwrap().to_string()
                                } else {
                                    "?".to_string()
                                },
                                style(properties.current_file.clone()).green()
                            ));
                            pb.tick(); // Force a redraw
                        }
                        ActionType::Next => {
                            pb.inc(1);
                            pb.tick(); // Force a redraw
                        }
                    }

                    // Only finish and remove when all tasks for this ID are complete
                    let should_finish = {
                        let bars_lock = bars.lock().unwrap();
                        if let Some((pb_ref, _)) = bars_lock.get(&id_clone) {
                            let current_pos = pb_ref.position();
                            if let Some(count) = total_count {
                                current_pos >= count
                            } else {
                                false
                            }
                        } else {
                            false
                        }
                    };

                    if should_finish {
                        pb.finish_with_message("✅ finished");
                        bars.lock().unwrap().remove(&id_clone);
                    }
                }
            },
        )),
        started,
    )
}
