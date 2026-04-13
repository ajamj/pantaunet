use image::{Rgba, RgbaImage};
use ab_glyph::{FontRef, PxScale, ScaleFont, Font, point};

const FONT_DATA: &[u8] = include_bytes!("../assets/fonts/Silkscreen-Regular.ttf");

pub fn generate_tray_icon(down: &str, up: &str) -> Vec<u8> {
    let mut img = RgbaImage::new(32, 32);
    let font = FontRef::try_from_slice(FONT_DATA).expect("Error loading font");

    // Scale 8.0 or 10.0 might be better for 32x32
    let scale = PxScale::from(8.0);
    let scaled_font = font.as_scaled(scale);

    // Draw Download speed (top)
    draw_text(&mut img, &scaled_font, 1, 10, down, Rgba([0, 255, 0, 255])); 

    // Draw Upload speed (bottom)
    draw_text(&mut img, &scaled_font, 1, 22, up, Rgba([0, 191, 255, 255])); 

    img.into_raw()
}

fn draw_text<F, T>(img: &mut RgbaImage, font: &F, x: i32, y: i32, text: &str, color: Rgba<u8>)
where
    F: ScaleFont<T>,
    T: Font,
{
    let mut caret = point(x as f32, y as f32);
    for c in text.chars() {
        let glyph = font.scaled_glyph(c);
        let glyph_id = glyph.id;
        if let Some(outline) = font.outline_glyph(glyph) {
            let bounds = outline.px_bounds();
            outline.draw(|x, y, v| {
                let px = (bounds.min.x + x as f32) as u32;
                let py = (bounds.min.y + y as f32) as u32;
                if px < img.width() && py < img.height() {
                    let pixel = img.get_pixel_mut(px, py);
                    // Simple blend
                    let alpha = (v * 255.0) as u8;
                    if alpha > pixel.0[3] {
                        *pixel = color;
                        pixel.0[3] = alpha;
                    }
                }
            });
        }
        caret.x += font.h_advance(glyph_id);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_tray_icon_size() {
        let buffer = generate_tray_icon("1.2M", "0.5M");
        assert_eq!(buffer.len(), 32 * 32 * 4);
    }

    #[test]
    fn test_generate_tray_icon_not_empty() {
        let buffer = generate_tray_icon("1.2M", "0.5M");
        // Check if there is at least some non-transparent pixel
        let has_content = buffer.iter().skip(3).step_by(4).any(|&a| a > 0);
        assert!(has_content, "Generated icon should not be fully transparent");
    }
}
