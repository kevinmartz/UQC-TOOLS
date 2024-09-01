import os
import sys
from PIL import Image
import numpy as np

class PixelComparisonDetector:
    def run(self, combined_img: Image.Image, split_height: int, **kwargs) -> list[int]:
        combined_img = np.array(combined_img.convert('L'))
        scan_step = kwargs.get('scan_step', 5)
        ignorable_pixels = kwargs.get('ignorable_pixels', 0)
        sensitivity = kwargs.get('sensitivity', 90)
        threshold = int(255 * (1 - (sensitivity / 100)))
        last_row = len(combined_img)
        slice_locations = [0]
        row = split_height
        move_up = True
        
        while row < last_row:
            row_pixels = combined_img[row]
            can_slice = True
            for index in range(ignorable_pixels + 1, len(row_pixels) - ignorable_pixels):
                prev_pixel = int(row_pixels[index - 1])
                next_pixel = int(row_pixels[index])
                value_diff = next_pixel - prev_pixel
                if abs(value_diff) > threshold:
                    can_slice = False
                    break
            if can_slice:
                slice_locations.append(row)
                row += split_height
                move_up = True
                continue
            if row - slice_locations[-1] <= 0.4 * split_height:
                row = slice_locations[-1] + split_height
                move_up = False
            if move_up:
                row -= scan_step
                continue
            row += scan_step
        
        if slice_locations[-1] != last_row - 1:
            slice_locations.append(last_row - 1)
        
        return slice_locations

def smart_split(image_path, output_dir, rough_output_height, sensitivity=90, scan_step=5):
    image = Image.open(image_path)
    detector = PixelComparisonDetector()
    slice_locations = detector.run(
        combined_img=image, 
        split_height=rough_output_height, 
        sensitivity=sensitivity, 
        scan_step=scan_step
    )

    os.makedirs(output_dir, exist_ok=True)

    for i in range(len(slice_locations) - 1):
        start_y = slice_locations[i]
        end_y = slice_locations[i + 1]
        slice_img = image.crop((0, start_y, image.width, end_y))
        slice_name = f"{i+1:03}.jpg"
        slice_path = os.path.join(output_dir, slice_name)
        slice_img.save(slice_path, "JPEG", quality=100)

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python script.py <image_path> <output_dir> <rough_output_height> <sensitivity> <scan_step>")
        sys.exit(1)

    image_path = sys.argv[1]
    output_dir = sys.argv[2]
    rough_output_height = int(sys.argv[3])
    sensitivity = int(sys.argv[4])
    scan_step = int(sys.argv[5])

    smart_split(image_path, output_dir, rough_output_height, sensitivity, scan_step)