use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Settings,
};
use std::error::Error;

pub fn type_text(text: &str) -> Result<(), Box<dyn Error>> {
    let mut enigo = Enigo::new(&Settings::default())?;

    for c in text.chars() {
        enigo.key(Key::Unicode(c), Click)?;
    }

    Ok(())
}

pub fn press_enter() -> Result<(), Box<dyn Error>> {
    let mut enigo = Enigo::new(&Settings::default())?;
    enigo.key(Key::Return, Click)?;
    Ok(())
}

pub fn paste_from_clipboard() -> Result<(), Box<dyn Error>> {
    let mut enigo = Enigo::new(&Settings::default())?;

    // Ctrl+V to paste
    enigo.key(Key::Control, Press)?;
    enigo.key(Key::Unicode('v'), Click)?;
    enigo.key(Key::Control, Release)?;

    Ok(())
}

pub fn copy_to_clipboard(text: &str) -> Result<(), Box<dyn Error + Send + Sync>> {
    let mut clipboard = arboard::Clipboard::new()?;
    clipboard.set_text(text)?;
    log::info!("Text copied to clipboard: {} chars", text.len());
    Ok(())
}

pub fn paste_and_send(text: &str) -> Result<(), Box<dyn Error + Send + Sync>> {
    // First copy to clipboard
    copy_to_clipboard(text)?;

    // Small delay to ensure clipboard is ready
    std::thread::sleep(std::time::Duration::from_millis(100));

    // Then paste with Ctrl+V
    let mut enigo = Enigo::new(&Settings::default())?;
    enigo.key(Key::Control, Press)?;
    enigo.key(Key::Unicode('v'), Click)?;
    enigo.key(Key::Control, Release)?;

    // Small delay before pressing enter
    std::thread::sleep(std::time::Duration::from_millis(100));

    // Press Enter to send
    enigo.key(Key::Return, Click)?;

    log::info!("Text pasted and sent");
    Ok(())
}

pub fn type_text_with_delay(text: &str, delay_ms: u64) -> Result<(), Box<dyn Error>> {
    let mut enigo = Enigo::new(&Settings::default())?;

    for c in text.chars() {
        enigo.key(Key::Unicode(c), Click)?;
        std::thread::sleep(std::time::Duration::from_millis(delay_ms));
    }

    Ok(())
}
