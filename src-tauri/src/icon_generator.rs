use image::{Rgba, RgbaImage};
use ab_glyph::{FontRef, PxScale, ScaleFont, Font, point};

const FONT_DATA: &[u8] = include_bytes!("../assets/fonts/Silkscreen-Regular.ttf");

pub fn generate_tray_icon(down: u64, up: u64) -> Vec<u8> {
    let mut img = RgbaImage::new(32, 32);
    let font = FontRef::try_from_slice(FONT_DATA).expect("Error loading font");

    // Scale 12.0 for better readability on 32x32
    let scale = PxScale::from(12.0);
    let scaled_font = font.as_scaled(scale);

    let down_str = format_tray_speed(down);
    let up_str = format_tray_speed(up);

    // Draw Download speed (top) - White
    draw_text(&mut img, &scaled_font, 1, 12, &down_str, Rgba([255, 255, 255, 255])); 

    // Draw Upload speed (bottom) - Light Blue/Indigo (Rgba([173, 216, 230, 255]))
    draw_text(&mut img, &scaled_font, 1, 28, &up_str, Rgba([173, 216, 230, 255])); 

    img.into_raw()
}

fn format_tray_speed(bytes_per_sec: u64) -> String {
    if bytes_per_sec == 0 {
        return "0B".to_string();
    }
    let units = ["B", "K", "M", "G", "T"];
    let mut speed = bytes_per_sec as f64;
    let mut unit_idx = 0;
    while speed >= 1024.0 && unit_idx < units.len() - 1 {
        speed /= 1024.0;
        unit_idx += 1;
    }

    if unit_idx == 0 {
        format!("{:.0}{}", speed, units[unit_idx])
    } else if speed >= 10.0 {
        format!("{:.0}{}", speed, units[unit_idx])
    } else {
        format!("{:.1}{}", speed, units[unit_idx])
    }
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
    fn test_format_tray_speed() {
        assert_eq!(format_tray_speed(0), "0B");
        assert_eq!(format_tray_speed(1024), "1.0K");
        assert_eq!(format_tray_speed(1048576), "1.0M");
        assert_eq!(format_tray_speed(1073741824), "1.0G");
        assert_eq!(format_tray_speed(512), "512B");
        assert_eq!(format_tray_speed(1024 * 512), "512K");
    }

    #[test]
    fn test_generate_tray_icon_size() {
        let buffer = generate_tray_icon(1024 * 1024, 1024 * 512);
        assert_eq!(buffer.len(), 32 * 32 * 4);
    }

    #[test]
    fn test_generate_tray_icon_not_empty() {
        let buffer = generate_tray_icon(1024 * 1024, 1024 * 512);
        // Check if there is at least some non-transparent pixel
        let has_content = buffer.iter().skip(3).step_by(4).any(|&a| a > 0);
        assert!(has_content, "Generated icon should not be fully transparent");
    }
}
