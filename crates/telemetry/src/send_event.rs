use async_trait::async_trait;
use posthog_rs;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct TelemetrySenderOptions {
    pub distinct_id: String,
    pub cloud_role: String,
}

#[derive(Debug, Clone)]
pub struct PartialTelemetrySenderOptions {
    pub distinct_id: Option<String>,
    pub cloud_role: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct BaseEvent {
    pub kind: String,
    #[serde(flatten)]
    pub properties: HashMap<String, String>,
}

#[async_trait]
pub trait TelemetrySender {
    async fn send_event(
        &self,
        event: BaseEvent,
        options_override: Option<PartialTelemetrySenderOptions>,
    );
}

pub struct PostHogSender {
    client: posthog_rs::Client,
    options: TelemetrySenderOptions,
}

impl PostHogSender {
    pub async fn new(options: TelemetrySenderOptions) -> Self {
        let client = posthog_rs::client("phc_nGWKWP3t1fcNFqGi6UdstXjMf0fxx7SBeohHPSS6d2Y").await;
        Self { client, options }
    }
}

#[async_trait]
impl TelemetrySender for PostHogSender {
    async fn send_event(
        &self,
        event: BaseEvent,
        options_override: Option<PartialTelemetrySenderOptions>,
    ) {
        let distinct_id = options_override
            .as_ref()
            .and_then(|o| o.distinct_id.clone())
            .unwrap_or_else(|| self.options.distinct_id.clone());

        let cloud_role = options_override
            .as_ref()
            .and_then(|o| o.cloud_role.clone())
            .unwrap_or_else(|| self.options.cloud_role.clone());

        let mut posthog_event = posthog_rs::Event::new(
            format!("codemod.{}.{}", cloud_role, event.kind),
            distinct_id.clone(),
        );

        for (key, value) in event.properties {
            if let Err(e) = posthog_event.insert_prop(key, value) {
                eprintln!("Failed to insert property into PostHog event: {e}");
            }
        }

        if let Err(e) = self.client.capture(posthog_event).await {
            eprintln!("Failed to send PostHog event: {e}");
        }
    }
}
