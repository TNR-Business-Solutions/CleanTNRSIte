# Black Friday Giveaway Hero Image Setup Instructions

## ✅ Image Selected: Image #2 from Galaxy.ai

### Steps to Complete Setup:

1. **Download the Image from Galaxy.ai**
   - Go to your Galaxy.ai generation history
   - Find Image #2 (the one with clear "FOREST GREEN" and "ARMY GREEN" color swatches)
   - Click download

2. **Save the Image**
   - Save the downloaded image to: `media/black-friday-giveaway-hero.jpg`
   - If it's a PNG, you can rename it to `.jpg` or keep it as `.png` and update the reference

3. **Verify the Image**
   - The image should be in: `C:\Users\roytu\Desktop\clean-site\media\black-friday-giveaway-hero.jpg`
   - Check that the file exists and is a reasonable size (should be several MB for high quality)

4. **Test the Page**
   - Open: `http://localhost:5000/black-friday-giveaway.html`
   - Verify the hero image displays correctly
   - Check that the green gradient overlay looks good
   - Ensure text is readable over the image

### If the Image is PNG Instead of JPG:

If Galaxy.ai downloaded it as PNG, you have two options:

**Option 1: Rename the file**
- Save as: `media/black-friday-giveaway-hero.png`
- Update the HTML reference (I can do this if needed)

**Option 2: Convert to JPG**
- Use an image converter or rename the extension
- Save as: `media/black-friday-giveaway-hero.jpg`

### Current Code Reference:

The giveaway page is already configured to use:
```css
background-image: linear-gradient(...), url('media/black-friday-giveaway-hero.jpg');
```

### Image Specifications:

- **File Location**: `media/black-friday-giveaway-hero.jpg`
- **Aspect Ratio**: 16:9 (landscape)
- **Recommended Size**: 1920x1080 or larger for best quality
- **Format**: JPG or PNG
- **Gradient Overlay**: 85% opacity forest green to army green

### Troubleshooting:

If the image doesn't appear:
1. Check the file path is correct
2. Verify the filename matches exactly (case-sensitive)
3. Clear browser cache (Ctrl+F5)
4. Check browser console for 404 errors
5. Verify the server is running on port 5000

---

**Status**: ✅ Code updated and ready - just need to add the image file!

