use image::{Rgba, RgbaImage};
use ab_glyph::{FontRef, PxScale, ScaleFont};

pub fn generate_tray_icon(_down: &str, _up: &str) -> Vec<u8> {
    // Placeholder implementation for Task 1
    let mut img = RgbaImage::new(32, 32);
    for pixel in img.pixels_mut() {
        *pixel = Rgba([255, 0, 0, 255]); // Red placeholder
    }
    img.into_raw()
}
