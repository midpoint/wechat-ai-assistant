use serde::Deserialize;
use std::error::Error;

#[derive(Debug, Deserialize)]
struct AnthropicResponse {
    content: Vec<ResponseContent>,
}

#[derive(Debug, Deserialize)]
struct ResponseContent {
    #[serde(rename = "type")]
    type_: String,
    text: Option<String>,
}

pub async fn analyze_image(
    image_base64: &str,
    prompt: &str,
    api_key: &str,
    model: &str,
    base_url: &str,
) -> Result<String, Box<dyn Error + Send + Sync>> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()?;

    let url = format!("{}/v1/messages", base_url.trim_end_matches('/'));
    log::info!("Calling API: {}", url);

    // Build message content
    let content = if !image_base64.is_empty() && image_base64 != "\"\"" {
        // With image
        let image_data = if image_base64.starts_with("data:") {
            image_base64.split(',').nth(1).unwrap_or(image_base64)
        } else {
            image_base64
        };

        serde_json::json!([
            {"type": "text", "text": prompt},
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}}
        ])
    } else {
        // Text only
        serde_json::json!([
            {"type": "text", "text": prompt}
        ])
    };

    let request_body = serde_json::json!({
        "model": model,
        "messages": [{"role": "user", "content": content}],
        "max_tokens": 1024
    });

    let response = client
        .post(&url)
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    let status = response.status();
    let response_text = response.text().await?;

    log::info!("API response status: {}", status);

    if !status.is_success() {
        return Err(format!("API error ({}): {}", status, response_text).into());
    }

    let resp: AnthropicResponse = serde_json::from_str(&response_text)
        .map_err(|e| format!("Parse error: {} - {}", e, response_text))?;

    let text = resp
        .content
        .iter()
        .find(|c| c.type_ == "text")
        .and_then(|c| c.text.clone())
        .ok_or("No text in response")?;

    Ok(text)
}
