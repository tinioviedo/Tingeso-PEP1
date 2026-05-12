const DESTINATION_IMAGES = {
  "New York, USA":
    "https://i2-prod.es.themirror.com/article1791898.ece/ALTERNATES/s1200b/0_GettyImages-2259063515.jpg",
  "Manchester, Inglaterra":
    "https://wallpapercave.com/wp/wp12424111.jpg",
  "Roma, Italia":
    "https://www.atptour.com/-/media/images/news/2026/04/30/16/07/rome-2026-site-upgrade-feature-pan-angle.jpg",
  "Londres, Inglaterra":
    "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80&fit=crop",
  "Ciudad de México, México":
    "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80&fit=crop",
  "Monte Carlo, Mónaco":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop",
  "Río de Janeiro, Brasil":
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80&fit=crop",
  "París, Francia":
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80&fit=crop",
  "Como, Italia":
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&fit=crop",
  "Tokio, Japón":
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80&fit=crop",
  "Cusco, Perú":
    "https://images.unsplash.com/photo-1587595431973-160543fc6d60?w=800&q=80&fit=crop",
  "Cancún, México":
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80&fit=crop",
  "Punta Arenas, Chile":
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop",
  "Santorini, Grecia":
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80&fit=crop",
}

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
]

export const getPackageImage = (destination) => {
  return DESTINATION_IMAGES[destination] || null
}

export const getFallbackGradient = (str) => {
  const hash = (str || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length]
}
