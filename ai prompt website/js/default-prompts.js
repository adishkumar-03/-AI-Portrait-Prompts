/**
 * Curated initial collection of high-end AI Portrait Prompts.
 * These act as ready-to-use templates optimized for creating photos of oneself
 * across popular models (Midjourney v6, Flux.1, SDXL, DALL-E 3).
 * 
 * Note: Placeholders inside brackets like [subject] or [outfit] are automatically
 * detected by the interactive Prompt Personalizer!
 */

const DEFAULT_PROMPTS = [
  {
    id: "sample-1",
    title: "Cinematic Rainy Cyberpunk Street Portrait",
    model: "Midjourney v6.1",
    category: "Cyberpunk & Sci-Fi",
    tags: ["Cyberpunk", "Neon", "Rain", "Cinematic", "Blade Runner Style", "Night"],
    aspect_ratio: "4:5",
    image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "A close-up cinematic portrait of [a 28-year-old person with sharp features and wet dark hair], standing under neon holographic signs in a rainy Tokyo street at night, reflective rain droplets on cheekbones, [wearing a high-collar matte black techwear jacket with subtle luminescent cyan piping], moody cyan and magenta ambient rim lighting, shot on 35mm anamorphic lens, shallow depth of field, photorealistic, cinematic film grain --ar 4:5 --v 6.1 --style raw --s 250",
    negative_prompt: "cartoon, 3d render, plastic skin, oversaturated, deformed eyes, extra limbs, bad anatomy, blur, watermark, signature",
    settings_info: {
      aspectRatio: "4:5",
      version: "v 6.1",
      stylize: "250",
      style: "raw",
      lighting: "Cyan & Magenta Neon Rim Light",
      camera: "35mm Anamorphic, f/1.4"
    },
    tips: "For Midjourney face consistency: upload your clear front portrait to Discord, copy its image link, and append `--cref https://your-link.jpg --cw 25` to the end of this prompt.",
    copy_count: 842,
    created_at: "2026-09-28T14:30:00Z"
  },
  {
    id: "sample-2",
    title: "Executive Minimalist LinkedIn Headshot",
    model: "Flux.1 Dev",
    category: "Professional Headshots",
    tags: ["Headshot", "Corporate", "LinkedIn", "Studio", "Minimalist", "Soft Light"],
    aspect_ratio: "1:1",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "Authentic professional editorial headshot of [a confident 30-year-old woman with a warm gentle smile and tied-back hair], wearing [a tailored charcoal grey cashmere blazer over a white crewneck shirt], neutral warm grey studio backdrop, soft diffused octabox key light with subtle hair light separation, natural skin texture with subtle pores, unedited natural aesthetic, shot on Hasselblad H6D-100c, 85mm portrait lens, f/2.8, pristine studio quality",
    negative_prompt: "airbrushed, porcelain doll skin, oversaturated, intense makeup, studio flash glare, amateur, cartoon",
    settings_info: {
      aspectRatio: "1:1",
      steps: 32,
      guidance: 3.5,
      sampler: "Euler",
      lighting: "Large Octabox Diffused Studio Light",
      camera: "Hasselblad 85mm, f/2.8"
    },
    tips: "In Flux PuLID or ComfyUI InstantID: Keep weight around 0.75 - 0.85 to maintain natural facial contours without warping the studio lighting.",
    copy_count: 1250,
    created_at: "2026-09-29T10:15:00Z"
  },
  {
    id: "sample-3",
    title: "Golden Hour 90s Kodak 35mm Film Portrait",
    model: "Midjourney v6.1",
    category: "Vintage & Film",
    tags: ["35mm", "Kodak Portra", "Golden Hour", "Vintage", "90s Aesthetic", "Sunlight"],
    aspect_ratio: "4:5",
    image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "Candid medium portrait of [a stylish young person with tousled wavy hair], bathed in warm sunset golden hour sunlight, laughing candidly, [wearing a vintage cream knit sweater], sitting by a sunlit cafe window with blurred warm greenery in background, authentic Kodak Portra 400 film stock, natural organic halation, soft lens flare, slight motion blur, 1990s magazine editorial look --ar 4:5 --v 6.1 --style raw",
    negative_prompt: "digital look, hyper-clean, CGI, plastic, artificial flash, oversharpened, low quality",
    settings_info: {
      aspectRatio: "4:5",
      version: "v 6.1",
      style: "raw",
      lighting: "Golden Hour Natural Backlight",
      camera: "Kodak Portra 400, 50mm f/1.8"
    },
    tips: "This prompt works wonders for casual social media photos. In Midjourney, try `--cw 20` to keep your face recognizable while letting the hair and outfit blend into the 90s aesthetic.",
    copy_count: 963,
    created_at: "2026-09-30T16:45:00Z"
  },
  {
    id: "sample-4",
    title: "Moody Cinematic Noir Portrait in Shadow",
    model: "Flux.1 Dev",
    category: "Cinematic & Moody",
    tags: ["Noir", "Dramatic", "Chiaroscuro", "Shadows", "Moody", "Black & White"],
    aspect_ratio: "4:5",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "High-contrast dramatic chiaroscuro portrait of [a man with thoughtful contemplative expression and subtle stubble], half face illuminated by harsh warm tungsten light through slatted blinds, deep cinematic shadows engulfing the opposite side, [wearing a dark wool overcoat], atmospheric haze in air, moody dramatic cinema still, 35mm film grain, directed by Roger Deakins, Master of Light",
    negative_prompt: "flat lighting, overly bright, cartoon, 3d render, washed out, low contrast, oversaturated",
    settings_info: {
      aspectRatio: "4:5",
      steps: 30,
      guidance: 4.0,
      lighting: "Chiaroscuro Venetian Blind Tungsten Light",
      camera: "Leica SL2, 50mm Summilux f/1.4"
    },
    tips: "Great for dramatic artistic profile pictures. Use a high-contrast front-facing selfie as your reference image.",
    copy_count: 720,
    created_at: "2026-10-01T09:20:00Z"
  },
  {
    id: "sample-5",
    title: "Vogue High-Fashion Editorial in Paris",
    model: "Midjourney v6.1",
    category: "High Fashion Editorial",
    tags: ["Fashion", "Editorial", "Paris", "Street Style", "Vogue", "Haute Couture"],
    aspect_ratio: "9:16",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "Full-body street style editorial portrait of [a chic individual with sleek high ponytail], walking across a Parisian stone street in Autumn, [wearing an oversized camel trench coat, silk emerald scarf, and dark sunglasses resting on head], crisp autumn leaves on pavement, overcast Parisian soft diffuse lighting, shot for Vogue magazine, photographed by Peter Lindbergh, Kodak Tri-X tonality, luxurious atmosphere --ar 9:16 --v 6.1 --style raw --s 180",
    negative_prompt: "bad proportions, warped anatomy, ugly clothing pattern, fake plastic skin, anime",
    settings_info: {
      aspectRatio: "9:16",
      version: "v 6.1",
      stylize: "180",
      style: "raw",
      lighting: "Soft Overcast European Daylight",
      camera: "Canon EOS R5, 70-200mm f/2.8 at 135mm"
    },
    tips: "Change `[a chic individual with sleek high ponytail]` and `[oversized camel trench coat]` to your favorite personal wardrobe piece for a personalized Paris photoshoot.",
    copy_count: 1410,
    created_at: "2026-10-01T18:00:00Z"
  },
  {
    id: "sample-6",
    title: "Ethereal Mythic Elf / Fantasy Forest Portrait",
    model: "Stable Diffusion XL",
    category: "Fantasy & Ethereal",
    tags: ["Fantasy", "Ethereal", "Forest", "Glowing", "Mythic", "Nature"],
    aspect_ratio: "4:5",
    image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "Ethereal fantasy fine-art portrait of [an enchanting person with braided silver-blonde hair adorned with tiny delicate white wildflowers], standing in a mystical mossy ancient redwood forest, glowing bioluminescent particles floating gently in air, [wearing an intricate moss-green velvet cloak with silver filigree embroidery], soft dreamlike god rays piercing misty canopy, magical realism, highly detailed, 8k resolution, artstation trending",
    negative_prompt: "lowres, bad anatomy, bad hands, text, error, missing fingers, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark",
    settings_info: {
      aspectRatio: "4:5",
      steps: 35,
      cfgScale: 7.0,
      sampler: "DPM++ 2M Karras",
      lighting: "Mystical Sun Rays & Bioluminescence",
      camera: "Sony A7R V, 85mm GM f/1.4"
    },
    tips: "Combine with SDXL ReActor node or InsightFace in WebUI / Forge to transfer your face while preserving the mystical hair and glowing atmosphere.",
    copy_count: 635,
    created_at: "2026-10-02T11:40:00Z"
  },
  {
    id: "sample-7",
    title: "Clean Scandinavian Studio Portrait with Warm Wood",
    model: "Flux.1 Dev",
    category: "Studio Minimalist",
    tags: ["Scandinavian", "Minimalist", "Cozy", "Natural Light", "Warm", "Studio"],
    aspect_ratio: "1:1",
    image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "Minimalist Scandinavian lifestyle portrait of [a relaxed 32-year-old with neat short beard and warm expression], [wearing an off-white chunky ribbed wool crewneck], seated on an oak bench against a minimalist light birch wood wall, large floor-to-ceiling window light from the side, clean modern Nordic aesthetic, muted organic earth tones, Kinfolk magazine style, ultra-sharp detail, natural catchlight in eyes",
    negative_prompt: "cluttered, noisy background, neon colors, artificial plastic skin, dark shadows, lowres",
    settings_info: {
      aspectRatio: "1:1",
      steps: 28,
      guidance: 3.2,
      lighting: "Large North-Facing Window Natural Light",
      camera: "Fujifilm GFX 100 II, 110mm f/2"
    },
    tips: "Ideal for warm, approachable personal branding or creator profile pictures.",
    copy_count: 889,
    created_at: "2026-10-02T15:20:00Z"
  },
  {
    id: "sample-8",
    title: "Futuristic Holographic Neon Cyber-Agent",
    model: "DALL-E 3",
    category: "Cyberpunk & Sci-Fi",
    tags: ["Futuristic", "Sci-Fi", "Hologram", "HUD", "Cyber", "Glow"],
    aspect_ratio: "16:9",
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
    prompt_text: "Futuristic concept portrait of [a high-tech operative with intense determined gaze], in a dark starship cockpit interacting with glowing translucent biometric holograms and floating digital UI nodes, [wearing sleek carbon-fiber armor with glowing emerald accents], metallic reflections, ultra-detailed textures, volumetric lighting, photorealistic sci-fi cinematic render",
    negative_prompt: "blurry, low resolution, flat colors, deformed hands, cartoon, oversaturated",
    settings_info: {
      aspectRatio: "16:9",
      quality: "hd",
      style: "vivid",
      lighting: "Green & Blue Holographic Projections",
      camera: "Cinematic Panavision anamorphic"
    },
    tips: "Customize the holographic UI color to your favorite shade (cyan, amber, or violet) to match your branding.",
    copy_count: 512,
    created_at: "2026-10-03T12:00:00Z"
  }
];

// Export for module systems or attach to window for browser script tag usage
if (typeof window !== 'undefined') {
  window.DEFAULT_PROMPTS = DEFAULT_PROMPTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_PROMPTS };
}
