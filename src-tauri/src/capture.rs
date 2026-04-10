use base64::Engine;
use screenshots::Screen;
use std::error::Error;

#[derive(Debug, Clone, serde::Serialize)]
pub struct ScreenInfo {
    pub id: u32,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub scale_factor: f32,
    pub is_primary: bool,
}

pub fn get_screens() -> Result<Vec<ScreenInfo>, Box<dyn Error>> {
    let screens = Screen::all()?;
    let result = screens
        .iter()
        .enumerate()
        .map(|(i, s)| ScreenInfo {
            id: i as u32,
            x: s.display_info.x,
            y: s.display_info.y,
            width: s.display_info.width,
            height: s.display_info.height,
            scale_factor: s.display_info.scale_factor,
            is_primary: s.display_info.is_primary,
        })
        .collect();
    Ok(result)
}

pub fn capture_region(x: i32, y: i32, width: u32, height: u32) -> Result<String, Box<dyn Error>> {
    let screens = Screen::all()?;

    // Find the screen that contains the region
    let target_screen = screens
        .iter()
        .find(|s| {
            let sx = s.display_info.x;
            let sy = s.display_info.y;
            let sw = s.display_info.width as i32;
            let sh = s.display_info.height as i32;

            x >= sx && y >= sy && x + width as i32 <= sx + sw && y + height as i32 <= sy + sh
        })
        .or_else(|| screens.iter().find(|s| s.display_info.is_primary))
        .or_else(|| screens.first())
        .ok_or("No screen found")?;

    let image = target_screen.capture_area(x, y, width, height)?;
    log::info!("Captured image: {}x{}", image.width(), image.height());

    // Convert to PNG bytes using image crate
    use image::ImageEncoder;
    let mut buffer = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new(&mut buffer);
    encoder.write_image(
        image.as_raw(),
        image.width(),
        image.height(),
        image::ExtendedColorType::Rgba8,
    )?;

    let base64_str = base64::engine::general_purpose::STANDARD.encode(&buffer);
    log::info!("Base64 length: {}", base64_str.len());

    Ok(format!("data:image/png;base64,{}", base64_str))
}

pub fn capture_screen_full(screen_id: u32) -> Result<String, Box<dyn Error>> {
    let screens = Screen::all()?;
    let screen = screens
        .get(screen_id as usize)
        .or_else(|| screens.iter().find(|s| s.display_info.is_primary))
        .or_else(|| screens.first())
        .ok_or("No screen found")?;

    let image = screen.capture()?;

    use image::ImageEncoder;
    let mut buffer = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new(&mut buffer);
    encoder.write_image(
        image.as_raw(),
        image.width(),
        image.height(),
        image::ExtendedColorType::Rgba8,
    )?;

    let base64_str = base64::engine::general_purpose::STANDARD.encode(&buffer);

    Ok(format!("data:image/png;base64,{}", base64_str))
}
